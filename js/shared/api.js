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
