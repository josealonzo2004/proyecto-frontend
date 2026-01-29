# Innova Arte - Frontend

Interfaz de usuario para la plataforma de comercio electrónico "Innova Arte", desarrollada con **React** y **Vite**.

## ☁️ Arquitectura de Despliegue

Este frontend sigue una arquitectura **Cloud-Based**, pero consume servicios de un servidor privado.

* **Alojamiento:** Desplegado en **Netlify** (Nube Pública).
* **Comunicación:** Se comunica con el Backend (situado en un servidor privado Ubuntu) a través de un túnel seguro HTTPS proporcionado por **Ngrok**.
* **Integración Continua:** Despliegue automático desde GitHub.

### Estado del Sistema
| Componente | Ubicación | Estado |
|------------|-----------|--------|
| **Frontend** | Netlify (Nube) | 🟢 Online |
| **Backend** | Servidor Ubuntu (Local) | 🟢 Online (vía Ngrok) |

## 🛠 Tecnologías
* **Librería:** React
* **Build Tool:** Vite
* **Estilos:** CSS Modules / Tailwind (según corresponda a tu proyecto)
* **Cliente HTTP:** Fetch / Axios

## ⚙️ Configuración (.env)

Para conectar con el servidor privado, se utiliza la URL dinámica de Ngrok:

```bash
# Ejemplo de configuración
VITE_API_URL=https://xxxx-xxxx.ngrok-free.app

# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
