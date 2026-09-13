# Frontend de laboratorio 1

Aplicación React sencilla para consumir el backend del laboratorio.

# Vistas incluidas

1. Consultar, crear, editar y eliminar clientes.
2. Realizar transferencias entre cuentas.
3. Consultar el histórico de transacciones por número de cuenta.

# Rutas que consume

- `GET` y `POST /api/customers`
- `PUT` y `DELETE /api/customers/{id}` *(rutas opcionales agregadas)*
- `POST /api/transactions`
- `GET /api/transactions/{accountNumber}`

# Cómo ejecutarlo

Primero inicia el backend en el puerto `8088`. Después, desde esta carpeta:

```bash
npm install
npm run dev
```

Abrir `http://localhost:5173` en navegador. 

# Es necesario, en los controladores del backend, agregar la linea `crossorigin(origins="http://localhost:5173")` para que los puertos del front y back puedan comunicarse sin problema. En caso de estar corriendo el front en otro puerto, cambiar la ruta.
