import { useState } from 'react';
import { useProducts } from '../../context/ProductsContext';

export const ProductForm = ({ product = null, onClose }) => {
    const { addProduct, updateProduct } = useProducts();
    const [formData, setFormData] = useState({
        nombre: product?.nombre || '',
        descripcion: product?.descripcion || '',
        precioBase: product?.precioBase || '',
        categoria: product?.categoria || '',
        imagen: product?.imagen || '',
        variantes: product?.variantes || [{ nombre: 'Default', precio: product?.precioBase || '' }]
    });
    const [imagePreview, setImagePreview] = useState(product?.imagen || '');

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
            // Validar que sea una imagen
            if (!file.type.startsWith('image/')) {
                alert('Por favor selecciona un archivo de imagen');
                return;
            }

            // Validar tamaño (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('La imagen es muy grande. Por favor selecciona una imagen menor a 5MB');
                return;
            }

            // Convertir a base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setFormData(prev => ({
                    ...prev,
                    imagen: base64String
                }));
                setImagePreview(base64String);
            };
            reader.onerror = () => {
                alert('Error al leer la imagen');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...formData.variantes];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setFormData(prev => ({
            ...prev,
            variantes: newVariants
        }));
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variantes: [...prev.variantes, { nombre: '', precio: '' }]
        }));
    };

    const removeVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variantes: prev.variantes.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const productData = {
            ...formData,
            precioBase: parseFloat(formData.precioBase),
            variantes: formData.variantes.map(v => ({
                id: Date.now() + Math.random(),
                nombre: v.nombre,
                precio: parseFloat(v.precio)
            }))
        };

        if (product) {
            updateProduct(product.id, productData);
        } else {
            addProduct(productData);
        }
        
        onClose();
    };

    return (
        <div className='bg-white rounded-lg p-6 border border-gray-200'>
            <h2 className='text-2xl font-bold mb-6'>
                {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h2>

            <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                    <label className='block font-semibold mb-2'>Nombre del Producto</label>
                    <input
                        type='text'
                        name='nombre'
                        value={formData.nombre}
                        onChange={handleChange}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600'
                        required
                    />
                </div>

                <div>
                    <label className='block font-semibold mb-2'>Descripción</label>
                    <textarea
                        name='descripcion'
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows={4}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600'
                        required
                    />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label className='block font-semibold mb-2'>Precio Base</label>
                        <input
                            type='number'
                            name='precioBase'
                            value={formData.precioBase}
                            onChange={handleChange}
                            step='0.01'
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600'
                            required
                        />
                    </div>

                    <div>
                        <label className='block font-semibold mb-2'>Categoría</label>
                        <input
                            type='text'
                            name='categoria'
                            value={formData.categoria}
                            onChange={handleChange}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600'
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className='block font-semibold mb-2'>Imagen del Producto</label>
                    
                    {/* Vista previa de la imagen */}
                    {imagePreview && (
                        <div className='mb-4'>
                            <img
                                src={imagePreview}
                                alt='Vista previa'
                                className='w-48 h-48 object-cover rounded-lg border border-gray-300'
                            />
                        </div>
                    )}

                    {/* Input para subir archivo */}
                    <div className='mb-2'>
                        <label className='block text-sm text-gray-600 mb-2'>
                            Subir imagen desde tu PC:
                        </label>
                        <input
                            type='file'
                            accept='image/*'
                            onChange={handleImageUpload}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600'
                        />
                    </div>

                    {/* O usar URL */}
                    <div className='mt-4'>
                        <label className='block text-sm text-gray-600 mb-2'>
                            O ingresa una URL de imagen:
                        </label>
                        <input
                            type='text'
                            name='imagen'
                            value={formData.imagen.startsWith('data:') ? '' : formData.imagen}
                            onChange={(e) => {
                                handleChange(e);
                                setImagePreview(e.target.value);
                            }}
                            placeholder='/images/producto.jpg o https://...'
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-600'
                        />
                    </div>
                </div>

                <div>
                    <div className='flex justify-between items-center mb-2'>
                        <label className='block font-semibold'>Variantes</label>
                        <button
                            type='button'
                            onClick={addVariant}
                            className='text-cyan-600 hover:text-cyan-700 text-sm font-medium'
                        >
                            + Agregar Variante
                        </button>
                    </div>
                    {formData.variantes.map((variant, index) => (
                        <div key={index} className='flex gap-2 mb-2'>
                            <input
                                type='text'
                                placeholder='Nombre variante'
                                value={variant.nombre}
                                onChange={(e) => handleVariantChange(index, 'nombre', e.target.value)}
                                className='flex-1 px-4 py-2 border border-gray-300 rounded-lg'
                            />
                            <input
                                type='number'
                                placeholder='Precio'
                                value={variant.precio}
                                onChange={(e) => handleVariantChange(index, 'precio', e.target.value)}
                                step='0.01'
                                className='w-32 px-4 py-2 border border-gray-300 rounded-lg'
                            />
                            {formData.variantes.length > 1 && (
                                <button
                                    type='button'
                                    onClick={() => removeVariant(index)}
                                    className='px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600'
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className='flex gap-4 pt-4'>
                    <button
                        type='submit'
                        className='flex-1 bg-cyan-600 text-white py-3 rounded-lg font-medium hover:bg-cyan-700'
                    >
                        {product ? 'Actualizar' : 'Agregar'} Producto
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
