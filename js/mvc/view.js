import { formatDDMMYYYYHHMM } from '../shared/date.js';

class ProductsView {
    constructor() {
        this._productCards = document.getElementById("product-cards");
    }

    renderProducts(products) {
        this._productCards.innerHTML = '';

        if (!products.length) {
            this._productCards.innerHTML = `
            <div class="h4">Товары не найдены</div>
            `;
            return;
        }

        products.forEach(product => {
            this._productCards.appendChild(this._createNodeProduct(product));
        });
    }

    _createNodeProduct(product) {
        const template = document.createElement('template');
        template.innerHTML = `
        <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="card h-100">
            <img
                class="card-img-top catd__img" 
                src="${product.image_url}" 
                alt="${product.name}"
            >
            <div class="card-body d-flex flex-column justify-content-between">
                <div class="card-title card__title">${product.name}</div>
                <div>
                    <div class="d-flex align-items-center mb-2">
                        <small class="me-2">${product.rating}</small>
                        <div class="d-flex gap-1">
                            ${this._createHTMLProductRating(product.rating)}
                        </div>
                    </div>
                    <div>
                        ${this._createHTMLProductPrice(product)}
                    </div>
                    <p class="card-text"></p>
                </div>
            </div>
            <button class="btn btn-sm btn-primary">В корзину</button>
        </div>
        </div>
        `;
        const node = template.content.cloneNode(true);

        const btn = node.querySelector('button');

        const toggleButton = () => {
            if (this.hasProductInCart(product.id)) {
                btn.textContent = 'В корзине';
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-success');
            } else {
                btn.textContent = 'В корзину';
                btn.classList.remove('btn-success');
                btn.classList.add('btn-primary');
            }
        };
        
        toggleButton();
        btn.addEventListener('click', () => {
            this.onClickProduct(product.id);
            toggleButton();
        });

        return node;
    }

    handleCartButton(onClick, hasInCart) {
        this.onClickProduct = onClick;
        this.hasProductInCart = hasInCart;
    }

    _createHTMLProductRating(rating) {
        let template = '';
        
        const fullStars = Math.floor(rating);

        for (let i = 0; i < fullStars; i++) {
            template += `<i class="bi bi-star-fill"></i>`;
        }

        const decimalPart = rating - fullStars;
        if (decimalPart >= 0.5) {
            template += `<i class="bi bi-star-half"></i>`;
        } else {
            template += `<i class="bi bi-star"></i>`;
        }

        const remainingStars = 5 - fullStars - 1;
        for (let i = 0; i < remainingStars; i++) {
            template += `<i class="bi bi-star"></i>`;
        }
      
        return template;
    }

    _createHTMLProductPrice(product) {
        let template = '';
        const discount = 100 - Math.round(
            product.discount_price / product.actual_price * 100
        );

        if (product.isDiscounted()) {
            template = `
            <span class="me-1">
                ${product.discount_price} ₽
            </span>
            <span class="text-decoration-line-through me-1">
                ${product.actual_price} ₽
            </span>
            <span class="fw-bold text-danger">
                (-${discount}%)
            </span>
            `;
        } else {
            template = `
            <span class="me-1">
                ${product.actual_price} ₽
            </span>
            `;
        }
        return template;
    }
}

class FilterView {
    constructor() {
        this._searchForm = document.getElementById('product-search');
        this._searchInput = this._searchForm.querySelector('input');
        this._filterForm = document
            .getElementById('product-filter');
        this._categoriesList = this._filterForm
            .querySelector('#product-filter-list');
        this._priceFromInput = this._filterForm.querySelector('#price-from');
        this._priceToInput = this._filterForm.querySelector('#price-to');
        this._discountedCheckbox = this._filterForm
            .querySelector('#discounted');
        this._sortSelect = document.getElementById('product-sort');
    }

    render(filter) {
        this._searchInput.value = filter.search;
        this._sortSelect.value = filter.sort;

        this._categoriesList.innerHTML = this._createHTMLCategory(
            filter.categories, filter.filter.categories
        );
        this._priceFromInput.value = filter.filter.price_from;
        this._priceToInput.value = filter.filter.price_to;
        this._discountedCheckbox.checked = filter.filter.only_discounted;
    }

