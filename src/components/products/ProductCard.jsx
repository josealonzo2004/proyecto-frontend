import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineHeart } from 'react-icons/hi';
import { HiHeart } from 'react-icons/hi';

export const ProductCard = ({ product, onAddToCart }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    return (
        <div className='group relative'>
            {/* Wishlist Button */}
            <button
                onClick={() => setIsFavorite(!isFavorite)}
                className='absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity'
            >
                {isFavorite ? (
                    <HiHeart size={20} className='text-red-500' />
                ) : (
                    <HiOutlineHeart size={20} />
                )}
            </button>

            <Link to={`/productos/${product.id}`}>
                {/* Imagen del producto */}
                <div className='aspect-square overflow-hidden rounded-lg bg-gray-100 mb-4'>
                    <img
                        src={product.imagen || '/images/logo1.png'}
                        alt={product.nombre}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                    />
                </div>

                {/* Información del producto */}
                <div>
                    <h3 className='font-semibold text-lg mb-1'>{product.nombre}</h3>
                    <p className='text-sm text-gray-600 mb-2 line-clamp-2'>
                        {product.descripcion}
                    </p>
                    <p className='text-2xl font-bold text-cyan-600'>
                        ${product.precioBase?.toLocaleString() || '0'}
                    </p>
                </div>
            </Link>

            {/* Botón rápido agregar al carrito */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    if (onAddToCart) {
                        onAddToCart();
                    }
                }}
                className='mt-4 w-full bg-cyan-600 text-white py-2 rounded-lg font-medium hover:bg-cyan-700 transition-colors'
            >
                Agregar al carrito
            </button>
        </div>
    );
};
