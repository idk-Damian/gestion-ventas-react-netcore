using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_netcore.Data;
using backend_netcore.Models;
using backend_netcore.DTOs;

namespace backend_netcore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VentaController : ControllerBase
    {
        private readonly GestionVDbContext _gestionContext;
        private readonly ClientesDbContext _clientesContext;

        public VentaController(GestionVDbContext gestionContext, ClientesDbContext clientesContext)
        {
            _gestionContext = gestionContext;
            _clientesContext = clientesContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Venta>>> GetVentas()
        {
            return await _gestionContext.Venta
                .Include(v => v.Detalles!)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Venta>> GetVenta(int id)
        {
            var venta = await _gestionContext.Venta
                .Include(v => v.Detalles!)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (venta == null)
            {
                return NotFound("Venta no encontrada");
            }

            return Ok(venta);
        }

        [HttpPost]
        public async Task<ActionResult> CrearVenta(VentaRequest request)
        {
            if (request.Detalles == null || request.Detalles.Count == 0)
            {
                return BadRequest("La venta debe tener al menos un producto.");
            }

            var cliente = await _clientesContext.Clientes.FindAsync(request.IdCliente);
            if (cliente == null)
            {
                return BadRequest("Cliente no encontrado.");
            }

            decimal subtotal = 0;
            decimal porcentajeIva = 0.15m;

            var detallesVenta = new List<VentaDetalle>();

            foreach (var item in request.Detalles)
            {
                var producto = await _gestionContext.Producto.FindAsync(item.IdProducto);

                if (producto == null)
                {
                    return BadRequest($"Producto con ID {item.IdProducto} no encontrado.");
                }

                if (item.Cantidad <= 0)
                {
                    return BadRequest($"Cantidad inválida para el producto {producto.NombreComercial}.");
                }

                if (producto.Stock < item.Cantidad)
                {
                    return BadRequest($"Stock insuficiente para el producto {producto.NombreComercial}.");
                }

                decimal subtotalLinea = producto.Precio * item.Cantidad;
                subtotal += subtotalLinea;

                detallesVenta.Add(new VentaDetalle
                {
                    IdProducto = producto.Id,
                    Cantidad = item.Cantidad,
                    PrecioUnitario = producto.Precio,
                    Subtotal = subtotalLinea
                });

                producto.Stock -= item.Cantidad;
            }

            decimal iva = Math.Round(subtotal * porcentajeIva, 2);
            decimal total = subtotal + iva;

            var venta = new Venta
            {
                IdCliente = request.IdCliente,
                FechaVenta = DateTime.Now,
                NumeroDocumento = request.NumeroDocumento,
                Subtotal = subtotal,
                Iva = iva,
                Total = total,
                Detalles = detallesVenta
            };

            _gestionContext.Venta.Add(venta);
            await _gestionContext.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Venta registrada correctamente",
                venta.Id,
                venta.NumeroDocumento,
                venta.Subtotal,
                venta.Iva,
                venta.Total
            });
        }
    }
}