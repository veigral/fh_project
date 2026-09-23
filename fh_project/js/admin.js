const loginView = document.querySelector('#loginView');
const adminPanel = document.querySelector('#adminPanel');
const loginForm = document.querySelector('#loginForm');
const loginError = document.querySelector('#loginError');
const logoutButton = document.querySelector('#logoutButton');
const ordersContainer = document.querySelector('#orders');
const ordersView = document.querySelector('#ordersView');
const productsView = document.querySelector('#productsView');
const adminTabs = document.querySelector('.admin-tabs');
const adminProducts = document.querySelector('#adminProducts');
let adminProductsData = [];

let currentStatus = '';

let token = sessionStorage.getItem('adminToken');

function logout() {
    token = null;

    sessionStorage.removeItem('adminToken');

    showLogin();

    loginForm.reset();

    ordersContainer.innerHTML = '';
}

logoutButton.addEventListener('click', () => {
    logout();
});

async function login(username, password) {
    try {
        loginError.textContent = '';

        const response = await fetch(
            'http://localhost:3000/api/auth/login',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || 'Не удалось выполнить вход'
            );
        }

        token = data.token;

        sessionStorage.setItem(
            'adminToken',
            token
        );

        showAdminPanel();
        loadOrders();
        loadOrderCounts();

    } catch (error) {
        console.error('Ошибка входа:', error);

        loginError.textContent = error.message;
    }
}

function showAdminPanel() {
    loginView.hidden = true;
    adminPanel.hidden = false;
}

function showLogin() {
    loginView.hidden = false;
    adminPanel.hidden = true;
}

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document
        .querySelector('#adminUsername')
        .value
        .trim();

    const password = document
        .querySelector('#adminPassword')
        .value;

    login(username, password);
});

async function loadAdminProducts() {
    try {
        const response = await fetch(
            'http://localhost:3000/api/products/admin',
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.status === 401) {
            logout();

            loginError.textContent =
                'Сессия истекла. Войдите снова.';

            return;
        }

        if (!response.ok) {
            throw new Error(
                `Ошибка сервера: ${response.status}`
            );
        }

        const products = await response.json();
        adminProductsData = products;

        renderAdminProducts(products);
    } catch (error) {
        console.error(
            'Ошибка загрузки товаров:',
            error
        );

        adminProducts.innerHTML = `
      <p>Не удалось загрузить товары.</p>
    `;
    }
}

function renderAdminProducts(products) {
    if (products.length === 0) {
        adminProducts.innerHTML = `
      <p>Товаров пока нет.</p>
    `;

        return;
    }

    adminProducts.innerHTML = products
        .map((product) => {
            const availability = product.is_available
                ? 'Доступен'
                : 'Скрыт';

            return `
        <article class="admin-product">
          <img
            src="${product.image}"
            alt="${product.name}"
            class="admin-product-image"
          >

          <div class="admin-product-info">
            <div class="admin-product-name">
              <small>${product.category_name}</small>

              <h3>${product.name}</h3>
            </div>

            <strong>
              ${product.price} ₽
            </strong>

            <div class="admin-product-actions">
                <span
                    class="admin-product-status ${product.is_available
                    ? 'is-available'
                    : 'is-hidden'
                }"
                >
                    ${availability}
                </span>

                <button
                    type="button"
                    class="product-availability-button"
                    data-product-id="${product.id}"
                    data-is-available="${product.is_available}"
                >
                    ${product.is_available
                    ? 'Скрыть'
                    : 'Вернуть в каталог'
                }
                </button>
                <button
                    type="button"
                    class="product-edit-button"
                    data-product-id="${product.id}"
                    >
                    Редактировать
                </button>
            </div>

            <div
                id="product-edit-${product.id}"
                class="product-edit-form"
                hidden
            ></div>

          </div>
        </article>
      `;
        })
        .join('');
}

