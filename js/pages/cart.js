
import { ProductsModel } from '../mvc/model.js';
import { ProductsView } from '../mvc/view.js';
import { CartController } from '../mvc/controller.js';

const productsModel = new ProductsModel();
const productsView = new ProductsView();

const cartController = new CartController(
    productsModel,
    productsView,
);
