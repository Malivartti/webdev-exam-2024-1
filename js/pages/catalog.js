
import { ProductsModel, FilterModel } from '../mvc/model.js';
import { ProductsView, FilterView } from '../mvc/view.js';
import { ProductsController } from '../mvc/controller.js';

const productsModel = new ProductsModel();
const productsView = new ProductsView();
const filterModel = new FilterModel();
const filterView = new FilterView();
const productsController = new ProductsController(
    productsModel,
    productsView,
    filterModel,
    filterView,
);