function openProductEditForm(product) {
    const container = document.querySelector(
        `#product-edit-${product.id}`
    );

    if (!container) return;

    if (!container.hidden) {
        container.hidden = true;
        container.innerHTML = '';

        return;
    }

    container.innerHTML = `
    <div class="product-edit-fields">
      <label>
        Название
        <input
          type="text"
          class="product-edit-name"
          value="${product.name}"
        >
      </label>

        <label>
            Категория

            <select class="product-edit-category">
                <option
                value="strawberry"
                ${product.category === 'strawberry' ? 'selected' : ''}
                >
                Клубника в шоколаде
                </option>

                <option
                value="bouquet"
                ${product.category === 'bouquet' ? 'selected' : ''}
                >
                Сладкие букеты
                </option>

                <option
                value="macaron"
                ${product.category === 'macaron' ? 'selected' : ''}
                >
                Макарон
                </option>

                <option
                value="date"
                ${product.category === 'date' ? 'selected' : ''}
                >
                Королевские финики
                </option>
            </select>
        </label>

      <label>
        Краткое описание
        <textarea
          class="product-edit-description"
        >${product.description}</textarea>
      </label>

      <label>
        Подробное описание
        <textarea
          class="product-edit-details"
        >${product.details}</textarea>
      </label>

      <label>
        Цена
        <input
          type="number"
          min="0"
          step="1"
          class="product-edit-price"
          value="${product.price}"
        >
      </label>

      <label>
        Тег
        <input
          type="text"
          class="product-edit-tag"
          value="${product.tag || ''}"
        >
      </label>
    </div>

    <div class="product-edit-actions">
      <button
        type="button"
        class="product-save-button"
        data-product-id="${product.id}"
      >
        Сохранить
      </button>

      <button
        type="button"
        class="product-cancel-button"
        data-product-id="${product.id}"
      >
        Отмена
      </button>
    </div>
  `;

    container.hidden = false;
}

async function updateProductAvailability(
    productId,
    isAvailable
) {
    try {
        const response = await fetch(
            `http://localhost:3000/api/products/${productId}/availability`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    isAvailable,
                }),
            }
        );

        if (response.status === 401) {
            logout();

            loginError.textContent =
                'Сессия истекла. Войдите снова.';

            return;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                'Не удалось изменить доступность товара'
            );
        }

        loadAdminProducts();
    } catch (error) {
        console.error(
            'Ошибка изменения доступности товара:',
            error
        );

        alert(error.message);
    }
}

async function saveProductChanges(productId) {
    const container = document.querySelector(
        `#product-edit-${productId}`
    );

    if (!container) return;

    const name = container
        .querySelector('.product-edit-name')
        .value
        .trim();

    const category = container
        .querySelector('.product-edit-category')
        .value;

    const description = container
        .querySelector('.product-edit-description')
        .value
        .trim();

    const details = container
        .querySelector('.product-edit-details')
        .value
        .trim();

    const price = Number(
        container.querySelector('.product-edit-price').value
    );

    const tag = container
        .querySelector('.product-edit-tag')
        .value
        .trim();

    if (!name) {
        alert('Укажите название товара');
        return;
    }

    if (!Number.isInteger(price) || price < 0) {
        alert('Укажите корректную цену');
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/api/products/${productId}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    category,
                    description,
                    details,
                    price,
                    tag: tag || null,
                }),
            }
        );

        if (response.status === 401) {
            logout();

            loginError.textContent =
                'Сессия истекла. Войдите снова.';

            return;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || 'Не удалось обновить товар'
            );
        }

        await loadAdminProducts();
    } catch (error) {
        console.error(
            'Ошибка обновления товара:',
            error
        );

        alert(error.message);
    }
}

adminProducts.addEventListener('click', (event) => {
    const availabilityButton = event.target.closest(
        '.product-availability-button'
    );

    if (availabilityButton) {
        const productId =
            availabilityButton.dataset.productId;

        const isCurrentlyAvailable =
            availabilityButton.dataset.isAvailable === 'true';

        updateProductAvailability(
            productId,
            !isCurrentlyAvailable
        );

        return;
    }

    const editButton = event.target.closest(
        '.product-edit-button'
    );

    if (editButton) {
        const productId =
            editButton.dataset.productId;

        const product = adminProductsData.find(
            (item) => item.id === productId
        );

        if (product) {
            openProductEditForm(product);
        }

        return;
    }

    const saveButton = event.target.closest(
        '.product-save-button'
    );

    if (saveButton) {
        const productId = saveButton.dataset.productId;

        saveProductChanges(productId);

        return;
    }

    const cancelButton = event.target.closest(
        '.product-cancel-button'
    );

    if (cancelButton) {
        const productId = cancelButton.dataset.productId;

        const container = document.querySelector(
            `#product-edit-${productId}`
        );

        if (container) {
            container.hidden = true;
            container.innerHTML = '';
        }

        return;
    }
});

adminTabs.addEventListener('click', (event) => {
    const button = event.target.closest('.admin-tab');

    if (!button) return;

    adminTabs
        .querySelectorAll('.admin-tab')
        .forEach((tab) => {
            tab.classList.remove('active');
        });

    button.classList.add('active');

    const tab = button.dataset.tab;

    if (tab === 'products') {
        ordersView.hidden = true;
        productsView.hidden = false;

        loadAdminProducts();

        return;
    }

    productsView.hidden = true;
    ordersView.hidden = false;
});

async function loadOrders(status = '') {
    try {
        let url = 'http://localhost:3000/api/orders';

        if (status) {
            url += `?status=${status}`;
        }

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 401) {
            logout();

            loginError.textContent =
                'Сессия истекла. Войдите снова.';

            return;
        }

        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const orders = await response.json();

        renderOrders(orders);
    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);

        ordersContainer.innerHTML = `
      <p>Не удалось загрузить заказы.</p>
    `;
    }
}

