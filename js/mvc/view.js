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
            <button class="btn btn-sm btn-outline-primary">В корзину</button>
        </div>
        </div>
        `;
        const node = template.content.cloneNode(true);

        return node;
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
        const discount = Math.round(
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


export {
    ProductsView,
    FilterView
};