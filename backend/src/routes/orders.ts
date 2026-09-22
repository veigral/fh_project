import { Router } from "express";
import pool from "../db";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", requireAdmin, async (req, res) => {
  try {
    const status = req.query.status as string | undefined;

    const allowedStatuses = [
      "new",
      "processing",
      "completed",
      "cancelled",
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Некорректный статус заказа",
      });
    }

    let query = `
      SELECT
        id,
        customer_name,
        phone,
        address,
        comment,
        total_price,
        status,
        delivery_method,
        requested_date::text AS requested_date,
        requested_time::text AS requested_time,
        created_at
      FROM orders
    `;

    const values: string[] = [];

    if (status) {
      query += ` WHERE status = $1`;
      values.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения заказов:", error);

    res.status(500).json({
      message: "Не удалось получить заказы",
    });
  }
});

router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Некорректный номер заказа",
      });
    }

    const orderResult = await pool.query(
      `
      SELECT
        id,
        customer_name,
        phone,
        address,
        comment,
        total_price,
        status,
        delivery_method,
        requested_date::text AS requested_date,
        requested_time::text AS requested_time,
        created_at
      FROM orders
      WHERE id = $1
      `,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        message: "Заказ не найден",
      });
    }

    const itemsResult = await pool.query(
      `
        SELECT
          oi.product_id,
          p.name,
          oi.quantity,
          oi.price
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = $1
        ORDER BY oi.id
      `,
      [orderId]
    );

    res.json({
      ...orderResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error("Ошибка получения заказа:", error);

    res.status(500).json({
      message: "Не удалось получить заказ",
    });
  }
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Некорректный номер заказа",
      });
    }

    const allowedStatuses = [
      "new",
      "processing",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Некорректный статус заказа",
      });
    }

    const result = await pool.query(
      `
        UPDATE orders
        SET status = $1
        WHERE id = $2
        RETURNING
          id,
          status,
          created_at
      `,
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Заказ не найден",
      });
    }

    res.json({
      message: "Статус заказа обновлён",
      order: result.rows[0],
    });
  } catch (error) {
    console.error("Ошибка изменения статуса заказа:", error);

    res.status(500).json({
      message: "Не удалось изменить статус заказа",
    });
  }
});

router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      customerName,
      phone,
      address,
      comment,
      deliveryMethod,
      requestedDate,
      requestedTime,
      items,
    } = req.body;

    if (!customerName || !phone) {
      return res.status(400).json({
        message: "Необходимо указать имя и телефон",
      });
    }

    const allowedDeliveryMethods = [
      "delivery",
      "pickup",
    ];

    if (!allowedDeliveryMethods.includes(deliveryMethod)) {
      return res.status(400).json({
        message: "Некорректный способ получения заказа",
      });
    }

    if (!requestedDate || !requestedTime) {
      return res.status(400).json({
        message: "Укажите дату и время получения заказа",
      });
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const timePattern = /^\d{2}:\d{2}$/;

    if (
      !datePattern.test(requestedDate) ||
      !timePattern.test(requestedTime)
    ) {
      return res.status(400).json({
        message: "Некорректная дата или время получения заказа",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Корзина пуста",
      });
    }

    await client.query("BEGIN");

    const productIds = items.map((item: { productId: string }) => item.productId);

    const productsResult = await client.query(
      `
        SELECT id, price
        FROM products
        WHERE id = ANY($1)
          AND is_available = TRUE
      `,
      [productIds]
    );

    if (productsResult.rows.length !== productIds.length) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Один или несколько товаров недоступны",
      });
    }

    let totalPrice = 0;

    const productMap = new Map(
      productsResult.rows.map((product) => [
        product.id,
        product.price,
      ])
    );

    for (const item of items) {
      const price = productMap.get(item.productId);

      if (!price || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message: "Некорректные данные товара",
        });
      }

      totalPrice += price * item.quantity;
    }

    const orderResult = await client.query(
      `
    INSERT INTO orders (
      customer_name,
      phone,
      address,
      comment,
      total_price,
      delivery_method,
      requested_date,
      requested_time
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING
      id,
      total_price,
      status,
      delivery_method,
      requested_date::text AS requested_date,
      requested_time::text AS requested_time,
      created_at
  `,
      [
        customerName,
        phone,
        deliveryMethod === "delivery" ? address || null : null,
        comment || null,
        totalPrice,
        deliveryMethod,
        requestedDate,
        requestedTime,
      ]
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      const price = productMap.get(item.productId);

      await client.query(
        `
          INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            price
          )
          VALUES ($1, $2, $3, $4)
        `,
        [
          order.id,
          item.productId,
          item.quantity,
          price,
        ]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Заказ успешно создан",
      order,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Ошибка создания заказа:", error);

    res.status(500).json({
      message: "Не удалось создать заказ",
    });
  } finally {
    client.release();
  }
});

export default router;