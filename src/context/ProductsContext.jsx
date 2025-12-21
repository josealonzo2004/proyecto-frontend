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

    // Cargar productos al iniciar
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

    // Función auxiliar para construir el FormData
    // isUpdate: controla qué IDs enviar para no romper la validación del Backend
    const createFormData = (productData, imageFile, isUpdate = false) => {
        const formData = new FormData();
        
        // --- CAMPOS OBLIGATORIOS COMUNES ---
        formData.append('nombre', productData.nombre);
        formData.append('marca', productData.marca || 'Generica');
        formData.append('descripcion', productData.descripcion);
        formData.append('precio', productData.precio); // Backend espera 'precio'
        formData.append('stock', productData.stock || 0);
        formData.append('estadoId', 1); // Ajusta esto si manejas estados dinámicos

        // --- CAMPOS OPCIONALES ---
        formData.append('caracteristicaPrincipal', productData.caracteristicaPrincipal || 'Estándar');

        // --- IMAGEN ---
        if (imageFile) {
            formData.append('file', imageFile);
        }

        // --- LÓGICA DIFERENCIADA CREAR vs EDITAR ---
        if (isUpdate) {
            // SI ES UPDATE:
            // Solo enviamos usuarioActualizaId si tu DTO de actualización lo permite.
            // Si tu UpdateProductoDto tiene usuarioActualizaId, descomenta la siguiente línea:
            // formData.append('usuarioActualizaId', 1); 
            
            // NO enviamos usuarioCreaId ni slug (generalmente el slug no se cambia al editar)
        } else {
            // SI ES CREATE:
            formData.append('usuarioCreaId', 1); // Obligatorio al crear

            // Generar slug si no viene (Obligatorio al crear)
            const slugBase = productData.slug || productData.nombre;
            const uniqueSlug = slugBase.toLowerCase().replace(/ /g, '-') + '-' + Date.now();
            formData.append('slug', uniqueSlug);
        }
        
        return formData;
    };

    // Crear Producto
    const addProduct = async (productData, imageFile) => {
        try {
            // false = modo creación
            const formData = createFormData(productData, imageFile, false);
            const res = await productsAPI.create(formData);
            
            // Agregamos el nuevo producto al estado local
            setProducts([...products, res.data]);
            return res.data;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error; // Re-lanzamos para manejar la alerta en el componente
        }
    };

    // Actualizar Producto
    const updateProduct = async (id, productData, imageFile) => {
        try {
            // true = modo edición
            const formData = createFormData(productData, imageFile, true);
            
            // 1. Enviamos la actualización al servidor
            await productsAPI.update(id, formData);
            
            // 2. CORRECCIÓN: Como el backend no nos devuelve los datos nuevos,
            // recargamos toda la lista de productos inmediatamente.
            await fetchProducts(); 
            
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    };

    // Eliminar Producto
    const deleteProduct = async (id) => {
        try {
            if (!id) {
                console.error("ID no válido para eliminar");
                return;
            }
            await productsAPI.delete(id);
            // Filtramos usando productoId
            setProducts(products.filter(p => p.productoId !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
            alert("Error al eliminar producto");
        }
    };

    // Obtener un producto por ID
    const getProductById = async (id) => {
        try {
            const res = await productsAPI.getById(id);
            return res.data;
        } catch (error) {
            console.error("Error fetching product:", error);
            return null;
        }
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
