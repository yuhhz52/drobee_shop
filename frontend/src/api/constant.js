import { getAccessToken } from "../utils/jwt-helper";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_URL = {
    GET_CATEGORIES: '/api/category',
    GET_CATEGORIE: (id) => `/api/category/${id}`,
    GET_PRODUCTS: '/api/products',
    GET_PRODUCT: (id) => `/api/products/${id}`,
};



export const getHeaders = () => {
    return {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json'
    };
};
