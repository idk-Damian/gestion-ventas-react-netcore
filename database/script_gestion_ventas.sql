USE GestionVentas;
GO

CREATE TABLE Cliente (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Cedula VARCHAR(20) NOT NULL UNIQUE,
    Nombre VARCHAR(100) NOT NULL,
    Apellido VARCHAR(100) NOT NULL,
    Telefono VARCHAR(20),
    Direccion VARCHAR(200),
    Correo VARCHAR(100)
);
GO

CREATE TABLE Producto (
    Id INT PRIMARY KEY IDENTITY(1,1),
    NombreComercial VARCHAR(100) NOT NULL,
    NombreGenerico VARCHAR(100),
    Presentacion VARCHAR(100),
    Precio DECIMAL(10,2) NOT NULL,
    Stock INT NOT NULL
);
GO

CREATE TABLE Venta (
    Id INT PRIMARY KEY IDENTITY(1,1),
    IdCliente INT NOT NULL,
    FechaVenta DATETIME NOT NULL,
    NumeroDocumento VARCHAR(50) NOT NULL,
    Subtotal DECIMAL(10,2) NOT NULL,
    Iva DECIMAL(10,2) NOT NULL,
    Total DECIMAL(10,2) NOT NULL,
    CONSTRAINT FK_Venta_Cliente FOREIGN KEY (IdCliente) REFERENCES Cliente(Id)
);
GO

CREATE TABLE VentaDetalle (
    Id INT PRIMARY KEY IDENTITY(1,1),
    IdVenta INT NOT NULL,
    IdProducto INT NOT NULL,
    PrecioUnitario DECIMAL(10,2) NOT NULL,
    Cantidad INT NOT NULL,
    Subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT FK_VentaDetalle_Venta FOREIGN KEY (IdVenta) REFERENCES Venta(Id),
    CONSTRAINT FK_VentaDetalle_Producto FOREIGN KEY (IdProducto) REFERENCES Producto(Id)
);
GO
INSERT INTO Cliente (Cedula, Nombre, Apellido, Telefono, Direccion, Correo)
VALUES
('1801', 'Hernan', 'Naranjo', '099445512', 'Rio Quijos', 'h_naranjo@uta.edu.ec'),
('1802', 'Pablo', 'Lozada', '0987654321', 'Ambato', 'pablo@correo.com'),
('1803', 'Maria', 'Perez', '0991112233', 'Quito', 'maria@correo.com');
GO

INSERT INTO Producto (NombreComercial, NombreGenerico, Presentacion, Precio, Stock)
VALUES
('ADVIL', 'IBUPROFENO', 'TABLETA 400 MG', 6.20, 50),
('TYLENOL', 'PARACETAMOL', 'TABLETA 500 MG', 5.50, 40),
('DICLOFENACO', 'DICLOFENACO', 'TABLETA 50 MG', 4.75, 35),
('AMOXIL', 'AMOXICILINA', 'CAPSULA 500 MG', 7.80, 25);
GO



