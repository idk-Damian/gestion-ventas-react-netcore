using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_netcore.Data;
using backend_netcore.Models;

namespace backend_netcore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClienteController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClienteController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetClientes()
        {
            return await _context.Cliente.ToListAsync();
        }

        [HttpGet("buscar/{cedula}")]
        public async Task<ActionResult<Cliente>> BuscarPorCedula(string cedula)
        {
            var cliente = await _context.Cliente.FirstOrDefaultAsync(c => c.Cedula == cedula);

            if (cliente == null)
            {
                return NotFound("Cliente no encontrado");
            }

            return Ok(cliente);
        }

        [HttpPost]
        public async Task<ActionResult<Cliente>> CrearCliente(Cliente cliente)
        {
            _context.Cliente.Add(cliente);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(BuscarPorCedula), new { cedula = cliente.Cedula }, cliente);
        }
    }
}