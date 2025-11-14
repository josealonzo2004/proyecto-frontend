import { useState, useEffect } from 'react';

export const AboutPage = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    const images = [
        '/images/bases_con_bordes.jpeg',
        '/images/bases_onduladas.jpeg',
        '/images/charliepops.jpeg',
        '/images/hablador_genovesa.jpeg',
        '/images/letrero_charliepops.jpeg',
        '/images/letrero.jpeg',
        '/images/servientrega.jpeg'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <div className='max-w-7xl mx-auto px-4 py-12'>
            {/* Hero Section */}
            <div className='text-center mb-16 animate-fade-in'>
                <h1 className='text-5xl font-bold mb-6 text-cyan-600'>
                    Sobre <span className='text-rose-500'>INNOVA ARTE</span>
                </h1>
                <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                    Transformamos ideas en realidad. Cortamos, creamos y personalizamos productos únicos para tus momentos especiales.
                </p>
            </div>

            {/* Carrusel de Imágenes */}
            <div className='mb-16 relative h-[700px] max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl'>
                <div className='absolute inset-0'>
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${
                                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            <img
                                src={image}
                                alt={`Producto ${index + 1}`}
                                className='w-full h-full object-cover'
                            />
                        </div>
                    ))}
                </div>
                {/* Indicadores */}
                <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2'>
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                                index === currentImageIndex
                                    ? 'bg-white w-8'
                                    : 'bg-white/50 hover:bg-white/75'
                            }`}
                            aria-label={`Imagen ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Información del Negocio */}
            <div className='grid md:grid-cols-2 gap-8 mb-16'>
                {/* Misión */}
                <div className='bg-gradient-to-br from-cyan-50 to-rose-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-in-left'>
                    <div className='text-4xl mb-4'>🎯</div>
                    <h2 className='text-2xl font-bold mb-4 text-cyan-600'>Nuestra Misión</h2>
                    <p className='text-gray-700 leading-relaxed'>
                        En INNOVA ARTE nos dedicamos a crear productos personalizados de alta calidad que reflejen la personalidad y estilo único de cada cliente. 
                        Desde letreros hasta bases personalizadas, cada pieza es diseñada con pasión y atención al detalle.
                    </p>
                </div>

                {/* Visión */}
                <div className='bg-gradient-to-br from-rose-50 to-cyan-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-in-right'>
                    <div className='text-4xl mb-4'>✨</div>
                    <h2 className='text-2xl font-bold mb-4 text-rose-500'>Nuestra Visión</h2>
                    <p className='text-gray-700 leading-relaxed'>
                        Ser la empresa líder en personalización de productos, reconocida por nuestra creatividad, 
                        calidad y compromiso con la satisfacción de nuestros clientes. Queremos que cada producto 
                        cuente una historia única.
                    </p>
                </div>
            </div>

            {/* Valores */}
            <div className='mb-16'>
                <h2 className='text-3xl font-bold text-center mb-12 text-gray-800'>
                    ¿Por qué elegir <span className='text-cyan-600'>INNOVA ARTE</span>?
                </h2>
                <div className='grid md:grid-cols-3 gap-6'>
                    <div className='bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-2 border-cyan-100'>
                        <div className='text-5xl mb-4 text-center'>🎨</div>
                        <h3 className='text-xl font-bold mb-3 text-center text-cyan-600'>Creatividad</h3>
                        <p className='text-gray-600 text-center'>
                            Diseños únicos y personalizados que reflejan tu estilo
                        </p>
                    </div>
                    <div className='bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-2 border-rose-100'>
                        <div className='text-5xl mb-4 text-center'>⚡</div>
                        <h3 className='text-xl font-bold mb-3 text-center text-rose-500'>Entrega Rápida</h3>
                        <p className='text-gray-600 text-center'>
                            Procesamos y entregamos tus pedidos en tiempo récord
                        </p>
                    </div>
                    <div className='bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-2 border-cyan-100'>
                        <div className='text-5xl mb-4 text-center'>💎</div>
                        <h3 className='text-xl font-bold mb-3 text-center text-cyan-600'>Calidad</h3>
                        <p className='text-gray-600 text-center'>
                            Materiales de primera calidad en cada producto
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className='bg-gradient-to-r from-cyan-600 to-rose-500 text-white p-12 rounded-2xl text-center shadow-2xl animate-pulse-slow'>
                <h2 className='text-3xl font-bold mb-4'>
                    ¿Listo para crear algo increíble?
                </h2>
                <p className='text-xl mb-6 opacity-90'>
                    Explora nuestro catálogo y encuentra el producto perfecto para ti
                </p>
                <a
                    href='/productos'
                    className='inline-block bg-white text-cyan-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl'
                >
                    Ver Productos
                </a>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes slide-in-left {
                    from {
                        opacity: 0;
                        transform: translateX(-50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes slide-in-right {
                    from {
                        opacity: 0;
                        transform: translateX(50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes pulse-slow {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.02);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 1s ease-out;
                }
                .animate-slide-in-left {
                    animation: slide-in-left 0.8s ease-out;
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.8s ease-out;
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};