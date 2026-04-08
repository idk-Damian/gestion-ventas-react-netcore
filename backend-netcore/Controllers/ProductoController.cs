using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_netcore.Data;
using backend_netcore.Models;

namespace backend_netcore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductoController : ControllerBase
    {
        private readonly GestionVDbContext _context;

        public ProductoController(GestionVDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Producto>>> GetProductos()
        {
            return await _context.Producto.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Producto>> GetProducto(int id)
        {
            var producto = await _context.Producto.FindAsync(id);

            if (producto == null)
            {
                return NotFound("Producto no encontrado");
            }

            return Ok(producto);
        }
    }
}