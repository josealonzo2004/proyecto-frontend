import { useState, useEffect } from 'react';
import { ProductCard } from '../components/products/ProductCard';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { HiCheckCircle, HiExclamationCircle } from 'react-icons/hi'; // Iconos para notificación

export const ProductsPage = () => {
    const { addToCart, getProductQuantityInCart } = useCart();
    // AGREGADO: fetchProducts
    const { products, fetchProducts } = useProducts();
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // --- SISTEMA DE NOTIFICACIONES (Igual al Admin) ---
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const showToast = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };
    // --------------------------------------------------

    // --- AGREGADO: AUTO-REFRESCO ---
    useEffect(() => {
        const interval = setInterval(() => {
            if(fetchProducts) fetchProducts();
        }, 1000);
        return () => clearInterval(interval);
    }, [fetchProducts]);
    // -----------------------------

    useEffect(() => {
        if (products && products.length >= 0) {
            setFilteredProducts(products);
        }
    }, [products]);

    useEffect(() => {
        let filtered = products || [];
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    return (
        <div className="relative">
             {/* --- TOAST NOTIFICATION --- */}
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
            {/* ------------------------- */}

            {/* Búsqueda */}
            <div className='mb-8'>
                <div className='flex-1 relative max-w-md'>
                    <HiOutlineMagnifyingGlass className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                    <input
                        type='text'
                        placeholder='Buscar productos...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600'
                    />
                </div>
            </div>

            {/* Grid de productos */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4'>
                {filteredProducts.map(product => {
                    return (
                        <ProductCard
                            key={product.productoId} 
                            product={product}
                            onAddToCart={() => {
                                // 1. Verificar Stock real vs Carrito
                                const stockTotal = product.stock || 0;
                                const inCart = getProductQuantityInCart(product.productoId);
                                
                                if (inCart >= stockTotal) {
                                    showToast("¡Has alcanzado el límite de stock disponible!", 'error');
                                    return;
                                }

                                let variantToAdd;
                                
                                const validVariants = product.variantes?.filter(v => 
                                    v.nombre.trim().toLowerCase() !== 'prueba'
                                ) || [];
                                
                                if (validVariants.length > 0) {
                                    variantToAdd = {
                                        ...validVariants[0],
                                        precio: Number(validVariants[0].precio)
                                    };
                                } else {
                                    variantToAdd = {
                                        nombre: 'Estándar',
                                        precio: Number(product.precio),
                                        productoId: product.productoId,
                                        varianteId: null 
                                    };
                                }

                                addToCart(product, variantToAdd, null); 
                                showToast("¡Agregado al carrito!", 'success');
                            }}
                        />
                    );
                })}
            </div>  

            {filteredProducts.length === 0 && (
                <div className='text-center py-12'>
                    <p className='text-gray-500 text-lg'>No se encontraron productos</p>
                </div>
            )}
        </div>
    );
};