const filters = document.querySelector('.order-filters');

filters.addEventListener('click', (event) => {
    const button = event.target.closest('button');

    if (!button) return;

    filters
        .querySelectorAll('button')
        .forEach((item) => {
            item.classList.remove('active');
        });

    button.classList.add('active');

    currentStatus = button.dataset.status;

    loadOrders(currentStatus);
});

function getStatusLabel(status) {
    const labels = {
        new: 'Новый',
        processing: 'В работе',
        completed: 'Выполнен',
        cancelled: 'Отменён',
    };

    return labels[status] || status;
}

function getStatusClass(status) {
    const classes = {
        new: 'status-new',
        processing: 'status-processing',
        completed: 'status-completed',
        cancelled: 'status-cancelled',
    };

    return classes[status] || '';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatRequestedDate(dateString) {
    if (!dateString) {
        return 'Не указана';
    }

    const [year, month, day] = dateString.split('-');

    return `${day}.${month}.${year}`;
}

function formatRequestedTime(timeString) {
    if (!timeString) {
        return 'Не указано';
    }

    return timeString.slice(0, 5);
}

function renderOrders(orders) {
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
      <p>Заказов пока нет.</p>
    `;

        return;
    }

    ordersContainer.innerHTML = orders
        .map((order) => {
            const delivery =
                order.delivery_method === 'pickup'
                    ? 'Самовывоз'
                    : 'Доставка';

            return `
        <article>
            <div class="order-card-header">
                <div>
                <h2>Заказ №${order.id}</h2>

                <div class="order-card-date">
                    ${formatDate(order.created_at)}
                </div>
                </div>

                <div class="order-card-meta">
                <strong class="order-card-total">
                    ${order.total_price} ₽
                </strong>

                <span
                    id="order-status-${order.id}"
                    class="order-status ${getStatusClass(order.status)}"
                >
                    ${getStatusLabel(order.status)}
                </span>
                </div>
            </div>

          <p>
            <strong>Клиент:</strong>
            ${order.customer_name}
          </p>

          <p>
            <strong>Телефон:</strong>
            ${order.phone}
          </p>

          <p>
            <strong>Получение:</strong>
            ${delivery}
          </p>

          <p>
            <strong>Сумма:</strong>
            ${order.total_price} ₽
          </p>

        <div class="order-actions">
        <div class="order-status-control">
            <select
            class="order-status-select"
            data-order-id="${order.id}"
            >
            <option value="new" ${order.status === 'new' ? 'selected' : ''}>
                Новый
            </option>

            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>
                В работе
            </option>

            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>
                Выполнен
            </option>

            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>
                Отменён
            </option>
            </select>

            <button
            type="button"
            class="order-status-button"
            data-order-id="${order.id}"
            >
            Сохранить статус
            </button>
        </div>

        <button
            type="button"
            class="order-details-button"
            data-order-id="${order.id}"
        >
            Подробнее
        </button>
        </div>

          <div
            id="order-details-${order.id}"
            class="order-details"
          ></div>

          <hr>
        </article>
      `;
        })
        .join('');
}

async function loadOrderDetails(orderId) {
    const detailsContainer = document.querySelector(
        `#order-details-${orderId}`
    );

    const button = document.querySelector(
        `.order-details-button[data-order-id="${orderId}"]`
    );

    if (detailsContainer.dataset.loaded === 'true') {
        const isHidden = detailsContainer.hidden;

        detailsContainer.hidden = !isHidden;

        button.textContent = isHidden
            ? 'Скрыть'
            : 'Подробнее';

        return;
    }

    try {
        detailsContainer.hidden = false;
        detailsContainer.innerHTML = '<p>Загрузка...</p>';

        const response = await fetch(
            `http://localhost:3000/api/orders/${orderId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.status === 401) {
            logout();

            loginError.textContent =
                'Сессия истекла. Войдите снова.';

            return;
        }

        if (!response.ok) {
            throw new Error(
                `Ошибка сервера: ${response.status}`
            );
        }

        const order = await response.json();

        const items = order.items
            .map((item) => {
                const itemTotal = item.quantity * item.price;

                return `
        <div class="order-item">
            <div class="order-item-name">
                ${item.name}
            </div>

            <div class="order-item-meta">
                <span>
                    ${item.quantity} × ${item.price} ₽
                </span>

                <strong>
                    ${itemTotal} ₽
                </strong>
            </div>
      </div>
    `;
            })
            .join('');

        detailsContainer.innerHTML = `
        
        <div class="order-details-section">
            <h3>Данные заказа</h3>

            <div class="order-details-row">
                <span>Клиент</span>
                <strong>${order.customer_name}</strong>
            </div>

            <div class="order-details-row">
                <span>Телефон</span>
                <strong>${order.phone}</strong>
            </div>

            <div class="order-details-row">
                <span>Получение</span>
                <strong>
                ${order.delivery_method === 'pickup'
                ? 'Самовывоз'
                : 'Доставка'}
                </strong>
            </div>

            <div class="order-details-row">
                <span>Адрес</span>
                <strong>${order.address || 'Не указан'}</strong>
            </div>

            <div class="order-details-row">
                <span>Дата получения</span>
                <strong>
                ${formatRequestedDate(order.requested_date)}
                </strong>
            </div>

            <div class="order-details-row">
                <span>Время получения</span>
                <strong>
                ${formatRequestedTime(order.requested_time)}
                </strong>
            </div>

            <div class="order-details-row">
                <span>Комментарий</span>
                <strong>${order.comment || 'Нет'}</strong>
            </div>
            </div>

    <div class="order-items">
        <p>
            <strong>Товары:</strong>
        </p>    

    ${items}

    <div class="order-items-total">
        <span>Итого</span>
        <strong>${order.total_price} ₽</strong>
    </div>
    </div>
    `;

        detailsContainer.dataset.loaded = 'true';

        button.textContent = 'Скрыть';
    } catch (error) {
        console.error(
            'Ошибка загрузки заказа:',
            error
        );

        detailsContainer.innerHTML = `
      <p>Не удалось загрузить детали заказа.</p>
    `;
    }
}

async function updateOrderStatus(orderId) {
    const select = document.querySelector(
        `.order-status-select[data-order-id="${orderId}"]`
    );

    const statusElement = document.querySelector(
        `#order-status-${orderId}`
    );

    const status = select.value;

    try {
        const response = await fetch(
            `http://localhost:3000/api/orders/${orderId}/status`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status,
                }),
            }
        );

        if (response.status === 401) {
            logout();

            loginError.textContent =
                'Сессия истекла. Войдите снова.';

            return;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || 'Не удалось изменить статус'
            );
        }

        statusElement.textContent = getStatusLabel(
            data.order.status
        );

        statusElement.className =
            `order-status ${getStatusClass(data.order.status)}`;

        if (
            currentStatus &&
            data.order.status !== currentStatus
        ) {
            loadOrders(currentStatus);
            loadOrderCounts();
        }

        alert('Статус заказа обновлён');
    } catch (error) {
        console.error(
            'Ошибка изменения статуса заказа:',
            error
        );

        alert(error.message);
    }
}

