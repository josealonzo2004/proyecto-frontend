import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { HiOutlineTrash, HiArrowLeft } from 'react-icons/hi';
import { HiOutlineShoppingCart } from 'react-icons/hi2';

export const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, getTotal } = useCart();

    return (
        <div className='max-w-4xl mx-auto'>
            <Link
                to='/productos'
                className='flex items-center gap-2 text-gray-600 hover:text-cyan-600 mb-6'
            >
                <HiArrowLeft size={20} />
                Seguir comprando
            </Link>

            <h1 className='text-3xl font-bold mb-8'>Carrito de compras</h1>

            {cartItems.length === 0 ? (
                <div className='text-center py-12'>
                    <HiOutlineShoppingCart size={64} className='mx-auto text-gray-400 mb-4' />
                    <p className='text-gray-500 text-lg mb-4'>Tu carrito está vacío</p>
                    <Link
                        to='/productos'
                        className='text-cyan-600 hover:underline'
                    >
                        Ir a productos
                    </Link>
                </div>
            ) : (
                <div className='grid md:grid-cols-3 gap-8'>
                    {/* Lista de productos */}
                    <div className='md:col-span-2 space-y-4'>
                        {cartItems.map(item => (
                            <div
                                key={item.id}
                                className='bg-white border border-gray-200 rounded-lg p-4 flex gap-4'
                            >
                                <img
                                    src={item.product.imagen || '/images/logo1.png'}
                                    alt={item.product.nombre}
                                    className='w-24 h-24 object-cover rounded-lg'
                                />
                                <div className='flex-1'>
                                    <h3 className='font-semibold text-lg'>{item.product.nombre}</h3>
                                    <p className='text-gray-600 text-sm'>{item.variant.nombre}</p>
                                    {item.customization?.texto && (
                                        <p className='text-sm text-cyan-600'>
                                            Personalización: {item.customization.texto}
                                        </p>
                                    )}
                                    <p className='text-xl font-bold text-cyan-600 mt-2'>
                                        ${(item.variant.precio * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                                <div className='flex flex-col items-end justify-between'>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className='text-red-500 hover:text-red-700'
                                    >
                                        <HiOutlineTrash size={24} />
                                    </button>
                                    <div className='flex items-center gap-2'>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className='px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100'
                                        >
                                            -
                                        </button>
                                        <span className='px-3'>{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className='px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100'
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Resumen */}
                    <div className='bg-gray-50 rounded-lg p-6 h-fit'>
                        <h2 className='text-xl font-bold mb-4'>Resumen del pedido</h2>
                        <div className='space-y-2 mb-4'>
                            <div className='flex justify-between text-gray-600'>
                                <span>Subtotal</span>
                                <span>${getTotal().toLocaleString()}</span>
                            </div>
                            <div className='flex justify-between text-gray-600'>
                                <span>Envío</span>
                                <span>Calculado al finalizar</span>
                            </div>
                            <div className='border-t pt-2 flex justify-between text-xl font-bold'>
                                <span>Total</span>
                                <span className='text-cyan-600'>${getTotal().toLocaleString()}</span>
                            </div>
                        </div>
                        <Link
                            to='/checkout'
                            className='block w-full bg-cyan-600 text-white text-center py-3 rounded-lg font-medium hover:bg-cyan-700 transition-colors'
                        >
                            Proceder al checkout
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};
