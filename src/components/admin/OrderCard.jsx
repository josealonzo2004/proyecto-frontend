import { useState } from 'react';
import { useOrders } from '../../context/OrdersContext';
import { HiOutlineMapPin, HiOutlinePhone } from 'react-icons/hi2';
import { HiOutlineMail } from 'react-icons/hi';

export const OrderCard = ({ order }) => {
    const { updateOrderStatus } = useOrders();
    const [showDetails, setShowDetails] = useState(false);

    // Función auxiliar para color de estado
    const getStatusColor = (estadoObj) => {
        // Tu backend devuelve un objeto estado o un ID.
        // Si es objeto: estadoObj.descripcion
        const status = estadoObj?.descripcion?.toLowerCase() || 'pendiente';
        
        const colors = {
            pendiente: 'bg-yellow-100 text-yellow-800',
            'en proceso': 'bg-blue-100 text-blue-800',
            enviado: 'bg-purple-100 text-purple-800',
            entregado: 'bg-green-100 text-green-800',
            cancelado: 'bg-red-100 text-red-800'
        };
        return colors[status] || colors.pendiente;
    };
     // Función auxiliar para formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
            {/* ENCABEZADO: ID y Fecha */}
            <div className='flex justify-between items-start mb-4'>
                <div>
                    <h3 className='text-xl font-bold mb-1 text-gray-800'>
                        Pedido #{order.pedidoId}
                    </h3>
                    <p className='text-sm text-gray-500'>
                        {formatDate(order.fechaCreacion)}
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.estado)}`}>
                    {order.estado?.descripcion?.toUpperCase() || 'PENDIENTE'}
                </span>
            </div>

            {/* INFORMACIÓN DEL USUARIO (Antes Cliente) */}
            {order.usuario && (
                <div className='bg-gray-50 rounded-lg p-4 mb-4 text-sm'>
                    <h4 className='font-semibold mb-2 text-gray-700'>Cliente</h4>
                    <div className='flex flex-col gap-1'>
                        <div className='flex items-center gap-2'>
                            <HiOutlineMail className='text-gray-400' />
                            <span>{order.usuario.nombre} {order.usuario.apellido}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <HiOutlineMail className='text-gray-400' />
                            <span className='text-gray-600'>{order.usuario.correoElectronico}</span>
                        </div>
                        {order.usuario.telefono && (
                            <div className='flex items-center gap-2'>
                                <HiOutlinePhone className='text-gray-400' />
                                <span>{order.usuario.telefono}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}


              {/* PRODUCTOS (Antes order.productos, ahora order.detalles) */}
            {order.detalles && order.detalles.length > 0 && (
                <div className='mb-4'>
                    <h4 className='font-semibold mb-3 text-gray-700'>Productos</h4>
                    <div className='space-y-3'>
                        {order.detalles.map((detalle, index) => (
                            <div key={index} className='flex justify-between items-center border-b pb-2 last:border-0'>
                                <div>
                                    <p className='font-medium text-gray-800'>
                                        {/* Accedemos profundo: detalle -> variante -> producto -> nombre */}
                                        {detalle.variante?.producto?.nombre || 'Producto'}
                                    </p>
                                    <p className='text-sm text-gray-500'>
                                        Variante: {detalle.variante?.nombre}
                                    </p>
                                    <p className='text-xs text-gray-400'>
                                        Cant: {detalle.cantidad} x ${Number(detalle.precio).toFixed(2)}
                                    </p>
                                </div>
                                <p className='font-semibold text-gray-700'>
                                    ${(Number(detalle.precio) * detalle.cantidad).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}


           {/* TOTAL Y ACCIONES */}
            <div className='border-t pt-4 flex flex-col sm:flex-row justify-between items-center gap-4'>
                <div className='text-xl font-bold'>
                    <span className='mr-2 text-gray-600 text-base'>Total:</span>
                    <span className='text-cyan-600'>
                        ${Number(order.contenidoTotal).toLocaleString()}
                    </span>
                </div>

             {/* Selector de estado (Solo funcional si tienes la función conectada al backend) */}
                <select
                    value={order.estado?.descripcion?.toLowerCase() || 'pendiente'}
                    onChange={(e) => updateOrderStatus(order.pedidoId, e.target.value)} // Usamos pedidoId
                    className='px-4 py-2 border border-gray-300 rounded-lg focus:border-cyan-600 outline-none text-sm'
                >
                    <option value='pendiente'>Pendiente</option>
                    <option value='en proceso'>En proceso</option>
                    <option value='enviado'>Enviado</option>
                    <option value='entregado'>Entregado</option>
                    <option value='cancelado'>Cancelado</option>
                </select>
            </div>
        </div>
    );
};