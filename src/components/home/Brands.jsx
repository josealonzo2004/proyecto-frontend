import React from 'react'

const brands = [
    {
        Image: '/images/brands/imgprueba1.png',
        alt: 'prueba1'
    },
    {
        Image: '/images/brands/imgprueba2.png',
        alt: 'prueba2'
    },
    {
        Image: '/images/brands/imgprueba3.png',
        alt: 'prueba3'
    },
    {
        Image: '/images/brands/imgprueba4.png',
        alt: 'prueba4'
    },
    {
        Image: '/images/brands/imgprueba5.png',
        alt: 'prueba5'
    },
    {
        Image: '/images/brands/imgprueba6.png',
        alt: 'prueba6'
    }

]

export const Brands = () => {
    return (
        <div className='flex flex-col items-center gap-3 pt-16 pb-12'>
            <h2 className='font-bold text-2xl'>Marcas que disponemos</h2>

            <p className='w-2/3 text-center text-sm md:text-base'>
                Tenemos lo más moderno en tecnología y los últimos modelos de
                celulares disponibles
            </p>

            <div className='grid grid-cols-3 gap-6 mt-8 items-center md:grid-cols-6'>
                {brands.map((brand, index) => (
                    <div key={index}>
                        <img src={brand.Image} alt={brand.alt} />
                    </div>
                ))}
            </div>
        </div>
    )
}
