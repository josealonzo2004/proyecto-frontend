import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "../components/shared/Navbar";
import { Footer } from "../components/shared/Footer";

export const RootLayout = () => {
    const { pathname } = useLocation();
	return (
		<div className='h-screen flex flex-col font-montserrat'>
			<Navbar />

			{pathname === '/' && (
                <header className="container my-8">Banner</header>
            )}

			<main className='container my-8 flex-1'>
				<Outlet />
			</main>

			{pathname === '/' && (
                <header className="container my-8">Newsletter</header>
            )}
			<Footer />
		</div>
	);
};