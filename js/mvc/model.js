import { getProducts } from "../shared/api.js";
import Storage from '../shared/storage.js';
import { formatDDMMYYYY, isWeekends } from '../shared/date.js';

class Product {
    constructor(obj) {
        this.id = obj.id;
        this.name = obj.name;
        this.main_category = obj.main_category;
        this.sub_category = obj.sub_category;
        this.image_url = obj.image_url;
        this.rating = obj.rating;
        this.actual_price = obj.actual_price;
        this.discount_price = obj.discount_price;
        this.created_at = obj.created_at;
    }

    isDiscounted() {
        return (
            this.discount_price !== null 
            && this.discount_price !== undefined
        );
    }

    getPrice() {
        return (
            this.discount_price 
            ?? this.actual_price
        );
    }
}

class Order {
    constructor(obj) {
        this.id = obj.id;
        this.full_name = obj.full_name;
        this.email = obj.email;
        this.subscribe = obj.subscribe;
        this.phone = obj.phone;
        this.delivery_address = obj.delivery_address;
        this.delivery_date = formatDDMMYYYY(new Date(obj.delivery_date));
        this.delivery_interval = obj.delivery_interval;
        this.comment = obj.comment;
        this.good_ids = obj.good_ids;
        this.created_at = new Date(obj.created_at);
        this.updated_at = new Date(obj.updated_at);
        this.student_id = obj.student_id;
    }
}

class XOrder extends Order {
    constructor(obj) {
        super(obj);
        this.products = obj.products;
        this.totalPrice = obj.totalPrice;
    }
}

const STORAGE_KEY_SEARCH = 'product-search';
const STORAGE_KEY_SORT = 'product-sort';
const STORAGE_KEY_FILTER = 'product-filter';
const STORAGE_KEY_cart = 'cart-products';

class ProductsModel {
    constructor() {
        this._storage = new Storage();
        this._products = [];
        this._cart = new Set();

        this._init();
    }

    _init() {
        const cartValue = this._storage.getItem(STORAGE_KEY_cart);
        if (cartValue) this._cart = new Set(cartValue);
    }

    _saveCart() {
        this._storage.setItem(STORAGE_KEY_cart, Array.from(this._cart));
    }

    async fetchProducts() {
        this._products = (await getProducts())
            .map(product => new Product(product));
    }

    getProducts() {
        return this._products;
    }

    getCategories() {
        return Array.from(new Set(
            this._products.map(product => product.main_category)
        ));
    }

    toggleProductInCart(id) {
        if (this.hasProductInCart(id)) {
            this.removeProductFromCart(id);
        } else {
            this.addProductToCart(id);
        }
    }

    addProductToCart(id) {
        this._cart.add(id);
        this._saveCart();
    }

    removeProductFromCart(id) {
        this._cart.delete(id);
        this._saveCart();
    }

    hasProductInCart(id) {
        return this._cart.has(id);
    }

    clearCart() {
        this._cart.clear();
        this._saveCart();
    }

    getCartProducts() {
        return this._products.filter((product) => 
            this.hasProductInCart(product.id)
        );
    }
}

class FilterModel {
    constructor() {
        this._storage = new Storage();
        this._search = '';
        this._categories = [];
        this._filter = {
            categories: [],
            price_from: 0,
            price_to: 0,
            only_discounted: false,
        };
        this._sort = 'rating-descending';

        this._init();
    }

    _init() {
        const searchValue = this._storage.getItem(STORAGE_KEY_SEARCH);
        const filterValue = this._storage.getItem(STORAGE_KEY_FILTER);
        const sortValue = this._storage.getItem(STORAGE_KEY_SORT);

        if (searchValue) this._search = searchValue;
        if (filterValue) this._filter = filterValue;
        if (sortValue) this._sort = sortValue;
    }

    _getValueForSort(key, product) {
        if (key === 'price') {
            return product.getPrice();
        }
        return product[key];
    }

    _searchProducts(products) {
        const normalizedSearch = this._search.trim().toLowerCase();

        if (!normalizedSearch) {
            return products;
        }

        return products.filter(product => (
            product.name.toLowerCase().includes(normalizedSearch)
        ));
    }

    _filterProducts(products) {
        const isCategories = this._filter.categories.length > 0;
        const isPriceFrom = this._filter.price_from !== 0;
        const isPriceTo = this._filter.price_to !== 0;
        const isOnlyDiscounted = this._filter.only_discounted;

        let filteredProducts = [];

        products.forEach(product => {
            if (
                (isCategories 
                    && !this._filter.categories.includes(product.main_category))
                || (isPriceFrom 
                    && !(product.getPrice() >= this._filter.price_from))
                || (isPriceTo 
                    && !(product.getPrice() <= this._filter.price_to))
                || (isOnlyDiscounted && !(product.isDiscounted()))
            ) {
                return;
            }

            filteredProducts.push(product);
        });
  
        return filteredProducts;
    }
    
    _sortProducts(products) {
        const [key, direction] = this._sort.split('-');
        return products.toSorted((a, b) => {
            const valueA = this._getValueForSort(key, a);
            const valueB = this._getValueForSort(key, b);
            return direction === 'descending' 
                ? valueB - valueA : valueA - valueB;
        });
    }

    setCategories(categoriesValue) {
        this._categories = categoriesValue;
    }

    setSearch(searchValue) {
        this._search = searchValue;
        this._storage.setItem(STORAGE_KEY_SEARCH, this._search);
    }

    setFilter(filterValue) {
        this._filter = filterValue;
        this._storage.setItem(STORAGE_KEY_FILTER, this._filter);
    }

    setSort(sortValue) {
        this._sort = sortValue;
        this._storage.setItem(STORAGE_KEY_SORT, this._sort);
    }

    getFilter() {
        return {
            search: this._search,
            categories: this._categories,
            filter: this._filter,
            sort: this._sort,
        };
    }

    getFilteredProducts(products) {
        return this._sortProducts(
            this._filterProducts(this._searchProducts(products))
        );
    }
}

class CartFormModel {
    constructor() {
        this._priceOfProducts = 0;
        this._deliveryDate = null;
        this._deliveryInterval = null;
    }

    setDeliveryDate(date) {
        this._deliveryDate = date;
    }

    setDeliveryInterval(interval) {
        this._deliveryInterval = interval;
    }

    getDeliveryPrice() {
        const defaultPrice = 200;
        if (this._deliveryDate === null || this._deliveryInterval == null) {
            return defaultPrice;
        }
        if (this._deliveryInterval !== '18:00-22:00') {
            return defaultPrice;
        }

        if (isWeekends(this._deliveryDate)) {
            return defaultPrice + 300;
        }

        return defaultPrice + 200;
    }

    setPriceOfProducts(value) {
        this._priceOfProducts = value;
    } 

    getTotalPrice() {
        return this._priceOfProducts + this.getDeliveryPrice();
    }
}

export {
    Product,
    Order,
    XOrder,
    ProductsModel,
    FilterModel,
    CartFormModel,
};