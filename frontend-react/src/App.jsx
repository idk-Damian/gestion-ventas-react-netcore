import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import VentaProductos from './pages/VentaProductos'
import ListaProductos from './pages/ListaProductos'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <header>
        <nav>
          <Link to="/">Venta de Productos</Link>
          <Link to="/productos">Lista de Productos</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<VentaProductos />} />
          <Route path="/productos" element={<ListaProductos />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}