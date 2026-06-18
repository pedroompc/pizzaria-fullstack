import axios from 'axios'

// Define a URL da API - [Pedro Marinho]
// 1) Usa VITE_API_URL se definida no build; 2) senão, detecta produção pelo domínio
//    (em onrender.com aponta para a API publicada; em localhost usa a API local).
const PROD_API_URL = 'https://pizzaria-api-10pp.onrender.com'
const isLocalhost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
const RAW_API_URL = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:4000' : PROD_API_URL)
const BASE_URL = /^https?:\/\//.test(RAW_API_URL) ? RAW_API_URL : `https://${RAW_API_URL}`

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: attach JWT ──────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pizza_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor: auto-logout on 401 ─────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pizza_token')
      localStorage.removeItem('pizza_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ============================================================
// AUTH
// ============================================================
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

// ============================================================
// USERS
// ============================================================
export const usersApi = {
  list: () => api.get('/users'),
  listActive: () => api.get('/users/active'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
}

// ============================================================
// PRODUCTS
// ============================================================
export const productsApi = {
  list: () => api.get('/products'),
  listAvailable: () => api.get('/products/available'),
  listByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.patch(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
}

// ============================================================
// CATEGORIES
// ============================================================
export const categoriesApi = {
  list: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

// ============================================================
// ORDERS
// ============================================================
export const ordersApi = {
  list: () => api.get('/orders'),
  listByStatus: (status) => api.get(`/orders/status/${status}`),
  listByUser: (userId) => api.get(`/orders/user/${userId}`),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.patch(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
}

export default api
