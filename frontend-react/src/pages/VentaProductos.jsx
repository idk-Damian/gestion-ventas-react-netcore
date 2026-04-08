import { useEffect, useState } from 'react'
import { buscarClientePorCedula } from '../services/clienteService'
import { getProductos } from '../services/productoService'
import { crearVenta } from '../services/ventaService'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const IVA = 0.15

export default function VentaProductos() {

  /* ── Estado ─────────────────────────────── */
  const [fechaVenta]         = useState(new Date().toLocaleDateString('es-EC'))
  const [numeroDocumento, setNumeroDocumento] = useState('')
  const [cedula,    setCedula]    = useState('')
  const [cliente,   setCliente]   = useState(null)
  const [clienteError, setClienteError] = useState('')

  const [productos, setProductos] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [busqueda, setBusqueda]   = useState('')
  const [productoSel, setProductoSel] = useState(null)
  const [cantidad,  setCantidad]  = useState('')
  const [detalles,  setDetalles]  = useState([])

  const [mensaje,   setMensaje]   = useState('')
  const [facturaGenerada, setFacturaGenerada] = useState(null)
  const [guardando, setGuardando] = useState(false)

  /* ── Cargar productos ───────────────────── */
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

  /* ── Seleccionar producto desde modal ───── */
  const seleccionarProducto = (prod) => {
    setProductoSel(prod)
    setModalAbierto(false)
    setBusqueda('')
  }

  /* ── Agregar al detalle ─────────────────── */
  const agregarProducto = () => {
    if (!productoSel) return alert('Seleccione un producto')
    const qty = parseInt(cantidad)
    if (!qty || qty <= 0)          return alert('Ingrese una cantidad válida')
    if (qty > productoSel.stock)   return alert(`Stock disponible: ${productoSel.stock}`)

    const existe = detalles.find(d => d.idProducto === productoSel.id)
    if (existe) {
      const nuevaCant = existe.cantidad + qty
      if (nuevaCant > productoSel.stock) return alert(`Stock disponible: ${productoSel.stock}`)
      setDetalles(detalles.map(d =>
        d.idProducto === productoSel.id
          ? { ...d, cantidad: nuevaCant, subtotal: nuevaCant * productoSel.precio }
          : d
      ))
    } else {
      setDetalles([...detalles, {
        idProducto:      productoSel.id,
        nombreComercial: productoSel.nombreComercial,
        presentacion:    productoSel.presentacion,
        precioUnitario:  productoSel.precio,
        cantidad:        qty,
        subtotal:        qty * productoSel.precio
      }])
    }
    setProductoSel(null)
    setCantidad('')
  }

  /* ── Eliminar fila ──────────────────────── */
  const eliminarDetalle = (id) =>
    setDetalles(detalles.filter(d => d.idProducto !== id))

  /* ── Totales ────────────────────────────── */
  const subtotal = detalles.reduce((a, d) => a + d.subtotal, 0)
  const iva      = subtotal * IVA
  const total    = subtotal + iva

  /* ── Guardar venta ──────────────────────── */
  

const guardarVenta = async () => {
  if (!cliente) return alert('Seleccione un cliente')
  if (detalles.length === 0) return alert('Agregue al menos un producto')
  if (!numeroDocumento) return alert('Ingrese el número de comprobante')

  setGuardando(true)
  try {
    const body = {
      idCliente: cliente.id,
      numeroDocumento: numeroDocumento,
      detalles: detalles.map(d => ({
        idProducto: d.idProducto,
        cantidad: d.cantidad
      }))
    }

    const res = await crearVenta(body)

    const factura = {
      idVenta: res.data.id,
      fechaVenta,
      numeroDocumento,
      cliente: {
        id: cliente.id,
        cedula: cedula,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        telefono: cliente.telefono,
        direccion: cliente.direccion,
        correo: cliente.correo
      },
      detalles: detalles,
      subtotal,
      iva,
      total
    }

    setFacturaGenerada(factura)

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

/*--------------------------------------*/

const generarPDF = () => {
  if (!facturaGenerada) {
    alert('Primero debes guardar una venta')
    return
  }

  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text('FACTURA DE VENTA', 14, 18)

  doc.setFontSize(10)
  doc.text(`Fecha: ${facturaGenerada.fechaVenta}`, 14, 28)
  doc.text(`N° Comprobante: ${facturaGenerada.numeroDocumento}`, 140, 28)

  doc.text('DATOS DEL CLIENTE', 14, 40)
  doc.text(`Cédula/RUC: ${facturaGenerada.cliente.cedula}`, 14, 48)
  doc.text(`Nombres: ${facturaGenerada.cliente.nombre}`, 14, 54)
  doc.text(`Apellidos: ${facturaGenerada.cliente.apellido}`, 14, 60)
  doc.text(`Teléfono: ${facturaGenerada.cliente.telefono || ''}`, 110, 48)
  doc.text(`Dirección: ${facturaGenerada.cliente.direccion || ''}`, 110, 54)
  doc.text(`Correo: ${facturaGenerada.cliente.correo || ''}`, 110, 60)

  autoTable(doc, {
    startY: 70,
    head: [[
      'Id',
      'Nombre Comercial',
      'Presentación',
      'Cantidad',
      'Precio Unit.',
      'Subtotal'
    ]],
    body: facturaGenerada.detalles.map(d => [
      d.idProducto,
      d.nombreComercial,
      d.presentacion,
      d.cantidad,
      `$${Number(d.precioUnitario).toFixed(2)}`,
      `$${Number(d.subtotal).toFixed(2)}`
    ]),
  })

  const finalY = doc.lastAutoTable.finalY + 10

  doc.text(`Subtotal: $${Number(facturaGenerada.subtotal).toFixed(2)}`, 140, finalY)
  doc.text(`IVA (15%): $${Number(facturaGenerada.iva).toFixed(2)}`, 140, finalY + 8)
  doc.setFontSize(12)
  doc.text(`TOTAL: $${Number(facturaGenerada.total).toFixed(2)}`, 140, finalY + 18)

  doc.save(`factura_${facturaGenerada.numeroDocumento}.pdf`)
}

  /* ── Productos filtrados en modal ───────── */
  const productosFiltrados = productos.filter(p =>
    p.nombreComercial.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.nombreGenerico || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  /* ── Render ─────────────────────────────── */
  return (
    <div className="page">
      <h2>Venta de Productos</h2>

      {/* ── DATOS DE VENTA ── */}
<section className="card">
  <h3>DATOS DE VENTA</h3>
  <div className="cliente-grid">
    <div className="cliente-campo">
      <label>Fecha Venta</label>
      <span className="campo-valor">{fechaVenta}</span>
    </div>
    <div className="cliente-campo">
      <label>N° Comprobante</label>
      <input
        value={numeroDocumento}
        onChange={e => setNumeroDocumento(e.target.value)}
        placeholder="2026-UTA-0001"
        style={{ width: '180px' }}
      />
    </div>
  </div>
</section>

      {/* ── DATOS DEL CLIENTE ── */}
<section className="card">
  <h3>DATOS DEL CLIENTE</h3>
  <div className="cliente-grid">
    <div className="cliente-campo">
      <label>Cédula/RUC</label>
      <input
        value={cedula}
        onChange={e => setCedula(e.target.value)}
        onBlur={buscarCliente}
        onKeyDown={e => e.key === 'Enter' && buscarCliente()}
        placeholder="1801..."
      />
    </div>
    <div className="cliente-campo">
      <label>Teléfono</label>
      <span className="campo-valor">{cliente?.telefono ?? ''}</span>
    </div>
    <div className="cliente-campo">
      <label>Apellidos</label>
      <span className="campo-valor">{cliente?.apellido ?? ''}</span>
    </div>
    <div className="cliente-campo">
      <label>Dirección</label>
      <span className="campo-valor">{cliente?.direccion ?? ''}</span>
    </div>
    <div className="cliente-campo">
      <label>Nombres</label>
      <span className="campo-valor">{cliente?.nombre ?? ''}</span>
    </div>
    <div className="cliente-campo">
      <label>Correo</label>
      <span className="campo-valor">{cliente?.correo ?? ''}</span>
    </div>
  </div>
  {clienteError && <p className="error" style={{padding: '0 16px 10px'}}>{clienteError}</p>}
</section>

      {/* ── DATOS DEL DETALLE ── */}
      <section className="card">
        <h3>DATOS DEL DETALLE DE VENTA</h3>

        {/* Fila de ingreso */}
        <div className="form-row" style={{ alignItems: 'center' }}>
          <button className="btn-buscar" onClick={() => setModalAbierto(true)}>
            🔍 Buscar Producto
          </button>

          {productoSel && (
            <div className="producto-sel-info">
              <span><b>{productoSel.nombreComercial}</b></span>
              <span>{productoSel.nombreGenerico}</span>
              <span>{productoSel.presentacion}</span>
              <span>Precio: <b>${productoSel.precio?.toFixed(2)}</b></span>
              <span>Stock: <b>{productoSel.stock}</b></span>
            </div>
          )}

          <label style={{ marginLeft: 'auto' }}>
            Cantidad:
            <input
              type="number" min="1"
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              style={{ width: '70px', marginLeft: '6px' }}
            />
          </label>
          <button className="btn-guardar" onClick={agregarProducto}>+ Agregar</button>
        </div>

        {/* Tabla de detalles */}
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Nombre Comercial</th>
              <th>Presentación</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {detalles.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', color: '#999' }}>
                Sin productos agregados
              </td></tr>
            ) : (
              detalles.map((d, i) => (
                <tr key={i}>
                  <td>{d.idProducto}</td>
                  <td>{d.nombreComercial}</td>
                  <td>{d.presentacion}</td>
                  <td>{d.cantidad}</td>
                  <td>{d.precioUnitario.toFixed(2)}</td>
                  <td>{d.subtotal.toFixed(2)}</td>
                  <td>
                    <button onClick={() => eliminarDetalle(d.idProducto)}
                            style={{ background: '#c0392b', color: 'white',
                                     border: 'none', padding: '2px 8px', cursor: 'pointer' }}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Totales */}
        <div className="totales">
          <div><span>SUBTOTAL</span><span>${subtotal.toFixed(2)}</span></div>
          <div><span>IVA (15%)</span><span>${iva.toFixed(2)}</span></div>
          <div className="total-final"><span>TOTAL</span><span>${total.toFixed(2)}</span></div>
        </div>

        {/* Acciones */}
<div className="acciones">
  <button onClick={guardarVenta} disabled={guardando} className="btn-guardar">
    {guardando ? 'Guardando...' : '💾 Guardar Venta'}
  </button>

  <button
    onClick={generarPDF}
    disabled={!facturaGenerada}
    className="btn-guardar"
  >
    📄 Generar PDF
  </button>

  <button onClick={() => {
    setDetalles([])
    setCliente(null)
    setCedula('')
    setNumeroDocumento('')
    setProductoSel(null)
    setCantidad('')
    setMensaje('')
  }} className="btn-limpiar">
    🗑 Limpiar
  </button>
</div>

        {mensaje && <p className="mensaje">{mensaje}</p>}
      </section>

      {/* ── MODAL DE PRODUCTOS ── */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Seleccionar Producto</h3>
              <button className="modal-close" onClick={() => setModalAbierto(false)}>✕</button>
            </div>

            <input
              className="modal-search"
              placeholder="Buscar por nombre comercial o genérico..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              autoFocus
            />

            <div className="modal-tabla-wrap">
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
                  {productosFiltrados.map(p => (
                    <tr
                      key={p.id}
                      className="modal-fila"
                      onClick={() => seleccionarProducto(p)}
                    >
                      <td>{p.id}</td>
                      <td>{p.nombreComercial}</td>
                      <td>{p.nombreGenerico}</td>
                      <td>{p.presentacion}</td>
                      <td>${p.precio?.toFixed(2)}</td>
                      <td>{p.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}