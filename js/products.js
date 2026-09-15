import { $, $$, CATEGORY_ORDER, INITIAL_VISIBLE_PRODUCTS, REVEAL_DELAY, money, getCategoryLabel, products } from './data.js';

/* ============================== PRODUCTS ================================ */


export function productImageTemplate(product) {
  return `
    <div class="product-image">
      <img src="${product.img}" alt="${product.name}" loading="lazy">
    </div>`;
}

export function productCardTemplate(product, index) {
  const isHidden = index >= INITIAL_VISIBLE_PRODUCTS;
  const hiddenClass = isHidden ? ' product-hidden' : '';
  const ariaHidden = isHidden ? ' aria-hidden="true"' : '';

  return `
    <article
      class="card reveal${hiddenClass}"
      data-card="${product.id}"
      tabindex="0"
      role="button"
      aria-label="Подробнее о товаре «${product.name}»"${ariaHidden}
    >
      ${product.tag ? `<span class="tagline">${product.tag}</span>` : ''}
      ${productImageTemplate(product)}
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="desc">${product.desc}</p>
        <div class="price">${money(product.price)}</div>
        <div class="card-action" data-action="${product.id}"></div>
      </div>
    </article>`;
}

export function renderProducts() {
  CATEGORY_ORDER.forEach((category) => {
    const container = $(`[data-grid="${category}"]`);
    if (!container) return;

    const categoryProducts = products.filter((product) => product.category === category);
    container.innerHTML = categoryProducts
      .map((product, index) => productCardTemplate(product, index))
      .join('');
  });
}

export function toggleCategory(category) {
  const button = $(`[data-show-more="${category}"]`);
  const container = $(`[data-grid="${category}"]`);
  if (!button || !container) return;

  const cards = $$('.card', container);
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  const nextExpanded = !isExpanded;

  cards.slice(INITIAL_VISIBLE_PRODUCTS).forEach((card, index) => {
    card.classList.toggle('product-hidden', isExpanded);
    card.setAttribute('aria-hidden', isExpanded ? 'true' : 'false');
    card.style.setProperty(
      '--reveal-delay',
      nextExpanded ? `${index * REVEAL_DELAY}ms` : '0ms',
    );
  });

  button.setAttribute('aria-expanded', String(nextExpanded));
  button.classList.toggle('is-expanded', nextExpanded);
  button.textContent = nextExpanded ? 'Свернуть' : 'Показать ещё';
  button.setAttribute(
    'aria-label',
    nextExpanded
      ? `Свернуть товары: ${getCategoryLabel(category)}`
      : `Показать ещё товары: ${getCategoryLabel(category)}`,
  );
}