    _createHTMLCategory(categories, selectedCategories) {
        let template = '';
        categories.forEach(category => {
            const element = `
            <div class="form-check">
                <input 
                    class="form-check-input"
                    type="checkbox" value="${category}"
                    id="${category}"
                    name="${category}"
                    ${selectedCategories.includes(category) ? 'checked' : ''}
                >
                <label
                    class="form-check-label"
                    for="${category}"
                >
                    ${category}
                </label>
            </div>
            `;
            template += element;
        });
        return template;
    }

    onSearchSubmit(callback) {
        this._searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const search = formData.get('search');
            callback(search);
        });
    }

    onFilterSubmit(callback) {
        this._filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const categories = [];
            
            formData.entries().forEach(([key, value]) => {
                if (
                    key === 'price-from'
                    || key === 'price-to'
                    || key === 'discounted'
                ) return;

                categories.push(value);
            });
            
            callback({
                categories,
                price_from: Number(formData.get('price-from')),
                price_to: Number(formData.get('price-to')),
                only_discounted: formData.has('discounted')
            });
        });
    }

    onSortSubmit(callback) {
        this._sortSelect.addEventListener('change', (e) => {
            callback(e.target.value);
        });
    }
}

class CartFormView {
    constructor() {
        this._form = document.getElementById('cart-form');
        this._deliveryDateInput = this._form.querySelector('#delivery_date');
        this._deliveryIntervalInput = this._form
            .querySelector('#delivery_interval');
        this._totalPriceSpan = document.getElementById('cart-total-price');
        this._deliveryPriceSpan = document
            .getElementById('cart-delivery-price');
    }

    render(totalPrice, deliveryPrice) {
        this._totalPriceSpan.textContent = parseInt(totalPrice, 10)
            .toLocaleString();
        this._deliveryPriceSpan.textContent = deliveryPrice;
    }

    handleChangeDelivery(onChangeDate, onChangeInterval) {
        this._deliveryDateInput.addEventListener('change', (e) => {
            onChangeDate(new Date(e.target.value));
        });
        this._deliveryIntervalInput.addEventListener('change', (e) => {
            onChangeInterval(e.target.value);
        });
    }

    onSubmitForm(callback) {
        this._form.addEventListener('submit', (e) => {
            e.preventDefault();
            callback(new FormData(e.target));
        });
    }

    resetForm() {
        this._form.reset();
    }
}

class ToastifyView {
    constructor() {
        this._toastContainer = document.getElementById('toast');
        this._toastMessage = this._toastContainer
            .querySelector('#toast-message');
        this._toast = bootstrap.Toast.getOrCreateInstance(this._toastContainer);
    }

    success(message) {
        this._toastContainer.className = (
            'toast align-items-center text-bg-success border-0'
        );
        this._toastMessage.textContent = message;
        this._toast.show();
    }

    error(message) {
        this._toastContainer.className = (
            'toast align-items-center text-bg-danger border-0'
        );
        this._toastMessage.textContent = message;
        this._toast.show();
    }
}

class OrdersTableView {
    constructor() {
        this._tableBody = document.getElementById('orders-table');
    }

    handleClickBtn(openModal) {
        this._openModal = openModal;
    }

    render(orders) {
        this._tableBody.innerHTML = '';
        orders.forEach(order => {
            this._tableBody.appendChild(this._createNodeRowTable(order));
        });
    }

    _createNodeRowTable(order) {
        const template = document.createElement('template');

        template.innerHTML = `
        <tr>
            <th class="align-middle">
                ${order.id}
            </th>
            <td class="align-middle">
                ${formatDDMMYYYYHHMM(order.created_at)}
            </td>
            <td>
                ${order.products.map(product => product.name).join(', ')}
            </td>
            <td class="align-middle">
                ${parseInt(order.totalPrice, 10).toLocaleString()} ₽
            </td>
            <td class="align-middle">
                ${order.delivery_date} ${order.delivery_interval}
            </td>
            <td class="align-middle">
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-secondary view-order">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning update-order">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-order">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
        `;
        const node = template.content.cloneNode(true);

        const viewOrderBtn = node.querySelector('.view-order');
        const updateOrderBtn = node.querySelector('.update-order');
        const deleteOrderBtn = node.querySelector('.delete-order');

        viewOrderBtn.addEventListener('click', () =>
            this._openModal(order, 'view')
        );
        updateOrderBtn.addEventListener('click', () =>
            this._openModal(order, 'update')
        );
        deleteOrderBtn.addEventListener('click', () =>
            this._openModal(order, 'delete')
        );
        return node;
    }
}

