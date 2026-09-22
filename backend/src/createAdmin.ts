import bcrypt from "bcryptjs";
import pool from "./db";

async function createAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error(
      "Укажите ADMIN_USERNAME и ADMIN_PASSWORD в .env"
    );

    await pool.end();
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
        INSERT INTO admins (
          username,
          password_hash
        )
        VALUES ($1, $2)
        RETURNING id, username, created_at
      `,
      [username, passwordHash]
    );

    console.log("Администратор создан:");
    console.log(result.rows[0]);
  } catch (error) {
    console.error("Не удалось создать администратора:", error);
  } finally {
    await pool.end();
  }
}

createAdmin();