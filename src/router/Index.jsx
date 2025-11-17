import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import {
    AboutPage,
    HomePage,
    ProductsPage,
    ProductDetail,
    CartPage,
    CheckoutPage,
    LoginPage,
    RegisterPage,
    ProfilePage,
    AdminDashboardPage
} from '../pages';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <RootLayout />,
            children: [
                {
                    index: true,
                    element: <HomePage />,
                },
                {
                    path: 'productos',
                    element: <ProductsPage />,
                },
                {
                    path: 'productos/:id',
                    element: <ProductDetail />,
                },
                {
                    path: 'carrito',
                    element: <CartPage />,
                },
                {
                    path: 'checkout',
                    element: <CheckoutPage />,
                },
                {
                    path: 'login',
                    element: <LoginPage />,
                },
                {
                    path: 'registro',
                    element: <RegisterPage />,
                },
                {
                    path: 'perfil',
                    element: (
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: 'admin',
                    element: (
                        <ProtectedRoute requireAdmin={true}>
                            <AdminDashboardPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: 'Nosotros',
                    element: <AboutPage />,
                }
            ]
        }
    ]
);
