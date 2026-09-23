import pool from "./db";

async function fixCategories() {
  try {
    const categories = [
      {
        slug: "strawberry",
        name: "Клубника в шоколаде",
      },
      {
        slug: "bouquet",
        name: "Сладкие букеты",
      },
      {
        slug: "macaron",
        name: "Макарон",
      },
      {
        slug: "date",
        name: "Королевские финики",
      },
    ];

    for (const category of categories) {
      await pool.query(
        `
          UPDATE categories
          SET name = $1
          WHERE slug = $2
        `,
        [category.name, category.slug]
      );
    }

    console.log("Названия категорий исправлены");
  } catch (error) {
    console.error(
      "Ошибка исправления категорий:",
      error
    );
  } finally {
    await pool.end();
  }
}

fixCategories();