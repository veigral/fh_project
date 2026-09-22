import { $, getProduct, money } from './data.js';
import { cartCount, getCart, cartTotal, clearCart, showToast } from './cart.js';

/* ============================== CART / CHECKOUT ========================= */


export const cartDrawer = $('#cartDrawer');
export const overlay = $('#overlay');
export const checkoutModal = $('#checkoutModal');
export const formView = $('#formView');
export const successView = $('#successView');
let deliveryMethod = 'delivery';

export function isCartOpen() {
  return cartDrawer.classList.contains('open');
}

export function isCheckoutOpen() {
  return checkoutModal.classList.contains('show');
}

export function openCart() {
  cartDrawer.classList.add('open');
  overlay.classList.add('show');
  document.body.classList.add('modal-open');
}

export function closeCart() {
  cartDrawer.classList.remove('open');
  syncOverlayState();
}

export function openCheckout() {
  if (cartCount() === 0) return;

  renderOrderSummary();
  checkoutModal.classList.add('show');
  checkoutModal.setAttribute('aria-hidden', 'false');
  overlay.classList.add('show');
  document.body.classList.add('modal-open');
}

export function closeCheckout() {
  checkoutModal.classList.remove('show');
  checkoutModal.setAttribute('aria-hidden', 'true');
  syncOverlayState();
}

export function syncOverlayState() {
  const productOpen = $('#productModal').classList.contains('show');
  const checkoutOpen = checkoutModal.classList.contains('show');
  const cartOpen = cartDrawer.classList.contains('open');
  const shouldShow = productOpen || checkoutOpen || cartOpen;

  overlay.classList.toggle('show', shouldShow);
  document.body.classList.toggle('modal-open', shouldShow);
}

export function renderOrderSummary() {
  const rows = Object.entries(getCart()).map(([id, quantity]) => {
    const product = getProduct(id);
    if (!product) return '';

    return `
      <div class="os-row">
        <span>${product.name} × ${quantity}</span>
        <span>${money(product.price * quantity)}</span>
      </div>`;
  }).join('');

  $('#orderSummary').innerHTML = `
    ${rows}
    <div class="os-total">
      <span>Итого</span>
      <span>${money(cartTotal())}</span>
    </div>`;
}

export function setDeliveryMethod(method) {
  deliveryMethod = method;
  $('#addressRow').style.display = deliveryMethod === 'delivery' ? 'block' : 'none';
}

export async function submitOrder(event) {
  event.preventDefault();

  const name = $('#custName').value.trim();
  const phone = $('#custPhone').value.trim();
  const address = $('#custAddress').value.trim();
  const requestedDate = $('#orderForm input[type="date"]').value;
  const requestedTime = $('#orderForm input[type="time"]').value;

  if (!name || !phone) {
    document.dispatchEvent(
      new CustomEvent('toast:show', {
        detail: '⚠️ Заполните обязательные поля',
      })
    );
    return;
  }

  if (deliveryMethod === 'delivery' && !address) {
    document.dispatchEvent(
      new CustomEvent('toast:show', {
        detail: '⚠️ Укажите адрес доставки',
      })
    );
    return;
  }

  if (!requestedDate || !requestedTime) {
    document.dispatchEvent(
      new CustomEvent('toast:show', {
        detail: '⚠️ Укажите дату и время получения заказа',
      })
    );

    return;
  }

  const items = Object.entries(getCart()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));

  try {
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: name,
        phone,
        address: deliveryMethod === 'delivery' ? address : '',
        comment: '',
        deliveryMethod,
        requestedDate,
        requestedTime,
        items,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Не удалось оформить заказ');
    }

    $('#successName').textContent = name;
    $('#successOrderId').textContent = data.order.id;

    formView.classList.add('hidden');
    successView.classList.remove('hidden');

    clearCart();
  } catch (error) {
    console.error('Ошибка оформления заказа:', error);

    document.dispatchEvent(
      new CustomEvent('toast:show', {
        detail: `⚠️ ${error.message}`,
      })
    );
  }
}

export function resetCheckoutView() {
  successView.classList.add('hidden');
  formView.classList.remove('hidden');
  $('#orderForm').reset();
}

