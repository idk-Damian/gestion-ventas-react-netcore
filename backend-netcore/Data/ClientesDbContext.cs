using Microsoft.EntityFrameworkCore;
using backend_netcore.Models;

namespace backend_netcore.Data
{
    public class ClientesDbContext : DbContext
    {
        public ClientesDbContext(DbContextOptions<ClientesDbContext> options) : base(options)
        {
        }

        public DbSet<Cliente> Clientes { get; set; }
    }
}