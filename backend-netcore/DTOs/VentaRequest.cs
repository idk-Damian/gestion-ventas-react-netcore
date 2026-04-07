namespace backend_netcore.DTOs
{
    public class VentaRequest
    {
        public int IdCliente { get; set; }
        public string NumeroDocumento { get; set; } = string.Empty;
        public List<VentaDetalleRequest> Detalles { get; set; } = new();
    }

    public class VentaDetalleRequest
    {
        public int IdProducto { get; set; }
        public int Cantidad { get; set; }
    }
}