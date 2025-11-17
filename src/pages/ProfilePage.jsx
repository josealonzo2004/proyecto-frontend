import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';

export const ProfilePage = () => {
    const { user, logout } = useAuth();
    const { orders } = useOrders();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');

    // Obtener pedidos del usuario actual
    const userOrders = useMemo(() => {
        if (!user || !orders) return [];
        return orders.filter(order => order.cliente?.email === user.correo);
    }, [user, orders]);

    // Obtener direcciones únicas de los pedidos del usuario
    const addresses = useMemo(() => {
        if (!userOrders || userOrders.length === 0) return [];
        
        const uniqueAddresses = [];
        const seenAddresses = new Set();
        
        userOrders.forEach(order => {
            if (order.direccion) {
                // Crear una clave única para la dirección
                const addressKey = JSON.stringify({
                    calleAvenida: order.direccion.calleAvenida || order.direccion.calle,
                    barrio: order.direccion.barrio,
                    ciudad: order.direccion.ciudad,
                    provincia: order.direccion.provincia
                });
                
                if (!seenAddresses.has(addressKey)) {
                    seenAddresses.add(addressKey);
                    uniqueAddresses.push({
                        id: uniqueAddresses.length + 1,
                        ...order.direccion,
                        transporte: order.transporte
                    });
                }
            }
        });
        
        return uniqueAddresses;
    }, [userOrders]);

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
                    {addresses.length === 0 ? (
                        <div className='bg-white rounded-lg p-8 border border-gray-200 text-center'>
                            <p className='text-gray-500 text-lg'>No tienes direcciones guardadas</p>
                            <p className='text-gray-400 text-sm mt-2'>
                                Las direcciones se guardarán automáticamente cuando realices un pedido
                            </p>
                        </div>
                    ) : (
                        addresses.map((address, index) => (
                            <div
                                key={index}
                                className='bg-white rounded-lg p-4 border border-gray-200'
                            >
                                <div className='mb-2'>
                                    <p className='font-semibold'>
                                        {address.calleAvenida || address.calle}
                                    </p>
                                    {address.barrio && (
                                        <p className='text-gray-600 text-sm'>Barrio: {address.barrio}</p>
                                    )}
                                    {address.referencia && (
                                        <p className='text-gray-500 text-xs'>Ref: {address.referencia}</p>
                                    )}
                                    <p className='text-gray-600 text-sm'>
                                        {address.ciudad}{address.provincia ? `, ${address.provincia}` : ''}
                                    </p>
                                    {address.transporte && (
                                        <p className='text-cyan-600 text-sm mt-1'>
                                            Transporte: {address.transporte}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'orders' && (
                <div className='space-y-4'>
                    {userOrders.length === 0 ? (
                        <div className='bg-white rounded-lg p-8 border border-gray-200 text-center'>
                            <p className='text-gray-500 text-lg'>No has realizado ningún pedido aún</p>
                            <p className='text-gray-400 text-sm mt-2'>
                                Tus pedidos aparecerán aquí una vez que realices una compra
                            </p>
                        </div>
                    ) : (
                        userOrders.map(order => (
                            <div key={order.id} className='bg-white rounded-lg p-6 border border-gray-200'>
                                <div className='flex justify-between items-center mb-4'>
                                    <div>
                                        <p className='font-semibold'>Pedido #{order.id}</p>
                                        {order.fecha && (
                                            <p className='text-sm text-gray-600'>
                                                Fecha: {formatDate(order.fecha)}
                                            </p>
                                        )}
                                    </div>
                                    {order.estado && (
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.estado)}`}>
                                            {order.estado.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                {order.direccion && (
                                    <div className='mb-3 text-sm text-gray-600'>
                                        <p>
                                            {order.direccion.calleAvenida || order.direccion.calle}
                                            {order.direccion.barrio && `, ${order.direccion.barrio}`}
                                            {order.direccion.ciudad && `, ${order.direccion.ciudad}`}
                                        </p>
                                        {order.transporte && (
                                            <p className='text-cyan-600'>Transporte: {order.transporte}</p>
                                        )}
                                    </div>
                                )}
                                <div className='flex justify-between items-center'>
                                    <p className='text-gray-600 font-semibold'>
                                        Total: ${(order.total || 0).toLocaleString()}
                                    </p>
                                    {order.metodoPago && (
                                        <p className='text-sm text-gray-500'>
                                            Pago: {order.metodoPago}
                                        </p>
                                    )}
                                </div>
                                {order.productos && order.productos.length > 0 && (
                                    <div className='mt-4 pt-4 border-t'>
                                        <p className='text-sm font-semibold mb-2'>Productos:</p>
                                        <div className='space-y-1'>
                                            {order.productos.slice(0, 3).map((item, idx) => (
                                                <p key={idx} className='text-sm text-gray-600'>
                                                    • {item.product?.nombre || 'Producto'} x{item.quantity || 1}
                                                </p>
                                            ))}
                                            {order.productos.length > 3 && (
                                                <p className='text-sm text-gray-500'>
                                                    y {order.productos.length - 3} más...
                                                </p>
                                            )}
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
