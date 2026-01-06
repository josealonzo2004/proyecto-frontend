import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiOutlineShoppingCart, HiArrowLeft } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';

export const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    // 1. CORRECCIÓN: Traemos 'products' y 'loading' del contexto
    const { products, loading } = useProducts(); 
    
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [customizationText, setCustomizationText] = useState('');
    const [customizationFile, setCustomizationFile] = useState(null);

    // 2. CORRECCIÓN: Buscamos el producto en la lista cargada
    // Usamos Number(id) porque el ID de la URL es texto y el del producto es número
    const product = products.find(p => p.productoId === Number(id));

    // 3. CORRECCIÓN: Manejo de variantes cuando cambia el producto
    useEffect(() => {
        if (product && !selectedVariant) {
            if (product.variantes && product.variantes.length > 0) {
                setSelectedVariant(product.variantes[0]);
            } else {
                // Si no hay variantes, creamos una "falsa" con el precio base
                setSelectedVariant({ nombre: 'Estándar', precio: product.precio || 0 });
            }
        }
    }, [product]);
    
    // 4. CORRECCIÓN: Pantallas de Carga y Error
    if (loading) {
        return <div className='text-center py-20 text-xl font-bold text-gray-500'>Cargando producto...</div>;
    }

    if (!product) {
        return (
            <div className='text-center py-12'>
                <p className='text-gray-500 text-lg mb-4'>Producto no encontrado</p>
                <Link to='/productos' className='text-cyan-600 hover:underline'>
                    Volver a productos
                </Link>
            </div>
        );
    }

    const imagenes = product.imagen ? [product.imagen] : ['/images/logo1.png'];

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) {
            alert('Por favor selecciona una variante (ej: color, talla) o Estándar.');
            return;
        }

        let archivoBase64 = null;
        if (customizationFile) {
            try {
                archivoBase64 = await convertFileToBase64(customizationFile);
            } catch (error) {
                console.error('Error al convertir archivo:', error);
                alert('Error al procesar el archivo');
                return;
            }
        }

        const customization = {
            texto: customizationText,
            archivo: archivoBase64,
            nombreArchivo: customizationFile?.name || null
        };

        // Agregar el producto la cantidad de veces seleccionada
        for (let i = 0; i < quantity; i++) {
            addToCart(product, selectedVariant, customization);
        }
        
        // 5. CORRECCIÓN: Aviso de éxito
        alert('¡Producto agregado al carrito exitosamente!');
    };

    const handleBuyNow = async () => {
        await handleAddToCart(); // Reutilizamos la lógica de agregar
        navigate('/checkout');   // Y redirigimos
    };

    return (
        <div className='max-w-6xl mx-auto px-4 py-8'>
            <Link
                to='/productos'
                className='flex items-center gap-2 text-gray-600 hover:text-cyan-600 mb-6'
            >
                <HiArrowLeft size={20} />
                Volver a productos
            </Link>

            <div className='grid md:grid-cols-2 gap-8'>
                {/* Imágenes */}
                <div className='space-y-4'>
                    <div className='aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200'>
                        <img
                            src={imagenes[0]}
                            alt={product.nombre}
                            className='w-full h-full object-contain'
                        />
                    </div>
                    {/* Galería pequeña si hubiera más imágenes */}
                    {imagenes.length > 1 && (
                        <div className='grid grid-cols-4 gap-2'>
                            {imagenes.map((img, index) => (
                                <div
                                    key={index}
                                    className='aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200'
                                >
                                    <img
                                        src={img}
                                        alt={`${product.nombre} ${index + 1}`}
                                        className='w-full h-full object-cover cursor-pointer hover:opacity-75'
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Información */}
                <div>
                    <h1 className='text-3xl font-bold mb-4 text-gray-900'>{product.nombre}</h1>
                    <p className='text-gray-600 mb-6 leading-relaxed'>{product.descripcion}</p>
                    
                    <p className='text-3xl font-bold text-cyan-600 mb-6'>
                        {/* Mostramos el precio de la variante seleccionada o del producto */}
                        ${(selectedVariant?.precio || product.precio)?.toLocaleString()}
                    </p>

                    {/* Selector de Variantes */}
                    {product.variantes && product.variantes.length > 0 && (
                        <div className='mb-6'>
                            <label className='block font-semibold mb-2 text-gray-700'>Opciones:</label>
                            <div className='flex gap-2 flex-wrap'>
                                {product.variantes.map((variant, index) => (
                                    <button
                                        key={variant.varianteId || index}
                                        onClick={() => setSelectedVariant(variant)}
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

                    {/* Personalización */}
                    <div className='mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100'>
                        <label className='block font-semibold mb-2 text-gray-700'>
                            Personalización (Opcional)
                        </label>
                        <input
                            type='text'
                            placeholder='Escribe un nombre o frase...'
                            value={customizationText}
                            onChange={(e) => setCustomizationText(e.target.value)}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:border-cyan-500'
                        />
                        <label className='block text-xs font-medium text-gray-500 mb-1'>Subir archivo/diseño:</label>
                        <input
                            type='file'
                            accept='image/*,.pdf'
                            onChange={(e) => setCustomizationFile(e.target.files[0])}
                            className='w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-100 file:text-cyan-700 hover:file:bg-cyan-200'
                        />
                    </div>

                    {/* Cantidad */}
                    <div className='mb-8'>
                        <label className='block font-semibold mb-2 text-gray-700'>Cantidad</label>
                        <div className='flex items-center gap-4'>
                            <div className='flex items-center border border-gray-300 rounded-lg'>
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className='px-4 py-2 hover:bg-gray-100 text-gray-600'
                                >
                                    -
                                </button>
                                <span className='w-12 text-center font-semibold'>{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className='px-4 py-2 hover:bg-gray-100 text-gray-600'
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className='flex flex-col sm:flex-row gap-4'>
                        <button
                            onClick={handleAddToCart}
                            className='flex-1 bg-cyan-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2 shadow-sm'
                        >
                            <HiOutlineShoppingCart size={20} />
                            Agregar al carrito
                        </button>
                        <button 
                            onClick={handleBuyNow}
                            className='flex-1 bg-gray-800 text-white py-3 px-6 rounded-lg font-bold hover:bg-gray-900 transition-colors shadow-sm'
                        >
                            Comprar ahora
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};