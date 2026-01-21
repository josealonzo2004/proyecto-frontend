import React from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { HiOutlineShoppingBag, HiLogout, HiUser } from 'react-icons/hi' 
import { FaBarsStaggered } from 'react-icons/fa6'
import { navbarLinks } from '../../constants/links'
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
    logout();
    navigate('/');
  };

  return (
    // AGREGADO: 'print:hidden' hace que todo el navbar desaparezca al darle a Imprimir
    <header className={`${isHome ? 'absolute top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md shadow-sm' : 'bg-white shadow-sm'} text-gray-800 py-4 flex items-center justify-between px-6 lg:px-12 transition-all duration-300 print:hidden`}>
      
      {/* LOGO */}
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
        <img 
          src="/images/COMPLETO_NEGRO_SIN_FONDO.png" 
          alt="Innova Arte" 
          className="h-10 w-auto object-contain" 
        />
      </Link>

      {/* MENÚ DE NAVEGACIÓN */}
      <nav className='hidden md:flex items-center space-x-8'>
        {navbarLinks.map(link => (
          <NavLink
            key={link.id}
            to={link.href}
            className={({ isActive }) =>
              `text-sm font-semibold tracking-wide transition-colors duration-200 ${
                isActive ? 'text-cyan-600' : 'text-gray-600 hover:text-cyan-600'
              }`
            }
          >
            {link.title}
          </NavLink>
        ))}

        <NavLink
          to='/productos'
          className={({ isActive }) =>
            `text-sm font-semibold tracking-wide transition-colors duration-200 ${
              isActive ? 'text-cyan-600' : 'text-gray-600 hover:text-cyan-600'
            }`
          }
        >
          Productos
        </NavLink>

        {isAuthenticated && isAdmin && (
          <NavLink
            to='/admin'
            className={({ isActive }) =>
              `px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                isActive 
                ? 'bg-cyan-50 border-cyan-200 text-cyan-700' 
                : 'border-gray-200 text-gray-500 hover:border-cyan-200 hover:text-cyan-600'
              }`
            }
          >
            PANEL ADMIN
          </NavLink>
        )}
      </nav>

      {/* BOTONES DE ACCIÓN */}
      <div className='flex items-center gap-6'>
        {!isAuthenticated ? (
          <div className='hidden md:flex items-center gap-4'>
            <button onClick={handleLogin} className='text-sm font-semibold text-gray-600 hover:text-cyan-600 transition-colors'>Iniciar sesión</button>
            <button onClick={handleRegister} className='px-5 py-2 bg-cyan-600 text-white text-sm font-bold rounded-full hover:bg-cyan-700 transition-transform active:scale-95 shadow-md shadow-cyan-100'>Registrarse</button>
          </div>
        ) : (
          <>
            <button className='relative group p-1' onClick={handleCartClick} title='Ver Carrito'>
              <div className='absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm group-hover:scale-110 transition-transform'>
                {typeof getTotalItems === 'function' ? getTotalItems() || 0 : 0}
              </div>
              <HiOutlineShoppingBag className="w-6 h-6 text-gray-600 group-hover:text-cyan-600 transition-colors" />
            </button>
            <button onClick={handleUserClick} className='w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-md hover:shadow-lg hover:ring-2 hover:ring-offset-2 hover:ring-cyan-200 transition-all' title={user?.nombre ? `Hola, ${user.nombre}` : 'Mi Perfil'}>
              {user?.nombre ? user.nombre[0].toUpperCase() : <HiUser />}
            </button>
            <button onClick={handleLogout} className='text-gray-400 hover:text-red-500 transition-colors p-1' title="Cerrar sesión">
              <HiLogout className="w-6 h-6" />
            </button>
          </>
        )}
        <button className='md:hidden text-gray-700 hover:text-cyan-600 transition-colors'><FaBarsStaggered size={24} /></button>
      </div>
    </header>
  )
}