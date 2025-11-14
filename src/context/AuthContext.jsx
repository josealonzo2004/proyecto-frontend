import { createContext, useContext, useState, useEffect } from 'react';

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
