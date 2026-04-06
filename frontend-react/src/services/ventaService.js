import api from '../api/axiosConfig'

// POST /api/Venta  →  registra una venta nueva
// Body esperado:
// {
//   idCliente: number,
//   numeroDocumento: string,
//   detalles: [{ idProducto: number, cantidad: number }]
// }
export const crearVenta = (ventaData) => api.post('/Venta', ventaData)

// GET /api/Venta  →  lista todas las ventas
export const getVentas = () => api.get('/Venta')