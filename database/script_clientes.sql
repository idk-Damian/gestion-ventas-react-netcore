CREATE DATABASE Clientes;
GO

USE Clientes;
GO

CREATE TABLE Clientes (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Cedula VARCHAR(20) NOT NULL UNIQUE,
    Nombre VARCHAR(100) NOT NULL,
    Apellido VARCHAR(100) NOT NULL,
    Telefono VARCHAR(20),
    Direccion VARCHAR(200),
    Correo VARCHAR(100)
);
GO

INSERT INTO Clientes (Cedula, Nombre, Apellido, Telefono, Direccion, Correo)
VALUES
('1801', 'Hernan', 'Naranjo', '099445512', 'Rio Quijos', 'h_naranjo@uta.edu.ec'),
('1802', 'Pablo', 'Lozada', '0987654321', 'Ambato', 'pablo@correo.com'),
('1803', 'Maria', 'Perez', '0991112233', 'Quito', 'maria@correo.com');
GO