class OrderModalView {
    constructor() {
        this._modalEl = document.getElementById('order-modal');
        this._title = this._modalEl.querySelector('#order-modal__title');
        this._body = this._modalEl.querySelector('#order-modal__body');
        this._btns = this._modalEl.querySelector('#order-modal__btns');

        this._modal = new bootstrap.Modal(this._modalEl);
    }

    showModal(order, type) {
        switch (type) {
        case 'view':
            this._viewModal(order);
            break;
        case 'update':
            this._updateModal(order);
            break;
        case 'delete':
            this._deleteModal(order.id);
            break;
        }
        
        this._modal.show();
    }

    closeModal() {
        this._modal.hide();
    }

    handleClickBtn(onUpdateOrder, onDeleteOrder) {
        this._onUpdateOrder = onUpdateOrder;
        this._onDeleteOrder = onDeleteOrder;
    }

    _closeBtn(text) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-secondary';
        btn.textContent = text;
        btn.addEventListener('click', () => this._modal.hide());
        return btn;
    }

    _saveBtn() {
        const btn = document.createElement('button');
        btn.type = 'submit';
        btn.className = `btn btn-primary`;
        btn.setAttribute('form', 'order-modal__form');
        btn.textContent = 'Сохранить';
        return btn;
    }

    _deleteBtn(callback) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn btn-danger`;
        btn.textContent = 'Да';
        btn.addEventListener('click', () => {
            callback();
            this._modal.hide();
        });
        return btn;
    }

    _createNodeBodyRoot(type, order) {
        let node;
        if (type == 'view') {
            node = document.createElement('div');
        } else {
            node = document.createElement('form');
            node.id = 'order-modal__form';
            node.addEventListener('submit', (e) => {
                e.preventDefault();
                this._onUpdateOrder(order, new FormData(e.target));
            });
        }
        return node;
    }

    _createHTMLName(value, type) {
        return type === 'view' 
            ? `
            <div class="col-6 fw-bold">Имя</div>
            <div class="col-6">${value}</div>
            `
            : `
            <label class="form-label col-6 fw-bold" for="full_name">Имя</label>
            <div class="col-6">
                <input
                    type="text"
                    class="form-control"
                    id="full_name"
                    name="full_name"
                    value="${value}"
                    required
                >
            </div>
            `;
    }

    _createHTMLPhone(value, type) {
        return type === 'view'
            ? `
            <div class="col-6 fw-bold">Номер телефона</div>
            <div class="col-6">${value}</div>
            `
            : `
            <label class="form-label col-6 fw-bold" for="phone">
                Номер телефона
            </label>
            <div class="col-6">
                <input
                    type="text"
                    class="form-control"
                    id="phone"
                    name="phone"
                    value="${value}"
                    required
                >
            </div>
            `;
    }

    _createHTMLEmail(value, type) {
        return type === 'view' 
            ? `
            <div class="col-6 fw-bold">Email</div>
            <div class="col-6">${value}</div>
            `
            : `
            <label class="form-label col-6 fw-bold" for="email">
                Email
            </label>
            <div class="col-6">
                <input
                    type="text"
                    class="form-control"
                    id="email"
                    name="email"
                    value="${value}"
                    required
                >
            </div>
            `;
    }

    _createHTMLDeliveryAddress(value, type) {
        return type === 'view' 
            ? `
            <div class="col-6 fw-bold">Адрес доставки</div>
            <div class="col-6">${value}</div>
            `
            : `
            <label class="form-label col-6 fw-bold" for="delivery_address">
                Адрес доставки
            </label>
            <div class="col-6">
                <input
                    type="text"
                    class="form-control"
                    id="delivery_address"
                    name="delivery_address"
                    value="${value}"
                    required
                >
            </div>
        `;
    }

    _createHTMLDeliveryDate(value, type) {
        return type === 'view' 
            ? `
            <div class="col-6 fw-bold">Дата доставки</div>
            <div class="col-6">${value}</div>
            `
            : `
            <label class="form-label col-6 fw-bold" for="delivery_date">
                Дата доставки
            </label>
            <div class="col-6">
                <input
                    type="date"
                    class="form-control"
                    id="delivery_date"
                    name="delivery_date"
                    value="${value.split('.').reverse().join('-')}"
                    required
                >
            </div>
        `;
    }

    _createHTMLDeliveryInterval(value, type) {
        return type === 'view' 
            ? `
            <div class="col-6 fw-bold">Время доставки</div>
            <div class="col-6">${value}</div>
            `
            : `
            <label class="form-label col-6 fw-bold" for="delivery_interval">
                Время доставки
            </label>
            <div class="col-6">
                <select
                    class="form-select"
                    id="delivery_interval"
                    name="delivery_interval"
                    required
                >
                    <option
                        value="08:00-12:00"
                        ${value === "08:00-12:00" ? 'selected' : ''}
                    >
                        08:00-12:00
                    </option>
                    <option
                        value="12:00-14:00"
                        ${value === "12:00-14:00" ? 'selected' : ''}
                    >
                        12:00-14:00
                    </option>
                    <option
                        value="14:00-18:00"
                        ${value === "14:00-18:00" ? 'selected' : ''}
                    >
                        14:00-18:00
                    </option>
                    <option
                        value="18:00-22:00"
                        ${value === "18:00-22:00" ? 'selected' : ''}
                    >
                        18:00-22:00
                    </option>
                </select>
            </div>
        `;
    }

    _createHTMLComment(value, type) {
        return type === 'view' 
            ? `
            <div class="col-6 fw-bold">Комментарий</div>
            <div class="col-6">${value}</div>
            `
            : `
            <label class="form-label col-6 fw-bold" for="comment">
                Комментарий
            </label>
            <div class="col-6">
                <textarea
                    class="form-control"
                    id="comment"
                    name="comment"
                    rows="3"
                >${value}</textarea>
            </div>
        `;
    }

    _createNodeBody(type, order) {
        const node = this._createNodeBodyRoot(type, order);
        node.innerHTML = `
        <div class="row mb-2">
            <div class="col-6 fw-bold">Дата оформления</div>
            <div class="col-6">
                ${formatDDMMYYYYHHMM(order.created_at)}
            </div>
        </div>
        <div class="row mb-2">
            ${this._createHTMLName(order.full_name, type)}
        </div>
        <div class="row mb-2">
            ${this._createHTMLPhone(order.phone, type)}
        </div>
        <div class="row mb-2">
            ${this._createHTMLEmail(order.email, type)}
        </div>
        <div class="row mb-2">
            ${this._createHTMLDeliveryAddress(order.delivery_address, type)}
        </div>
        <div class="row mb-2">
            ${this._createHTMLDeliveryDate(order.delivery_date, type)}
        </div>
        <div class="row mb-2">
            ${this._createHTMLDeliveryInterval(order.delivery_interval, type)}
        </div>
        <div class="row mb-2">
            <div class="col-6 fw-bold">Состав заказа</div>
            <div class="col-6 d-flex flex-column gap-3">
                ${order.products
        .map(product =>`<div>${product.name}</div>`)
        .join('')}
            </div>
        </div>
        <div class="row mb-2">
            <div class="col-6 fw-bold">Стоимость</div>
            <div class="col-6">
                 ${parseInt(order.totalPrice, 10).toLocaleString()} ₽
            </div>
        </div>
        <div class="row mb-2">
            ${this._createHTMLComment(order.comment ?? '', type)}
        </div>
        `;
        return node;
    }

    _viewModal(order) {
        this._title.textContent = 'Просмотр заказа';

        this._body.innerHTML = '';
        this._body.appendChild(this._createNodeBody('view', order));

        this._btns.innerHTML = '';
        this._btns.appendChild(this._closeBtn('Ок'));
    }
    
    _updateModal(order) {
        this._title.textContent = 'Редактирование заказа';

        this._body.innerHTML = '';
        this._body.appendChild(this._createNodeBody('update', order));

        this._btns.innerHTML = '';
        this._btns.appendChild(this._closeBtn('Отмена'));
        this._btns.appendChild(this._saveBtn(() => {}));
    }
    
    _deleteModal(orderId) {
        this._title.textContent = 'Удаление заказа';

        this._body.innerHTML = `
            <div>Вы уверены, что хотите удалить заказ?</div>
        `;

        this._btns.innerHTML = '';
        this._btns.appendChild(this._closeBtn('Нет'));
        this._btns.appendChild(this._deleteBtn(
            () => this._onDeleteOrder(orderId)
        ));
    }
}

export {
    ProductsView,
    FilterView,
    CartFormView,
    ToastifyView,
    OrdersTableView,
    OrderModalView
};