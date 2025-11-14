import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Credenciales incorrectas');
        }
    };

    return (
        <div className='max-w-md mx-auto mt-12'>
            <h1 className='text-3xl font-bold mb-8 text-center'>Iniciar sesión</h1>

            {error && (
                <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                    <label className='block font-semibold mb-2'>Correo electrónico</label>
                    <input
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600'
                        required
                    />
                </div>

                <div>
                    <label className='block font-semibold mb-2'>Contraseña</label>
                    <input
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600'
                        required
                    />
                </div>

                <button
                    type='submit'
                    className='w-full bg-cyan-600 text-white py-3 rounded-lg font-medium hover:bg-cyan-700 transition-colors'
                >
                    Iniciar sesión
                </button>
            </form>

            <p className='text-center mt-4 text-gray-600'>
                ¿No tienes cuenta?{' '}
                <Link to='/registro' className='text-cyan-600 hover:underline'>
                    Regístrate
                </Link>
            </p>
        </div>
    );
};
