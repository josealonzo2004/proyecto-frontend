import { useState, useEffect } from 'react';
import { ProductCard } from '../components/products/ProductCard';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';

export const ProductsPage = () => {
    const { addToCart } = useCart();
    const { products } = useProducts();
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

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
        <div>
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
                                let variantToAdd;
                                
                                // --- CORRECCIÓN ROBUSTA ---
                                // Filtramos variantes ignorando mayúsculas y espacios
                                const validVariants = product.variantes?.filter(v => 
                                    v.nombre.trim().toLowerCase() !== 'prueba'
                                ) || [];
                                
                                if (validVariants.length > 0) {
                                    // Si queda alguna variante válida, usamos la primera
                                    variantToAdd = {
                                        ...validVariants[0],
                                        precio: Number(validVariants[0].precio)
                                    };
                                } else {
                                    // Si no hay variantes o solo estaba "Prueba", usamos el producto base ($20)
                                    variantToAdd = {
                                        nombre: 'Estándar',
                                        precio: Number(product.precio), // Precio Correcto
                                        productoId: product.productoId,
                                        varianteId: null 
                                    };
                                }

                                addToCart(product, variantToAdd, null); 
                                alert("¡Producto agregado al carrito correctamente!");
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