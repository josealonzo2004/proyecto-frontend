import { useState } from 'react';
import { useOrders } from '../../context/OrdersContext';
import { HiOutlineMapPin, HiOutlinePhone } from 'react-icons/hi2';
import { HiOutlineMail } from 'react-icons/hi';

export const OrderCard = ({ order }) => {
    const { updateOrderStatus } = useOrders();
    const [showDetails, setShowDetails] = useState(false);

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

    return (
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <div className='flex justify-between items-start mb-4'>
                <div>
                    <h3 className='text-xl font-bold mb-1'>Pedido #{order.id}</h3>
                    {order.fecha && (
                        <p className='text-sm text-gray-600'>{formatDate(order.fecha)}</p>
                    )}
                </div>
                {order.estado && (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.estado)}`}>
                        {(order.estado || 'pendiente').toUpperCase()}
                    </span>
                )}
            </div>

            {/* Información del Cliente */}
            {order.cliente && (
                <div className='bg-gray-50 rounded-lg p-4 mb-4'>
                    <h4 className='font-semibold mb-3'>Información del Cliente</h4>
                    <div className='space-y-2 text-sm'>
                        {(order.cliente?.nombre || order.cliente?.apellido) && (
                            <div className='flex items-center gap-2'>
                                <HiOutlineMail className='text-gray-500' />
                                <span className='font-medium'>{order.cliente?.nombre || ''} {order.cliente?.apellido || ''}</span>
                            </div>
                        )}
                        {order.cliente?.email && (
                            <div className='flex items-center gap-2'>
                                <HiOutlineMail className='text-gray-500' />
                                <span>{order.cliente.email}</span>
                            </div>
                        )}
                        {order.cliente?.telefono && (
                            <div className='flex items-center gap-2'>
                                <HiOutlinePhone className='text-gray-500' />
                                <span>{order.cliente.telefono}</span>
                            </div>
                        )}
                        {order.transporte && (
                            <div className='flex items-center gap-2'>
                                <span className='text-gray-500 font-medium'>Transporte:</span>
                                <span className='font-semibold text-cyan-600'>{order.transporte}</span>
                            </div>
                        )}
                        {order.direccion && (
                            <div className='flex items-start gap-2'>
                                <HiOutlineMapPin className='text-gray-500 mt-1' />
                                <div>
                                    <p className='font-medium'>Dirección de envío:</p>
                                    {order.direccion.calleAvenida && <p>{order.direccion.calleAvenida}</p>}
                                    {order.direccion.barrio && <p>Barrio: {order.direccion.barrio}</p>}
                                    {order.direccion.referencia && <p className='text-xs text-gray-600'>Ref: {order.direccion.referencia}</p>}
                                    {(order.direccion.ciudad || order.direccion.provincia) && (
                                        <p>{order.direccion.ciudad || ''}{order.direccion.ciudad && order.direccion.provincia ? ', ' : ''}{order.direccion.provincia || ''}</p>
                                    )}
                                    {/* Compatibilidad con formato antiguo */}
                                    {order.direccion.calle && !order.direccion.calleAvenida && <p>{order.direccion.calle}</p>}
                                    {order.direccion.codigoPostal && <p>C.P: {order.direccion.codigoPostal}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Productos */}
            {order.productos && order.productos.length > 0 && (
                <div className='mb-4'>
                    <h4 className='font-semibold mb-3'>Productos Solicitados</h4>
                    <div className='space-y-2'>
                        {order.productos.map((item, index) => (
                            <div key={index} className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
                                <div className='flex items-center gap-3'>
                                    {item.product?.imagen && (
                                        <img
                                            src={item.product.imagen}
                                            alt={item.product?.nombre || 'Producto'}
                                            className='w-16 h-16 object-cover rounded-lg'
                                        />
                                    )}
                                    <div className='flex-1'>
                                        <p className='font-medium'>{item.product?.nombre || 'Producto'}</p>
                                        {item.variant?.nombre && (
                                            <p className='text-sm text-gray-600'>{item.variant.nombre}</p>
                                        )}
                                        {item.customization?.texto && (
                                            <p className='text-xs text-cyan-600'>Personalización: {item.customization.texto}</p>
                                        )}
                                        {item.customization?.archivo && (
                                            <div className='mt-2'>
                                                <p className='text-xs font-semibold text-gray-600 mb-1'>
                                                    Archivo proporcionado:
                                                    {item.customization.nombreArchivo && (
                                                        <span className='ml-1'>{item.customization.nombreArchivo}</span>
                                                    )}
                                                </p>
                                                {typeof item.customization.archivo === 'string' && item.customization.archivo.startsWith('data:image/') ? (
                                                    <img
                                                        src={item.customization.archivo}
                                                        alt='Archivo de personalización'
                                                        className='w-32 h-32 object-contain border border-gray-300 rounded-lg bg-gray-50'
                                                    />
                                                ) : typeof item.customization.archivo === 'string' ? (
                                                    <div className='p-2 bg-gray-100 rounded-lg border border-gray-300'>
                                                        <a
                                                            href={item.customization.archivo}
                                                            download={item.customization.nombreArchivo || 'archivo'}
                                                            className='text-xs text-cyan-600 hover:underline'
                                                        >
                                                            📄 Descargar archivo
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <p className='text-xs text-gray-500'>Archivo no disponible</p>
                                                )}
                                            </div>
                                        )}
                                        <p className='text-sm text-gray-500 mt-1'>Cantidad: {item.quantity || 1}</p>
                                    </div>
                                </div>
                                <p className='font-semibold'>${((item.variant?.precio || 0) * (item.quantity || 1)).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Total y Método de Pago */}
            <div className='border-t pt-4 mb-4'>
                {order.metodoPago && (
                    <div className='flex justify-between items-center mb-2'>
                        <span className='text-gray-600'>Método de pago:</span>
                        <span className='font-medium'>{order.metodoPago}</span>
                    </div>
                )}
                <div className='flex justify-between items-center text-xl font-bold'>
                    <span>Total:</span>
                    <span className='text-cyan-600'>${(order.total || 0).toLocaleString()}</span>
                </div>
            </div>

            {/* Cambiar Estado */}
            <div className='flex gap-2'>
                <select
                    value={order.estado || 'pendiente'}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600'
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
