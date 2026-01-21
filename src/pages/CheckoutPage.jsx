import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { direccionesAPI } from '../services/api';

// Iconos
import { 
    HiArrowLeft, HiPrinter, HiCheckCircle, HiLibrary, 
    HiCurrencyDollar, HiExclamationCircle 
} from 'react-icons/hi';

export const CheckoutPage = () => {
    // 1. Hooks
    const { cartItems, getTotal, clearCart } = useCart();
    const { createOrder } = useOrders();
    const { user } = useAuth();
    const navigate = useNavigate();

    // 2. Estados
    const [step, setStep] = useState(1);
    const [transporte, setTransporte] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [saveAddress, setSaveAddress] = useState(false);
    
    // Estados de control
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState(null);

    const [shippingAddress, setShippingAddress] = useState({
        callePrincipal: '',
        avenida: '',
        ciudad: '',
        provincia: '',
        pais: 'Ecuador'
    });

    // LÓGICA DE ENVÍO
    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- NAVEGACIÓN ---
        if (step === 1) {
            setStep(2);
        } else if (step === 2) {
            if (!paymentMethod) return alert("Por favor selecciona un método de pago.");
            setStep(3);
        } else {
            // === PASO 3: CONFIRMACIÓN ===
            if (isSubmitting || cartItems.length === 0) return;

            setIsSubmitting(true);

            try {
                // 1. GUARDAR DIRECCIÓN (Si aplica)
                if (saveAddress && user?.usuarioId) {
                    try {
                        await direccionesAPI.create({
                            usuarioId: Number(user.usuarioId),
                            callePrincipal: shippingAddress.callePrincipal,
                            avenida: shippingAddress.avenida || '',
                            ciudad: shippingAddress.ciudad,
                            provincia: shippingAddress.provincia,
                            pais: shippingAddress.pais || 'Ecuador'
                        });
                    } catch (dirError) {
                        console.warn("No se pudo guardar la dirección:", dirError);
                    }
                }

                // 2. CREAR PEDIDO
                const orderData = {
                    usuarioId: Number(user?.usuarioId),
                    transporte: transporte,
                    metodoPago: paymentMethod,
                    contenidoTotal: Number(getTotal()),
                    direccion: shippingAddress, 
                    detalles: cartItems.map(item => ({
                        cantidad: Number(item.quantity),
                        precio: Number(item.variant.precio),
                        ...(item.variant.varianteId ? { varianteId: Number(item.variant.varianteId) } : { productoId: Number(item.variant.productoId) })
                    }))
                };

                const response = await createOrder(orderData);
                
                // 3. ÉXITO
                setPurchaseSuccess(response);
                clearCart();
                setStep(4); 

            } catch (error) {
                console.error("Error en checkout:", error);
                const msg = error.response?.data?.message || "Ocurrió un error al procesar tu pedido.";
                alert(`Hubo un error: ${Array.isArray(msg) ? msg[0] : msg}`);
                setIsSubmitting(false); 
            }
        }
    };

    if (cartItems.length === 0 && step !== 4) { 
        return (
            <div className='text-center py-20 bg-gray-50 min-h-screen'>
                <p className='text-gray-500 text-xl font-medium mb-6'>Tu carrito está vacío</p>
                <Link to='/productos' className='bg-cyan-600 text-white px-6 py-3 rounded-full hover:bg-cyan-700 font-bold transition-all shadow-lg'>
                    Volver a la tienda
                </Link>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50 py-12 px-4 print:bg-white print:p-0'>
            <div className='max-w-4xl mx-auto print:max-w-none print:w-full'>
                
                {/* Header de Navegación (Oculto al imprimir) */}
                {step !== 4 && (
                    <div className="mb-8 flex items-center justify-between print:hidden">
                        <button 
                            onClick={() => step > 1 && setStep(step - 1)} 
                            className='flex items-center gap-2 text-gray-500 hover:text-cyan-600 font-medium transition-colors disabled:opacity-50' 
                            disabled={step === 1 || isSubmitting}
                        >
                            <HiArrowLeft size={20} /> Regresar
                        </button>
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Paso {step} de 3</span>
                    </div>
                )}

                <h1 className='text-3xl font-extrabold text-gray-900 mb-8 text-center print:hidden'>
                    {step === 4 ? '¡Gracias por tu compra!' : step === 1 ? 'Detalles de Envío' : step === 2 ? 'Método de Pago' : 'Confirmar Pedido'}
                </h1>

                {/* Stepper Visual (Oculto al imprimir) */}
                {step !== 4 && (
                    <div className='flex items-center justify-center mb-10 print:hidden'>
                        {[1, 2, 3].map((s) => (
                            <div key={s} className='flex items-center'>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${s <= step ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-200' : 'bg-white text-gray-400 border border-gray-200'}`}>
                                    {s}
                                </div>
                                {s < 3 && <div className={`w-20 h-1 mx-2 rounded-full transition-all duration-300 ${s < step ? 'bg-cyan-600' : 'bg-gray-200'}`} />}
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    
                    {/* === PASO 1: DIRECCIÓN === */}
                    {step === 1 && (
                        <div className='bg-white rounded-2xl p-8 border border-gray-100 shadow-xl shadow-gray-100/50 animate-fade-in'>
                            <h2 className='text-xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
                                Información de Entrega
                            </h2>
                            <div className='space-y-5'>
                                <div>
                                    <label className='block text-sm font-bold text-gray-700 mb-2'>Empresa de Transporte</label>
                                    <div className="relative">
                                        <select
                                            value={transporte}
                                            onChange={(e) => setTransporte(e.target.value)}
                                            className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none appearance-none'
                                            required
                                        >
                                            <option value=''>Selecciona una opción...</option>
                                            <option value='ENETSA'>ENETSA (Recomendado)</option>
                                            <option value='SERVIENTREGA'>Servientrega</option>
                                            <option value='COOPERATIVA'>Cooperativa de Transporte</option>
                                            <option value='DELIVERY EN MANTA'>Delivery Local (Solo Manta)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▼</div>
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                    <div>
                                        <label className='block text-sm font-bold text-gray-700 mb-2'>Calle Principal</label>
                                        <input type='text' value={shippingAddress.callePrincipal} onChange={(e) => setShippingAddress({ ...shippingAddress, callePrincipal: e.target.value })} className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-cyan-500' required />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-bold text-gray-700 mb-2'>Referencia</label>
                                        <input type='text' value={shippingAddress.avenida} onChange={(e) => setShippingAddress({ ...shippingAddress, avenida: e.target.value })} className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-cyan-500' />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-bold text-gray-700 mb-2'>Ciudad</label>
                                        <input type='text' value={shippingAddress.ciudad} onChange={(e) => setShippingAddress({ ...shippingAddress, ciudad: e.target.value })} className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-cyan-500' required />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-bold text-gray-700 mb-2'>Provincia</label>
                                        <input type='text' value={shippingAddress.provincia} onChange={(e) => setShippingAddress({ ...shippingAddress, provincia: e.target.value })} className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-cyan-500' required />
                                    </div>
                                </div>
                                
                                <div className="flex items-center p-4 bg-cyan-50/50 rounded-xl border border-cyan-100 mt-4 cursor-pointer hover:bg-cyan-100 transition-colors" onClick={() => setSaveAddress(!saveAddress)}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${saveAddress ? 'bg-cyan-600 border-cyan-600' : 'bg-white border-gray-300'}`}>
                                        {saveAddress && <HiCheckCircle className="text-white text-sm" />}
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 select-none">Guardar esta dirección en mi perfil</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === PASO 2: PAGO === */}
                    {step === 2 && (
                        <div className='bg-white rounded-2xl p-8 border border-gray-100 shadow-xl shadow-gray-100/50 animate-fade-in'>
                            <h2 className='text-xl font-bold text-gray-800 mb-6'>Método de Pago</h2>
                            
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
                                <div 
                                    onClick={() => setPaymentMethod('Transferencia bancaria')} 
                                    className={`p-6 border-2 rounded-2xl cursor-pointer transition-all hover:shadow-lg ${paymentMethod === 'Transferencia bancaria' ? 'border-cyan-600 bg-cyan-50/20' : 'border-gray-100 hover:border-cyan-200'}`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                       <div className={`p-3 rounded-full ${paymentMethod === 'Transferencia bancaria' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-500'}`}><HiLibrary size={24} /></div>
                                       {paymentMethod === 'Transferencia bancaria' && <HiCheckCircle className="text-cyan-600" size={28} />}
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-lg">Transferencia</h3>
                                    <p className="text-xs text-gray-500 mt-1">Pichincha, Guayaquil, Produbanco</p>
                                </div>

                                <div 
                                    onClick={() => setPaymentMethod('Depósito')} 
                                    className={`p-6 border-2 rounded-2xl cursor-pointer transition-all hover:shadow-lg ${paymentMethod === 'Depósito' ? 'border-cyan-600 bg-cyan-50/20' : 'border-gray-100 hover:border-cyan-200'}`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                       <div className={`p-3 rounded-full ${paymentMethod === 'Depósito' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-500'}`}><HiCurrencyDollar size={24} /></div>
                                       {paymentMethod === 'Depósito' && <HiCheckCircle className="text-cyan-600" size={28} />}
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-lg">Depósito</h3>
                                    <p className="text-xs text-gray-500 mt-1">Ventanilla o Mi Vecino</p>
                                </div>
                            </div>

                            {paymentMethod && (
                                <div className="space-y-6 animate-fade-in-up">
                                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200">
                                        <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Datos para el pago:</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                <p className="text-xs text-gray-400 font-bold">Banco Pichincha</p>
                                                <p className="font-mono font-bold text-gray-800 text-lg">2204567890</p>
                                                <p className="text-xs text-gray-500">Cta. Corriente | Innova Arte</p>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                <p className="text-xs text-gray-400 font-bold">RUC</p>
                                                <p className="font-mono font-bold text-gray-800 text-lg">0999999999001</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-start gap-3 text-xs text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                            <HiExclamationCircle size={18} className="shrink-0" />
                                            <p className="font-medium">Realiza el pago antes de que despachemos tu pedido.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* === PASO 3: RESUMEN === */}
                    {step === 3 && (
                        <div className='bg-white rounded-2xl p-8 border border-gray-100 shadow-xl shadow-gray-100/50 animate-fade-in'>
                            <h2 className='text-xl font-bold text-gray-800 mb-6'>Resumen Final</h2>
                            
                            <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-900 text-sm rounded-xl border border-blue-100 flex items-start gap-3">
                                <span className="text-2xl">🧾</span>
                                <div>
                                    <p className="font-bold">Facturación Electrónica</p>
                                    <p className="opacity-80">Al confirmar, generaremos tu factura automáticamente con los datos de tu perfil.</p>
                                </div>
                            </div>

                            <div className='space-y-4 mb-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100'>
                                {cartItems.map(item => (
                                    <div key={item.id} className='flex justify-between items-center py-2 border-b border-gray-200 last:border-0 border-dashed'>
                                        <div>
                                            <p className="font-bold text-gray-800">{item.product.nombre}</p>
                                            <p className="text-xs text-gray-500 font-medium">x{item.quantity} | {item.variant.nombre}</p>
                                        </div>
                                        <span className="font-bold text-gray-900">${(item.variant.precio * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className='pt-4 flex justify-between items-center mt-4 border-t-2 border-gray-200'>
                                    <span className='text-gray-500 font-medium'>Total a pagar</span>
                                    <span className='text-3xl font-black text-cyan-600'>${getTotal().toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === PASO 4: RECIBO / FACTURA (ESTO ES LO QUE SE IMPRIME) === */}
                    {step === 4 && purchaseSuccess && (
                        <div className="animate-fade-in">
                            {/* Esta parte tiene 'print:shadow-none' y 'print:border-0' para quedar limpia */}
                            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto border border-gray-200 print:shadow-none print:border-0 print:p-0 print:m-0 print:max-w-none">
                                
                                {/* Bloque de éxito: SE OCULTA AL IMPRIMIR ('print:hidden') */}
                                <div className="text-center mb-8 print:hidden">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
                                        <HiCheckCircle size={48} />
                                    </div>
                                    <h2 className="text-3xl font-extrabold text-gray-900">¡Pedido Confirmado!</h2>
                                    <p className="text-gray-500 mt-2">Hemos enviado los detalles a tu correo.</p>
                                </div>

                                {/* FACTURA: SE MUESTRA Y SE AJUSTA AL PAPEL */}
                                <div className="border-t-2 border-gray-900 pt-8 border-dashed print:border-none print:pt-0">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">INNOVA ARTE</h3>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Manta, Ecuador</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-500 uppercase">Orden #</p>
                                            <p className="text-2xl font-mono font-bold text-gray-900">{String(purchaseSuccess.pedidoId || purchaseSuccess.id || '000').padStart(6, '0')}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-xl mb-8 border border-gray-100 print:bg-white print:border-gray-200">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-400 font-bold uppercase text-xs">Cliente</p>
                                                <p className="font-bold text-gray-800">{user?.nombre} {user?.apellido}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-400 font-bold uppercase text-xs">Método</p>
                                                <p className="font-bold text-gray-800">{paymentMethod}</p>
                                            </div>
                                            <div className="col-span-2 border-t border-gray-200 pt-3 mt-1">
                                                <p className="text-gray-400 font-bold uppercase text-xs">Enviar a</p>
                                                <p className="font-medium text-gray-700">{shippingAddress.callePrincipal}, {shippingAddress.ciudad}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* TABLA DE PRODUCTOS */}
                                    <table className="w-full text-sm mb-6">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-gray-400 uppercase text-xs">
                                                <th className="text-left py-2 font-bold">Item</th>
                                                <th className="text-right py-2 font-bold">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {(purchaseSuccess.detalles || cartItems).map((item, i) => (
                                                <tr key={i}>
                                                    <td className="py-3">
                                                        <span className="font-bold text-gray-800">{item.variant?.producto?.nombre || item.product?.nombre}</span>
                                                        <span className="text-gray-400 text-xs ml-2">x{item.cantidad || item.quantity}</span>
                                                    </td>
                                                    <td className="py-3 text-right font-medium">
                                                        ${((item.precio || item.variant?.precio || 0) * (item.cantidad || item.quantity)).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div className="flex justify-end border-t border-gray-900 border-dashed pt-4">
                                        <div className="text-right">
                                            <p className="text-xl font-black text-gray-900">Total: ${Number(purchaseSuccess.total || purchaseSuccess.contenidoTotal || getTotal()).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BOTONES: SE OCULTAN AL IMPRIMIR ('print:hidden') */}
                            <div className="flex justify-center gap-4 mt-8 pb-12 print:hidden">
                                <button 
                                    onClick={() => window.print()} 
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg font-bold"
                                >
                                    <HiPrinter size={20} /> Imprimir
                                </button>
                                <button 
                                    onClick={() => navigate('/productos')} 
                                    className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                                >
                                    Seguir Comprando
                                </button>
                            </div>
                        </div>
                    )}

                    {/* BOTONES DE NAVEGACIÓN (Ocultos en impresión) */}
                    {step !== 4 && (
                        <div className='flex justify-between mt-10 pt-6 border-t border-gray-100 print:hidden'>
                            {step > 1 && (
                                <button 
                                    type='button' 
                                    onClick={() => setStep(step - 1)} 
                                    disabled={isSubmitting} 
                                    className='px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors'
                                >
                                    Atrás
                                </button>
                            )}
                            <button 
                                type='submit' 
                                disabled={isSubmitting} 
                                className={`ml-auto px-8 py-3 text-white rounded-xl font-bold shadow-lg shadow-cyan-200 transition-all active:scale-95 ${
                                    isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700'
                                }`}
                            >
                                {isSubmitting 
                                    ? 'Procesando...' 
                                    : step < 3 ? 'Continuar' : 'Confirmar Pedido'
                                }
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};