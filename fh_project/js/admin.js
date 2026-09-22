const loginView = document.querySelector('#loginView');
const adminPanel = document.querySelector('#adminPanel');
const loginForm = document.querySelector('#loginForm');
const loginError = document.querySelector('#loginError');
const logoutButton = document.querySelector('#logoutButton');
const ordersContainer = document.querySelector('#orders');

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