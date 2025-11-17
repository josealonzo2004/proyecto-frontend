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
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    authAPI.getProfile()
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const token = res.data.access_token;
    localStorage.setItem('token', token);
    const profile = await authAPI.getProfile();
    setUser(profile.data);
    return profile.data;
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
    usuarioCreaId: 1,   // Poner un número dummy mientras no tengas sistema de admins
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
      loading, isAuthenticated: !!user, isAdmin: user?.rol === 'administrador'
    }}>
      {children}
    </AuthContext.Provider>
  );
};
