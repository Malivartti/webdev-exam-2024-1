import { OrdersTableView } from "../mvc/view.js";
import { OrdersTableController } from "../mvc/controller.js";


const ordersTableView = new OrdersTableView();
const ordersTableController = new OrdersTableController(
    ordersTableView,
);