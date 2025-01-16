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
    constructor(productsModel, productsView) {
        this._productsModel = productsModel;
        this._productsView = productsView;
        
        this.render();
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
            },
            this._productsModel.hasProductInCart.bind(this._productsModel)
        );
        this._productsView.renderProducts(
            this._productsModel.getCartProducts()
        );
    }
}

export {
    ProductsController,
    CartController
};