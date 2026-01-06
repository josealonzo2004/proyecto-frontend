import { useState, useEffect } from 'react';
import { useProducts } from '../../context/ProductsContext';

export const ProductForm = ({ product = null, onClose }) => {
    const { addProduct, updateProduct } = useProducts();

    const [formData, setFormData] = useState({
        nombre: product?.nombre || '',
        descripcion: product?.descripcion || '',
        precio: product?.precio || '', 
        stock: product?.stock || 0,
        marca: product?.marca || 'Generica',
        variantes: (product?.variantes && product.variantes.length > 0) 
            ? product.variantes 
            : [{ nombre: '', precio: '' }]
    });

    // Manejar cambios en los inputs de variantes
    const handleVariantChange = (index, e) => {
        const { name, value } = e.target;
        const newVariantes = [...formData.variantes];
        newVariantes[index][name] = name === 'precio' ? value : value;
        setFormData({ ...formData, variantes: newVariantes });
    };

    const addVariantRow = () => {
        setFormData({
            ...formData,
            variantes: [...formData.variantes, { nombre: '', precio: '' }]
        });
    };

    const removeVariantRow = (index) => {
        const newVariantes = formData.variantes.filter((_, i) => i !== index);
        setFormData({ ...formData, variantes: newVariantes });
    };

   const handleSubmit = async (e) => {
    e.preventDefault();

    // Datos base que siempre se envían
    const basePayload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock) || 0,
        marca: 'Generica',
        caracteristicaPrincipal: 'Estándar',
    };

   try {
        if (product) {
            // AQUÍ VA EL CÓDIGO QUE PUSASTE
            // Esto es lo que se ejecuta cuando estás EDITANDO
        const payloadEdicion = {
            ...basePayload,
            variantes: formData.variantes
                .filter(v => v.nombre && v.nombre.trim() !== '') // No enviamos filas vacías
                .map(v => {
                    const variantObj = {
                        nombre: v.nombre,
                        precio: parseFloat(v.precio) || 0
                    };
                    // IMPORTANTE: Enviar el ID si la variante ya existe
                    if (v.varianteId) {
                        variantObj.varianteId = Number(v.varianteId);
                    }
                    return variantObj;
                })
        };
            
            console.log("Enviando edición:", payloadEdicion);
            await updateProduct(product.productoId || product.id, payloadEdicion);
        } else {
            // AL CREAR: Enviamos todo
            const createPayload = {
                ...basePayload,
                slug: formData.nombre.toLowerCase().trim().replace(/[\s_-]+/g, '-'),
                usuarioCreaId: 1,
                estadoId: 1,
                variantes: formData.variantes
                    .filter(v => v.nombre && v.nombre.trim() !== '')
                    .map(v => ({
                        nombre: v.nombre,
                        precio: parseFloat(v.precio) || 0
                    }))
            };
            await addProduct(createPayload);
        }
        onClose();
        alert('Operación exitosa');
    } catch (error) {
        console.error("Error:", error.response?.data);
    }
};

    return (
        <div className='bg-white rounded-lg p-6 border border-gray-200 overflow-y-auto max-h-[90vh] shadow-xl'>
            <h2 className='text-2xl font-bold mb-6 text-gray-800'>
                {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h2>

            <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Nombre del Producto</label>
                    <input
                        type='text'
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500'
                        required
                    />
                </div>

                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Descripción</label>
                    <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg h-24 outline-none focus:ring-2 focus:ring-cyan-500'
                        required
                    />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Precio Base</label>
                        <input
                            type='number'
                            step="0.01"
                            value={formData.precio}
                            onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500'
                            required
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Stock</label>
                        <input
                            type='number'
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500'
                            required
                        />
                    </div>
                </div>

                {/* SECCIÓN DE VARIANTES */}
                <div className='border-t border-gray-100 pt-4 mt-4'>
                    <div className='flex justify-between items-center mb-3'>
                        <h3 className='font-bold text-gray-700'>Variantes (Opcional)</h3>
                        <button 
                            type='button' 
                            onClick={addVariantRow}
                            className='text-cyan-600 text-sm font-bold bg-cyan-50 px-3 py-1 rounded-full'
                        >
                            + Agregar Variante
                        </button>
                    </div>

                    {formData.variantes.map((variante, index) => (
                        <div key={index} className='flex gap-3 mb-3 items-end'>
                            <div className='flex-1'>
                                <input
                                    type='text'
                                    name='nombre'
                                    value={variante.nombre}
                                    onChange={(e) => handleVariantChange(index, e)}
                                    placeholder='Ej: Rojo, XL, etc.'
                                    className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm'
                                />
                            </div>
                            <div className='w-28'>
                                <input
                                    type='number'
                                    step="0.01"
                                    name='precio'
                                    value={variante.precio}
                                    onChange={(e) => handleVariantChange(index, e)}
                                    placeholder='Precio'
                                    className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm'
                                />
                            </div>
                            {formData.variantes.length > 1 && (
                                <button 
                                    type='button' 
                                    onClick={() => removeVariantRow(index)}
                                    className='text-red-400 hover:text-red-600 pb-2 text-xl'
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className='flex gap-3 pt-6'>
                    <button type='submit' className='flex-1 bg-cyan-600 text-white py-3 rounded-lg font-bold hover:bg-cyan-700'>
                        {product ? 'Actualizar Producto' : 'Crear Producto'}
                    </button>
                    <button type='button' onClick={onClose} className='px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50'>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};