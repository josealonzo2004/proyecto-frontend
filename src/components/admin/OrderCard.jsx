import { useState } from 'react';
import { useOrders } from '../../context/OrdersContext';
import { HiOutlineMapPin, HiOutlinePhone } from 'react-icons/hi2';
import { HiOutlineMail } from 'react-icons/hi';
import { notifySuccess, notifyError } from '../../utils/notifications';

export const OrderCard = ({ order }) => {
    const { updateOrderStatus } = useOrders();
    const [showDetails, setShowDetails] = useState(false);
    const [selectedEstadoId, setSelectedEstadoId] = useState(order.estado?.estadoId || 1);
    const [isUpdating, setIsUpdating] = useState(false);

    // Mapeo de estadoId a nombre de estado
    const getEstadoNombre = (estadoId) => {
        const estados = {
            1: 'Pendiente',
            2: 'En proceso',
            3: 'Enviado',
            4: 'Entregado',
            5: 'Cancelado'
        };
        return estados[estadoId] || 'Pendiente';
    };

    // Función auxiliar para color de estado (acepta estadoId)
    const getStatusColor = (estadoId) => {
        const colors = {
            1: 'bg-yellow-100 text-yellow-800',
            2: 'bg-blue-100 text-blue-800',
            3: 'bg-purple-100 text-purple-800',
            4: 'bg-green-100 text-green-800',
            5: 'bg-red-100 text-red-800'
        };
        return colors[estadoId] || colors[1];
    };

    // Función para guardar el estado
    const handleSaveEstado = async () => {
        setIsUpdating(true);
        try {
            await updateOrderStatus(order.pedidoId, selectedEstadoId);
            // Mostrar notificación de éxito
            notifySuccess('Estado del pedido actualizado correctamente');
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            notifyError('Error al actualizar el estado del pedido');
        } finally {
            setIsUpdating(false);
        }
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
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedEstadoId)}`}>
                    {getEstadoNombre(selectedEstadoId).toUpperCase()}
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

             {/* Selector de estado con botón de guardar */}
                <div className='flex gap-2 items-center'>
                    <select
                        value={selectedEstadoId}
                        onChange={(e) => setSelectedEstadoId(Number(e.target.value))}
                        disabled={isUpdating}
                        className='px-4 py-2 border border-gray-300 rounded-lg focus:border-cyan-600 outline-none text-sm disabled:bg-gray-100 disabled:cursor-not-allowed'
                    >
                        <option value="1">Pendiente</option>
                        <option value="2">En proceso</option>
                        <option value="3">Enviado</option>
                        <option value="4">Entregado</option>
                        <option value="5">Cancelado</option>
                    </select>
                    <button
                        onClick={handleSaveEstado}
                        disabled={isUpdating}
                        className='px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2'
                    >
                        {isUpdating ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Guardando...
                            </>
                        ) : (
                            'Guardar'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};