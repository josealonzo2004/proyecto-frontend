import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiOutlineShoppingCart, HiArrowLeft, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';

export const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const { addToCart, getProductQuantityInCart } = useCart();
    const { products, loading } = useProducts(); 
    
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [customizationText, setCustomizationText] = useState('');
    const [customizationFile, setCustomizationFile] = useState(null);

    // --- NOTIFICACIONES MEJORADAS ---
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const showToast = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };
    // -------------------------------

    const product = (products && products.length > 0) 
        ? products.find(p => p.productoId === Number(id)) 
        : null;

    const stockTotal = product?.stock || 0;
    const inCartQty = product ? getProductQuantityInCart(product.productoId) : 0;
    const availableToAdd = Math.max(0, stockTotal - inCartQty);
    const isOutOfStock = availableToAdd === 0;

    useEffect(() => {
        if (product && !selectedVariant) {
            const validVariants = product.variantes?.filter(v => v.nombre !== 'Prueba') || [];
            if (validVariants.length > 0) {
                const firstVariant = validVariants[0];
                setSelectedVariant({
                    ...firstVariant,
                    precio: Number(firstVariant.precio)
                });
            } else {
                setSelectedVariant({ 
                    nombre: 'Estándar', 
                    precio: Number(product.precio || 0),
                    productoId: product.productoId,
                    varianteId: null
                });
            }
        }
    }, [product]);

    useEffect(() => {
        if (availableToAdd > 0 && quantity > availableToAdd) {
            setQuantity(availableToAdd);
        } else if (availableToAdd === 0) {
            setQuantity(0);
        } else if (quantity === 0 && availableToAdd > 0) {
            setQuantity(1);
        }
    }, [availableToAdd]);

    if (loading) return <div className='text-center py-20 text-xl font-bold text-gray-500'>Cargando producto...</div>;
    
    if (!product && !loading) {
        return (
            <div className='text-center py-12'>
                <p className='text-gray-500 text-lg mb-4'>Producto no encontrado</p>
                <Link to='/productos' className='text-cyan-600 hover:underline'>Volver a productos</Link>
            </div>
        );
    }

    const imagenes = product.imagen ? [product.imagen] : ['/images/logo1.png'];

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) { resolve(null); return; }
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) return;
        
        if (quantity > availableToAdd) {
            showToast(`Solo quedan ${availableToAdd} unidades disponibles`, 'error');
            return;
        }

        let archivoBase64 = null;
        if (customizationFile) {
            try {
                archivoBase64 = await convertFileToBase64(customizationFile);
            } catch (error) { console.error(error); return; }
        }

        const customization = {
            texto: customizationText,
            archivo: archivoBase64,
            nombreArchivo: customizationFile?.name || null
        };

        const variantToAdd = { ...selectedVariant, precio: Number(selectedVariant.precio) };

        for (let i = 0; i < quantity; i++) {
            addToCart(product, variantToAdd, customization);
        }
        
        showToast('¡Producto agregado al carrito!', 'success');
    };

    const handleBuyNow = async () => {
        if (!selectedVariant) return;
        
        if (quantity > availableToAdd) {
             showToast(`Solo quedan ${availableToAdd} unidades disponibles`, 'error');
             return;
        }

        let archivoBase64 = null;
        if (customizationFile) {
             try { archivoBase64 = await convertFileToBase64(customizationFile); } catch (e) {}
        }
        const customization = { texto: customizationText, archivo: archivoBase64, nombreArchivo: customizationFile?.name };
        const variantToAdd = { ...selectedVariant, precio: Number(selectedVariant.precio) };

        for (let i = 0; i < quantity; i++) {
            addToCart(product, variantToAdd, customization);
        }

        navigate('/checkout');
    };

    const displayPrice = (selectedVariant && selectedVariant.precio > 0)
        ? Number(selectedVariant.precio) 
        : Number(product.precio);

    const visibleVariants = product.variantes?.filter(v => v.nombre !== 'Prueba') || [];

    return (
        <div className='max-w-6xl mx-auto px-4 py-8 relative notranslate'>
            
            {/* --- TOAST NOTIFICATION (Estilo Unificado) --- */}
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in transition-all transform duration-300 ${
                    notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
                }`}>
                    {notification.type === 'error' ? <HiExclamationCircle size={24} /> : <HiCheckCircle size={24} />}
                    <div>
                        <p className="font-bold">{notification.type === 'error' ? 'Atención' : 'Éxito'}</p>
                        <p className="text-sm">{notification.message}</p>
                    </div>
                </div>
            )}
            
            <Link to='/productos' className='flex items-center gap-2 text-gray-600 hover:text-cyan-600 mb-6'>
                <HiArrowLeft size={20} /> Volver a productos
            </Link>

            <div className='grid md:grid-cols-2 gap-8'>
                <div className='space-y-4'>
                    <div className='aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200'>
                        <img src={imagenes[0]} alt={product.nombre} className='w-full h-full object-contain' />
                    </div>
                    {imagenes.length > 1 && (
                        <div className='grid grid-cols-4 gap-2'>
                            {imagenes.map((img, index) => (
                                <div key={index} className='aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200'>
                                    <img src={img} alt={`${product.nombre} ${index + 1}`} className='w-full h-full object-cover cursor-pointer hover:opacity-75' />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h1 className='text-3xl font-bold mb-2 text-gray-900'>{product.nombre}</h1>
                    
                    <div className="mb-4 flex items-center gap-2">
                        {stockTotal === 0 ? (
                            <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">AGOTADO</span>
                        ) : availableToAdd === 0 ? (
                             <span className="bg-orange-100 text-orange-800 text-sm font-bold px-3 py-1 rounded-full">LÍMITE ALCANZADO (En Carrito)</span>
                        ) : (
                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${stockTotal < 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                <span>Disponible: {stockTotal}</span> 
                                {inCartQty > 0 && <span> (-{inCartQty} en carrito)</span>}
                            </span>
                        )}
                    </div>

                    <p className='text-gray-600 mb-6 leading-relaxed'>{product.descripcion}</p>
                    <p className='text-3xl font-bold text-cyan-600 mb-6'>
                        ${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>

                    {visibleVariants.length > 0 && (
                        <div className='mb-6'>
                            <label className='block font-semibold mb-2 text-gray-700'>Opciones:</label>
                            <div className='flex gap-2 flex-wrap'>
                                {visibleVariants.map((variant, index) => (
                                    <button
                                        key={variant.varianteId || index}
                                        onClick={() => setSelectedVariant({ ...variant, precio: Number(variant.precio) })}
                                        className={`px-4 py-2 border rounded-lg transition-all ${
                                            (selectedVariant?.varianteId === variant.varianteId) || (selectedVariant?.nombre === variant.nombre)
                                                ? 'border-cyan-600 bg-cyan-50 text-cyan-700 ring-2 ring-cyan-100'
                                                : 'border-gray-300 hover:border-cyan-600 text-gray-600'
                                        }`}
                                    >
                                        {variant.nombre}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className='mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100'>
                        <label className='block font-semibold mb-2 text-gray-700'>Personalización (Opcional)</label>
                        <input type='text' placeholder='Escribe un nombre o frase...' value={customizationText} onChange={(e) => setCustomizationText(e.target.value)} className='w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:border-cyan-500' />
                        <label className='block text-xs font-medium text-gray-500 mb-1'>Subir archivo/diseño:</label>
                        <input type='file' accept='image/*,.pdf' onChange={(e) => setCustomizationFile(e.target.files[0])} className='w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-100 file:text-cyan-700 hover:file:bg-cyan-200' />
                    </div>

                    <div className='mb-8'>
                        <label className='block font-semibold mb-2 text-gray-700'>Cantidad</label>
                        <div className='flex items-center gap-4'>
                            <div className='flex items-center border border-gray-300 rounded-lg bg-white'>
                                <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                                    disabled={isOutOfStock || quantity <= 1}
                                    className='px-4 py-2 hover:bg-gray-100 text-gray-600 disabled:opacity-50'
                                >
                                    -
                                </button>
                                <span className='w-12 text-center font-semibold text-gray-800'>
                                    {isOutOfStock ? 0 : quantity}
                                </span>
                                <button 
                                    onClick={() => setQuantity(q => Math.min(availableToAdd, q + 1))} 
                                    disabled={isOutOfStock || quantity >= availableToAdd}
                                    className='px-4 py-2 hover:bg-gray-100 text-gray-600 disabled:opacity-50'
                                >
                                    +
                                </button>
                            </div>
                            {quantity >= availableToAdd && !isOutOfStock && (
                                <span className='text-xs text-orange-500 font-medium'>Máximo disponible alcanzado</span>
                            )}
                        </div>
                    </div>

                    <div className='flex flex-col sm:flex-row gap-4'>
                        <button 
                            onClick={handleAddToCart} 
                            disabled={isOutOfStock}
                            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-sm ${
                                isOutOfStock 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-cyan-600 text-white hover:bg-cyan-700'
                            }`}
                        >
                            <HiOutlineShoppingCart size={20} /> 
                            <span>{isOutOfStock ? 'Sin Stock' : 'Agregar al carrito'}</span>
                        </button>
                        <button 
                            onClick={handleBuyNow}
                            disabled={isOutOfStock}
                            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-colors shadow-sm ${
                                isOutOfStock
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-800 text-white hover:bg-gray-900'
                            }`}
                        >
                            <span>Comprar ahora</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};