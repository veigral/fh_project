import { Router } from "express";
import pool from "../db";

const router = Router();

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