import pool from "./db";

const products = [
  {
    id: "s1",
    category: "strawberry",
    name: "Набор «Классический»",
    description: "12 крупных ягод в молочном шоколаде с ручным декором.",
    details:
      "Свежая клубника, бельгийский молочный шоколад и нежный декор. Подходит для свидания, дня рождения или небольшого комплимента.",
    price: 1890,
    tag: "Хит",
    image: "img/strawberry/2.jpg",
  },
  {
    id: "s2",
    category: "strawberry",
    name: "Набор «Бельгийский»",
    description: "12 ягод в бельгийском шоколаде с изысканным декором.",
    details:
      "12 свежих ягод, покрытых шоколадом с высоким содержанием какао. Декор можно адаптировать под повод.",
    price: 2090,
    tag: null,
    image: "img/strawberry/2.jpg",
  },
  {
    id: "s3",
    category: "strawberry",
    name: "Набор «Праздничный»",
    description: "12 ягод в шоколаде с нарядным праздничным оформлением.",
    details:
      "Подарочный набор для особого случая: крупная клубника, шоколад и выразительный ручной декор.",
    price: 2690,
    tag: "Новинка",
    image: "img/strawberry/2.jpg",
  },
  {
    id: "s4",
    category: "strawberry",
    name: "Мини-набор «Комплимент»",
    description: "6 отборных ягод в шоколаде — маленький сладкий знак внимания.",
    details:
      "Компактный набор для тёплого комплимента. Количество и оформление оптимальны для небольшого подарка.",
    price: 1190,
    tag: null,
    image: "img/strawberry/2.jpg",
  },
  {
    id: "s5",
    category: "strawberry",
    name: "Набор «Романтика»",
    description: "10 ягод в шоколаде с нежным декором.",
    details:
      "Романтичное оформление и свежая клубника — готовый подарок без лишних хлопот.",
    price: 2290,
    tag: null,
    image: "img/strawberry/2.jpg",
  },
  {
    id: "s6",
    category: "strawberry",
    name: "Набор «Премиум»",
    description: "16 крупных ягод в шоколаде с премиальным декором.",
    details:
      "Увеличенный набор для тех случаев, когда хочется впечатлить. Ягоды оформляются вручную.",
    price: 3190,
    tag: "Премиум",
    image: "img/strawberry/2.jpg",
  },
  {
    id: "s7",
    category: "strawberry",
    name: "Набор «Нежность»",
    description: "9 ягод в белом и молочном шоколаде.",
    details:
      "Светлое сочетание шоколада и ягод с аккуратным минималистичным декором.",
    price: 2190,
    tag: null,
    image: "img/strawberry/2.jpg",
  },

  {
    id: "b1",
    category: "bouquet",
    name: "Сладкий букет",
    description: "Композиция из клубники в шоколаде и декоративных элементов.",
    details:
      "Авторская сладкая композиция, собранная вручную. Состав и декор можно уточнить при заказе.",
    price: 2490,
    tag: null,
    image: "img/bouquets/1.jpg",
  },
  {
    id: "b2",
    category: "bouquet",
    name: "Сладкий букет «Хит»",
    description: "Праздничная композиция из сладостей и клубники.",
    details:
      "Яркий вариант подарка для дня рождения, свидания или другого важного события.",
    price: 2890,
    tag: "Хит",
    image: "img/bouquets/1.jpg",
  },
  {
    id: "b3",
    category: "bouquet",
    name: "Сладкий букет «Праздник»",
    description: "Большая композиция с выразительным ручным декором.",
    details:
      "Объёмный сладкий букет, который станет самостоятельным подарком.",
    price: 3190,
    tag: null,
    image: "img/bouquets/1.jpg",
  },
  {
    id: "b4",
    category: "bouquet",
    name: "Мини-букет «Комплимент»",
    description: "Небольшая сладкая композиция для знака внимания.",
    details:
      "Лаконичный формат для небольшого, но приятного сюрприза.",
    price: 1590,
    tag: null,
    image: "img/bouquets/1.jpg",
  },
  {
    id: "b5",
    category: "bouquet",
    name: "Букет «Клубничное облако»",
    description:
      "Воздушная композиция из клубники в шоколаде и нежного декора.",
    details:
      "Элегантный букет с акцентом на свежую клубнику и шоколад. Подойдёт для романтического подарка или важной даты.",
    price: 2790,
    tag: "Новинка",
    image: "img/bouquets/1.jpg",
  },
  {
    id: "b6",
    category: "bouquet",
    name: "Букет «Сладкая нежность»",
    description:
      "Нежная композиция в светлой палитре с ягодами и сладостями.",
    details:
      "Мягкое сочетание клубники, шоколада и декоративных элементов. Универсальный вариант для тёплого сюрприза.",
    price: 2990,
    tag: null,
    image: "img/bouquets/1.jpg",
  },
  {
    id: "b7",
    category: "bouquet",
    name: "Премиум-букет «Впечатление»",
    description:
      "Большая подарочная композиция с выразительным ручным оформлением.",
    details:
      "Премиальный формат для особенного повода. Объёмная композиция с клубникой в шоколаде и декоративными акцентами.",
    price: 3790,
    tag: "Премиум",
    image: "img/bouquets/1.jpg",
  },

  {
    id: "m1",
    category: "macaron",
    name: "Набор «Ассорти»",
    description: "12 макарон, 6 классических вкусов.",
    details:
      "Набор для знакомства с коллекцией: 12 воздушных макарон с разнообразными начинками.",
    price: 1690,
    tag: null,
    image: "img/macaron/1.jpg",
  },
  {
    id: "m2",
    category: "macaron",
    name: "Набор «Ягодный»",
    description: "12 макарон с нежными ягодными начинками.",
    details:
      "Сочетание хрустящей оболочки и ярких ягодных вкусов.",
    price: 1790,
    tag: null,
    image: "img/macaron/1.jpg",
  },
  {
    id: "m3",
    category: "macaron",
    name: "Набор «Шоколадный»",
    description: "12 макарон с насыщенной шоколадной начинкой.",
    details:
      "Для любителей глубокого шоколадного вкуса — нежная начинка и классическая оболочка.",
    price: 1790,
    tag: null,
    image: "img/macaron/1.jpg",
  },
  {
    id: "m4",
    category: "macaron",
    name: "Праздничная коробка",
    description: "24 макарон, ассорти вкусов.",
    details:
      "Большая коробка для праздника или компании. Внутри — 24 макарон ассорти.",
    price: 3290,
    tag: "Выгодно",
    image: "img/macaron/1.jpg",
  },
  {
    id: "m5",
    category: "macaron",
    name: "Набор «Фисташка»",
    description: "12 макарон с нежной фисташковой начинкой.",
    details:
      "Ароматная фисташковая начинка в классической французской оболочке.",
    price: 1890,
    tag: null,
    image: "img/macaron/1.jpg",
  },
  {
    id: "m6",
    category: "macaron",
    name: "Набор «Ваниль»",
    description: "12 макарон с мягкой ванильной начинкой.",
    details:
      "Деликатный ванильный вкус для тех, кто любит классические десерты.",
    price: 1690,
    tag: null,
    image: "img/macaron/1.jpg",
  },
  {
    id: "m7",
    category: "macaron",
    name: "Подарочный набор «Дуэт»",
    description: "16 макарон двух выбранных вкусов.",
    details:
      "Удобный формат, чтобы собрать коробку из двух любимых вкусов.",
    price: 2290,
    tag: "Подарок",
    image: "img/macaron/1.jpg",
  },

  {
    id: "d1",
    category: "date",
    name: "Финики в шоколаде «Классика»",
    description: "Отборные королевские финики в бельгийском шоколаде.",
    details:
      "Мягкие королевские финики и шоколад с аккуратным декором. Отличный вариант к чаю и в подарок.",
    price: 1290,
    tag: null,
    image: "img/dates-fruit/1.jpg",
  },
  {
    id: "d2",
    category: "date",
    name: "Финики «Фундук»",
    description: "Финики в шоколаде с хрустящим фундуком.",
    details:
      "Нежная сладость финика, шоколад и ореховая текстура в одном десерте.",
    price: 1390,
    tag: null,
    image: "img/dates-fruit/1.jpg",
  },
  {
    id: "d3",
    category: "date",
    name: "Финики «Кокос»",
    description: "Финики в шоколаде с кокосовым декором.",
    details:
      "Мягкий финик, шоколадная оболочка и кокосовая нотка.",
    price: 1290,
    tag: null,
    image: "img/dates-fruit/1.jpg",
  },
  {
    id: "d4",
    category: "date",
    name: "Подарочная коробка фиников",
    description: "Ассорти королевских фиников в шоколаде.",
    details:
      "Подарочный вариант для любителей восточных сладостей. Аккуратная ручная сборка и оформление.",
    price: 1990,
    tag: "Хит",
    image: "img/dates-fruit/1.jpg",
  },
  {
    id: "d5",
    category: "date",
    name: "Финики «Фисташка»",
    description: "Королевские финики с фисташковой начинкой.",
    details:
      "Насыщенный ореховый вкус фисташки в сочетании с мягким фиником и шоколадом.",
    price: 1490,
    tag: null,
    image: "img/dates-fruit/1.jpg",
  },
  {
    id: "d6",
    category: "date",
    name: "Финики «Миндаль»",
    description: "Финики с миндальной начинкой и шоколадом.",
    details:
      "Классическое сочетание мягкого финика, миндаля и шоколадной оболочки.",
    price: 1490,
    tag: null,
    image: "img/dates-fruit/1.jpg",
  },
  {
    id: "d7",
    category: "date",
    name: "Набор «Восточная коллекция»",
    description: "18 фиников с разными начинками.",
    details:
      "Большой набор для подарка или семейного чаепития с несколькими видами начинок.",
    price: 2490,
    tag: "Премиум",
    image: "img/dates-fruit/1.jpg",
  },
];

async function seed() {
  try {
    for (const product of products) {
      const categoryResult = await pool.query(
        "SELECT id FROM categories WHERE slug = $1",
        [product.category]
      );

      if (categoryResult.rows.length === 0) {
        throw new Error(
          `Категория "${product.category}" не найдена в базе данных.`
        );
      }

      const categoryId = categoryResult.rows[0].id;

      await pool.query(
        `INSERT INTO products
          (id, category_id, name, description, details, price, tag, image)
         VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [
          product.id,
          categoryId,
          product.name,
          product.description,
          product.details,
          product.price,
          product.tag,
          product.image,
        ]
      );
    }

    console.log(`Добавлено товаров: ${products.length}`);
  } catch (error) {
    console.error("Ошибка заполнения базы:", error);
  } finally {
    await pool.end();
  }
}

seed();