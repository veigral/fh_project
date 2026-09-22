import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db";
import { requireAdmin } from "../middleware/auth";
import { rateLimit } from "express-rate-limit";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,

  skipSuccessfulRequests: true,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message:
      "Слишком много неудачных попыток входа. Попробуйте позже.",
  },
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Укажите логин и пароль",
      });
    }

    const result = await pool.query(
      `
        SELECT
          id,
          username,
          password_hash
        FROM admins
        WHERE username = $1
      `,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Неверный логин или пароль",
      });
    }

    const admin = result.rows[0];

    const passwordIsValid = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        message: "Неверный логин или пароль",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET не указан");
    }

    const token = jwt.sign(
      {
        adminId: admin.id,
        username: admin.username,
      },
      jwtSecret,
      {
        expiresIn: "8h",
      }
    );

    res.json({
      message: "Вход выполнен",
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error("Ошибка входа администратора:", error);

    res.status(500).json({
      message: "Не удалось выполнить вход",
    });
  }
});

router.get("/me", requireAdmin, async (_req, res) => {
  res.json({
    message: "Токен действителен",
  });
});

export default router;