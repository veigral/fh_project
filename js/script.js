/* ============ PRODUCT DATA ============ */

const products = [
  // Strawberries
  {id:'s1', category:'strawberry', name:'Набор «Классический»', desc:'12 ягод в молочном шоколаде с декором (любое описание)', price:1890, tag:'Хит', img:'img/strawberry/2.jpg'},
  {id:'s2', category:'strawberry', name:'Набор «Бельгийский»', desc:'12 ягод в молочном шоколаде с декором (любое описание)', price:2090, img:'img/strawberry/2.jpg'},
  {id:'s3', category:'strawberry', name:'Набор «Праздничный»', desc:'12 ягод в молочном шоколаде с декором (любое описание)', price:2690, tag:'Новинка', img:'img/strawberry/2.jpg'},
  {id:'s4', category:'strawberry', name:'Мини-набор «Комплимент»', desc:'12 ягод в молочном шоколаде с декором (любое описание)', price:1190, img:'img/strawberry/2.jpg'},

  // Bouquets
  {id:'b1', category:'bouquet', name:'Сладкий букет', desc:'Состав/описание', price:2490, img:'img/bouquets/1.jpg'},
  {id:'b2', category:'bouquet', name:'Сладкий букет»', desc:'Состав/описание', price:2890, tag:'Хит', img:'img/bouquets/1.jpg'},
  {id:'b3', category:'bouquet', name:'Сладкий букет»', desc:'Состав/описание', price:3190, img:'img/bouquets/1.jpg'},
  {id:'b4', category:'bouquet', name:'Сладкий букет»', desc:'Состав/описание', price:1590, img:'img/bouquets/1.jpg'},

  // Macarons
  {id:'m1', category:'macaron', name:'Набор «Ассорти»', desc:'12 макарон, 6 классических вкусов', price:1690, img:'img/macaron/1.jpg'},
  {id:'m2', category:'macaron', name:'Набор «Ягодный»', desc:'12 макарон', price:1790, img:'img/macaron/1.jpg'},
  {id:'m3', category:'macaron', name:'Набор «Шоколадный»', desc:'12 макарон с шоколадом', price:1790, img:'img/macaron/1.jpg'},
  {id:'m4', category:'macaron', name:'Праздничная коробка', desc:'24 макарон, ассорти', price:3290, tag:'Выгодно', img:'img/macaron/1.jpg'},

  // Dates
  {id:'d1', category:'date', name:'Финики в шоколаде', desc:'Описание/состав', price:1290, img:'img/dates-fruit/1.jpg'},
  {id:'d2', category:'date', name:'Финики в шоколаде', desc:'Описание/состав', price:1390, img:'img/dates-fruit/1.jpg'},
  {id:'d3', category:'date', name:'Финики в шоколаде', desc:'Описание/состав', price:1290, img:'img/dates-fruit/1.jpg'},
  {id:'d4', category:'date', name:'Финики в шоколаде', desc:'Описание/состав', price:1990, tag:'Хит', img:'img/dates-fruit/1.jpg'},
];

const emojiMap = {strawberry:'🍓', bouquet:'💐'};

function money(n){ return n.toLocaleString('ru-RU') + ' ₽'; }

function iconHTML(p){
  return `<div class="product-image"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>`;
}

function cardTemplate(p){
  return `
  <div class="card reveal" data-card="${p.id}">
    ${p.tag ? `<span class="tagline">${p.tag}</span>` : ''}
    ${iconHTML(p)}
    <h3>${p.name}</h3>
    <p class="desc">${p.desc}</p>
    <div class="price">${money(p.price)}</div>
    <div class="card-action" data-action="${p.id}"></div>
  </div>`;
}

function renderProducts(){
  ['strawberry','bouquet','macaron','date'].forEach(cat=>{
    const container = document.querySelector(`[data-grid="${cat}"]`);
    container.innerHTML = products.filter(p=>p.category===cat).map(cardTemplate).join('');
  });
  renderCardActions();
  observeReveal();
}

/* ============ CART ============ */
let cart = JSON.parse(localStorage.getItem('fh_cart') || '{}');

function saveCart(){
  localStorage.setItem('fh_cart', JSON.stringify(cart));
  renderCardActions();
  renderCartDrawer();
  updateCartCount();
}

function addToCart(id){
  cart[id] = (cart[id]||0) + 1;
  saveCart();
  showToast('✅ Товар добавлен в корзину');
  bumpCartIcon();
}

function changeQty(id, delta){
  if(!cart[id]) return;
  cart[id] += delta;
  if(cart[id] <= 0) delete cart[id];
  saveCart();
}

function removeFromCart(id){
  delete cart[id];
  saveCart();
}

function cartCount(){
  return Object.values(cart).reduce((a,b)=>a+b, 0);
}

function cartTotal(){
  return Object.entries(cart).reduce((sum,[id,qty])=>{
    const p = products.find(p=>p.id===id);
    return sum + (p ? p.price*qty : 0);
  }, 0);
}

function updateCartCount(){
  const el = document.getElementById('cartCount');
  const count = cartCount();
  el.textContent = count;
  el.classList.toggle('show', count>0);
}

