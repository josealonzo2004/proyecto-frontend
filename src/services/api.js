// API Configuration and Services
// TODO: Install axios -> npm install axios
// TODO: Update import -> import axios from 'axios';

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Incluir token en requests (después serviría para login)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//conexion de la api(backend) con el frontend
// se usa el axios para hacer las peticiones http y manejar las respuestas
//api.post es para enviar datos al servidor
// ---- AUTH ----
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
  logout: () => localStorage.removeItem("token"),
};

//---- USERS ----
export const usersAPI = {
  getAll: () => api.get('/usuario'),
  getById: (id) => api.get(`/usuario/${id}`),
  create: (data) => api.post('/usuario', data),
  update: (id, data) => api.put(`/usuario/${id}`, data),
  delete: (id) => api.delete(`/usuario/${id}`),
};

// ---- PRODUCTS ----
export const productsAPI = {
  getAll: () => api.get('/productos'),
  getById: (id) => api.get(`/productos/${id}`),
  // Importante: Axios detecta FormData y pone el header correcto automáticamente, 
  // pero a veces es bueno ser explícito si hay problemas.
  create: (formData) => api.post('/productos', formData, {
      headers: { "Content-Type": "multipart/form-data" }
  }),
  update: (id, formData) => api.put(`/productos/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
  }),
  delete: (id) => api.delete(`/productos/${id}`),
};


// ---- DIRECCIONES (AGREGAR ESTO) ----
export const direccionesAPI = {
  getAll: () => api.get('/direcciones'),
  getById: (id) => api.get(`/direcciones/${id}`),
  create: (data) => api.post('/direcciones', data),
  update: (id, data) => api.put(`/direcciones/${id}`, data),
  delete: (id) => api.delete(`/direcciones/${id}`),
};

// ---- PEDIDOS (AGREGAR ESTO) ----
export const pedidosAPI = {
  getAll: () => api.get('/pedidos'),
  getById: (id) => api.get(`/pedidos/${id}`),
  create: (data) => api.post('/pedidos', data),
};


export default api;







/*
// Example with axios
import axios from 'axios';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Products API
export const productsAPI = {
    getAll: () => api.get('/productos'),
    getById: (id) => api.get(`/productos/${id}`),
    create: (product) => api.post('/productos', product),
    update: (id, product) => api.put(`/productos/${id}`, product),
    delete: (id) => api.delete(`/productos/${id}`)
};

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    getProfile: () => api.get('/auth/profile')
};

// Orders API
export const ordersAPI = {
    create: (orderData) => api.post('/pedidos', orderData),
    getByUser: () => api.get('/pedidos/usuario'),
    getById: (id) => api.get(`/pedidos/${id}`),
    updateStatus: (id, status) => api.put(`/pedidos/${id}`, { estado: status })
};

// Cart API
export const cartAPI = {
    add: (productData) => api.post('/carrito', productData),
    get: () => api.get('/carrito'),
    update: (id, quantity) => api.put(`/carrito/${id}`, { quantity }),
    remove: (id) => api.delete(`/carrito/${id}`),
    clear: () => api.delete('/carrito')
};

// Users API
export const usersAPI = {
    getAll: () => api.get('/usuarios'),
    getById: (id) => api.get(`/usuarios/${id}`),
    update: (id, userData) => api.put(`/usuarios/${id}`, userData)
};

// Addresses API
export const addressesAPI = {
    getAll: () => api.get('/direcciones'),
    create: (address) => api.post('/direcciones', address),
    update: (id, address) => api.put(`/direcciones/${id}`, address),
    delete: (id) => api.delete(`/direcciones/${id}`)
};

// Returns API
export const returnsAPI = {
    create: (returnData) => api.post('/devoluciones', returnData),
    getByUser: () => api.get('/devoluciones/usuario'),
    getAll: () => api.get('/devoluciones'), // Admin only
    updateStatus: (id, status) => api.put(`/devoluciones/${id}`, { estado: status })
};

// Reports API
export const reportsAPI = {
    getSales: (period) => api.get(`/reportes/ventas?periodo=${period}`),
    getBestSellers: () => api.get('/reportes/mas-vendidos'),
    getRevenue: () => api.get('/reportes/revenue')
};

export default api;


// mock funciones de desarrollo (serán reemplazadas por llamadas reales a la API)
export const mockAPI = {
    products: {
        getAll: async () => ({ data: [] }),
        getById: async (id) => ({ data: {} })
    },
    auth: {
        login: async (credentials) => ({ data: {}, headers: { authorization: 'mock-token' } }),
        register: async (userData) => ({ data: {} }),
        logout: async () => {}
    },
    orders: {
        create: async (orderData) => ({ data: {} }),
        getByUser: async () => ({ data: [] })
    }
};

export default API_BASE_URL;
*/
