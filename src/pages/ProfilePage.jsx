import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// IMPORTACIÓN DE API
import { direccionesAPI, pedidosAPI, devolucionesAPI } from "../services/api"; 
// IMPORTACIÓN DE ICONOS
import { HiPencil, HiTrash, HiX, HiReply, HiExclamationCircle, HiUpload } from 'react-icons/hi'; 

export const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // Control de Pestañas
    const [activeTab, setActiveTab] = useState('profile');

    // === ESTADOS PARA DIRECCIONES ===
    const [misDirecciones, setMisDirecciones] = useState([]);
    const [editingAddress, setEditingAddress] = useState(null); 
    const [formData, setFormData] = useState({}); 

    // === ESTADOS PARA PEDIDOS Y DEVOLUCIONES ===
    const [misPedidos, setMisPedidos] = useState([]);
    const [misDevoluciones, setMisDevoluciones] = useState([]);

    // === ESTADOS PARA EL MODAL DE DEVOLUCIÓN ===
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnItemData, setReturnItemData] = useState(null); 
    const [returnForm, setReturnForm] = useState({
        causa: '',
        comentario: ''
    });
    // Estado para el archivo de la factura
    const [invoiceFile, setInvoiceFile] = useState(null);

    // ----------------------------------------------------------------
    // 1. CARGA DE DATOS (USE EFFECTS)
    // ----------------------------------------------------------------

    // Cargar Direcciones
    useEffect(() => {
        if (activeTab === 'addresses') {
            direccionesAPI.getAll()
                .then((res) => setMisDirecciones(res.data))
                .catch((err) => console.error("Error cargando direcciones", err));
        }
    }, [activeTab]);

    // Cargar Pedidos
    useEffect(() => {
        if (activeTab === 'orders' && user) {
            pedidosAPI.getAll()
                .then((res) => {
                    // Filtro para asegurar que sean pedidos de ESTE usuario
                    const pedidosMios = res.data.filter(
                        pedido => pedido.usuario && pedido.usuario.correoElectronico === user.correoElectronico
                    );
                    setMisPedidos(pedidosMios);
                })
                .catch(err => console.error("Error cargando pedidos", err));
        }
    }, [activeTab, user]);

    // Cargar Devoluciones
    useEffect(() => {
        if (activeTab === 'returns' && user) {
            devolucionesAPI.getAll()
                .then(res => {
                    const misDevs = res.data.filter(d => d.usuarioCreaId === user.usuarioId);
                    setMisDevoluciones(misDevs);
                })
                .catch(err => console.error("Error cargando devoluciones", err));
        }
    }, [activeTab, user]);


    // ----------------------------------------------------------------
    // 2. FUNCIONES LÓGICAS
    // ----------------------------------------------------------------

    // --- Lógica Direcciones ---
    const handleDeleteAddress = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
            try {
                await direccionesAPI.delete(id);
                setMisDirecciones(misDirecciones.filter(dir => dir.direccionId !== id));
            } catch (error) {
                console.error(error);
                alert("No se pudo eliminar");
            }
        }
    };

    const startEdit = (dir) => {
        setEditingAddress(dir.direccionId);
        setFormData({
            callePrincipal: dir.callePrincipal,
            avenida: dir.avenida || '',
            ciudad: dir.ciudad,
            provincia: dir.provincia,
            pais: dir.pais
        });
    };

    const cancelEdit = () => {
        setEditingAddress(null);
        setFormData({});
    };

    const handleUpdateAddress = async (e) => {
        e.preventDefault();
        try {
            await direccionesAPI.update(editingAddress, {
                usuarioId: user.usuarioId,
                ...formData
            });
            const updatedList = misDirecciones.map(d => 
                d.direccionId === editingAddress ? { ...d, ...formData } : d
            );
            setMisDirecciones(updatedList);
            setEditingAddress(null);
            alert("Dirección actualizada");
        } catch (error) {
            console.error(error);
            alert("Error al actualizar");
        }
    };

    // --- LÓGICA DE DEVOLUCIONES (MODAL) ---

    const openReturnModal = (pedidoId, item) => {
        setReturnItemData({ pedidoId, detalle: item });
        setReturnForm({ causa: '', comentario: '' }); 
        setInvoiceFile(null); // Limpiar archivo previo
        setShowReturnModal(true);
    };

    const closeReturnModal = () => {
        setShowReturnModal(false);
        setReturnItemData(null);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setInvoiceFile(e.target.files[0]);
        }
    };

    const submitReturn = async (e) => {
        e.preventDefault();
        
        if (!returnForm.causa) {
            alert("Por favor selecciona una causa de devolución");
            return;
        }

        try {
            // Nota: Como el backend no tiene campo de archivo aún, lo ponemos en el texto
            const archivoInfo = invoiceFile ? ` (Archivo adjunto: ${invoiceFile.name})` : '';
            const motivoFinal = `[${returnForm.causa}] - ${returnForm.comentario}${archivoInfo}`;

            const nuevaDevolucion = {
                facturaId: returnItemData.pedidoId, 
                varianteId: returnItemData.detalle.variante?.varianteId || returnItemData.detalle.varianteId,
                motivo: motivoFinal,
                fechaDevolucion: new Date(),
                estadoId: 1, // Pendiente
                usuarioCreaId: user.usuarioId
            };

            await devolucionesAPI.create(nuevaDevolucion);
            
            alert("Solicitud enviada con éxito.");
            closeReturnModal();
            setActiveTab('returns');

        } catch (error) {
            console.error(error);
            alert("Error al solicitar devolución.");
        }
    };


    // ----------------------------------------------------------------
    // 3. RENDERIZADO (JSX)
    // ----------------------------------------------------------------
    return (
        <div className='max-w-4xl mx-auto relative'>
            <h1 className='text-3xl font-bold mb-8'>Mi cuenta</h1>

            {/* Navegación de Pestañas */}
            <div className='flex gap-4 mb-8 border-b overflow-x-auto'>
                {['profile', 'addresses', 'orders', 'returns'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 font-semibold capitalize whitespace-nowrap ${
                            activeTab === tab ? 'border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                        }`}
                    >
                        {tab === 'profile' ? 'Perfil' : 
                         tab === 'addresses' ? 'Direcciones' : 
                         tab === 'orders' ? 'Pedidos' : 'Devoluciones'}
                    </button>
                ))}
            </div>

            {/* TAB: PERFIL (Completo Original) */}
            {activeTab === 'profile' && (
                <div className='bg-white rounded-lg p-6 border border-gray-200'>
                    <h2 className='text-xl font-bold mb-4'>Información personal</h2>
                    <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className='block font-semibold mb-2'>Nombre</label>
                                <input
                                    type='text'
                                    defaultValue={user?.nombre || ''}
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                                />
                            </div>
                            <div>
                                <label className='block font-semibold mb-2'>Apellido</label>
                                <input
                                    type='text'
                                    defaultValue={user?.apellido || ''}
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                                />
                            </div>
                        </div>
                        <div>
                            <label className='block font-semibold mb-2'>Correo electrónico</label>
                            <input
                                type='email'
                                defaultValue={user?.correoElectronico || ''}
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                            />
                        </div>
                        <div>
                            <label className='block font-semibold mb-2'>Teléfono</label>
                            <input
                                type='tel'
                                defaultValue={user?.telefono || ''}
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                            />
                        </div>
                        <button className='bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700'>
                            Guardar cambios
                        </button>
                    </div>
                </div>
            )}

            {/* TAB: DIRECCIONES */}
            {activeTab === 'addresses' && (
                <div className='space-y-4'>
                    {misDirecciones.length === 0 ? (
                        <div className='bg-white rounded-lg p-8 border border-gray-200 text-center'>
                            <p className='text-gray-500'>No tienes direcciones guardadas.</p>
                        </div>
                    ) : (
                        misDirecciones.map((dir) => (
                            <div key={dir.direccionId} className='bg-white rounded-lg p-6 border border-gray-200 shadow-sm'>
                                {editingAddress === dir.direccionId ? (
                                    <form onSubmit={handleUpdateAddress} className="space-y-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-bold text-cyan-600">Editar Dirección</h3>
                                            <button type="button" onClick={cancelEdit} className="text-gray-400 hover:text-red-500"><HiX size={20}/></button>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            <input type="text" placeholder="Calle Principal" required className="w-full px-3 py-2 border rounded" value={formData.callePrincipal} onChange={e => setFormData({...formData, callePrincipal: e.target.value})} />
                                            <input type="text" placeholder="Avenida" className="w-full px-3 py-2 border rounded" value={formData.avenida} onChange={e => setFormData({...formData, avenida: e.target.value})} />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="text" placeholder="Ciudad" required className="w-full px-3 py-2 border rounded" value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} />
                                                <input type="text" placeholder="Provincia" required className="w-full px-3 py-2 border rounded" value={formData.provincia} onChange={e => setFormData({...formData, provincia: e.target.value})} />
                                            </div>
                                            <input type="text" placeholder="País" required className="w-full px-3 py-2 border rounded" value={formData.pais} onChange={e => setFormData({...formData, pais: e.target.value})} />
                                        </div>
                                        <div className="flex justify-end gap-2 mt-3">
                                            <button type="button" onClick={cancelEdit} className="px-4 py-2 text-sm bg-gray-100 rounded">Cancelar</button>
                                            <button type="submit" className="px-4 py-2 text-sm text-white bg-cyan-600 rounded hover:bg-cyan-700">Guardar</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className='font-bold text-lg text-gray-800'>{dir.callePrincipal}</p>
                                            {dir.avenida && <p className='text-gray-600 text-sm'>{dir.avenida}</p>}
                                            <p className='text-gray-600 text-sm mt-1'>{dir.ciudad}, {dir.provincia}</p>
                                            <p className='text-gray-400 text-xs mt-1 uppercase'>{dir.pais}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => startEdit(dir)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"><HiPencil size={20}/></button>
                                            <button onClick={() => handleDeleteAddress(dir.direccionId)} className="p-2 text-red-600 hover:bg-red-50 rounded-full"><HiTrash size={20}/></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* TAB: PEDIDOS */}
            {activeTab === 'orders' && (
                <div className='space-y-4'>
                    {misPedidos.length === 0 ? (
                        <div className='bg-white rounded-lg p-8 border border-gray-200 text-center'>
                            <p className='text-gray-500'>No has realizado pedidos aún.</p>
                        </div>
                    ) : (
                        misPedidos.map(pedido => (
                            <div key={pedido.pedidoId} className='bg-white rounded-lg p-6 border border-gray-200'>
                                <div className='flex justify-between items-center mb-4'>
                                    <div>
                                        <p className='font-bold text-lg'>Pedido #{pedido.pedidoId}</p>
                                        <p className='text-sm text-gray-600'>Fecha: {new Date(pedido.fechaCreacion).toLocaleDateString()}</p>
                                    </div>
                                    <span className='px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800'>
                                        {pedido.estado ? pedido.estado.descripcion : 'Procesando'}
                                    </span>
                                </div>
                                <div className='flex justify-between items-center mb-4 border-b pb-4'>
                                    <p className='text-gray-600 font-semibold'>Total:</p>
                                    <p className='text-xl font-bold text-cyan-600'>${Number(pedido.contenidoTotal).toFixed(2)}</p>
                                </div>
                                
                                {pedido.detalles && pedido.detalles.length > 0 && (
                                    <div className='bg-gray-50 rounded p-3'>
                                        <p className='text-sm font-semibold mb-2 text-gray-700'>Productos:</p>
                                        <div className='space-y-2'>
                                            {pedido.detalles.map((detalle, idx) => (
                                                <div key={idx} className='flex justify-between text-sm items-center'>
                                                    <span className='text-gray-600'>
                                                        • {detalle.variante?.producto?.nombre || 'Producto'} 
                                                        <span className='text-gray-400'> (x{detalle.cantidad})</span>
                                                    </span>
                                                    <div className="flex items-center gap-4">
                                                        <span className='font-medium'>${Number(detalle.precio).toFixed(2)}</span>
                                                        <button 
                                                            onClick={() => openReturnModal(pedido.pedidoId, detalle)}
                                                            className="text-cyan-600 hover:text-cyan-800 text-xs font-semibold underline flex items-center gap-1"
                                                        >
                                                            <HiReply /> Devolver
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* TAB: DEVOLUCIONES */}
            {activeTab === 'returns' && (
                <div className='space-y-4'>
                    {misDevoluciones.length === 0 ? (
                        <div className='bg-white rounded-lg p-8 border border-gray-200 text-center'>
                            <p className='text-gray-500'>No tienes devoluciones registradas.</p>
                        </div>
                    ) : (
                        misDevoluciones.map(dev => (
                            <div key={dev.devolucionId} className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between">
                                    <h3 className="font-bold">Solicitud #{dev.devolucionId}</h3>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                        dev.estadoId === 1 ? 'bg-yellow-100 text-yellow-800' : 
                                        dev.estadoId === 2 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {dev.estadoId === 1 ? 'Pendiente' : dev.estadoId === 2 ? 'Aprobada' : 'Rechazada'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{dev.motivo}</p>
                                <p className="text-xs text-gray-400 mt-2">Fecha: {new Date(dev.fechaDevolucion).toLocaleDateString()}</p>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* --- MODAL DE DEVOLUCIÓN (POPUP) --- */}
            {showReturnModal && returnItemData && (
                <div 
                    className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} 
                >
                    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl animate-fade-in relative">
                        
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-cyan-700">
                                <HiExclamationCircle /> Solicitar Devolución
                            </h3>
                            <button onClick={closeReturnModal} className="text-gray-400 hover:text-red-500">
                                <HiX size={24} />
                            </button>
                        </div>

                        <div className="mb-4 bg-gray-50 p-3 rounded border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Vas a devolver:</p>
                            <p className="font-semibold text-gray-800">
                                {returnItemData.detalle.variante?.producto?.nombre} (x{returnItemData.detalle.cantidad})
                            </p>
                        </div>

                        <form onSubmit={submitReturn}>
                            {/* Causa */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2">Motivo</label>
                                <select 
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-cyan-500"
                                    value={returnForm.causa}
                                    onChange={(e) => setReturnForm({...returnForm, causa: e.target.value})}
                                    required
                                >
                                    <option value="">Selecciona una opción</option>
                                    <option value="Defectuoso">Producto defectuoso / No funciona</option>
                                    <option value="Dañado">Llegó dañado (empaque roto)</option>
                                    <option value="Incorrecto">Producto incorrecto</option>
                                    <option value="Arrepentimiento">Ya no lo necesito</option>
                                    <option value="Otro">Otro motivo</option>
                                </select>
                            </div>

                            {/* Comentarios */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2">Comentarios</label>
                                <textarea 
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 resize-none focus:ring-cyan-500"
                                    placeholder="Detalles adicionales..."
                                    value={returnForm.comentario}
                                    onChange={(e) => setReturnForm({...returnForm, comentario: e.target.value})}
                                    required
                                ></textarea>
                            </div>

                            {/* INPUT DE ARCHIVO (Factura) */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold mb-2">Subir Factura / Evidencia</label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <HiUpload className="w-8 h-8 mb-3 text-gray-400" />
                                            <p className="text-sm text-gray-500">
                                                <span className="font-semibold">Click para subir</span>
                                            </p>
                                            <p className="text-xs text-gray-500">PDF, PNG, JPG (Max. 5MB)</p>
                                        </div>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept=".pdf,.png,.jpg,.jpeg"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>
                                {invoiceFile && (
                                    <p className="mt-2 text-sm text-green-600 font-medium flex items-center gap-1 animate-pulse">
                                        ✓ Archivo seleccionado: {invoiceFile.name}
                                    </p>
                                )}
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={closeReturnModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold shadow-sm"
                                >
                                    Enviar Solicitud
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <button
                onClick={() => { logout(); navigate('/'); }}
                className='mt-8 px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 w-full sm:w-auto'
            >
                Cerrar sesión
            </button>
        </div>
    );
};