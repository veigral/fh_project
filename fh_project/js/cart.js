import { $, money, getProduct, products, emojiMap, TOAST_DURATION } from './data.js';

/* ============================== CART =================================== */


let cart = loadCart();
let toastTimer;

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem('fh_cart') || '{}');
    return stored && typeof stored === 'object' ? stored : {};
  } catch {
    return {};
  }
}

function emitCartUpdated() {
  document.dispatchEvent(new CustomEvent('cart:updated'));
}

export function getCart() {
  return cart;
}

function saveCart() {
  localStorage.setItem('fh_cart', JSON.stringify(cart));
  emitCartUpdated();
}

export function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  showToast('✅ Товар добавлен в корзину');
  bumpCartIcon();
}

export function changeQty(id, delta) {
  if (!cart[id]) return;

  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
}

export function removeFromCart(id) {
  delete cart[id];
  saveCart();
}

export function clearCart() {
  cart = {};
  saveCart();
}

export function cartCount() {
  return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
}

export function cartTotal() {
  return Object.entries(cart).reduce((total, [id, quantity]) => {
    const product = getProduct(id);
    return total + (product ? product.price * quantity : 0);
  }, 0);
}

export function updateCartCount() {
  const element = $('#cartCount');
  const count = cartCount();

  element.textContent = count;
  element.classList.toggle('show', count > 0);
}

function bumpCartIcon() {
  const element = $('#cartCount');
  element.classList.remove('bump');
  void element.offsetWidth;
  element.classList.add('bump');
}

export function renderCardActions() {
  products.forEach((product) => {
    const wrapper = $(`[data-action="${product.id}"]`);
    if (!wrapper) return;

    const quantity = cart[product.id] || 0;

    wrapper.innerHTML = quantity > 0
      ? `
        <div class="qty-row">
          <button type="button" data-minus="${product.id}" aria-label="Уменьшить количество">−</button>
          <span aria-live="polite">${quantity} шт.</span>
          <button type="button" data-plus="${product.id}" aria-label="Увеличить количество">+</button>
        </div>`
      : `<button class="add-btn" type="button" data-add="${product.id}">🛍 В корзину</button>`;
  });
}

export function renderCartDrawer() {
  const container = $('#cartItems');
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <span class="em">🛍</span>
        Ваша корзина пока пуста<br>
        Добавьте что-нибудь сладкое!
      </div>`;
  } else {
    container.innerHTML = entries.map(([id, quantity]) => {
      const product = getProduct(id);
      if (!product) return '';

      const icon = product.category === 'macaron'
        ? '🥐'
        : product.category === 'date'
          ? '🌰'
          : (emojiMap[product.category] || '🍬');

      return `
        <div class="cart-item">
          <div class="ci-icon">${icon}</div>
          <div class="ci-info">
            <h4>${product.name}</h4>
            <div class="ci-price">${money(product.price)}</div>
            <div class="ci-qty">
              <button type="button" data-minus="${id}" aria-label="Уменьшить количество">−</button>
              <span>${quantity}</span>
              <button type="button" data-plus="${id}" aria-label="Увеличить количество">+</button>
              <button type="button" class="ci-remove" data-remove="${id}">Удалить</button>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  $('#cartTotal').textContent = money(cartTotal());
  $('#checkoutBtn').disabled = entries.length === 0;
}

export function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), TOAST_DURATION);
}
