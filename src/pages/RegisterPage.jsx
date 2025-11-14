import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Error al crear la cuenta');
        }
    };

    return (
        <div className='max-w-md mx-auto mt-12'>
            <h1 className='text-3xl font-bold mb-8 text-center'>Crear cuenta</h1>

            {error && (
                <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label className='block font-semibold mb-2'>Nombre</label>
                        <input
                            type='text'
                            name='nombre'
                            value={formData.nombre}
                            onChange={handleChange}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600'
                            required
                        />
                    </div>

                    <div>
                        <label className='block font-semibold mb-2'>Apellido</label>
                        <input
                            type='text'
                            name='apellido'
                            value={formData.apellido}
                            onChange={handleChange}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600'
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className='block font-semibold mb-2'>Teléfono</label>
                    <input
                        type='tel'
                        name='telefono'
                        value={formData.telefono}
                        onChange={handleChange}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600'
                        required
                    />
                </div>

                <div>
                    <label className='block font-semibold mb-2'>Correo electrónico</label>
                    <input
                        type='email'
                        name='email'
                        value={formData.email}
                        onChange={handleChange}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600'
                        required
                    />
                </div>

                <div>
                    <label className='block font-semibold mb-2'>Contraseña</label>
                    <input
                        type='password'
                        name='password'
                        value={formData.password}
                        onChange={handleChange}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600'
                        required
                    />
                </div>

                <div>
                    <label className='block font-semibold mb-2'>Confirmar contraseña</label>
                    <input
                        type='password'
                        name='confirmPassword'
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600'
                        required
                    />
                </div>

                <button
                    type='submit'
                    className='w-full bg-cyan-600 text-white py-3 rounded-lg font-medium hover:bg-cyan-700 transition-colors'
                >
                    Crear cuenta
                </button>
            </form>

            <p className='text-center mt-4 text-gray-600'>
                ¿Ya tienes cuenta?{' '}
                <Link to='/login' className='text-cyan-600 hover:underline'>
                    Inicia sesión
                </Link>
            </p>
        </div>
    );
};
