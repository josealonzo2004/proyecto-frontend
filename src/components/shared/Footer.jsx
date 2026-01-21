import { Link } from 'react-router-dom';
import { socialLinks } from '../../constants/links';

export const Footer = () => {
	// Filtrar solo TikTok e Instagram
	const filteredSocialLinks = socialLinks.filter(
		link => link.title === 'Instagram' || link.title === 'Tiktok'
	);

	return (
		// AGREGADO: 'print:hidden' para que no salga en la factura
		<footer className='bg-gray-900 text-slate-300 py-12 px-6 mt-auto border-t border-gray-800 print:hidden'>
			<div className='max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8'>
				
				{/* LOGO Y DESCRIPCIÓN */}
				<div className='text-center md:text-left space-y-2'>
					<Link
						to='/'
						className='text-2xl font-extrabold tracking-tighter text-white hover:text-cyan-500 transition-colors'
					>
						INNOVA ARTE
					</Link>
					<p className='text-xs text-gray-500 max-w-xs mx-auto md:mx-0'>
						Creando experiencias únicas con cortes láser y diseño personalizado en Manta, Ecuador.
					</p>
				</div>

				{/* REDES SOCIALES */}
				<div className='flex flex-col items-center md:items-end gap-4'>
					<p className='text-sm font-medium text-slate-400'>
						Síguenos en redes sociales
					</p>
					<div className='flex gap-4'>
						{filteredSocialLinks.map(link => (
							<a
								key={link.id}
								href={link.href}
								target='_blank'
								rel='noreferrer'
								className='w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 border border-gray-700 text-gray-400 transition-all duration-300 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/20'
								title={link.title}
							>
								{link.icon}
							</a>
						))}
					</div>
				</div>
			</div>

			{/* COPYRIGHT */}
			<div className='mt-10 pt-6 border-t border-gray-800 text-center'>
				<p className='text-xs text-gray-600'>
					© {new Date().getFullYear()} Innova Arte. Todos los derechos reservados.
				</p>
			</div>
		</footer>
	);
};