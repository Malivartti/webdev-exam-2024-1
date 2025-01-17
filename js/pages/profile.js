import { OrderModalView, OrdersTableView, ToastifyView } from "../mvc/view.js";
import { OrdersTableController } from "../mvc/controller.js";


const ordersTableView = new OrdersTableView();
const orderModalView = new OrderModalView();
const toastifyView = new ToastifyView();
const ordersTableController = new OrdersTableController(
    ordersTableView,
    orderModalView,
    toastifyView,
);