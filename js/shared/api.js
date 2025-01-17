import { isWeekends } from "./date.js";

const API_ENTRY_POINT = 
    'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api';
const API_ACCESS_KEY = 
    '98d750c8-b62b-4631-801a-ea217f56febd';

const ENDPOINTS = {
    products: {
        get: () => 
            `${API_ENTRY_POINT}/goods?api_key=${API_ACCESS_KEY}`,
        getOne: (id) => 
            `${API_ENTRY_POINT}/goods/${id}?api_key=${API_ACCESS_KEY}`
    },
    order: {
        get: () => 
            `${API_ENTRY_POINT}/orders?api_key=${API_ACCESS_KEY}`,
        getOne: (id) => 
            `${API_ENTRY_POINT}/orders/${id}?api_key=${API_ACCESS_KEY}`,
        create: () => 
            `${API_ENTRY_POINT}/orders?api_key=${API_ACCESS_KEY}`,
        update: (id) =>
            `${API_ENTRY_POINT}/orders/${id}?api_key=${API_ACCESS_KEY}`,
        delete: (id) => 
            `${API_ENTRY_POINT}/orders/${id}?api_key=${API_ACCESS_KEY}`,
    }
};

async function fetchWrapper(url, args = null) {
    const res = await fetch(url, args);

    if (res.ok) {
        return await res.json();
    } else {
        throw new Error(`Ошибка HTTP ${res.status}: ${res.error}`);
    }
}

export async function getProducts() {
    return await fetchWrapper(ENDPOINTS.products.get());
}

export async function getProduct(id) {
    return await fetchWrapper(ENDPOINTS.products.getOne(id));
}

export async function getOrder(id) {
    const order = await fetchWrapper(ENDPOINTS.order.getOne(id));

    const products = await Promise.all(
        order.good_ids.map((productId) => getProduct(productId))
    );
    order.products = products;
    
    const priceOfProducts = products.reduce(
        (acc, cur) => (cur.discount_price ?? cur.actual_price) + acc,
        0
    );

    let deliveryPrice = 200;
    if (order.delivery_interval === '18:00-22:00') {
        if (isWeekends(new Date(order.delivery_date))) {
            deliveryPrice += 300;
        } else {
            deliveryPrice += 200;
        }
    }

    order.totalPrice = priceOfProducts + deliveryPrice;

    return order;
}

export async function getOrders() {
    const orders = await fetchWrapper(ENDPOINTS.order.get());
    return await Promise.all(
        orders.map(order => getOrder(order.id))
    );
}

export async function createOrder(body) {
    await fetchWrapper(ENDPOINTS.order.create(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
}

export async function updateOrder(id, body) {
    await fetchWrapper(ENDPOINTS.order.update(id), {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
} 

export async function deleteOrder(id) {
    await fetchWrapper(ENDPOINTS.order.delete(id), {
        method: "DELETE"
    });
}