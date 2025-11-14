import { createContext, useContext, useState, useEffect } from 'react';

const ProductsContext = createContext();

export const useProducts = () => {
    const context = useContext(ProductsContext);
    if (!context) {
        throw new Error('useProducts must be used within ProductsProvider');
    }
    return context;
};

export const ProductsProvider = ({ children }) => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        try {
            const savedProducts = localStorage.getItem('products');
            if (savedProducts) {
                const parsed = JSON.parse(savedProducts);
                if (Array.isArray(parsed)) {
                    setProducts(parsed);
                }
            }
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts([]);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('products', JSON.stringify(products));
        } catch (error) {
            console.error('Error saving products:', error);
        }
    }, [products]);

    const addProduct = (product) => {
        const newProduct = {
            id: Date.now(),
            ...product,
            createdAt: new Date().toISOString()
        };
        setProducts([...products, newProduct]);
        return newProduct;
    };

    const updateProduct = (id, updatedProduct) => {
        setProducts(products.map(p => 
            p.id === id ? { ...p, ...updatedProduct } : p
        ));
    };

    const deleteProduct = (id) => {
        setProducts(products.filter(p => p.id !== id));
    };

    const getProductById = (id) => {
        return products.find(p => p.id === parseInt(id));
    };

    const value = {
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById
    };

    return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};
