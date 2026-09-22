import express from "express";
import cors from "cors";
import pool from "./db";
import productsRouter from "./routes/products";
import ordersRouter from "./routes/orders";
import authRouter from "./routes/auth";

const app = express();

const PORT = 3000;

app.use(cors());

app.use(express.json());

app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/auth", authRouter);

app.get("/", (_req, res) => {
  res.json({
    message: "Fruit House backend работает!",
  });
});

app.get("/api/test-db", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Соединение с PostgreSQL работает!",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Ошибка подключения к PostgreSQL:", error);

    res.status(500).json({
      message: "Ошибка подключения к PostgreSQL",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend запущен на http://localhost:${PORT}`);
});