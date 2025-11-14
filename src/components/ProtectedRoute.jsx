import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <p className='text-gray-600'>Cargando...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    if (requireAdmin && !isAdmin) {
        return (
            <div className='text-center py-12'>
                <p className='text-red-600 text-lg mb-4'>No tienes permisos para acceder a esta página</p>
                <p className='text-gray-600'>Solo los administradores pueden acceder a esta sección.</p>
            </div>
        );
    }

    return children;
};

