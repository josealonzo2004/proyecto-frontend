# INNOVA ARTE - Plataforma de Ventas Online

Plataforma de e-commerce desarrollada con React para la venta de productos personalizados, especialmente productos de corte láser y personalización.
Tecnologías Utilizadas

 Frontend
- **React 18+** - Biblioteca de JavaScript para construir interfaces de usuario
- **Vite** - Herramienta de construcción y desarrollo rápida
- **React Router DOM** - Enrutamiento y navegación en la aplicación
- **Tailwind CSS** - Framework de CSS utility-first para estilos
- **React Icons** - Biblioteca de iconos para React

 Gestión de Estado
- **Context API** - Para estado global de la aplicación
- **LocalStorage** - Persistencia de datos en el navegador

 Librerías Adicionales
- `react-icons` - Iconos (hi, hi2, fa6, bi)

##  Estructura del Proyecto

```
proyecto-frontend/
├── public/
│   ├── images/          # Imágenes de productos y banners
│   └── img/             # Logos y recursos gráficos
├── src/
│   ├── components/
│   │   ├── admin/       # Componentes del panel de administración
│   │   │   ├── OrderCard.jsx
│   │   │   └── ProductForm.jsx
│   │   ├── home/        # Componentes de la página de inicio
│   │   │   ├── Banner.jsx
│   │   │   └── Newsletter.jsx
│   │   ├── products/    # Componentes de productos
│   │   │   └── ProductCard.jsx
│   │   └── shared/      # Componentes compartidos
│   │       ├── Footer.jsx
│   │       ├── Logo.jsx
│   │       └── Navbar.jsx
│   ├── context/         # Contextos de React (Estado global)
│   │   ├── AuthContext.jsx      # Autenticación de usuarios
│   │   ├── CartContext.jsx      # Carrito de compras
│   │   ├── OrdersContext.jsx    # Gestión de pedidos
│   │   └── ProductsContext.jsx  # Gestión de productos
│   ├── layouts/         # Layouts de la aplicación
│   │   └── RootLayout.jsx
│   ├── pages/           # Páginas principales
│   │   ├── AboutPage.jsx
│   │   ├── AdminDashboardPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── ProductsPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── RegisterPage.jsx
│   ├── router/          # Configuración de rutas
│   │   └── Index.jsx
│   ├── constants/       # Constantes y datos estáticos
│   │   └── links.jsx
│   ├── components/      # Componentes adicionales
│   │   ├── ErrorBoundary.jsx
│   │   └── ProtectedRoute.jsx
│   ├── main.jsx         # Punto de entrada de la aplicación
│   └── index.css        # Estilos globales
├── index.html           # HTML principal
└── package.json         # Dependencias del proyecto
```

##  Instalación

1. **Clonar el repositorio** 
   ```bash
   git clone <url-del-repositorio>
   cd proyecto-frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

##  Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo


##  Autenticación

### Usuario Administrador
- **Email**: `innovaadmin@corte.com`
- **Contraseña**: `123456`

Solo este usuario puede acceder al panel de administración.

### Usuarios Regulares
Los usuarios pueden registrarse normalmente y serán asignados como "cliente" por defecto.

##  Funcionalidades Principales

 Para Usuarios
-  Catálogo de productos con búsqueda
-  Detalle de productos con personalización (texto y archivos)
-  Carrito de compras
-  Proceso de checkout (3 pasos)
-  Gestión de perfil
-  Historial de pedidos
-  Direcciones guardadas automáticamente

### Para Administradores
-  Dashboard con estadísticas
-  Gestión de productos (agregar, editar, eliminar)
-  Gestión de pedidos (ver, actualizar estado)
-  Visualización de archivos/imágenes proporcionados por clientes

##  Características Técnicas

### Estado Global (Context API)
- **AuthContext**: Maneja autenticación y roles de usuario
- **CartContext**: Gestiona el carrito de compras
- **ProductsContext**: Administra el catálogo de productos
- **OrdersContext**: Maneja los pedidos y órdenes

### Persistencia de Datos
Todos los datos se guardan en `localStorage` del navegador:
- `user` - Usuario actual
- `users` - Lista de usuarios registrados
- `products` - Catálogo de productos
- `orders` - Pedidos realizados
- `cart` - Carrito de compras

### Rutas Protegidas
- `/admin` - Solo accesible para administradores
- `/perfil` - Requiere autenticación
- `/checkout` - Requiere productos en el carrito

##  Personalización de Productos

Los usuarios pueden personalizar productos con:
- **Texto personalizado**: Campo de texto libre
- **Archivos**: Subida de imágenes o PDFs (convertidos a base64)

Los archivos se muestran en el panel de administración cuando hay pedidos.

##  Opciones de Transporte

- ENETSA
- SERVIENTREGA
- COOPERATIVA
- DELIVERY EN MANTA

##  Métodos de Pago

- Transferencia bancaria
- Depósito

##  Responsive 

La aplicación está completamente optimizada para:
- Desktop
- Tablet
- Mobile

##  Configuración

### Variables de Entorno
El proyecto está preparado para conectarse a un backend. Las variables se configurarían en un archivo `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

##  Notas Importantes

- Los datos se guardan en `localStorage` del navegador





