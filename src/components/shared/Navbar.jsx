import React from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { HiOutlineSearch, HiOutlineShoppingBag,} from 'react-icons/hi'
import { FaBarsStaggered } from 'react-icons/fa6'
import { navbarLinks } from '../../constants/links'
import { Logo } from './Logo'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { getTotalItems } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const isHome = location.pathname === '/';

    const handleCartClick = () => {
        navigate('/carrito');
    };

    const handleUserClick = () => {
        if (isAuthenticated) {
            navigate('/perfil');
        } else {
            navigate('/login');
        }
    };

    return (
        <header className={`${isHome ? 'absolute top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm' : 'bg-white'} text-black py-4 flex items-center justify-between px-5 border-b border-slate-200 lg:px-12`}>
            
            <Logo />

            <nav className='space-x-5 hidden md:flex'>
                {navbarLinks.map(link => (
                    <NavLink
                        key={link.id}
                        to={link.href}
                        className={({ isActive }) =>
                            `${isActive ? 'text-cyan-600 underline' : ''
                            } transition-all duration-300 font-medium hover:text-cyan-600 hover:underline `
                        }
                    >
                        {link.title}
                    </NavLink>
                ))}
                <NavLink
                    to='/productos'
                    className={({ isActive }) =>
                        `${isActive ? 'text-cyan-600 underline' : ''
                        } transition-all duration-300 font-medium hover:text-cyan-600 hover:underline`
                    }
                >
                    Productos
                </NavLink>
                {isAuthenticated && isAdmin && <NavLink
                    to='/admin'
                    className={({ isActive }) =>
                        `${isActive ? 'text-cyan-600 underline' : ''
                        } transition-all duration-300 font-medium hover:text-cyan-600 hover:underline`
                    }
                >
                    Admin
                </NavLink>}
            </nav>
            <div className='flex gap-5 items-center'>
                <button>
                    <HiOutlineSearch size={25} />
                </button>

                <div className='relative'>
                    {/* User Nav */}
                    <button
                        onClick={handleUserClick}
                        className='border-2 border-slate-700 w-9 h-9 rounded-full grid place-items-center text-lg font-bold'
                        title={isAuthenticated ? user?.nombre : 'Iniciar sesión'}
                    >
                        {isAuthenticated ? user?.nombre[0] : 'U'}
                    </button>
                </div>

                <button className='relative' onClick={handleCartClick}>
                    <span className='absolute -bottom-2 -right-2 w-5 h-5 grid place-items-center bg-black text-white text-xs rounded-full'>
                        {getTotalItems()}
                    </span>
                    <HiOutlineShoppingBag size={25} />
                </button>
            </div>

            <button className='md:hidden'>
                <FaBarsStaggered size={25} />
            </button>
        </header>
    )
}
