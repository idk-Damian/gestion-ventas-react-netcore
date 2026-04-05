using Microsoft.EntityFrameworkCore;
using backend_netcore.Models;

namespace backend_netcore.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Cliente> Cliente { get; set; }
        public DbSet<Producto> Producto { get; set; }
        public DbSet<Venta> Venta { get; set; }
        public DbSet<VentaDetalle> VentaDetalle { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Cliente>().ToTable("Cliente");
            modelBuilder.Entity<Producto>().ToTable("Producto");
            modelBuilder.Entity<Venta>().ToTable("Venta");
            modelBuilder.Entity<VentaDetalle>().ToTable("VentaDetalle");

            modelBuilder.Entity<Venta>()
                .HasOne(v => v.Cliente)
                .WithMany()
                .HasForeignKey(v => v.IdCliente);

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