using Microsoft.EntityFrameworkCore;
using backend_netcore.Models;

namespace backend_netcore.Data
{
    public class GestionVDbContext : DbContext
    {
        public GestionVDbContext(DbContextOptions<GestionVDbContext> options) : base(options)
        {
        }

        public DbSet<Producto> Producto { get; set; }
        public DbSet<Venta> Venta { get; set; }
        public DbSet<VentaDetalle> VentaDetalle { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<VentaDetalle>()
                .HasOne(vd => vd.Venta)
                .WithMany(v => v.Detalles)
                .HasForeignKey(vd => vd.IdVenta);

            modelBuilder.Entity<VentaDetalle>()
                .HasOne(vd => vd.Producto)
                .WithMany()
                .HasForeignKey(vd => vd.IdProducto);
        }
    }
}