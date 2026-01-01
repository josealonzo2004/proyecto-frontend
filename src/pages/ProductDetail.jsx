import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineShoppingCart, HiArrowLeft } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { Link } from 'react-router-dom';

export const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { getProductById } = useProducts();
    
    // ESTADOS
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [customizationText, setCustomizationText] = useState('');
    const [customizationFile, setCustomizationFile] = useState(null);

    // 1. Cargar el producto correctamente desde la API
    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            const data = await getProductById(id);
            setProduct(data);
            setLoading(false);
        };
        fetchProductData();
    }, [id, getProductById]);

    // 2. Inicializar variante seleccionada cuando el producto ya cargó
    useEffect(() => {
        if (product && !selectedVariant) {
            if (product.variantes && product.variantes.length > 0) {
                setSelectedVariant(product.variantes[0]);
            } else {
                setSelectedVariant({ 
                    nombre: 'Original', 
                    precio: Number(product.precio) || 0 
                });
            }
        }
    }, [product, selectedVariant]);
    
    // 3. Pantallas de espera
    if (loading) {
        return <div className='text-center py-20'>Cargando detalles del producto...</div>;
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
            alert('Selecciona una variante');
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

        for (let i = 0; i < quantity; i++) {
            addToCart(product, selectedVariant, customization);
        }
        alert('Producto agregado al carrito');
    };

    const handleBuyNow = async () => {
        if (!selectedVariant) {
            alert('Selecciona una variante');
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

        for (let i = 0; i < quantity; i++) {
            addToCart(product, selectedVariant, customization);
        }
        
        navigate('/checkout');
    };

    return (
        <div className='max-w-6xl mx-auto'>
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
                    <div className='aspect-square rounded-lg overflow-hidden bg-gray-100'>
                        <img
                            src={imagenes[0]}
                            alt={product.nombre}
                            className='w-full h-full object-cover'
                        />
                    </div>
                    {imagenes.length > 1 && (
                        <div className='grid grid-cols-4 gap-2'>
                            {imagenes.map((img, index) => (
                                <div
                                    key={index}
                                    className='aspect-square rounded-lg overflow-hidden bg-gray-100'
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
                    <h1 className='text-3xl font-bold mb-4'>{product.nombre}</h1>
                    <p className='text-gray-600 mb-6'>{product.descripcion}</p>
                    
                    <p className='text-3xl font-bold text-cyan-600 mb-6'>
                        {/* SOLUCIÓN: Precio dinámico basado en la carga real */}
                        ${selectedVariant?.precio 
                            ? Number(selectedVariant.precio).toLocaleString('en-US', { minimumFractionDigits: 2 }) 
                            : Number(product.precio || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>

                    {/* Variantes */}
                    {product.variantes && product.variantes.length > 0 && (
                        <div className='mb-6'>
                            <label className='block font-semibold mb-2'>Variantes</label>
                            <div className='flex gap-2 flex-wrap'>
                                {product.variantes.map((variant, index) => (
                                    <button
                                        key={variant.id || index}
                                        onClick={() => setSelectedVariant(variant)}
                                        className={`px-4 py-2 border-2 rounded-lg transition-colors ${
                                            selectedVariant?.id === variant.id || selectedVariant?.nombre === variant.nombre
                                                ? 'border-cyan-600 bg-cyan-50'
                                                : 'border-gray-300 hover:border-cyan-600'
                                        }`}
                                    >
                                        {variant.nombre} - ${Number(variant.precio).toLocaleString()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Personalización */}
                    <div className='mb-6'>
                        <label className='block font-semibold mb-2'>
                            Personalización (Opcional)
                        </label>
                        <input
                            type='text'
                            placeholder='Ingresa texto personalizado'
                            value={customizationText}
                            onChange={(e) => setCustomizationText(e.target.value)}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg mb-2'
                        />
                        <input
                            type='file'
                            accept='image/*,.pdf'
                            onChange={(e) => setCustomizationFile(e.target.files[0])}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                        />
                    </div>

                    {/* Cantidad */}
                    <div className='mb-6'>
                        <label className='block font-semibold mb-2'>Cantidad</label>
                        <div className='flex items-center gap-4'>
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100'
                            >
                                -
                            </button>
                            <span className='text-xl font-semibold'>{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100'
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className='flex gap-4'>
                        <button
                            onClick={handleAddToCart}
                            className='flex-1 bg-cyan-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2'
                        >
                            <HiOutlineShoppingCart size={24} />
                            Agregar al carrito
                        </button>
                        <button 
                            onClick={handleBuyNow}
                            className='flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors'
                        >
                            Comprar ahora
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};