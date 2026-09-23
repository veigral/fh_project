import { Router } from "express";
import pool from "../db";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/admin", requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        c.slug AS category,
        c.name AS category_name,
        p.name,
        p.description,
        p.details,
        p.price,
        p.tag,
        p.image,
        p.is_available,
        p.created_at
      FROM products p
      JOIN categories c ON c.id = p.category_id
      ORDER BY c.id, p.created_at, p.id
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения товаров для админки:", error);

    res.status(500).json({
      message: "Не удалось получить товары",
    });
  }
});

router.patch("/:id/availability", requireAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        message: "Некорректное значение доступности товара",
      });
    }

    const result = await pool.query(
      `
        UPDATE products
        SET is_available = $1
        WHERE id = $2
        RETURNING
          id,
          name,
          is_available
      `,
      [isAvailable, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Товар не найден",
      });
    }

    res.json({
      message: isAvailable
        ? "Товар возвращён в каталог"
        : "Товар скрыт из каталога",
      product: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Ошибка изменения доступности товара:",
      error
    );

    res.status(500).json({
      message: "Не удалось изменить доступность товара",
    });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const productId = req.params.id;

    const {
      name,
      description,
      details,
      price,
      tag,
      category,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof description !== "string" ||
      typeof details !== "string"
    ) {
      return res.status(400).json({
        message: "Некорректные данные товара",
      });
    }

    if (
      !Number.isInteger(price) ||
      price < 0
    ) {
      return res.status(400).json({
        message: "Цена товара указана некорректно",
      });
    }

    if (
      tag !== null &&
      tag !== undefined &&
      typeof tag !== "string"
    ) {
      return res.status(400).json({
        message: "Некорректный тег товара",
      });
    }

    if (
      typeof category !== "string" ||
      !category.trim()
    ) {
      return res.status(400).json({
        message: "Некорректная категория товара",
      });
    }

    const categoryResult = await pool.query(
      `
    SELECT id
    FROM categories
    WHERE slug = $1
  `,
      [category]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(400).json({
        message: "Категория не найдена",
      });
    }

    const categoryId = categoryResult.rows[0].id;

    const result = await pool.query(
      `
    UPDATE products
    SET
      name = $1,
      description = $2,
      details = $3,
      price = $4,
      tag = $5,
      category_id = $6
    WHERE id = $7
    RETURNING
      id,
      name,
      description,
      details,
      price,
      tag,
      category_id,
      is_available
  `,
      [
        name.trim(),
        description.trim(),
        details.trim(),
        price,
        tag?.trim() || null,
        categoryId,
        productId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Товар не найден",
      });
    }

    res.json({
      message: "Товар обновлён",
      product: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Ошибка обновления товара:",
      error
    );

    res.status(500).json({
      message: "Не удалось обновить товар",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const category = req.query.category as string | undefined;

    let query = `
      SELECT
        p.id,
        c.slug AS category,
        c.name AS category_name,
        p.name,
        p.description,
        p.details,
        p.price,
        p.tag,
        p.image,
        p.is_available,
        p.created_at
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.is_available = TRUE
    `;

    const values: string[] = [];

    if (category) {
      query += ` AND c.slug = $1`;
      values.push(category);
    }

    query += ` ORDER BY p.created_at, p.id`;

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения товаров:", error);

    res.status(500).json({
      message: "Не удалось получить товары",
    });
  }
});

export default router;