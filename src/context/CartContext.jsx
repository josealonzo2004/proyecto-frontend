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

    // Cargar carrito
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed)) {
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

    // Guardar carrito
    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }, [cartItems]);

    // --- NUEVA FUNCIÓN: Obtener cantidad actual de un producto en el carrito ---
    const getProductQuantityInCart = (productId) => {
        return cartItems.reduce((total, item) => {
            if (item.product.productoId === productId) {
                return total + item.quantity;
            }
            return total;
        }, 0);
    };

    const addToCart = (product, variant, customization = null) => {
        // 1. Verificar Stock Global
        const currentQtyInCart = getProductQuantityInCart(product.productoId);
        const stockDisponible = product.stock || 0;

        if (currentQtyInCart + 1 > stockDisponible) {
            alert(`No puedes agregar más. Stock máximo disponible: ${stockDisponible}`);
            return;
        }

        // 2. Buscar si ya existe este item exacto (mismo producto, variante y personalización)
        const existingItemIndex = cartItems.findIndex(item => 
            item.product.productoId === product.productoId &&
            item.variant.nombre === variant.nombre && 
            JSON.stringify(item.customization) === JSON.stringify(customization)
        );

        if (existingItemIndex >= 0) {
            // Si existe, actualizamos la cantidad
            const newCart = [...cartItems];
            newCart[existingItemIndex].quantity += 1;
            setCartItems(newCart);
        } else {
            // Si no existe, creamos uno nuevo
            const cartItem = {
                id: Date.now(),
                product,
                variant: {
                    ...variant,
                    precio: Number(variant?.precio || 0)
                },
                customization,
                quantity: 1
            };
            setCartItems(prev => [...prev, cartItem]);
        }
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId, quantity) => {
        const qty = Number(quantity);
        if (qty < 1) return;

        // Buscar el item para verificar stock
        const itemToUpdate = cartItems.find(item => item.id === itemId);
        if (!itemToUpdate) return;

        // Calcular cuántos otros items de este mismo producto hay en el carrito (excluyendo este mismo)
        const otherItemsQty = cartItems.reduce((sum, item) => {
            if (item.id !== itemId && item.product.productoId === itemToUpdate.product.productoId) {
                return sum + item.quantity;
            }
            return sum;
        }, 0);

        const stockDisponible = itemToUpdate.product.stock || 0;

        // Validar: (Cantidad de otros iguales) + (Nueva cantidad deseada) <= Stock
        if ((otherItemsQty + qty) > stockDisponible) {
            alert(`Stock insuficiente. Máximo disponible: ${stockDisponible}`);
            return; // No actualizamos si supera el stock
        }

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
        getTotalItems,
        getProductQuantityInCart // Exportamos esta función útil
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};