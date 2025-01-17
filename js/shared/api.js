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

export async function getOrders() {
    return await fetchWrapper(ENDPOINTS.order.get());
}

export async function getOrder(id) {
    return await fetchWrapper(ENDPOINTS.order.getOne(id));
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
        body: JSON.stringify(body)
    });
} 

export async function deleteOrder(id) {
    await fetchWrapper(ENDPOINTS.order.delete(id), {
        method: "DELETE"
    });
}