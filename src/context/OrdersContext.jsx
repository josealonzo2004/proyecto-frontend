import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { pedidosAPI } from '../api'; // IMPORTA TU API
import { useAuth } from './AuthContext'; // Para saber si hay usuario logueado

const OrdersContext = createContext();

export const useOrders = () => {
    const context = useContext(OrdersContext);
    if (!context) throw new Error('useOrders must be used within OrdersProvider');
    return context;
};

export const OrdersProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const { user, isAdmin } = useAuth(); // Necesitamos saber quién es

    // 1. Función para cargar pedidos desde el Backend
    const fetchOrders = useCallback(async () => {
        try {
            // Hacemos la petición al backend
            const { data } = await pedidosAPI.getAll();
            
            // Si es admin ve todos, si es usuario normal filtramos los suyos
            // (Aunque lo ideal es que el backend filtre, por ahora filtramos aquí)
            if (isAdmin) {
                setOrders(data);
            } else if (user) {
                const misPedidos = data.filter(o => o.usuario?.email === user.email);
                setOrders(misPedidos);
            }
        } catch (error) {
            console.error('Error cargando pedidos:', error);
        }
    }, [user, isAdmin]);

    // Cargar pedidos al iniciar o cambiar de usuario
    useEffect(() => {
        if (user) {
            fetchOrders();
        } else {
            setOrders([]);
        }
    }, [user, fetchOrders]);

    // 2. Crear pedido (Conectado a la API)
    const createOrder = async (orderData) => {
        try {
            // orderData ya viene formateado desde CheckoutPage
            const { data } = await pedidosAPI.create(orderData);
            
            // Recargamos la lista de pedidos para ver el nuevo
            await fetchOrders();
            return data;
        } catch (error) {
            console.error('Error creando pedido:', error);
            throw error;
        }
    };

    // 3. Actualizar estado (Conectado a la API)
    const updateOrderStatus = async (id, status) => {
        try {
            // Nota: Tu backend necesita un endpoint update que acepte { estado: ... }
            // O debes enviar el DTO completo. Ajusta según tu 'updatePedidoDto'.
            // Si tu backend espera un ID de estado (ej: 1, 2), debes convertir el string 'status' a ID.
            
            // Ejemplo simple asumiendo que el backend procesa el update:
            await pedidosAPI.update(id, { estado: status }); 
            
            await fetchOrders(); // Recargar
        } catch (error) {
            console.error('Error actualizando estado:', error);
        }
    };

    const value = {
        orders,
        createOrder,
        updateOrderStatus,
        fetchOrders // Exportamos por si queremos recargar manualmente
    };

    return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
};