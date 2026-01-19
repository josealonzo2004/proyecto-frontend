import { StrictMode } from "react"; 
import { createRoot } from "react-dom/client";
import './index.css'
import { RouterProvider } from "react-router-dom";
import { router } from "./router/Index";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ProductsProvider } from "./context/ProductsContext";
import { OrdersProvider } from "./context/OrdersContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { UsersProvider } from "./context/UsersContext";
import { Toaster } from 'react-hot-toast';

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('No se encontró el elemento root');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <UsersProvider>
          <ProductsProvider>
            <OrdersProvider>
              <CartProvider>
                <RouterProvider router={router}/>
                <Toaster 
                  position="bottom-right"
                  toastOptions={{
                    className: 'font-sans',
                  }}
                />
              </CartProvider>
            </OrdersProvider>
          </ProductsProvider>
          </UsersProvider>
        </AuthProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
} catch (error) {
  console.error('Error al inicializar la aplicación:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; background: red; color: white;">
      <h1>Error al cargar la aplicación</h1>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
    </div>
  `;
}

