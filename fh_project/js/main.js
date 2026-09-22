import { $, $$, loadProducts } from './data.js';
import { addToCart, changeQty, removeFromCart, renderCardActions, renderCartDrawer, updateCartCount, showToast } from './cart.js';
import { renderProducts, toggleCategory } from './products.js';
import { productModal, productModalAction, closeProductModal, openProductModal, handleProductModalAction, renderProductModalAction, closeProductModalButton } from './modal.js';
import { cartDrawer, checkoutModal, openCart, closeCart, openCheckout, closeCheckout, syncOverlayState, setDeliveryMethod, submitOrder, resetCheckoutView } from './checkout.js';

/* ============================== APPLICATION ============================= */


/* ============================== REVEAL ================================== */

function observeReveal() {
  if (!('IntersectionObserver' in window)) {
    $$('.reveal, .reveal-scale').forEach((element) => element.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  $$('.reveal:not(.in-view), .reveal-scale').forEach((element) => observer.observe(element));
}

/* ============================== PRODUCT EVENTS ========================== */

closeProductModalButton.addEventListener('click', closeProductModal);

productModal.addEventListener('click', (event) => {
  if (event.target === productModal) closeProductModal();
});

productModalAction.addEventListener('click', handleProductModalAction);

/* ============================== GLOBAL EVENTS ========================== */

document.addEventListener('click', (event) => {
  const card = event.target.closest('[data-card]');
  const moreButton = event.target.closest('[data-show-more]');
  const addButton = event.target.closest('[data-add]');
  const plusButton = event.target.closest('[data-plus]');
  const minusButton = event.target.closest('[data-minus]');
  const removeButton = event.target.closest('[data-remove]');

  // Product modal owns its add/quantity controls.
  // Its handler stops propagation, this guard is an additional safety net.
  if (event.target.closest('#productModalAction')) return;

  if (card && !event.target.closest('.card-action')) {
    openProductModal(card.dataset.card);
    return;
  }

  if (moreButton) {
    toggleCategory(moreButton.dataset.showMore);
    return;
  }

  if (addButton) addToCart(addButton.dataset.add);
  if (plusButton) changeQty(plusButton.dataset.plus, 1);
  if (minusButton) changeQty(minusButton.dataset.minus, -1);
  if (removeButton) removeFromCart(removeButton.dataset.remove);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (productModal.classList.contains('show')) closeProductModal();
    else if (checkoutModal.classList.contains('show')) closeCheckout();
    else if (cartDrawer.classList.contains('open')) closeCart();
  }

  const isCardActivation =
    (event.key === 'Enter' || event.key === ' ') &&
    event.target.matches('[data-card]') &&
    !event.target.closest('.card-action');

  if (isCardActivation) {
    event.preventDefault();
    openProductModal(event.target.dataset.card);
  }
});

productModal.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;

  const focusable = $$('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])', productModal);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

/* ============================== OVERLAY / CART ========================== */

$('#cartBtn').addEventListener('click', openCart);
$('#closeCart').addEventListener('click', closeCart);

$('#overlay').addEventListener('click', () => {
  closeCart();
  closeProductModal();
  closeCheckout();
});

$('#checkoutBtn').addEventListener('click', () => {
  closeCart();
  openCheckout();
});

$('#closeCheckout').addEventListener('click', closeCheckout);

checkoutModal.addEventListener('click', (event) => {
  if (event.target === checkoutModal) closeCheckout();
});

/* ============================== CHECKOUT ================================ */

$$('.method-btn').forEach((button) => {
  button.addEventListener('click', () => {
    $$('.method-btn').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    setDeliveryMethod(button.dataset.method);
  });
});

$('#orderForm').addEventListener('submit', submitOrder);

$('#closeSuccess').addEventListener('click', () => {
  closeCheckout();
  setTimeout(resetCheckoutView, 350);
});

/* ============================== CART UPDATES ============================ */

document.addEventListener('cart:updated', () => {
  renderCardActions();
  renderCartDrawer();
  updateCartCount();
  renderProductModalAction();
  syncOverlayState();
});

document.addEventListener('toast:show', (event) => showToast(event.detail));

/* ============================== HEADER ================================== */

const header = $('#siteHeader');
const burger = $('#burger');
const mainNav = $('#mainNav');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  mainNav.classList.toggle('open');
});

$$('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    mainNav.classList.remove('open');
  });
});

/* ============================== INIT ==================================== */

async function init() {
  const productsLoaded = await loadProducts();

  if (!productsLoaded) {
    showApiError();
    return;
  }

  renderProducts();
  renderCardActions();
  renderCartDrawer();
  updateCartCount();
  observeReveal();
}

function showApiError() {
  const errorElement = document.createElement('div');

  errorElement.className = 'api-error';

  errorElement.innerHTML = `
    <h2>Не удалось загрузить товары</h2>
    <p>
      Сервер временно недоступен.
      Пожалуйста, попробуйте обновить страницу позже.
    </p>
    <button type="button" class="api-error__retry">
      Повторить
    </button>
  `;
  document.body.innerHTML = ``;
  document.body.prepend(errorElement);

  const retryButton = errorElement.querySelector('.api-error__retry');

  retryButton.addEventListener('click', () => {
    location.reload();
  });
}

init();
