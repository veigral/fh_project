import { $, $$, money, getProduct, getCategoryLabel } from './data.js';
import { getCart, addToCart, changeQty } from './cart.js';

/* ============================== PRODUCT MODAL =========================== */


export const productModal = $('#productModal');
const productModalImage = $('#productModalImage');
const productModalTitle = $('#productModalTitle');
const productModalDescription = $('#productModalDescription');
const productModalPrice = $('#productModalPrice');
const productModalCategory = $('#productModalCategory');
const productModalTag = $('#productModalTag');
export const productModalAction = $('#productModalAction');
export const closeProductModalButton = $('#closeProductModal');

let activeProductId = null;
let lastFocusedElement = null;

export function isProductModalOpen() {
  return productModal.classList.contains('show');
}

export function openProductModal(id) {
  const product = getProduct(id);
  if (!product) return;

  activeProductId = id;
  lastFocusedElement = document.activeElement;

  productModalImage.src = product.img;
  productModalImage.alt = product.name;
  productModalTitle.textContent = product.name;
  productModalDescription.textContent = product.details || product.desc;
  productModalPrice.textContent = money(product.price);
  productModalCategory.textContent = getCategoryLabel(product.category);
  productModalTag.textContent = product.tag || '';
  productModalTag.hidden = !product.tag;

  productModal.classList.add('show');
  productModal.setAttribute('aria-hidden', 'false');
  $('#overlay').classList.add('show');
  document.body.classList.add('modal-open');

  renderProductModalAction();
  requestAnimationFrame(() => closeProductModalButton.focus());
}

export function renderProductModalAction() {
  if (!productModalAction || !activeProductId) return;

  const quantity = getCart()[activeProductId] || 0;

  if (quantity > 0) {
    productModalAction.innerHTML = `
      <div class="qty-row product-modal-qty" aria-label="Количество товара">
        <button type="button" data-minus="${activeProductId}" aria-label="Уменьшить количество">−</button>
        <span aria-live="polite">${quantity} шт.</span>
        <button type="button" data-plus="${activeProductId}" aria-label="Увеличить количество">+</button>
      </div>`;
    return;
  }

  productModalAction.innerHTML = `
    <button class="btn btn-dark btn-full" id="productModalAdd" type="button">
      🛍 В корзину
    </button>`;
}

export function handleProductModalAction(event) {
  const control = event.target.closest('#productModalAdd, [data-plus], [data-minus]');
  if (!control || !productModalAction.contains(control)) return;

  // The modal owns these controls. Stop the event from reaching the
  // document-level cart handler, otherwise the same click can be processed twice.
  event.stopPropagation();

  if (control.id === 'productModalAdd' && activeProductId) {
    addToCart(activeProductId);
    return;
  }

  if (control.dataset.plus) {
    changeQty(control.dataset.plus, 1);
    return;
  }

  if (control.dataset.minus) {
    changeQty(control.dataset.minus, -1);
  }
}

export function closeProductModal() {
  if (!isProductModalOpen()) return;

  productModal.classList.remove('show');
  productModal.setAttribute('aria-hidden', 'true');
  activeProductId = null;

  const cartDrawer = $('#cartDrawer');
  const checkoutModal = $('#checkoutModal');
  if (!cartDrawer.classList.contains('open') && !checkoutModal.classList.contains('show')) {
    $('#overlay').classList.remove('show');
    document.body.classList.remove('modal-open');
  }

  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

