namespace backend_netcore.Models
{
    public class Producto
    {
        public int Id { get; set; }
        public string NombreComercial { get; set; } = string.Empty;
        public string? NombreGenerico { get; set; }
        public string? Presentacion { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
    }
}