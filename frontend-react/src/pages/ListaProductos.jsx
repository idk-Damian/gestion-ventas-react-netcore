import { useEffect, useState } from 'react'
import { getProductos } from '../services/productoService'

export default function ListaProductos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [total, setTotal]         = useState(0)

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

  if (loading) return (
    <div className="page">
      <h2>Lista de Productos</h2>
      <div className="card">
        <p style={{ padding: '20px', textAlign: 'center', color: '#555' }}>
          ⏳ Cargando productos...
        </p>
      </div>
    </div>
  )

  if (error) return (
    <div className="page">
      <h2>Lista de Productos</h2>
      <div className="card">
        <p className="error" style={{ padding: '20px', textAlign: 'center' }}>
          ❌ {error}
        </p>
      </div>
    </div>
  )

  return (
    <div className="page">
      <h2>Lista de Productos</h2>

      <section className="card">
        <h3>SELECCIÓN DE PRODUCTOS</h3>

        {/* Contador */}
        <div style={{
          padding: '8px 16px',
          background: '#eef2f7',
          borderBottom: '1px solid #dde4ed',
          fontSize: '12px',
          color: '#555',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Total de productos: <b style={{ color: '#1a3a5c' }}>{productos.length}</b></span>
          <span>Valor del inventario: <b style={{ color: '#1a3a5c' }}>${total.toFixed(2)}</b></span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Id</th>
                <th>Nombre Comercial</th>
                <th>Nombre Genérico</th>
                <th>Presentación</th>
                <th>Precio</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><b style={{ color: '#1a3a5c' }}>{p.nombreComercial}</b></td>
                  <td>{p.nombreGenerico}</td>
                  <td>{p.presentacion}</td>
                  <td>
                    <span style={{
                      background: '#e3edf7',
                      color: '#1a3a5c',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: '700'
                    }}>
                      ${p.precio.toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      background: p.stock > 50 ? '#d4edda' : p.stock > 10 ? '#fff3cd' : '#f8d7da',
                      color:      p.stock > 50 ? '#155724' : p.stock > 10 ? '#856404' : '#721c24',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: '700'
                    }}>
                      {p.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="total-row" style={{ margin: '0' }}>
          <span>TOTAL INVENTARIO</span>
          <span>${total.toFixed(2)}</span>
        </div>

      </section>
    </div>
  )
}