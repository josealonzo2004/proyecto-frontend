// src/components/admin/ProductForm.jsx
import { useState, useEffect } from 'react';
import { useProducts } from '../../context/ProductsContext';

export const ProductForm = ({ product = null, onClose }) => {
    // Extraemos addProduct y updateProduct del contexto
    const { addProduct, updateProduct } = useProducts();
    
    // Estado para el archivo real que se enviará al backend
    const [selectedFile, setSelectedFile] = useState(null);
    
    // Estado para la vista previa (URL o Base64 solo para mostrar en pantalla)
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '', // Cambiado de precioBase a precio (Backend entity)
        stock: '',  // Agregado stock (Backend entity)
        categoria: '', 
        imagen: '',
        // Nota: El manejo de variantes requiere lógica extra en backend si son una tabla aparte
        // Por ahora lo enviaremos como JSON stringify o lo manejaremos simple
        variantes: [] 
    });

    // Cargar datos si estamos editando
    useEffect(() => {
        if (product) {
            setFormData({
                nombre: product.nombre || '',
                descripcion: product.descripcion || '',
                precio: product.precio || '', 
                stock: product.stock || 0,
                categoria: product.categoria || '', // Nota: Tu entity tiene marca, no categoria, ajusta según necesites
                imagen: product.imagen || '',
                variantes: product.variantes || []
            });
            setImagePreview(product.imagen);
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // 1. Validaciones básicas
            if (!file.type.startsWith('image/')) {
                alert('Por favor selecciona un archivo de imagen');
                return;
            }

            // 2. Guardamos el archivo real para enviarlo luego
            setSelectedFile(file);

            // 3. Generamos vista previa para el usuario (solo visual)
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Preparamos el objeto de datos
        // Asegúrate de que los nombres coincidan con tu CreateProductoDto
        const productData = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            precio: parseFloat(formData.precio),
            stock: parseInt(formData.stock) || 0,
            categoria: formData.categoria,
            // Agrega otros campos requeridos por tu backend (ej. marca, slug)
            marca: 'Generica', // Valor por defecto o agrega un input
        };

        try {
            if (product) {
                // UPDATE: Pasamos ID, datos y el archivo (si se cambió)
                await updateProduct(product.productoId || product.id, productData, selectedFile);
                alert('Producto actualizado con éxito');
            } else {
                // CREATE: Pasamos datos y el archivo
                await addProduct(productData, selectedFile);
                alert('Producto creado con éxito');
            }
            onClose();
        } catch (error) {
            console.error(error);
            alert('Error al guardar el producto');
        }
    };

    return (
        <div className='bg-white rounded-lg p-6 border border-gray-200 overflow-y-auto max-h-[90vh]'>
            <h2 className='text-2xl font-bold mb-6'>
                {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h2>

            <form onSubmit={handleSubmit} className='space-y-4'>
                {/* Nombre */}
                <div>
                    <label className='block font-semibold mb-2'>Nombre del Producto</label>
                    <input
                        type='text'
                        name='nombre'
                        value={formData.nombre}
                        onChange={handleChange}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                        required
                    />
                </div>

                {/* Descripción */}
                <div>
                    <label className='block font-semibold mb-2'>Descripción</label>
                    <textarea
                        name='descripcion'
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows={3}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                        required
                    />
                </div>

                {/* Precios y Stock */}
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label className='block font-semibold mb-2'>Precio</label>
                        <input
                            type='number'
                            name='precio'
                            value={formData.precio}
                            onChange={handleChange}
                            step='0.01'
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                            required
                        />
                    </div>
                    <div>
                        <label className='block font-semibold mb-2'>Stock</label>
                        <input
                            type='number'
                            name='stock'
                            value={formData.stock}
                            onChange={handleChange}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                        />
                    </div>
                </div>

                {/* Imagen */}
                <div>
                    <label className='block font-semibold mb-2'>Imagen</label>
                    
                    {imagePreview && (
                        <div className='mb-4'>
                            <img
                                src={imagePreview}
                                alt='Vista previa'
                                className='w-32 h-32 object-cover rounded-lg border border-gray-300'
                            />
                        </div>
                    )}

                    <input
                        type='file'
                        accept='image/*'
                        onChange={handleImageUpload}
                        className='w-full'
                    />
                    <p className='text-xs text-gray-500 mt-1'>Deja vacío para mantener la imagen actual (al editar).</p>
                </div>

                {/* Botones */}
                <div className='flex gap-4 pt-4'>
                    <button
                        type='submit'
                        className='flex-1 bg-cyan-600 text-white py-3 rounded-lg font-medium hover:bg-cyan-700'
                    >
                        {product ? 'Guardar Cambios' : 'Crear Producto'}
                    </button>
                    <button
                        type='button'
                        onClick={onClose}
                        className='px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50'
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};