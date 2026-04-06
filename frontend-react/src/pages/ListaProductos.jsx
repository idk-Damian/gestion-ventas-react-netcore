// src/pages/ListaProductos.jsx
import { useEffect, useState } from 'react'
import { getProductos } from '../services/productoService'

export default function ListaProductos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    getProductos()
      .then(res => {
        setProductos(res.data)
        const sum = res.data.reduce(
          (acc, p) => acc + parseFloat(p.precio) * p.stock, 0
        )
        setTotal(sum)
      })
      .catch(() => setError('Error al cargar productos'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Cargando...</p>
  if (error)   return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div className="page">
      <h2>Lista de Productos</h2>

      <section className="card">
        <h3>SELECCIÓN DE PRODUCTOS</h3>
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>NombreComercial</th>
              <th>NombreGenerico</th>
              <th>Presentación</th>
              <th>Precio</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombreComercial}</td>
                <td>{p.nombreGenerico}</td>
                <td>{p.presentacion}</td>
                <td>{p.precio.toFixed(2)}</td>
                <td>{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="total-row">
          <span>TOTAL</span>
          <span>{total.toFixed(2)}</span>
        </div>
      </section>
    </div>
  )
}