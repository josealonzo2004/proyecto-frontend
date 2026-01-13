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
import { productsAPI } from '../services/api'; // Asegúrate que la ruta sea correcta (ej: ../api)

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

    // --- FUNCIÓN CLAVE: Convertir datos a FormData para enviar archivo ---
    const prepareFormData = (data, file) => {
        const formData = new FormData();
        
        // Agregar campos básicos
        formData.append('nombre', data.nombre);
        formData.append('descripcion', data.descripcion);
        formData.append('precio', data.precio);
        formData.append('stock', data.stock || 0);
        formData.append('marca', data.marca || 'Generica');
        formData.append('caracteristicaPrincipal', data.caracteristicaPrincipal || '');
        
        // Agregar Slug (generar uno si no existe)
        if (!data.slug) {
            const uniqueSlug = (data.nombre.toLowerCase().replace(/ /g, '-') + '-' + Date.now());
            formData.append('slug', uniqueSlug);
        } else {
             formData.append('slug', data.slug);
        }

        // --- AGREGAR ESTA LÍNEA (IMPORTANTE) ---
        // Convertimos el array de variantes a un String JSON para que viaje con la imagen
        if (data.variantes && data.variantes.length > 0) {
            formData.append('variantes', JSON.stringify(data.variantes));
        }
        // ---------------------------------------

        // Agregar archivo si existe
        if (file) {
            formData.append('file', file);
        }

        // Variantes (Si las tienes, conviértelas a string porque FormData solo acepta strings/blobs)
        // Nota: Asegúrate que tu backend pueda recibir y parsear esto si es complejo.
        // Si no usas variantes complejas en la creación, puedes omitir esto por ahora.
        // formData.append('variantes', JSON.stringify(data.variantes || []));

        return formData;
    };

    // --- AGREGAR PRODUCTO (Modificado) ---
    const addProduct = async (productData, imageFile) => {
        try {
            // 1. Preparamos el FormData
            const formData = prepareFormData(productData, imageFile);

            // 2. Enviamos al backend (api.js debe tener header multipart/form-data o axios lo pone solo)
            const res = await productsAPI.create(formData);
            
            setProducts([...products, res.data]);
            return res.data;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    };

    // --- ACTUALIZAR PRODUCTO (Modificado) ---
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
        // Buscamos en el estado local primero para velocidad
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