import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Cargar carrito y convertir precios a números por seguridad
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed)) {
                    // Limpieza de datos al cargar
                    const cleanCart = parsed.map(item => ({
                        ...item,
                        quantity: Number(item.quantity),
                        variant: {
                            ...item.variant,
                            precio: Number(item.variant?.precio || 0)
                        }
                    }));
                    setCartItems(cleanCart);
                }
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            setCartItems([]);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }, [cartItems]);

    const addToCart = (product, variant, customization = null) => {
        const cartItem = {
            id: Date.now(),
            product,
            variant: {
                ...variant,
                precio: Number(variant?.precio || 0) // Forzar número
            },
            customization,
            quantity: 1
        };
        setCartItems(prev => [...prev, cartItem]);
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId, quantity) => {
        const qty = Number(quantity);
        if (qty < 1) return;
        setCartItems(prev => prev.map(item => 
            item.id === itemId ? { ...item, quantity: qty } : item
        ));
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
    };

    const getTotal = () => {
        return cartItems.reduce((sum, item) => {
            const precio = Number(item.variant?.precio || 0);
            const cantidad = Number(item.quantity || 1);
            return sum + (precio * cantidad);
        }, 0);
    };

    const getTotalItems = () => {
        return cartItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getTotalItems
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};