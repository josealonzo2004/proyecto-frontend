import React from 'react'
import { Link } from 'react-router-dom'

export const ProductGrid = ({ title, products }) => {
    return (
        <div className='my-32'>
            <div className='flex justify-between items-center mb-8'>
                <h2 className='text-3xl font-semibold md:text-4xl lg:text-5xl capitalize'>
                    {title}
                </h2>
                <Link
                    to='/productos'
                    className='text-cyan-600 hover:underline font-medium'
                >
                    Ver todos →
                </Link>
            </div>

            <div className='grid grid-cols-1 gap-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4'>
                {products.map(product => (
                    <Link
                        to={`/productos/${product.id}`}
                        className='flex flex-col gap-4 relative group cursor-pointer' 
                        key={product.id}
                    >
                        <div className='aspect-square overflow-hidden rounded-lg bg-gray-100'>
                            <img
                                src={product.imagen || '/images/logo1.png'}
                                alt={product.title}
                                className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                            />
                        </div>
                        <div>
                            <h3 className='font-semibold text-lg'>{product.title}</h3>
                            {product.precio && (
                                <p className='text-xl font-bold text-cyan-600'>
                                    ${product.precio?.toLocaleString()}
                                </p>
                            )}
                        </div>
                    </Link>
                ))}


            </div>
        </div>
    )
}
