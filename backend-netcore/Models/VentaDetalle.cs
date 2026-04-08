using System.ComponentModel.DataAnnotations.Schema;

namespace backend_netcore.Models
{
    public class VentaDetalle
    {
        public int Id { get; set; }
        public int IdVenta { get; set; }
        public int IdProducto { get; set; }
        public decimal PrecioUnitario { get; set; }
        public int Cantidad { get; set; }
        public decimal Subtotal { get; set; }

        [ForeignKey("IdVenta")]
        public Venta? Venta { get; set; }

        [ForeignKey("IdProducto")]
        public Producto? Producto { get; set; }
    }
}