import { createContext, useContext, useState, useEffect } from 'react';

const OrdersContext = createContext();

export const useOrders = () => {
    const context = useContext(OrdersContext);
    if (!context) {
        throw new Error('useOrders must be used within OrdersProvider');
    }
    return context;
};

export const OrdersProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        try {
            const savedOrders = localStorage.getItem('orders');
            if (savedOrders) {
                const parsed = JSON.parse(savedOrders);
                if (Array.isArray(parsed)) {
                    setOrders(parsed);
                }
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            setOrders([]);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('orders', JSON.stringify(orders));
        } catch (error) {
            console.error('Error saving orders:', error);
        }
    }, [orders]);

    const createOrder = (orderData) => {
        const newOrder = {
            id: Date.now(),
            ...orderData,
            estado: 'pendiente',
            fecha: new Date().toISOString()
        };
        setOrders([...orders, newOrder]);
        return newOrder;
    };

    const updateOrderStatus = (id, status) => {
        setOrders(orders.map(order => 
            order.id === id ? { ...order, estado: status } : order
        ));
    };

    const getOrdersByStatus = (status) => {
        return orders.filter(order => order.estado === status);
    };

    const value = {
        orders,
        createOrder,
        updateOrderStatus,
        getOrdersByStatus
    };

    return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
};