ordersContainer.addEventListener('click', (event) => {
    const detailsButton = event.target.closest(
        '.order-details-button'
    );

    if (detailsButton) {
        const orderId = detailsButton.dataset.orderId;

        loadOrderDetails(orderId);

        return;
    }

    const statusButton = event.target.closest(
        '.order-status-button'
    );

    if (statusButton) {
        const orderId = statusButton.dataset.orderId;

        updateOrderStatus(orderId);
    }
});

async function loadOrderCounts() {
    try {
        const response = await fetch(
            'http://localhost:3000/api/orders',
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.status === 401) {
            logout();

            loginError.textContent =
                'Сессия истекла. Войдите снова.';

            return;
        }

        if (!response.ok) {
            throw new Error(
                `Ошибка сервера: ${response.status}`
            );
        }

        const orders = await response.json();

        const counts = {
            all: orders.length,
            new: 0,
            processing: 0,
            completed: 0,
            cancelled: 0,
        };

        orders.forEach((order) => {
            if (counts[order.status] !== undefined) {
                counts[order.status]++;
            }
        });

        document.querySelector('#count-all').textContent =
            counts.all;

        document.querySelector('#count-new').textContent =
            counts.new;

        document.querySelector('#count-processing').textContent =
            counts.processing;

        document.querySelector('#count-completed').textContent =
            counts.completed;

        document.querySelector('#count-cancelled').textContent =
            counts.cancelled;
    } catch (error) {
        console.error(
            'Ошибка загрузки счётчиков заказов:',
            error
        );
    }
}

async function checkAuth() {
    if (!token) {
        showLogin();
        return;
    }

    try {
        const response = await fetch(
            'http://localhost:3000/api/auth/me',
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.status === 401) {
            logout();

            loginError.textContent =
                'Сессия истекла. Войдите снова.';

            return;
        }

        if (!response.ok) {
            throw new Error(
                `Ошибка сервера: ${response.status}`
            );
        }

        showAdminPanel();
        loadOrders();
        loadOrderCounts();

    } catch (error) {
        console.error(
            'Ошибка проверки авторизации:',
            error
        );

        showLogin();

        loginError.textContent =
            'Не удалось проверить авторизацию';
    }
}



checkAuth();