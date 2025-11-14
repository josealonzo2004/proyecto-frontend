import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { Banner } from '../components/home/Banner';

export const RootLayout = () => {
	const { pathname } = useLocation();
	const isHome = pathname === '/';

	return (
		<div className={`font-montserrat ${isHome ? 'h-screen overflow-hidden' : 'min-h-screen flex flex-col'}`}>
			{!isHome && <Navbar />}

			{isHome && (
				<>
					<Banner />
					<Navbar />
				</>
			)}

			{!isHome && (
				<>
					<main className='container mx-auto px-4 my-8 flex-1 w-full'>
						<Outlet />
					</main>
					<Footer />
				</>
			)}

			{isHome && <Outlet />}
		</div>
	);
};