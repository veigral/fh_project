import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      message: "Требуется авторизация",
    });
  }

  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Некорректный токен",
    });
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("JWT_SECRET не указан");

    return res.status(500).json({
      message: "Ошибка конфигурации сервера",
    });
  }

  try {
    jwt.verify(token, jwtSecret);

    next();
  } catch {
    return res.status(401).json({
      message: "Токен недействителен или истёк",
    });
  }
}