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

    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed)) {
                    setCartItems(parsed);
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
            variant,
            customization,
            quantity: 1
        };
        setCartItems([...cartItems, cartItem]);
    };

    const removeFromCart = (itemId) => {
        setCartItems(cartItems.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId, quantity) => {
        setCartItems(cartItems.map(item => 
            item.id === itemId ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getTotal = () => {
        return cartItems.reduce((sum, item) => {
            const precio = item.variant?.precio || 0;
            const cantidad = item.quantity || 1;
            return sum + (precio * cantidad);
        }, 0);
    };

    const getTotalItems = () => {
        return cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
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
