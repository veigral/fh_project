import bcrypt from "bcryptjs";
import pool from "./db";

async function changeAdminPassword() {
  const username = process.env.ADMIN_USERNAME;
  const newPassword = process.env.ADMIN_PASSWORD;

  if (!username || !newPassword) {
    console.error(
      "Укажите ADMIN_USERNAME и ADMIN_PASSWORD в .env"
    );

    await pool.end();
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 12);

    const result = await pool.query(
      `
        UPDATE admins
        SET password_hash = $1
        WHERE username = $2
        RETURNING id, username
      `,
      [passwordHash, username]
    );

    if (result.rows.length === 0) {
      console.log("Администратор не найден");
      return;
    }

    console.log("Пароль администратора успешно изменён:");
    console.log(result.rows[0]);
  } catch (error) {
    console.error("Не удалось изменить пароль:", error);
  } finally {
    await pool.end();
  }
}

changeAdminPassword();