/*import { createContext, useContext, useState, useEffect } from 'react';

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
};*/

// src/context/ProductsContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { productsAPI } from '../services/api'; 

const ProductsContext = createContext();

export const useProducts = () => {
    const context = useContext(ProductsContext);
    if (!context) throw new Error('useProducts must be used within ProductsProvider');
    return context;
};

export const ProductsProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await productsAPI.getAll();
            setProducts(res.data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // --- FUNCIÓN CORREGIDA Y MEJORADA ---
    const prepareFormData = (data, file) => {
        const formData = new FormData();
        
        // Validación estricta: Solo enviamos si el dato existe (para no borrar datos accidentalmente)
        if (data.nombre !== undefined) formData.append('nombre', data.nombre);
        if (data.descripcion !== undefined) formData.append('descripcion', data.descripcion);
        if (data.precio !== undefined) formData.append('precio', data.precio);
        
        // CORRECCIÓN STOCK: Antes tenías "|| 0", lo cual borraba el stock si no se enviaba.
        if (data.stock !== undefined) formData.append('stock', data.stock);
        
        if (data.marca !== undefined) formData.append('marca', data.marca);
        if (data.caracteristicaPrincipal !== undefined) formData.append('caracteristicaPrincipal', data.caracteristicaPrincipal);
        
        // CAMPO ACTIVO
        if (data.activo !== undefined) {
            formData.append('activo', data.activo);
        }

        // Slug
        if (data.slug) {
             formData.append('slug', data.slug);
        } else if (data.nombre && !data.id) { 
            // Solo generar slug si es producto nuevo y no tiene slug
            const uniqueSlug = (data.nombre.toLowerCase().replace(/ /g, '-') + '-' + Date.now());
            formData.append('slug', uniqueSlug);
        }

        // Variantes
        if (data.variantes && data.variantes.length > 0) {
            formData.append('variantes', JSON.stringify(data.variantes));
        }

        // Archivo
        if (file) {
            formData.append('file', file);
        }

        return formData;
    };

    // --- AGREGAR PRODUCTO ---
    const addProduct = async (productData, imageFile) => {
        try {
            const formData = prepareFormData(productData, imageFile);
            const res = await productsAPI.create(formData);
            setProducts([...products, res.data]);
            return res.data;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    };

    // --- ACTUALIZAR PRODUCTO ---
    const updateProduct = async (id, productData, imageFile) => {
        try {
            const formData = prepareFormData(productData, imageFile);
            await productsAPI.update(id, formData);
            await fetchProducts(); 
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    };

    const deleteProduct = async (id) => {
        try {
            if (!id) return;
            await productsAPI.delete(id);
            setProducts(products.filter(p => p.productoId !== id));
            alert("Producto eliminado exitosamente");
        } catch (error) {
            console.error('Error deleting product:', error);
            const errorMessage = error.response?.data?.message || "Error al eliminar el producto";
            alert(errorMessage);
            throw error;
        }
    };

    const getProductById = (id) => {
        return products.find(p => p.productoId === Number(id));
    };

    const value = {
        products,
        loading,
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById
    };

    return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};