function bumpCartIcon(){
  const el = document.getElementById('cartCount');
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

function renderCardActions(){
  products.forEach(p=>{
    const wrap = document.querySelector(`[data-action="${p.id}"]`);
    if(!wrap) return;
    const qty = cart[p.id] || 0;
    if(qty > 0){
      wrap.innerHTML = `
        <div class="qty-row">
          <button data-minus="${p.id}">−</button>
          <span>${qty} шт.</span>
          <button data-plus="${p.id}">+</button>
        </div>`;
    } else {
      wrap.innerHTML = `<button class="add-btn" data-add="${p.id}">🛍 В корзину</button>`;
    }
  });
}

function renderCartDrawer(){
  const container = document.getElementById('cartItems');
  const entries = Object.entries(cart);
  if(entries.length === 0){
    container.innerHTML = `<div class="cart-empty"><span class="em">🛍</span>Ваша корзина пока пуста<br>Добавьте что-нибудь сладкое!</div>`;
  } else {
    container.innerHTML = entries.map(([id,qty])=>{
      const p = products.find(p=>p.id===id);
      if(!p) return '';
      const emo = p.category==='macaron' ? '🥐' : p.category==='date' ? '🌰' : (emojiMap[p.category]||'🍬');
      return `
      <div class="cart-item">
        <div class="ci-icon">${emo}</div>
        <div class="ci-info">
          <h4>${p.name}</h4>
          <div class="ci-price">${money(p.price)}</div>
          <div class="ci-qty">
            <button data-minus="${id}">−</button>
            <span>${qty}</span>
            <button data-plus="${id}">+</button>
            <span class="ci-remove" data-remove="${id}">Удалить</span>
          </div>
        </div>
      </div>`;
    }).join('');
  }
  document.getElementById('cartTotal').textContent = money(cartTotal());
  document.getElementById('checkoutBtn').disabled = entries.length === 0;
}

/* Delegated click handling for add/plus/minus/remove */
document.addEventListener('click', (e)=>{
  const add = e.target.closest('[data-add]');
  const plus = e.target.closest('[data-plus]');
  const minus = e.target.closest('[data-minus]');
  const remove = e.target.closest('[data-remove]');
  if(add) addToCart(add.dataset.add);
  if(plus) changeQty(plus.dataset.plus, 1);
  if(minus) changeQty(minus.dataset.minus, -1);
  if(remove) removeFromCart(remove.dataset.remove);
});

/* ============ TOAST ============ */
let toastTimer;
function showToast(msg){
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove('show'), 2400);
}

/* ============ CART DRAWER TOGGLE ============ */
const cartDrawer = document.getElementById('cartDrawer');
const overlay = document.getElementById('overlay');

function openCart(){
  cartDrawer.classList.add('open');
  overlay.classList.add('show');
}
function closeCart(){
  cartDrawer.classList.remove('open');
  overlay.classList.remove('show');
}
document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
overlay.addEventListener('click', ()=>{ closeCart(); closeModal(); });

/* ============ HEADER SCROLL & MOBILE MENU ============ */
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', ()=>{
  header.classList.toggle('scrolled', window.scrollY > 40);
});

const burger = document.getElementById('burger');
const mainNav = document.getElementById('mainNav');
burger.addEventListener('click', ()=>{
  burger.classList.toggle('open');
  mainNav.classList.toggle('open');
});
document.querySelectorAll('.nav-link').forEach(link=>{
  link.addEventListener('click', ()=>{
    burger.classList.remove('open');
    mainNav.classList.remove('open');
  });
});

/* ============ CHECKOUT MODAL ============ */
const checkoutModal = document.getElementById('checkoutModal');
const formView = document.getElementById('formView');
const successView = document.getElementById('successView');
let deliveryMethod = 'delivery';

function openModal(){
  if(cartCount()===0) return;
  renderOrderSummary();
  checkoutModal.classList.add('show');
  overlay.classList.add('show');
}
function closeModal(){
  checkoutModal.classList.remove('show');
  if(!cartDrawer.classList.contains('open')) overlay.classList.remove('show');
}

document.getElementById('checkoutBtn').addEventListener('click', ()=>{
  closeCart();
  openModal();
});

document.querySelectorAll('.method-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.method-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    deliveryMethod = btn.dataset.method;
    document.getElementById('addressRow').style.display = deliveryMethod==='delivery' ? 'block' : 'none';
  });
});

function renderOrderSummary(){
  const entries = Object.entries(cart);
  const rows = entries.map(([id,qty])=>{
    const p = products.find(p=>p.id===id);
    return `<div class="os-row"><span>${p.name} × ${qty}</span><span>${money(p.price*qty)}</span></div>`;
  }).join('');
  document.getElementById('orderSummary').innerHTML = `
    ${rows}
    <div class="os-total"><span>Итого</span><span>${money(cartTotal())}</span></div>
  `;
}

document.getElementById('orderForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();

  if(!name || !phone){ showToast('⚠️ Заполните обязательные поля'); return; }
  if(deliveryMethod==='delivery' && !address){ showToast('⚠️ Укажите адрес доставки'); return; }

  const orderId = Math.floor(10000 + Math.random()*89999);
  document.getElementById('successName').textContent = name;
  document.getElementById('successOrderId').textContent = orderId;

  formView.classList.add('hidden');
  successView.classList.remove('hidden');

  cart = {};
  saveCart();
});

document.getElementById('closeSuccess').addEventListener('click', ()=>{
  closeModal();
  setTimeout(()=>{
    successView.classList.add('hidden');
    formView.classList.remove('hidden');
    document.getElementById('orderForm').reset();
  }, 350);
});

/* ============ SCROLL REVEAL ============ */
function observeReveal(){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:.15});
  document.querySelectorAll('.reveal:not(.in-view), .reveal-scale').forEach(el=> io.observe(el));
}

/* ============ INIT ============ */
renderProducts();
renderCartDrawer();
updateCartCount();