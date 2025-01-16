
import { ProductsModel, CartFormModel } from '../mvc/model.js';
import { ProductsView, CartFormView, ToastifyView } from '../mvc/view.js';
import { CartController } from '../mvc/controller.js';

const productsModel = new ProductsModel();
const productsView = new ProductsView();
const cartFormModel = new CartFormModel();
const cartFormView = new CartFormView();
const toastifyView = new ToastifyView();
const cartController = new CartController(
    productsModel,
    productsView,
    cartFormModel,
    cartFormView,
    toastifyView
);
