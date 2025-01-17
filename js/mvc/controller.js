import { 
    createOrder, updateOrder, deleteOrder, getOrders 
} from "../shared/api.js";
import { formatDDMMYYYY, isDateBefore } from "../shared/date.js";
import { XOrder } from "./model.js";

class ProductsController {
    constructor(productsModel, productsView, filterModel, filterView) {
        this._productsModel = productsModel;
        this._productsView = productsView;
        this._filterModel = filterModel;
        this._filterView = filterView;
        
        this.render();
    }

    _renderProducts() {
        const products = this._productsModel.getProducts();
        this._productsView.renderProducts.call(
            this._productsView,
            this._filterModel.getFilteredProducts(products)
        );
    }

    _reRender(func) {
        return (arg) => {
            func(arg);
            this._renderProducts();
        };
    }

    async render() {
        await this._productsModel.fetchProducts();
        this._filterModel.setCategories(this._productsModel.getCategories());

        this._productsView.handleCartButton(
            (id) => this._productsModel.toggleProductInCart
                .call(this._productsModel, id),
            this._productsModel.hasProductInCart.bind(this._productsModel)
        );
        this._renderProducts();

        this._filterView.onSearchSubmit(
            this._reRender(this._filterModel.setSearch.bind(this._filterModel))
        );
        this._filterView.onFilterSubmit(
            this._reRender(this._filterModel.setFilter.bind(this._filterModel))
        );
        this._filterView.onSortSubmit(
            this._reRender(this._filterModel.setSort.bind(this._filterModel))
        );
        this._filterView.render(this._filterModel.getFilter());
    }
}

class CartController {
    constructor(
        productsModel,
        productsView,
        cartFormModel,
        cartFormView,
        toastifyView
    ) {
        this._productsModel = productsModel;
        this._productsView = productsView;
        this._cartFormModel = cartFormModel;
        this._cartFormView = cartFormView;
        this._toastifyView = toastifyView;


        this.render();
    }

    async _handleOrderCreation(formData) {
        const cartProducts = this._productsModel.getCartProducts();

        if (!cartProducts.length) {
            this._toastifyView.error('Нет выбранных товаров');
            return;
        }

        const data = {
            good_ids: cartProducts.map(product => product.id)
        };

        for (const [key, value] of formData.entries()) {
            if (key === 'subscribe') {
                data[key] = true;
                continue;
            }
            if (key === 'delivery_date') {
                const date = new Date(value);
                
                if (isDateBefore(date)) {
                    this._toastifyView.error('Дата доставки раньше текущей');
                    return;
                }

                data[key] = formatDDMMYYYY(date);
                continue;
            }
            data[key] = value;
        };

        try {
            await createOrder(data);
            this._toastifyView.success('Заказ успешно создан');
            this._productsModel.clearCart();
            this._productsView.renderProducts(
                this._productsModel.getCartProducts()
            );
            this._cartFormView.resetForm();
        } catch (e) {
            this._toastifyView.error('Не удалось создать заказ');
            console.log(e);
        }
    }

    _renderCartForm() {
        const priceOfProducts = this._productsModel.getCartProducts()
            .reduce((acc, curr) => curr.getPrice() + acc, 0);
        
        this._cartFormModel.setPriceOfProducts(priceOfProducts);

        this._cartFormView.render(
            this._cartFormModel.getTotalPrice(),
            this._cartFormModel.getDeliveryPrice(),
        );
    }

    _handleChangeDate(date) {
        this._cartFormModel.setDeliveryDate(date);
        this._renderCartForm();
    }

    _handleChangeInterval(interval) {
        this._cartFormModel.setDeliveryInterval(interval);
        this._renderCartForm();
    }

    async render() {
        await this._productsModel.fetchProducts();
    
        this._productsView.handleCartButton(
            (id) => {
                this._productsModel.toggleProductInCart
                    .call(this._productsModel, id);
                this._productsView.renderProducts(
                    this._productsModel.getCartProducts()
                );
                this._renderCartForm();
            },
            this._productsModel.hasProductInCart.bind(this._productsModel)
        );
        this._productsView.renderProducts(
            this._productsModel.getCartProducts()
        );

        this._renderCartForm();
        this._cartFormView.handleChangeDelivery(
            this._handleChangeDate.bind(this),
            this._handleChangeInterval.bind(this),
        );
        this._cartFormView.onSubmitForm(
            this._handleOrderCreation.bind(this)
        );
    }
}

class OrdersTableController {
    constructor(ordersTableView, orderModalView, toastifyView) {
        this._ordersTableView = ordersTableView;
        this._orderModalView = orderModalView;
        this._toastifyView = toastifyView;
        this.render();
    }

    async _getXOrders() {
        const orders = await getOrders();
        return orders.map(order => new XOrder(order));
    }

    async _reRender() {
        this._ordersTableView.render(await this._getXOrders());
    }

    async _onDeleteOrder(orderId) {
        try {
            await deleteOrder(orderId);
            this._toastifyView.success(`Заказ №${orderId} успешно удален`);
            await this._reRender();
        } catch (e) {
            this._toastifyView.error(`Не удалось удалить заказ №${orderId}`);
        }
    }

    async _onUpdateOrder(order, formData) {
        let deliveryDate = new Date(formData.get('delivery_date'));

        if (isDateBefore(deliveryDate)) {
            this._toastifyView.error('Дата доставки раньше текущей');
            return;
        }
        formData.set('delivery_date', formatDDMMYYYY(deliveryDate));

        const newOrder = {};
        for (const [key, value] of formData.entries()) {
            if (
                (order[key] === value)
                || (key === 'comment' && value === '' && order[key] === null)
            ) {
                continue;
            };
    
            newOrder[key] = value;
        }

        if (!Object.keys(newOrder).length) {
            this._orderModalView.closeModal();
            return;
        }

        try {
            await updateOrder(order.id, newOrder);
            this._orderModalView.closeModal();
            this._toastifyView
                .success(`Заказ №${order.id} успешно отредактирован`);
            await this._reRender();
        } catch (e) {
            this._toastifyView
                .error(`Не удалось отредактировать заказ №${order.id}`);
            console.log(e);
        }
    }

    async render() {
        await this._reRender();

        this._ordersTableView.handleClickBtn(
            this._orderModalView.showModal.bind(this._orderModalView),
        );
        this._orderModalView.handleClickBtn(
            this._onUpdateOrder.bind(this),
            this._onDeleteOrder.bind(this)
        );
    }

}

export {
    ProductsController,
    CartController,
    OrdersTableController
};