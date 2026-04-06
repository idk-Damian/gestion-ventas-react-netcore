// src/pages/VentaProductos.jsx
import { useEffect, useState } from 'react'
import { buscarClientePorCedula } from '../services/clienteService'
import { getProductos }          from '../services/productoService'
import { crearVenta }            from '../services/ventaService'

const IVA = 0.15

export default function VentaProductos() {
  /* ── Estado ─────────────────────────────── */
  const [fechaVenta]         = useState(new Date().toLocaleDateString('es-EC'))
  const [numeroDocumento, setNumeroDocumento] = useState('')
  const [cedula,    setCedula]    = useState('')
  const [cliente,   setCliente]   = useState(null)
  const [clienteError, setClienteError] = useState('')

  const [productos, setProductos] = useState([])
  const [productoId,   setProductoId]   = useState('')
  const [cantidad,  setCantidad]  = useState('')
  const [detalles,  setDetalles]  = useState([])   // filas de la venta

  const [mensaje,   setMensaje]   = useState('')
  const [guardando, setGuardando] = useState(false)

  /* ── Cargar productos al montar ─────────── */
  useEffect(() => {
    getProductos().then(res => setProductos(res.data))
  }, [])

  /* ── Buscar cliente ─────────────────────── */
  const buscarCliente = async () => {
    setClienteError('')
    setCliente(null)
    if (!cedula.trim()) return
    try {
      const res = await buscarClientePorCedula(cedula.trim())
      setCliente(res.data)
    } catch {
      setClienteError('Cliente no encontrado')
    }
  }

  /* ── Agregar producto al detalle ────────── */
  const agregarProducto = () => {
    const prod = productos.find(p => p.id === parseInt(productoId))
    const qty  = parseInt(cantidad)
    if (!prod || qty <= 0 || qty > prod.stock) return

    const existe = detalles.find(d => d.idProducto === prod.id)
    if (existe) {
      setDetalles(detalles.map(d =>
        d.idProducto === prod.id
          ? { ...d, cantidad: d.cantidad + qty, subtotal: (d.cantidad + qty) * prod.precio }
          : d
      ))
    } else {
      setDetalles([...detalles, {
        idProducto:     prod.id,
        nombreComercial: prod.nombreComercial,
        presentacion:   prod.presentacion,
        precioUnitario: prod.precio,
        cantidad:       qty,
        subtotal:       qty * prod.precio
      }])
    }
    setProductoId('')
    setCantidad('')
  }

  /* ── Eliminar fila del detalle ──────────── */
  const eliminarDetalle = (id) =>
    setDetalles(detalles.filter(d => d.idProducto !== id))

  /* ── Totales ────────────────────────────── */
  const subtotal = detalles.reduce((a, d) => a + d.subtotal, 0)
  const iva      = subtotal * IVA
  const total    = subtotal + iva

  /* ── Guardar venta ──────────────────────── */
  const guardarVenta = async () => {
    if (!cliente)           return alert('Seleccione un cliente')
    if (detalles.length===0) return alert('Agregue al menos un producto')
    if (!numeroDocumento)   return alert('Ingrese el número de comprobante')

    setGuardando(true)
    try {
      const body = {
        idCliente:       cliente.id,
        numeroDocumento: numeroDocumento,
        detalles: detalles.map(d => ({
          idProducto: d.idProducto,
          cantidad:   d.cantidad
        }))
      }
      const res = await crearVenta(body)
      setMensaje(`✅ Venta #${res.data.id} registrada. Total: $${res.data.total}`)
      setDetalles([])
      setCliente(null)
      setCedula('')
      setNumeroDocumento('')
    } catch (err) {
      setMensaje('❌ ' + (err.response?.data || 'Error al guardar'))
    } finally {
      setGuardando(false)
    }
  }

  /* ── Render ─────────────────────────────── */
  const productoSeleccionado = productos.find(p => p.id === parseInt(productoId))

  return (
    <div className="page">
      <h2>Venta de Productos</h2>

      {/* ── DATOS DE VENTA ── */}
      <section className="card">
        <h3>DATOS DE VENTA</h3>
        <div className="form-row">
          <label>Fecha Venta: <span>{fechaVenta}</span></label>
          <label>
            N° Comprobante:
            <input
              value={numeroDocumento}
              onChange={e => setNumeroDocumento(e.target.value)}
              placeholder="2026-UTA-0001"
            />
          </label>
        </div>
      </section>

      {/* ── DATOS DEL CLIENTE ── */}
      <section className="card">
        <h3>DATOS DEL CLIENTE</h3>
        <div className="form-row">
          <label>
            Cédula/RUC:
            <input
              value={cedula}
              onChange={e => setCedula(e.target.value)}
              onBlur={buscarCliente}
              onKeyDown={e => e.key === 'Enter' && buscarCliente()}
              placeholder="1801..."
            />
          </label>
          <label>Teléfono: <span>{cliente?.telefono ?? ''}</span></label>
        </div>
        <div className="form-row">
          <label>Apellidos: <span>{cliente?.apellido ?? ''}</span></label>
          <label>Dirección: <span>{cliente?.direccion ?? ''}</span></label>
        </div>
        <div className="form-row">
          <label>Nombres: <span>{cliente?.nombre ?? ''}</span></label>
          <label>Correo: <span>{cliente?.correo ?? ''}</span></label>
        </div>
        {clienteError && <p className="error">{clienteError}</p>}
      </section>

      {/* ── DATOS DEL DETALLE ── */}
      <section className="card">
        <h3>DATOS DEL DETALLE DE VENTA</h3>

        {/* Fila de ingreso */}
        <div className="form-row">
          <label>
            Nombre Comercial:
            <select value={productoId} onChange={e => setProductoId(e.target.value)}>
              <option value="">-- Seleccione --</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>{p.nombreComercial}</option>
              ))}
            </select>
          </label>
          <label>Nombre Genérico:
            <span>{productoSeleccionado?.nombreGenerico ?? ''}</span>
          </label>
          <label>Presentación:
            <span>{productoSeleccionado?.presentacion ?? ''}</span>
          </label>
          <label>Precio:
            <span>{productoSeleccionado?.precio?.toFixed(2) ?? ''}</span>
          </label>
          <label>
            Cantidad:
            <input
              type="number" min="1"
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
            />
          </label>
          <button onClick={agregarProducto}>+ Agregar</button>
        </div>

        {/* Tabla de detalles */}
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>NombreComercial</th>
              <th>Presentación</th>
              <th>Cantidad</th>
              <th>PrecioVenta</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {detalles.map((d, i) => (
              <tr key={i}>
                <td>{d.idProducto}</td>
                <td>{d.nombreComercial}</td>
                <td>{d.presentacion}</td>
                <td>{d.cantidad}</td>
                <td>{d.precioUnitario.toFixed(2)}</td>
                <td>{d.subtotal.toFixed(2)}</td>
                <td>
                  <button onClick={() => eliminarDetalle(d.idProducto)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="totales">
          <div><span>SUBTOTAL</span><span>{subtotal.toFixed(2)}</span></div>
          <div><span>IVA (15%)</span><span>{iva.toFixed(2)}</span></div>
          <div className="total-final"><span>TOTAL</span><span>{total.toFixed(2)}</span></div>
        </div>

        {/* Acciones */}
        <div className="acciones">
          <button onClick={guardarVenta} disabled={guardando} className="btn-guardar">
            {guardando ? 'Guardando...' : '💾 Guardar Venta'}
          </button>
          <button onClick={() => { setDetalles([]); setCliente(null); setCedula(''); }}
                  className="btn-limpiar">
            🗑 Limpiar
          </button>
        </div>

        {mensaje && <p className="mensaje">{mensaje}</p>}
      </section>
    </div>
  )
}