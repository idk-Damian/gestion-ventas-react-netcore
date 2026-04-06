import api from '../api/axiosConfig'

// GET /api/Cliente/buscar/{cedula}  →  busca cliente por cédula/RUC
export const buscarClientePorCedula = (cedula) =>
  api.get(`/Cliente/buscar/${cedula}`)

// GET /api/Cliente  →  lista todos los clientes
export const getClientes = () => api.get('/Cliente')