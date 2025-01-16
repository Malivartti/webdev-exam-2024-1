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

        this._renderProducts();
        this._filterView.render(this._filterModel.getFilter());
        this._filterView.onSearchSubmit(
            this._reRender(this._filterModel.setSearch.bind(this._filterModel))
        );
        this._filterView.onFilterSubmit(
            this._reRender(this._filterModel.setFilter.bind(this._filterModel))
        );
        this._filterView.onSortSubmit(
            this._reRender(this._filterModel.setSort.bind(this._filterModel))
        );
    }
}

export {
    ProductsController,
};