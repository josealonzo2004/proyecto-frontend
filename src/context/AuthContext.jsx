/*import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cargar usuario del localStorage
        try {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
            }
        } catch (error) {
            console.error('Error loading user:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        // Credenciales de administrador
        const ADMIN_EMAIL = 'innovaadmin@corte.com';
        const ADMIN_PASSWORD = '123456';
        
        // Validar credenciales de administrador
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            const userData = {
                id: 1,
                nombre: 'Administrador',
                apellido: 'Innova Arte',
                email: ADMIN_EMAIL,
                telefono: '123456789',
                rol: 'administrador'
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        }
        
        // Para otros usuarios, buscar en localStorage si existe
        try {
            const savedUsers = localStorage.getItem('users');
            if (savedUsers) {
                const users = JSON.parse(savedUsers);
                const foundUser = users.find(u => u.email === email && u.password === password);
                if (foundUser) {
                    const userData = {
                        ...foundUser,
                        rol: 'cliente'
                    };
                    delete userData.password; // No guardar la contraseña en el estado
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                    return userData;
                }
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
        
        // Si no se encuentra, lanzar error
        throw new Error('Credenciales incorrectas');
    };

    const register = async (userData) => {
        // Guardar usuarios en un array separado
        try {
            const savedUsers = localStorage.getItem('users');
            const users = savedUsers ? JSON.parse(savedUsers) : [];
            
            // Verificar si el email ya existe
            if (users.some(u => u.email === userData.email)) {
                throw new Error('Este correo ya está registrado');
            }
            
            const newUser = {
                id: Date.now(),
                ...userData,
                rol: 'cliente' // Todos los registros son clientes, solo el admin específico puede ser administrador
            };
            
            // Guardar con contraseña en el array de usuarios
            users.push({ ...newUser, password: userData.password });
            localStorage.setItem('users', JSON.stringify(users));
            
            // Guardar usuario actual sin contraseña
            const userWithoutPassword = { ...newUser };
            delete userWithoutPassword.password;
            setUser(userWithoutPassword);
            localStorage.setItem('user', JSON.stringify(userWithoutPassword));
            
            return userWithoutPassword;
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.rol === 'administrador'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
*/


//Esto reemplaza el sistema anterior basado en localStorage.users. 
// el LoginPage.jsx y RegisterPage.jsx no necesitan cambios 
// si ya usan useAuth() y llaman login(email,password) / register(formData). nose
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth tiene que ser usado dentro de AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Al montar, verificar si hay token y cargar perfil
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        // Si hay token, intentar cargar perfil
        authAPI.getProfile()
            .then(res => setUser(res.data))
            .catch(() => localStorage.removeItem('token'))
            .finally(() => setLoading(false));
    }, []);

    // Mapeo de campos para login y llamada a la API
    const login = async (email, password) => {
        try {
            // Mapear a lo que espera el backend
            const payload = {
                correoElectronico: email,
                contrasenaFriada: password
            };

            // Llamada al backend
            const res = await authAPI.login(payload);

            // Ajusta esto si tu backend devuelve el token con otro nombre
            // (por ejemplo: res.data.token o res.data.access_token)
            const token = res.data?.access_token || res.data?.token || res.data;

            if (!token) {
                // Si respuesta no contiene token, tiramos error para manejar en UI
                throw new Error('No se recibió token del servidor');
            }

            // Guardar token y cargar perfil
            localStorage.setItem('token', token);

            // Obtener perfil del backend (ruta protegida)
            const profileRes = await authAPI.getProfile();
            setUser(profileRes.data);

            return profileRes.data;
        } catch (err) {
            // Normalizar el error para que LoginPage pueda mostrar mensaje
            console.error('Login error:', err);
            // Si err.response existe, tomar mensaje del backend
            const message = err?.response?.data?.message || err.message || 'Error al iniciar sesión';
            throw new Error(message);
        }
    };

    // Mapeo de campos para registro y llamada a la API
    const register = async (data) => {
        // Construimos un objeto exacto como lo tenemos en el RegistroDto de backend
        const payload = {
            nombre: data.nombre,
            apellido: data.apellido,
            telefono: data.telefono,

            // MAPEAMOS CAMPOS
            correoElectronico: data.email,
            contrasenaFriada: data.password,

            // OBLIGATORIOS DEL DTO
            usuarioCreaId: 1,
        };

        console.log("ENVIANDO REGISTRO:", payload);

        return await authAPI.register(payload);
    };


    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user, login, register, logout,
            // el admin se determina por el rol, el rol vienen del backend el cual es rolId = 2
            loading, isAuthenticated: !!user, isAdmin: user?.rolId === 2
        }}>
            {children}
        </AuthContext.Provider>
    );
};
