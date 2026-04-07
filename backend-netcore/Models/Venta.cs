namespace backend_netcore.Models
{
    public class Venta
    {
        public int Id { get; set; }
        public int IdCliente { get; set; }
        public DateTime FechaVenta { get; set; }
        public string NumeroDocumento { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal Iva { get; set; }
        public decimal Total { get; set; }

        public Cliente? Cliente { get; set; }
        public List<VentaDetalle>? Detalles { get; set; }
    }
}