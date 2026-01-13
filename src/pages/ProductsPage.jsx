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

        // Filtro por búsqueda
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
            {/* CAMBIO: Usamos 'grid-cols-2' en móvil y 'lg:grid-cols-4' en PC */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4'>
                {filteredProducts.map(product => {
                    // ... lógica de variante ...
                    return (
                        <ProductCard
                            key={product.productoId} // Usa productoId
                            product={product}
                            onAddToCart={() => {
                                // ... tu lógica de agregar ...
                                alert("Producto agregado al carrito"); // Solución problema 2 (rápida)
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
