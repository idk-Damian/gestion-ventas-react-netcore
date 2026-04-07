import api from '../api/axiosConfig'

// GET /api/Producto  →  lista todos los productos
export const getProductos = () => api.get('/Producto')

// GET /api/Producto/{id}  →  producto por ID
export const getProductoById = (id) => api.get(`/Producto/${id}`)