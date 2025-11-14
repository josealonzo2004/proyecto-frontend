import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { useOrders } from '../context/OrdersContext';
import { useNavigate } from 'react-router-dom';
import { HiOutlineChartBar, HiOutlineShoppingBag, HiOutlineUsers } from 'react-icons/hi2';
import { HiX } from 'react-icons/hi';
import { ProductForm } from '../components/admin/ProductForm';
import { OrderCard } from '../components/admin/OrderCard';

export const AdminDashboardPage = () => {
    const { isAdmin } = useAuth();
    const { products, deleteProduct } = useProducts();
    const { orders } = useOrders();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    if (!isAdmin) {
        return (
            <div className='text-center py-12'>
                <p className='text-red-600 text-lg'>No tienes permisos para acceder a esta página</p>
            </div>
        );
    }

    const pendingOrders = (orders || []).filter(o => o.estado === 'pendiente');
    const totalRevenue = (orders || []).reduce((sum, order) => sum + (order.total || 0), 0);

    const stats = [
        { label: 'Ventas totales', value: `$${totalRevenue.toLocaleString()}`, icon: HiOutlineChartBar },
        { label: 'Pedidos pendientes', value: pendingOrders.length.toString(), icon: HiOutlineShoppingBag },
        { label: 'Total pedidos', value: (orders || []).length.toString(), icon: HiOutlineUsers }
    ];

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowProductForm(true);
    };

    const handleCloseForm = () => {
        setShowProductForm(false);
        setEditingProduct(null);
    };

    return (
        <div className='max-w-7xl mx-auto'>
            <h1 className='text-3xl font-bold mb-8'>Panel de administración</h1>

            {/* Tabs */}
            <div className='flex gap-2 mb-8 border-b overflow-x-auto'>
                <button
                    onClick={() => setActiveSection('dashboard')}
                    className={`pb-2 px-4 font-semibold whitespace-nowrap ${
                        activeSection === 'dashboard' ? 'border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                    }`}
                >
                    Dashboard
                </button>
                <button
                    onClick={() => setActiveSection('products')}
                    className={`pb-2 px-4 font-semibold whitespace-nowrap ${
                        activeSection === 'products' ? 'border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                    }`}
                >
                    Productos
                </button>
                <button
                    onClick={() => setActiveSection('orders')}
                    className={`pb-2 px-4 font-semibold whitespace-nowrap ${
                        activeSection === 'orders' ? 'border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                    }`}
                >
                    Pedidos
                </button>
                <button
                    onClick={() => setActiveSection('returns')}
                    className={`pb-2 px-4 font-semibold whitespace-nowrap ${
                        activeSection === 'returns' ? 'border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                    }`}
                >
                    Devoluciones
                </button>
            </div>

            {/* Contenido */}
            {activeSection === 'dashboard' && (
                <div className='space-y-6'>
                    {/* Estadísticas */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                        {stats.map((stat, index) => (
                            <div key={index} className='bg-white rounded-lg p-6 border border-gray-200'>
                                <div className='flex items-center justify-between mb-2'>
                                    <stat.icon size={32} className='text-cyan-600' />
                                </div>
                                <p className='text-2xl font-bold'>{stat.value}</p>
                                <p className='text-gray-600 text-sm'>{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Pedidos recientes */}
                    {orders && orders.length > 0 && (
                        <div className='bg-white rounded-lg p-6 border border-gray-200'>
                            <h2 className='text-xl font-bold mb-4'>Pedidos recientes</h2>
                            <div className='space-y-3'>
                                {orders.slice(0, 3).map(order => (
                                    <div key={order.id} className='flex justify-between items-center pb-3 border-b last:border-0'>
                                        <div>
                                            <p className='font-semibold'>Pedido #{order.id}</p>
                                            <p className='text-sm text-gray-600'>
                                                Cliente: {order.cliente?.nombre || 'N/A'} {order.cliente?.apellido || ''}
                                            </p>
                                        </div>
                                        <div className='text-right'>
                                            <p className='font-semibold'>${(order.total || 0).toLocaleString()}</p>
                                            <p className={`text-sm ${
                                                order.estado === 'pendiente' ? 'text-yellow-600' :
                                                order.estado === 'en proceso' ? 'text-blue-600' :
                                                order.estado === 'enviado' ? 'text-purple-600' :
                                                order.estado === 'entregado' ? 'text-green-600' :
                                                'text-gray-600'
                                            }`}>
                                                {order.estado || 'pendiente'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeSection === 'products' && (
                <div>
                    <div className='flex justify-between items-center mb-4'>
                        <h2 className='text-xl font-bold'>Gestión de productos</h2>
                        <button 
                            onClick={() => setShowProductForm(true)}
                            className='bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700'
                        >
                            + Agregar producto
                        </button>
                    </div>

                    {showProductForm && (
                        <div className='mb-6'>
                            <ProductForm 
                                product={editingProduct} 
                                onClose={handleCloseForm}
                            />
                        </div>
                    )}

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {(products || []).map(product => (
                            <div key={product.id} className='bg-white rounded-lg border border-gray-200 p-4'>
                                {product.imagen && (
                                    <img
                                        src={product.imagen}
                                        alt={product.nombre}
                                        className='w-full h-48 object-cover rounded-lg mb-3'
                                    />
                                )}
                                <h3 className='font-bold text-lg mb-2'>{product.nombre}</h3>
                                <p className='text-gray-600 text-sm mb-2 line-clamp-2'>{product.descripcion}</p>
                                <p className='text-cyan-600 font-bold mb-3'>${product.precioBase?.toLocaleString()}</p>
                                <div className='flex gap-2'>
                                    <button
                                        onClick={() => handleEditProduct(product)}
                                        className='flex-1 bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 text-sm'
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => deleteProduct(product.id)}
                                        className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600'
                                    >
                                        <HiX size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {(!products || products.length === 0) && (
                            <div className='col-span-full text-center py-12 text-gray-500'>
                                No hay productos. Agrega tu primer producto.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeSection === 'orders' && (
                <div>
                    <h2 className='text-xl font-bold mb-4'>Gestión de pedidos</h2>
                    <div className='space-y-4'>
                        {(!orders || orders.length === 0) ? (
                            <div className='text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200'>
                                No hay pedidos aún
                            </div>
                        ) : (
                            (orders || []).map(order => (
                                <OrderCard key={order.id} order={order} />
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeSection === 'returns' && (
                <div className='bg-white rounded-lg border border-gray-200 p-6'>
                    <h2 className='text-xl font-bold mb-4'>Solicitudes de devolución</h2>
                    <div className='space-y-3'>
                        {[1, 2].map(item => (
                            <div key={item} className='p-4 bg-gray-50 rounded-lg'>
                                <div className='flex justify-between items-start mb-2'>
                                    <div>
                                        <p className='font-semibold'>Devolución #RET00{item}</p>
                                        <p className='text-sm text-gray-600'>Pedido: #1234{item}</p>
                                    </div>
                                    <span className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'>
                                        Pendiente
                                    </span>
                                </div>
                                <p className='text-gray-600 mb-2'>Razón: Producto con defecto</p>
                                <div className='flex gap-2'>
                                    <button className='px-4 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700'>
                                        Aprobar
                                    </button>
                                    <button className='px-4 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700'>
                                        Rechazar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
