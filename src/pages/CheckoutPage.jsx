import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiPrinter, HiCheckCircle } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { direccionesAPI } from '../services/api';
import { notifyError } from '../utils/notifications';

export const CheckoutPage = () => {
    // 1. Hooks personalizados
    const { cartItems, getTotal, clearCart } = useCart();
    const { createOrder } = useOrders();
    const { user } = useAuth();
    const navigate = useNavigate();

    // 2. Estados (useState)
    const [step, setStep] = useState(1);
    const [transporte, setTransporte] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [saveAddress, setSaveAddress] = useState(false);
    
    // NUEVO: Estado para bloquear el botón (Evita doble compra)
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // NUEVO: Estado para guardar la respuesta de éxito
    const [purchaseSuccess, setPurchaseSuccess] = useState(null);

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
            // === PASO 3: CONFIRMACIÓN Y COMPRA ===
            
            // 1. Validaciones de seguridad
            if (isSubmitting) return; // Si ya se envió, ignorar clics extra
            if (cartItems.length === 0) return;

            // 2. Bloquear botón
            setIsSubmitting(true);

            try {
                // Guardar dirección (Opcional)
                if (saveAddress) {
                    try {
                        const nuevaDireccion = {
                            usuarioId: user.usuarioId,
                            callePrincipal: shippingAddress.callePrincipal,
                            avenida: shippingAddress.avenida || '',
                            ciudad: shippingAddress.ciudad,
                            provincia: shippingAddress.provincia,
                            pais: shippingAddress.pais
                        };
                        await direccionesAPI.create(nuevaDireccion);
                    } catch (error) {
                        console.error("No se pudo guardar dirección (no bloqueante):", error);
                    }
                }

                // 3. Preparar datos de la orden
                const orderData = {
                    usuarioId: user?.usuarioId,
                    direccion: shippingAddress,
                    transporte: transporte,
                    detalles: cartItems.map(item => {
                        const detalle = {
                            cantidad: item.quantity,
                            precio: item.variant.precio
                        };
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

                // 4. Crear orden y ESPERAR respuesta
                const response = await createOrder(orderData);
                
                // 5. Guardar respuesta para mostrar la factura
                setPurchaseSuccess(response);
                
                // 6. Limpiar carrito y avanzar al PASO 4 (Factura)
                clearCart();
                setStep(4); 

            } catch (error) {
                console.error("Error en checkout:", error);
                notifyError("Hubo un error al procesar tu pedido. Por favor intenta de nuevo.");
                setIsSubmitting(false); // Desbloquear solo si hubo error
            }
        }
    };

    // Si el carrito está vacío y NO estamos en el paso final (Factura)
    if (cartItems.length === 0 && step !== 4) { 
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
        <div className='max-w-4xl mx-auto px-4 py-8'>
            {/* Ocultamos navegación si ya compró (Paso 4) */}
            {step !== 4 && (
                <Link
                    to='/carrito'
                    className='flex items-center gap-2 text-gray-600 hover:text-cyan-600 mb-6'
                >
                    <HiArrowLeft size={20} />
                    Volver al carrito
                </Link>
            )}

            <h1 className='text-3xl font-bold mb-8 text-center md:text-left'>
                {step === 4 ? '¡Compra Exitosa!' : 'Checkout'}
            </h1>

            {/* Indicador de Progreso (Se oculta en paso 4) */}
            {step !== 4 && (
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
            )}

            <form onSubmit={handleSubmit}>
                {step === 1 && (
                    <div className='bg-white rounded-lg p-6 border border-gray-200 shadow-sm'>
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

                            {/* Campos de dirección */}
                            <div>
                                <label className='block font-semibold mb-2'>Calle Principal</label>
                                <input
                                    type='text'
                                    value={shippingAddress.callePrincipal}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, callePrincipal: e.target.value })}
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                                    required
                                />
                            </div>
                            <div>
                                <label className='block font-semibold mb-2'>Avenida / Intersección</label>
                                <input
                                    type='text'
                                    value={shippingAddress.avenida}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, avenida: e.target.value })}
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                                />
                            </div>
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
                            
                            {/* Checkbox guardar dirección */}
                            <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-200 mt-2">
                                <input
                                    type="checkbox"
                                    id="saveAddress"
                                    checked={saveAddress}
                                    onChange={(e) => setSaveAddress(e.target.checked)}
                                    className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500 cursor-pointer"
                                />
                                <label htmlFor="saveAddress" className="ml-2 text-sm text-gray-700 cursor-pointer font-medium">
                                    Guardar esta dirección para futuras compras
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className='bg-white rounded-lg p-6 border border-gray-200 shadow-sm'>
                        <h2 className='text-xl font-bold mb-4'>Método de pago</h2>
                        <div className='space-y-3'>
                            {['Transferencia bancaria', 'Depósito'].map((method) => (
                                <label key={method} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === method ? 'border-cyan-600 bg-cyan-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                                    <input
                                        type='radio'
                                        name='payment'
                                        value={method}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className='mr-3 text-cyan-600 focus:ring-cyan-500'
                                        required
                                    />
                                    {method}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className='bg-white rounded-lg p-6 border border-gray-200 shadow-sm'>
                        <h2 className='text-xl font-bold mb-4'>Resumen del pedido</h2>
                        
                        <div className="mb-6 p-4 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100 flex items-start gap-2">
                            <span className="text-xl">ℹ️</span>
                            <div>
                                <p className="font-bold">Facturación Automática</p>
                                <p>Al confirmar, se generará tu factura electrónica vinculada a este pedido.</p>
                            </div>
                        </div>

                        <div className='space-y-3 mb-6'>
                            {cartItems.map(item => (
                                <div key={item.id} className='flex justify-between items-center py-2 border-b border-gray-100 last:border-0'>
                                    <div>
                                        <p className="font-medium">{item.product.nombre}</p>
                                        <p className="text-sm text-gray-500">Cant: {item.quantity} | {item.variant.nombre}</p>
                                    </div>
                                    <span className="font-semibold">${(item.variant.precio * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className='border-t pt-4 flex justify-between items-center'>
                            <span className='text-gray-600'>Total a pagar</span>
                            <span className='text-2xl font-bold text-cyan-600'>${getTotal().toLocaleString()}</span>
                        </div>
                    </div>
                )}

                {/* === PASO 4: VISTA DE FACTURA / RECIBO === */}
                {step === 4 && purchaseSuccess && (
                    <div className="animate-fade-in">
                        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto border border-gray-200 print:shadow-none print:border-0">
                            
                            {/* Mensaje de éxito (No imprimir) */}
                            <div className="text-center mb-8 print:hidden">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <HiCheckCircle size={40} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">¡Pedido Confirmado!</h2>
                                <p className="text-gray-500">Hemos enviado los detalles a tu correo.</p>
                            </div>

                            {/* ÁREA DE IMPRESIÓN (RECIBO) */}
                            <div className="border-t-2 border-gray-800 pt-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">TU TIENDA S.A.</h3>
                                        <p className="text-xs text-gray-500">RUC: 0999999999001</p>
                                        <p className="text-xs text-gray-500">Manta, Ecuador</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-600">COMPROBANTE</p>
                                        <p className="text-lg font-mono text-gray-900">#{String(purchaseSuccess.pedidoId || '000').padStart(6, '0')}</p>
                                        <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="mb-6 bg-gray-50 p-4 rounded text-sm">
                                    <p><span className="font-bold">Cliente:</span> {user?.nombre || user?.email}</p>
                                    <p><span className="font-bold">Dirección:</span> {shippingAddress.callePrincipal}, {shippingAddress.ciudad}</p>
                                    <p><span className="font-bold">Transporte:</span> {transporte}</p>
                                </div>

                                <table className="w-full text-sm mb-6">
                                    <thead>
                                        <tr className="border-b border-gray-300">
                                            <th className="text-left py-2">Desc.</th>
                                            <th className="text-center py-2">Cant.</th>
                                            <th className="text-right py-2">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Usamos los detalles retornados por el backend si existen */}
                                        {(purchaseSuccess.detalles || cartItems).map((item, i) => (
                                            <tr key={i} className="border-b border-gray-100">
                                                <td className="py-2">
                                                    {item.variant?.producto?.nombre || item.product?.nombre || 'Producto'}
                                                </td>
                                                <td className="py-2 text-center">{item.cantidad || item.quantity}</td>
                                                <td className="py-2 text-right">
                                                    ${((item.precio || item.variant?.precio || 0) * (item.cantidad || item.quantity)).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="flex justify-end border-t pt-4">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Subtotal: ${(purchaseSuccess.total / 1.15).toFixed(2)}</p>
                                        <p className="text-sm text-gray-600">IVA (15%): ${(purchaseSuccess.total - (purchaseSuccess.total / 1.15)).toFixed(2)}</p>
                                        <p className="text-xl font-bold text-gray-900 mt-1">Total: ${Number(purchaseSuccess.total).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botones finales */}
                        <div className="flex justify-center gap-4 mt-8 pb-12 print:hidden">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors shadow-lg"
                            >
                                <HiPrinter size={20} />
                                Imprimir Comprobante
                            </button>
                            <button
                                onClick={() => navigate('/productos')}
                                className="px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Seguir Comprando
                            </button>
                        </div>
                    </div>
                )}

                {/* Botones de navegación (Solo si NO estamos en paso 4) */}
                {step !== 4 && (
                    <div className='flex justify-between mt-8'>
                        {step > 1 && (
                            <button
                                type='button'
                                onClick={() => setStep(step - 1)}
                                disabled={isSubmitting} // Bloquear volver
                                className='px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50'
                            >
                                Anterior
                            </button>
                        )}
                        <button
                            type='submit'
                            disabled={isSubmitting} // Bloquear confirmar
                            className={`ml-auto px-6 py-2 text-white rounded-lg font-medium transition-colors ${
                                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700'
                            }`}
                        >
                            {isSubmitting 
                                ? 'Procesando...' 
                                : step < 3 ? 'Siguiente' : 'Confirmar Pedido'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};