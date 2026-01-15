import React from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { HiOutlineSearch, HiOutlineShoppingBag } from 'react-icons/hi'
import { FaBarsStaggered } from 'react-icons/fa6'
import { navbarLinks } from '../../constants/links'
import { Logo } from './public/COMPLETO_NEGRO_SIN_FONDO'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const handleCartClick = () => {
    if (isAuthenticated) navigate('/carrito');
    else navigate('/login');
  };

  const handleUserClick = () => {
    if (isAuthenticated) navigate('/perfil');
    else navigate('/login');
  };

  const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/registro');

  const handleLogout = () => {
    logout();        // ← Llama a tu AuthContext
    navigate('/');   // ← Redirige al home o donde prefieras
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
              `${isActive ? 'text-cyan-600 underline' : ''} transition-all duration-300 font-medium hover:text-cyan-600 hover:underline`
            }
          >
            {link.title}
          </NavLink>
        ))}

        <NavLink
          to='/productos'
          className={({ isActive }) =>
            `${isActive ? 'text-cyan-600 underline' : ''} transition-all duration-300 font-medium hover:text-cyan-600 hover:underline`
          }
        >
          Productos
        </NavLink>

        {isAuthenticated && isAdmin && (
          <NavLink
            to='/admin'
            className={({ isActive }) =>
              `${isActive ? 'text-cyan-600 underline' : ''} transition-all duration-300 font-medium hover:text-cyan-600 hover:underline`
            }
          >
            Admin
          </NavLink>
        )}
      </nav>

      <div className='flex gap-5 items-center'>

        {/* SI NO ESTÁ AUTENTICADO */}
        {!isAuthenticated ? (
          <div className='hidden md:flex gap-3'>
            <button
              onClick={handleLogin}
              className='px-4 py-2 border border-slate-300 rounded-md font-medium hover:bg-slate-50'
            >
              Iniciar sesión
            </button>

            <button
              onClick={handleRegister}
              className='px-4 py-2 bg-cyan-600 text-white rounded-md font-medium hover:bg-cyan-700'
            >
              Registrarse
            </button>
          </div>
        ) : (
          <>
            {/* LUPA */}
            <button title='Buscar' className='hidden md:block'>
              <HiOutlineSearch size={25} />
            </button>

            {/* AVATAR */}
            <div className='relative'>
              <button
                onClick={handleUserClick}
                className='border-2 border-slate-700 w-9 h-9 rounded-full grid place-items-center text-lg font-bold'
                title={user?.nombre ? `Perfil de ${user.nombre}` : 'Perfil'}
              >
                {user?.nombre ? user.nombre[0].toUpperCase() : 'U'}
              </button>
            </div>

            {/* CARRITO */}
            <button className='relative' onClick={handleCartClick} title='Carrito'>
              <span className='absolute -bottom-2 -right-2 w-5 h-5 grid place-items-center bg-black text-white text-xs rounded-full'>
                {typeof getTotalItems === 'function' ? getTotalItems() || 0 : 0}
              </span>
              <HiOutlineShoppingBag size={25} />
            </button>

            {/* NUEVO BOTÓN CERRAR SESIÓN */}
            <button
              onClick={handleLogout}
              className='px-3 py-2 bg-cyan-600 text-white rounded-md font-medium hover:bg-cyan-700'
            >
              Cerrar sesión
            </button>
          </>
        )}

      </div>

      {/* MOBILE MENU */}
      <button className='md:hidden'>
        <FaBarsStaggered size={25} />
      </button>
    </header>
  )
}