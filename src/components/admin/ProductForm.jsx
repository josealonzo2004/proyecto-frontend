import { useState } from 'react';
import { useProducts } from '../../context/ProductsContext';
import { HiOutlinePhoto } from 'react-icons/hi2'; // Opcional: Icono para que se vea bonito
import { notifySuccess, notifyError } from '../../utils/notifications';

export const ProductForm = ({ product = null, onClose }) => {
    // Obtenemos las funciones del contexto
    const { addProduct, updateProduct } = useProducts();

    // 1. ESTADO PARA LA IMAGEN (NUEVO)
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(product?.imagen || null);

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

    // Manejador para cuando seleccionan un archivo (NUEVO)
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Creamos una URL temporal para ver la previsualización
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleVariantChange = (index, e) => {
        const { name, value } = e.target;
        const newVariantes = [...formData.variantes];
        newVariantes[index][name] = value;
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

        // Datos base
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
                // --- MODO EDICIÓN ---
                const payloadEdicion = {
                    ...basePayload,
                    variantes: formData.variantes
                        .filter(v => v.nombre && v.nombre.trim() !== '')
                        .map(v => {
                            const variantObj = {
                                nombre: v.nombre,
                                precio: parseFloat(v.precio) || 0
                            };
                            if (v.varianteId) {
                                variantObj.varianteId = Number(v.varianteId);
                            }
                            return variantObj;
                        })
                };
                
                // 3. PASAMOS EL ARCHIVO COMO SEGUNDO ARGUMENTO (NUEVO)
                await updateProduct(product.productoId || product.id, payloadEdicion, imageFile);

            } else {
                // --- MODO CREACIÓN ---
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
                
                // 3. PASAMOS EL ARCHIVO COMO SEGUNDO ARGUMENTO (NUEVO)
                await addProduct(createPayload, imageFile);
            }
            
            onClose();
            notifySuccess('Producto guardado exitosamente');
        } catch (error) {
            console.error("Error:", error);
            notifyError("Hubo un error al guardar el producto");
        }
    };

    return (
        <div className='bg-white rounded-lg p-6 border border-gray-200 overflow-y-auto max-h-[90vh] shadow-xl'>
            <h2 className='text-2xl font-bold mb-6 text-gray-800'>
                {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h2>

            <form onSubmit={handleSubmit} className='space-y-4'>
                
                {/* 2. INPUT DE IMAGEN (NUEVO SECCIÓN) */}
                <div className="flex gap-4 items-center mb-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <HiOutlinePhoto className="text-gray-400 text-3xl" />
                        )}
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Producto</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-cyan-50 file:text-cyan-700
                                hover:file:bg-cyan-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">Soporta JPG, PNG, WEBP (Max 5MB)</p>
                    </div>
                </div>

                {/* INPUTS NORMALES (SIN CAMBIOS) */}
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

                {/* SECCIÓN DE VARIANTES (SIN CAMBIOS GRANDES) */}
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