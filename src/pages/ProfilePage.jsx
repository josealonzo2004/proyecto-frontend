import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { direccionesAPI, pedidosAPI } from "../services/api"; // 2. Importa la API

export const ProfilePage = () => {
    const { user, logout } = useAuth();
    const { orders } = useOrders();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');


    // --- NUEVO CÓDIGO DE DIRECCIONES ---
    
    // 1. Variable para guardar las direcciones que vienen de la base de datos
    const [misDirecciones, setMisDirecciones] = useState([]);

    // 2. Cada vez que cambies a la pestaña 'addresses', pedimos los datos
    useEffect(() => {
        if (activeTab === 'addresses') {
            direccionesAPI.getAll()
                .then((respuesta) => {
                    // Guardamos los datos que nos devolvió el backend
                    setMisDirecciones(respuesta.data);
                })
                .catch((error) => console.error("Error cargando direcciones", error));
        }
    }, [activeTab]);

    // --- FIN NUEVO CÓDIGO DE DIRECCIONES ---

    // --- NUEVO CÓDIGO PARA PEDIDOS ---
    const [misPedidos, setMisPedidos] = useState([]);

    useEffect(() => {
        if (activeTab === 'orders' && user) {
            pedidosAPI.getAll()
                .then((res) => {
                    // FILTRO IMPORTANTE: 
                    // Como el backend trae TODOS los pedidos de TODOS los usuarios,
                    // aquí filtramos solo los que pertenecen al usuario logueado.
                    // Asumimos que user.id o user.usuarioId coinciden.
                    const pedidosMios = res.data.filter(
                        pedido => pedido.usuario && pedido.usuario.correoElectronico === user.correoElectronico
                    );
                    setMisPedidos(pedidosMios);
                })
                .catch(err => console.error("Error cargando pedidos", err));
        }
    }, [activeTab, user]);
    // --- FIN NUEVO CÓDIGO DE PEDIDOS ---


    // Obtener pedidos del usuario actual
    const userOrders = useMemo(() => {
        if (!user || !orders) return [];
        return orders.filter(order => order.cliente?.email === user.correo);
    }, [user, orders]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Fecha inválida';
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pendiente: 'bg-yellow-100 text-yellow-800',
            'en proceso': 'bg-blue-100 text-blue-800',
            enviado: 'bg-purple-100 text-purple-800',
            entregado: 'bg-green-100 text-green-800',
            cancelado: 'bg-red-100 text-red-800'
        };
        return colors[status] || colors.pendiente;
    };

    return (
        <div className='max-w-4xl mx-auto'>
            <h1 className='text-3xl font-bold mb-8'>Mi cuenta</h1>

            {/* Tabs */}
            <div className='flex gap-4 mb-8 border-b'>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-2 px-4 font-semibold ${
                        activeTab === 'profile' ? 'border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                    }`}
                >
                    Perfil
                </button>
                <button
                    onClick={() => setActiveTab('addresses')}
                    className={`pb-2 px-4 font-semibold ${
                        activeTab === 'addresses' ? 'border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                    }`}
                >
                    Direcciones
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`pb-2 px-4 font-semibold ${
                        activeTab === 'orders' ? 'border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                    }`}
                >
                    Pedidos
                </button>
                <button
                    onClick={() => setActiveTab('returns')}
                    className={`pb-2 px-4 font-semibold ${
                        activeTab === 'returns' ? 'border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                    }`}
                >
                    Devoluciones
                </button>
            </div>

            {/* Contenido de tabs */}
            {activeTab === 'profile' && (
                <div className='bg-white rounded-lg p-6 border border-gray-200'>
                    <h2 className='text-xl font-bold mb-4'>Información personal</h2>
                    <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className='block font-semibold mb-2'>Nombre</label>
                                <input
                                    type='text'
                                    defaultValue={user?.nombre || ''}
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                                />
                            </div>
                            <div>
                                <label className='block font-semibold mb-2'>Apellido</label>
                                <input
                                    type='text'
                                    defaultValue={user?.apellido || ''}
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                                />
                            </div>
                        </div>
                        <div>
                            <label className='block font-semibold mb-2'>Correo electrónico</label>
                            <input
                                type='email'
                                defaultValue={user?.correoElectronico || ''}
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                            />
                        </div>
                        <div>
                            <label className='block font-semibold mb-2'>Teléfono</label>
                            <input
                                type='tel'
                                defaultValue={user?.telefono || ''}
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                            />
                        </div>
                        <button className='bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700'>
                            Guardar cambios
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'addresses' && (
                <div className='space-y-4'>
                    {misDirecciones.length === 0 ? (
                        <div className='bg-white rounded-lg p-8 border border-gray-200 text-center'>
                            <p className='text-gray-500 text-lg'>No tienes direcciones guardadas</p>
                        </div>
                    ) : (
                        // Aquí recorremos 'misDirecciones' en lugar de 'addresses'
                        misDirecciones.map((dir) => (
                            <div key={dir.direccionId} className='bg-white rounded-lg p-4 border border-gray-200'>
                                <div className='mb-2'>
                                    {/* Usamos los nombres exactos de tu Backend (direccion.entity.ts) */}
                                    <p className='font-semibold text-lg'>
                                        {dir.callePrincipal}
                                    </p>
                                    
                                    {/* Si existe la avenida, la mostramos */}
                                    {dir.avenida && (
                                        <p className='text-gray-600 text-sm'>
                                            Avenida: {dir.avenida}
                                        </p>
                                    )}

                                    <p className='text-gray-600 text-sm mt-1'>
                                        {dir.ciudad} - {dir.provincia}
                                    </p>
                                    
                                    <p className='text-gray-400 text-xs mt-1 uppercase'>
                                        {dir.pais}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'orders' && (
                <div className='space-y-4'>
                    {misPedidos.length === 0 ? (
                        <div className='bg-white rounded-lg p-8 border border-gray-200 text-center'>
                            <p className='text-gray-500 text-lg'>No has realizado ningún pedido aún</p>
                        </div>
                    ) : (
                        misPedidos.map(pedido => (
                            <div key={pedido.pedidoId} className='bg-white rounded-lg p-6 border border-gray-200'>
                                {/* Encabezado del pedido */}
                                <div className='flex justify-between items-center mb-4'>
                                    <div>
                                        <p className='font-bold text-lg'>Pedido #{pedido.pedidoId}</p>
                                        <p className='text-sm text-gray-600'>
                                            Fecha: {new Date(pedido.fechaCreacion).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {/* Estado (Si tienes una entidad Estado con descripción) */}
                                    <span className='px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800'>
                                        {pedido.estado ? pedido.estado.descripcion : 'Procesando'}
                                    </span>
                                </div>

                                {/* Total */}
                                <div className='flex justify-between items-center mb-4 border-b pb-4'>
                                    <p className='text-gray-600 font-semibold'>Total Pagado:</p>
                                    <p className='text-xl font-bold text-cyan-600'>
                                        ${Number(pedido.contenidoTotal).toFixed(2)}
                                    </p>
                                </div>

                                {/* Lista de productos dentro del pedido */}
                                {pedido.detalles && pedido.detalles.length > 0 && (
                                    <div className='bg-gray-50 rounded p-3'>
                                        <p className='text-sm font-semibold mb-2 text-gray-700'>Productos:</p>
                                        <div className='space-y-2'>
                                            {pedido.detalles.map((detalle, idx) => (
                                                <div key={idx} className='flex justify-between text-sm'>
                                                    <span className='text-gray-600'>
                                                        {/* Accedemos al nombre gracias al cambio del Paso 1 */}
                                                        • {detalle.variante?.producto?.nombre || 'Producto'} 
                                                        <span className='text-gray-400'> (x{detalle.cantidad})</span>
                                                    </span>
                                                    <span className='font-medium'>
                                                        ${Number(detalle.precio).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'returns' && (
                <div className='space-y-4'>
                    <div className='bg-white rounded-lg p-8 border border-gray-200 text-center'>
                        <p className='text-gray-500 text-lg'>No tienes devoluciones</p>
                        <p className='text-gray-400 text-sm mt-2'>
                            Si necesitas realizar una devolución, contacta con el administrador
                        </p>
                    </div>
                </div>
            )}

            <button
                onClick={() => {
                    logout();
                    navigate('/');
                }}
                className='mt-8 px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50'
            >
                Cerrar sesión
            </button>
        </div>
    );
};
