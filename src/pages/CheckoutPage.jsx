import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { direccionesAPI } from '../services/api'; // Asegúrate que la ruta sea correcta

export const CheckoutPage = () => {
    // 1. Hooks personalizados
    const { cartItems, getTotal, clearCart } = useCart();
    const { createOrder } = useOrders();
    const { user } = useAuth();
    const navigate = useNavigate();

    // 2. Estados (useState)
    const [step, setStep] = useState(1);
    const [transporte, setTransporte] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(''); // Solo una vez
    const [saveAddress, setSaveAddress] = useState(false);  // El nuevo que agregamos

    const [shippingAddress, setShippingAddress] = useState({
        callePrincipal: '',
        avenida: '',
        ciudad: '',
        provincia: '',
        pais: 'Ecuador'
    });

const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
        setStep(2);
    } else if (step === 2) {
        setStep(3);
    } else {
        // === INICIO LÓGICA DE GUARDADO DE DIRECCIÓN ===
        if (saveAddress) {
            try {
                // Mapeamos los datos para que coincidan con tu DTO (create-direccion.dto.ts)
                const nuevaDireccion = {
                    usuarioId: user.usuarioId, // Necesario según tu DTO
                    callePrincipal: shippingAddress.callePrincipal,
                    avenida: shippingAddress.avenida || '', // Evitamos null
                    ciudad: shippingAddress.ciudad,
                    provincia: shippingAddress.provincia,
                    pais: shippingAddress.pais
                };

                // Usamos la función que ya existe en tu api.js
                await direccionesAPI.create(nuevaDireccion);
                console.log("Dirección guardada correctamente en el perfil");
            } catch (error) {
                // Si falla el guardado de dirección, NO detenemos la compra, solo avisamos en consola
                console.error("No se pudo guardar la dirección:", error);
            }
        }
            // Crear la orden
            const orderData = {
                usuarioId: user?.usuarioId,
                direccion: shippingAddress,
                transporte: transporte,
                detalles: cartItems.map(item => {
                    const detalle = {
                        cantidad: item.quantity,
                        precio: item.variant.precio
                    };
                    // Si tiene varianteId, lo usamos; sino, usamos productoId
                    if (item.variant.varianteId) {
                        detalle.varianteId = item.variant.varianteId;
                    } else if (item.variant.productoId) {
                        detalle.productoId = item.variant.productoId;
                    }
                    return detalle;
                }),
                contenidoTotal: getTotal(),
                metodoPago: paymentMethod
            };
            await createOrder(orderData);
            clearCart();
            navigate('/perfil');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className='text-center py-12'>
                <p className='text-gray-500 text-lg mb-4'>No hay productos en el carrito</p>
                <Link to='/productos' className='text-cyan-600 hover:underline'>
                    Ir a productos
                </Link>
            </div>
        );
    }

    return (
        <div className='max-w-4xl mx-auto'>
            <Link
                to='/carrito'
                className='flex items-center gap-2 text-gray-600 hover:text-cyan-600 mb-6'
            >
                <HiArrowLeft size={20} />
                Volver al carrito
            </Link>

            <h1 className='text-3xl font-bold mb-8'>Checkout</h1>

            {/* Progress indicator */}
            <div className='flex items-center justify-center mb-8'>
                <div className='flex items-center space-x-4'>
                    {[1, 2, 3].map((s) => (
                        <div key={s} className='flex items-center'>
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${s <= step ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}
                            >
                                {s}
                            </div>
                            {s < 3 && (
                                <div
                                    className={`w-16 h-1 ${s < step ? 'bg-cyan-600' : 'bg-gray-200'}`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {step === 1 && (
                    <div className='bg-white rounded-lg p-6 border border-gray-200'>
                        <h2 className='text-xl font-bold mb-4'>Dirección de envío</h2>
                        <div className='space-y-4'>
                            {/* Selector de Transporte */}
                            <div>
                                <label className='block font-semibold mb-2'>Transporte</label>
                                <select
                                    value={transporte}
                                    onChange={(e) => setTransporte(e.target.value)}
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600'
                                    required
                                >
                                    <option value=''>Selecciona un transporte</option>
                                    <option value='ENETSA'>ENETSA</option>
                                    <option value='SERVIENTREGA'>SERVIENTREGA</option>
                                    <option value='COOPERATIVA'>COOPERATIVA</option>
                                    <option value='DELIVERY EN MANTA'>DELIVERY EN MANTA</option>
                                </select>
                            </div>

                            {/* Calle Principal */}
                            <div>
                                <label className='block font-semibold mb-2'>Calle Principal</label>
                                <input
                                    type='text'
                                    value={shippingAddress.callePrincipal}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, callePrincipal: e.target.value })}
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                                    placeholder='Ej: Av. 4 de Noviembre'
                                    required
                                />
                            </div>

                            {/* Avenida (Opcional en tu entity nullable: true) */}
                            <div>
                                <label className='block font-semibold mb-2'>Avenida / Intersección</label>
                                <input
                                    type='text'
                                    value={shippingAddress.avenida}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, avenida: e.target.value })}
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                                    placeholder='Ej: Calle 113'
                                />
                            </div>

                            {/* Ciudad y Provincia */}
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='block font-semibold mb-2'>Ciudad</label>
                                    <input
                                        type='text'
                                        value={shippingAddress.ciudad}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, ciudad: e.target.value })}
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                                        required
                                    />
                                </div>
                                <div>
                                    <label className='block font-semibold mb-2'>Provincia</label>
                                    <input
                                        type='text'
                                        value={shippingAddress.provincia}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, provincia: e.target.value })}
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                                        required
                                    />
                                </div>
                            </div>

                            {/* País */}
                            <div>
                                <label className='block font-semibold mb-2'>País</label>
                                <input
                                    type='text'
                                    value={shippingAddress.pais}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, pais: e.target.value })}
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                                    required
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className='bg-white rounded-lg p-6 border border-gray-200'>
                        <h2 className='text-xl font-bold mb-4'>Método de pago</h2>
                        <div className='space-y-2'>
                            <label className='flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50'>
                                <input
                                    type='radio'
                                    name='payment'
                                    value='Transferencia bancaria'
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className='mr-3'
                                    required
                                />
                                Transferencia bancaria
                            </label>
                            <label className='flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50'>
                                <input
                                    type='radio'
                                    name='payment'
                                    value='Depósito'
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className='mr-3'
                                    required
                                />
                                Depósito
                            </label>
                        </div>
                    </div>
                )}

                {/* NUEVO: Checkbox para guardar dirección */}
                <div className="mt-4 flex items-center p-2 bg-gray-50 rounded border border-gray-100">
                    <input
                        type="checkbox"
                        id="saveAddress"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 cursor-pointer"
                    />
                    <label htmlFor="saveAddress" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        Guardar esta dirección en mi perfil para futuras compras
                    </label>
                </div>

                {step === 3 && (
                    <div className='bg-white rounded-lg p-6 border border-gray-200'>
                        <h2 className='text-xl font-bold mb-4'>Resumen del pedido</h2>
                        <div className='space-y-2 mb-4'>
                            {cartItems.map(item => (
                                <div key={item.id} className='flex justify-between'>
                                    <span>{item.product.nombre} x{item.quantity}</span>
                                    <span>${(item.variant.precio * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                            <div className='border-t pt-2 flex justify-between font-bold text-lg'>
                                <span>Total a pagar</span>
                                <span className='text-cyan-600'>${getTotal().toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className='flex justify-between mt-8'>
                    {step > 1 && (
                        <button
                            type='button'
                            onClick={() => setStep(step - 1)}
                            className='px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50'
                        >
                            Anterior
                        </button>
                    )}
                    <button
                        type='submit'
                        className='ml-auto px-6 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700'
                    >
                        {step < 3 ? 'Siguiente' : 'Confirmar pedido'}
                    </button>
                </div>
            </form>
        </div>
    );
};
