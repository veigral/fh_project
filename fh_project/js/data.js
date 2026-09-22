/* ========================================================================== *
   Fruit House — application logic
   ========================================================================== */

/* ============================== CONFIG =================================== */

export const CATEGORY_ORDER = ['strawberry', 'bouquet', 'macaron', 'date'];
export const INITIAL_VISIBLE_PRODUCTS = 4;
export const REVEAL_DELAY = 70;
export const TOAST_DURATION = 2400;

export const categoryLabels = {
  strawberry: 'Клубника в шоколаде',
  bouquet: 'Сладкие букеты',
  macaron: 'Макарон',
  date: 'Королевские финики',
};

export const emojiMap = {
  strawberry: '🍓',
  bouquet: '💐',
};

/* ============================== HELPERS ================================== */

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export function money(value) {
  return `${value.toLocaleString('ru-RU')} ₽`;
}

export function getProduct(id) {
  return products.find((product) => product.id === id);
}

export function getCategoryLabel(category) {
  return categoryLabels[category] || category;
}

/* ============================== PRODUCT DATA ============================= */

export let products = [];

export async function loadProducts() {
  try {
    const response = await fetch('http://localhost:3000/api/products');

    if (!response.ok) {
      throw new Error(`Сервер вернул ошибку: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Сервер вернул некорректные данные');
    }

    products = data.map((product) => ({
      id: product.id,
      category: product.category,
      name: product.name,
      desc: product.description,
      details: product.details,
      price: product.price,
      tag: product.tag,
      img: product.image,
    }));

    console.log(`Товары загружены с backend: ${products.length}`);

    return true;
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error);

    return false;
  }
}