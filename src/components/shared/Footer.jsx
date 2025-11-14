import { Link } from 'react-router-dom';
import { socialLinks } from '../../constants/links';

export const Footer = () => {
	// Filtrar solo TikTok e Instagram
	const filteredSocialLinks = socialLinks.filter(
		link => link.title === 'Instagram' || link.title === 'Tiktok'
	);

	return (
		<footer className='py-16 bg-gray-950 px-12 flex flex-col items-center gap-6 text-slate-200 text-sm mt-10'>
			<Link
				to='/'
				className={`text-2xl font-bold tracking-tighter transition-all text-white`}
			>
				INNOVA ARTE
			</Link>

			<div className='flex flex-col gap-4 items-center'>
				<p className='text-sm font-medium text-slate-200 text-center'>
					Síguenos en nuestras redes sociales y etiquétanos
				</p>
				<div className='flex gap-2'>
					{filteredSocialLinks.map(link => (
						<a
							key={link.id}
							href={link.href}
							target='_blank'
							rel='noreferrer'
							className='text-slate-300 border border-gray-800 w-12 h-12 flex items-center justify-center transition-all hover:bg-white hover:text-gray-950'
						>
							{link.icon}
						</a>
					))}
				</div>
			</div>
		</footer>
	);
};