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
        private readonly ClientesDbContext _context;

        public ClienteController(ClientesDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetClientes()
        {
            return await _context.Clientes.ToListAsync();
        }

        [HttpGet("buscar/{cedula}")]
        public async Task<ActionResult<Cliente>> BuscarPorCedula(string cedula)
        {
            var cliente = await _context.Clientes.FirstOrDefaultAsync(c => c.Cedula == cedula);

            if (cliente == null)
            {
                return NotFound("Cliente no encontrado");
            }

            return Ok(cliente);
        }

        [HttpPost]
        public async Task<ActionResult<Cliente>> CrearCliente(Cliente cliente)
        {
            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(BuscarPorCedula), new { cedula = cliente.Cedula }, cliente);
        }
    }
}