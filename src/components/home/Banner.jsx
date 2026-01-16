import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const images = [
	'/images/bases_con_bordes.jpeg',
	'/images/bases_onduladas.jpeg',
	'/images/charliepops.jpeg',
	'/images/hablador_genovesa.jpeg',
	'/images/letrero_charliepops.jpeg',
	'/images/letrero.jpeg',
	'/images/servientrega.jpeg',
];

export const Banner = () => {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
		}, 3000); // Cambiar imagen cada 3 segundos

		return () => clearInterval(interval);
	}, []);

	return (
		<div className='relative min-h-screen w-full'>
			{/* Imágenes del carrusel como fondo completo */}
			<div className='absolute inset-0'>
				{images.map((image, index) => (
					<div
						key={index}
						className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
							index === currentIndex ? 'opacity-100' : 'opacity-0'
						}`}
						style={{ backgroundImage: `url(${image})` }}
					/>
				))}
			</div>

			{/* Overlay oscuro para legibilidad */}
			<div className='absolute inset-0 bg-black/30' />

			{/* Contenido sobrepuesto */}
			<div className='relative z-10 flex items-center justify-center min-h-screen p-8 lg:p-16'>
				<div className='max-w-4xl w-full'>
					{/* Imagen principal */}
					<div className='text-center mb-8'>
						<img 
							src='/images/cortamos_ideas_blanco.png' 
							alt='Cortamos ideas, creamos momentos' 
							className='max-w-full h-auto mx-auto'
						/>
					</div>

					{/* Botón CTA */}
					<div className='text-center'>
						<Link
							to='/productos'
							className='inline-block bg-rose-500 hover:bg-rose-600 text-white font-semibold py-4 px-10 rounded-lg shadow-xl transition duration-300 ease-in-out text-lg'
						>
							Ver Catálogo
						</Link>
					</div>
				</div>
			</div>

			{/* Indicadores del carrusel */}
			<div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex gap-2'>
				{images.map((_, index) => (
					<button
						key={index}
						onClick={() => setCurrentIndex(index)}
						className={`w-2 h-2 rounded-full transition-all bg-white ${
							index === currentIndex ? 'w-8' : 'opacity-50'
						}`}
						aria-label={`Imagen ${index + 1}`}
					/>
				))}
			</div>
		</div>
	);
};