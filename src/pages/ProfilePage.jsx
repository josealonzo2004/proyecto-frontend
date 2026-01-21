import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { direccionesAPI, pedidosAPI, devolucionesAPI, usersAPI } from "../services/api"; 
import { 
    HiPencil, HiTrash, HiX, HiReply, HiExclamationCircle, 
    HiUser, HiLocationMarker, HiShoppingBag, 
    HiRefresh, HiChevronLeft, HiChevronRight
} from 'react-icons/hi'; 

// --- COMPONENTE DE PAGINACIÓN MEJORADO (Smart Pagination) ---
const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    // Lógica para generar los números de página con puntos suspensivos
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            // Si son pocas páginas, mostramos todas (ej: 1 2 3 4 5)
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // Si son muchas, mostramos lógica acortada
            if (currentPage <= 4) {
                // Al principio: 1 2 3 4 5 ... 19
                pages.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (currentPage >= totalPages - 3) {
                // Al final: 1 ... 15 16 17 18 19
                pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                // En el medio: 1 ... 9 10 11 ... 19
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-b-lg">
            {/* Vista Móvil: Solo botones Anterior/Siguiente */}
            <div className="flex flex-1 justify-between sm:hidden">
                <button 
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))} 
                    disabled={currentPage === 1} 
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Anterior
                </button>
                <button 
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} 
                    disabled={currentPage === totalPages} 
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>

            {/* Vista Escritorio: Números inteligentes */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> de <span className="font-medium">{totalItems}</span> resultados
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        {/* Botón Anterior */}
                        <button 
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))} 
                            disabled={currentPage === 1} 
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                        >
                            <HiChevronLeft className="h-5 w-5" />
                        </button>
                        
                        {/* Números de Página */}
                        {getPageNumbers().map((page, index) => (
                             page === '...' ? (
                                <span key={`dots-${index}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                                    ...
                                </span>
                             ) : (
                                <button 
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                                        currentPage === page 
                                        ? 'z-10 bg-cyan-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600' 
                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                             )
                        ))}

                        {/* Botón Siguiente */}
                        <button 
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} 
                            disabled={currentPage === totalPages} 
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                        >
                            <HiChevronRight className="h-5 w-5" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export const ProfilePage = () => {
    const { user, logout } = useAuth(); 
    const navigate = useNavigate();
    
    // --- ESTADOS ---
    const [activeTab, setActiveTab] = useState('profile');
    
    const [misDirecciones, setMisDirecciones] = useState([]);
    const [misPedidos, setMisPedidos] = useState([]);
    const [misDevoluciones, setMisDevoluciones] = useState([]);
    
    // Formulario Perfil
    const [profileForm, setProfileForm] = useState({ nombre: '', apellido: '', telefono: '' });

    // Paginación
    const ITEMS_PER_PAGE = 2; // Puedes subir esto a 5 o 10 si prefieres
    const [addressPage, setAddressPage] = useState(1);
    const [orderPage, setOrderPage] = useState(1);
    const [returnPage, setReturnPage] = useState(1);

    // Formularios
    const [editingAddress, setEditingAddress] = useState(null); 
    const [formData, setFormData] = useState({}); 
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnItemData, setReturnItemData] = useState(null); 
    const [returnForm, setReturnForm] = useState({ causa: '', comentario: '' });
    const [invoiceFile, setInvoiceFile] = useState(null);

    // --- CARGA INICIAL ---
    useEffect(() => {
        if (user) {
            setProfileForm({
                nombre: user.nombre || '',
                apellido: user.apellido || '',
                telefono: user.telefono || ''
            });
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'addresses') {
            direccionesAPI.getAll().then((res) => {
                // --- CORRECCIÓN AQUÍ: Ordenar direcciones (Nuevas primero) ---
                const sortedAddresses = res.data.sort((a, b) => b.direccionId - a.direccionId);
                setMisDirecciones(sortedAddresses);
            }).catch(console.error);
        }
        if (activeTab === 'orders' && user) {
            pedidosAPI.getAll().then((res) => {
                const pedidosMios = res.data.filter(p => p.usuario?.correoElectronico === user.correoElectronico)
                                            .sort((a,b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
                setMisPedidos(pedidosMios);
            }).catch(console.error);
        }
        if (activeTab === 'returns' && user) {
            devolucionesAPI.getAll().then(res => {
                const misDevs = res.data.filter(d => d.usuarioCreaId === user.usuarioId)
                                        .sort((a,b) => new Date(b.fechaDevolucion) - new Date(a.fechaDevolucion));
                setMisDevoluciones(misDevs);
            }).catch(console.error);
        }
    }, [activeTab, user]);

    if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando perfil...</div>;

    // --- HELPERS VISUALES ---
    const getStatusStyle = (estadoId) => {
        if (estadoId === 1) return { label: 'PENDIENTE', color: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-200' };
        if (estadoId === 2) return { label: 'PROCESANDO', color: 'bg-blue-100 text-blue-800', border: 'border-blue-200' };
        if (estadoId === 3) return { label: 'ENVIADO', color: 'bg-indigo-100 text-indigo-800', border: 'border-indigo-200' };
        if (estadoId === 4) return { label: 'ENTREGADO', color: 'bg-green-100 text-green-800', border: 'border-green-200' };
        if (estadoId === 5) return { label: 'CANCELADO', color: 'bg-red-100 text-red-800', border: 'border-red-200' };
        return { label: 'DESCONOCIDO', color: 'bg-gray-100 text-gray-800', border: 'border-gray-200' };
    };

    const paginatedAddresses = misDirecciones.slice((addressPage - 1) * ITEMS_PER_PAGE, addressPage * ITEMS_PER_PAGE);
    const paginatedOrders = misPedidos.slice((orderPage - 1) * ITEMS_PER_PAGE, orderPage * ITEMS_PER_PAGE);
    const paginatedReturns = misDevoluciones.slice((returnPage - 1) * ITEMS_PER_PAGE, returnPage * ITEMS_PER_PAGE);

    // --- ACCIONES ---
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            if (usersAPI && usersAPI.update) {
                await usersAPI.update(user.usuarioId, profileForm);
                alert("¡Datos actualizados correctamente!");
            } else {
                alert("Error técnico: API no configurada.");
            }
        } catch (error) {
            console.error(error);
            alert("Error al actualizar perfil");
        }
    };

    const handleDeleteAddress = async (id) => {
        if (window.confirm('¿Eliminar dirección?')) {
            await direccionesAPI.delete(id);
            setMisDirecciones(misDirecciones.filter(dir => dir.direccionId !== id));
        }
    };
    const startEdit = (dir) => {
        setEditingAddress(dir.direccionId);
        setFormData({ callePrincipal: dir.callePrincipal, avenida: dir.avenida||'', ciudad: dir.ciudad, provincia: dir.provincia, pais: dir.pais });
    };
    const cancelEdit = () => {
        setEditingAddress(null);
        setFormData({});
    };
    const handleUpdateAddress = async (e) => {
        e.preventDefault();
        await direccionesAPI.update(editingAddress, { usuarioId: user.usuarioId, ...formData });
        const updated = misDirecciones.map(d => d.direccionId === editingAddress ? { ...d, ...formData } : d);
        
        // Reordenar también después de editar para mantener el orden correcto
        setMisDirecciones(updated.sort((a, b) => b.direccionId - a.direccionId));
        setEditingAddress(null);
    };

    const openReturnModal = (pedido, item) => {
        if (!pedido.factura) { alert("Este pedido no tiene factura generada."); return; }
        setReturnItemData({ pedido, detalle: item });
        setReturnForm({ causa: '', comentario: '' }); 
        setInvoiceFile(null); 
        setShowReturnModal(true);
    };
    const closeReturnModal = () => { setShowReturnModal(false); setReturnItemData(null); };
    const handleFileChange = (e) => { if (e.target.files?.[0]) setInvoiceFile(e.target.files[0]); };

    const submitReturn = async (e) => {
        e.preventDefault();
        if (!returnForm.causa) return alert("Selecciona una causa");
        
        try {
            const archivoInfo = invoiceFile ? ` (Archivo: ${invoiceFile.name})` : '';
            const motivoFinal = `[${returnForm.causa}] - ${returnForm.comentario}${archivoInfo}`;
            const idFactura = returnItemData.pedido?.factura?.facturaId; 
            
            await devolucionesAPI.create({
                facturaId: Number(idFactura), 
                varianteId: Number(returnItemData.detalle.variante?.varianteId || returnItemData.detalle.varianteId),
                motivo: motivoFinal,
                estadoId: 1, 
                usuarioCreaId: user.usuarioId
            });
            alert("Solicitud enviada");
            setShowReturnModal(false);
            setActiveTab('returns');
            const res = await devolucionesAPI.getAll();
            setMisDevoluciones(res.data.filter(d => d.usuarioCreaId === user.usuarioId));
        } catch (error) { alert("Error: " + error.message); }
    };

    return (
        <div className='min-h-screen bg-gray-50 py-10 px-4'>
            <div className='max-w-6xl mx-auto'>
                {/* HEADER PERFIL */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {user.nombre?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">{user.nombre} {user.apellido}</h1>
                        <p className="text-gray-500">{user.correoElectronico}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-cyan-50 text-cyan-700 text-xs font-bold rounded-full">CLIENTE</span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* MENÚ LATERAL */}
                    <div className="lg:w-64 flex-shrink-0">
                        <nav className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 space-y-1 sticky top-8">
                            {[
                                { id: 'profile', label: 'Datos Personales', icon: HiUser },
                                { id: 'orders', label: 'Mis Pedidos', icon: HiShoppingBag },
                                { id: 'addresses', label: 'Direcciones', icon: HiLocationMarker },
                                { id: 'returns', label: 'Devoluciones', icon: HiRefresh },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left ${
                                        activeTab === tab.id 
                                        ? 'bg-cyan-50 text-cyan-700 shadow-sm ring-1 ring-cyan-200' 
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <tab.icon className={`text-xl ${activeTab === tab.id ? 'text-cyan-600' : 'text-gray-400'}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* CONTENIDO PRINCIPAL */}
                    <div className="flex-1">
                        {/* DATOS PERSONALES */}
                        {activeTab === 'profile' && (
                            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in'>
                                <div className="flex justify-between items-center mb-6 border-b pb-4">
                                    <h2 className='text-xl font-bold text-gray-800'>Editar Información</h2>
                                    <HiPencil className="text-gray-400"/>
                                </div>
                                <form onSubmit={handleProfileUpdate}>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                        <div><label className='text-sm font-bold text-gray-700 mb-2 block'>Nombre</label><input type='text' value={profileForm.nombre} onChange={e=>setProfileForm({...profileForm, nombre:e.target.value})} className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all' /></div>
                                        <div><label className='text-sm font-bold text-gray-700 mb-2 block'>Apellido</label><input type='text' value={profileForm.apellido} onChange={e=>setProfileForm({...profileForm, apellido:e.target.value})} className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all' /></div>
                                        <div className="md:col-span-2"><label className='text-sm font-bold text-gray-700 mb-2 block'>Correo Electrónico</label><input type='email' defaultValue={user.correoElectronico} disabled className='w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed' /></div>
                                        <div className="md:col-span-2"><label className='text-sm font-bold text-gray-700 mb-2 block'>Teléfono</label><input type='tel' value={profileForm.telefono} onChange={e=>setProfileForm({...profileForm, telefono:e.target.value})} className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all' placeholder="Ej: 0999999999"/></div>
                                    </div>
                                    <div className="mt-8 flex justify-end"><button type="submit" className='bg-cyan-600 text-white px-8 py-3 rounded-xl hover:bg-cyan-700 font-bold shadow-lg shadow-cyan-100 transition-transform active:scale-95'>Guardar Cambios</button></div>
                                </form>
                            </div>
                        )}

                        {/* MIS PEDIDOS */}
                        {activeTab === 'orders' && (
                            <div className="animate-fade-in">
                                <div className="flex justify-between items-center mb-6"><h2 className='text-xl font-bold text-gray-800'>Historial de Pedidos</h2><span className="text-xs font-bold bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full">{misPedidos.length} Compras</span></div>
                                {paginatedOrders.length === 0 ? <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200"><HiShoppingBag className="mx-auto text-5xl text-gray-300 mb-4"/><h3 className="text-lg font-bold text-gray-900">Tu historial está vacío</h3></div> : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {paginatedOrders.map(pedido => {
                                            const status = getStatusStyle(pedido.estadoId);
                                            const primerDetalle = pedido.detalles?.[0];
                                            const imagenProducto = primerDetalle?.variante?.producto?.imagen;
                                            return (
                                                <div key={pedido.pedidoId} className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all`}>
                                                    <div className="h-40 bg-gray-100 relative overflow-hidden border-b border-gray-100">
                                                        {imagenProducto ? <img src={imagenProducto} className="w-full h-full object-cover" alt=""/> : <div className="flex h-full items-center justify-center text-gray-300"><HiShoppingBag size={40}/></div>}
                                                        <div className="absolute top-2 right-2"><span className={`px-2 py-1 text-[10px] font-bold rounded-md border shadow-sm uppercase ${status.color} ${status.border} bg-opacity-90`}>{status.label}</span></div>
                                                    </div>
                                                    <div className="p-5">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div><h3 className='font-bold text-gray-800 text-lg'>Pedido #{pedido.pedidoId}</h3><p className='text-xs text-gray-500 font-mono'>{new Date(pedido.fechaCreacion).toLocaleDateString()}</p></div>
                                                            <p className='text-cyan-600 font-bold text-xl'>${Number(pedido.contenidoTotal).toFixed(2)}</p>
                                                        </div>
                                                        <div className="space-y-2 mb-4 border-t border-gray-100 pt-3">
                                                            {pedido.detalles?.slice(0, 2).map((det, idx) => (
                                                                <div key={idx} className="flex justify-between text-sm"><span className="text-gray-600 truncate max-w-[70%]">{det.variante?.producto?.nombre}</span><span className="font-semibold text-gray-800">x{det.cantidad}</span></div>
                                                            ))}
                                                        </div>
                                                        {pedido.factura && (
                                                            <div className='flex gap-2 pt-2 border-t border-gray-100'><button onClick={() => openReturnModal(pedido, pedido.detalles[0])} className='flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors'><HiReply size={16} /> Devolver</button></div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <Pagination totalItems={misPedidos.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={orderPage} onPageChange={setOrderPage} />
                            </div>
                        )}

                        {/* DIRECCIONES */}
                        {activeTab === 'addresses' && (
                            <div className="space-y-4 animate-fade-in">
                                <h2 className='text-xl font-bold text-gray-800 mb-6'>Mis Direcciones</h2>
                                {paginatedAddresses.length === 0 ? <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200"><HiLocationMarker className="mx-auto text-4xl text-gray-300 mb-2"/><p className="text-gray-500">No hay direcciones guardadas</p></div> : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {paginatedAddresses.map((dir) => (
                                            <div key={dir.direccionId} className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all relative group'>
                                                {editingAddress === dir.direccionId ? (
                                                    <form onSubmit={handleUpdateAddress} className="space-y-4">
                                                        <div className="flex justify-between items-center"><h3 className="font-bold text-cyan-600">Editando...</h3><button type="button" onClick={cancelEdit}><HiX/></button></div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <input className="w-full px-3 py-2 border rounded-lg" placeholder="Calle Principal" value={formData.callePrincipal} onChange={e => setFormData({...formData, callePrincipal: e.target.value})} />
                                                            <input className="w-full px-3 py-2 border rounded-lg" placeholder="Avenida" value={formData.avenida} onChange={e => setFormData({...formData, avenida: e.target.value})} />
                                                            <input className="w-full px-3 py-2 border rounded-lg" placeholder="Ciudad" value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} />
                                                            <input className="w-full px-3 py-2 border rounded-lg" placeholder="Provincia" value={formData.provincia} onChange={e => setFormData({...formData, provincia: e.target.value})} />
                                                        </div>
                                                        <div className="flex justify-end gap-2"><button type="button" onClick={cancelEdit} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancelar</button><button type="submit" className="px-4 py-2 text-sm bg-cyan-600 text-white rounded-lg">Guardar</button></div>
                                                    </form>
                                                ) : (
                                                    <>
                                                        <div className="pr-12"><p className='font-bold text-lg text-gray-800'>{dir.callePrincipal}</p><p className='text-gray-600'>{dir.avenida ? `${dir.avenida}, ` : ''}{dir.ciudad}, {dir.provincia}</p><p className='text-xs text-gray-400 mt-2 font-bold uppercase tracking-wide flex items-center gap-1'><HiLocationMarker/> {dir.pais}</p></div>
                                                        <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => startEdit(dir)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"><HiPencil size={18}/></button><button onClick={() => handleDeleteAddress(dir.direccionId)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><HiTrash size={18}/></button></div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Pagination totalItems={misDirecciones.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={addressPage} onPageChange={setAddressPage} />
                            </div>
                        )}

                        {/* DEVOLUCIONES */}
                        {activeTab === 'returns' && (
                            <div className="space-y-4 animate-fade-in">
                                <h2 className='text-xl font-bold text-gray-800 mb-6'>Historial de Devoluciones</h2>
                                {paginatedReturns.length === 0 ? <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200"><HiRefresh className="mx-auto text-4xl text-gray-300 mb-2"/><p className="text-gray-500">No hay devoluciones activas</p></div> : (
                                    <>
                                        {paginatedReturns.map(dev => (
                                            <div key={dev.devolucionId} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-5 items-start hover:shadow-md transition-shadow">
                                                <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200"><img src={dev.variante?.producto?.imagen || '/placeholder.png'} alt="" className="w-full h-full object-cover" /></div>
                                                <div className="flex-1 w-full">
                                                    <div className="flex justify-between items-start mb-2"><div><h3 className="font-bold text-gray-900 text-lg">{dev.variante?.producto?.nombre}</h3><p className="text-xs text-gray-500 font-mono mt-1">Solicitud #{dev.devolucionId}</p></div><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${dev.estadoId === 1 ? 'bg-yellow-100 text-yellow-800' : dev.estadoId === 2 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{dev.estadoId === 1 ? 'Pendiente' : dev.estadoId === 2 ? 'Aprobada' : 'Rechazada'}</span></div>
                                                    <div className="mt-3 bg-gray-50 p-3 rounded-xl text-sm text-gray-700 border border-gray-100"><span className="font-semibold block mb-1 text-xs text-gray-400 uppercase">Motivo:</span>{dev.motivo}</div>
                                                </div>
                                            </div>
                                        ))}
                                        <Pagination totalItems={misDevoluciones.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={returnPage} onPageChange={setReturnPage} />
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL DE DEVOLUCIÓN */}
            {showReturnModal && returnItemData && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center p-4 z-50 transition-all">
                    <div className="bg-white rounded-2xl max-w-md w-full p-0 shadow-2xl animate-fade-in overflow-hidden transform scale-100">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center"><h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><HiExclamationCircle className="text-cyan-600"/> Solicitar Devolución</h3><button onClick={closeReturnModal} className="text-gray-400 hover:text-red-500 transition-colors"><HiX size={24}/></button></div>
                        <form onSubmit={submitReturn} className="p-6">
                            <div className="mb-4 bg-blue-50 p-3 rounded-lg text-sm text-blue-800 border border-blue-100"><strong>Producto:</strong> {returnItemData.variante?.producto?.nombre}</div>
                            <div className="mb-4"><label className="block text-sm font-bold mb-2">Motivo</label><select className="w-full border rounded-lg px-3 py-2" value={returnForm.causa} onChange={(e) => setReturnForm({...returnForm, causa: e.target.value})} required><option value="">Selecciona...</option><option value="Defectuoso">Defectuoso</option><option value="Arrepentimiento">Arrepentimiento</option></select></div>
                            <div className="mb-4"><label className="block text-sm font-bold mb-2">Detalles</label><textarea className="w-full border rounded-lg px-3 py-2 h-24 resize-none" value={returnForm.comentario} onChange={(e) => setReturnForm({...returnForm, comentario: e.target.value})} required></textarea></div>
                            <div className="mb-6"><label className="block text-sm font-bold mb-2">Evidenciar Factura</label><input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100" onChange={handleFileChange}/></div>
                            <div className="flex gap-3"><button type="button" onClick={closeReturnModal} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button><button type="submit" className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-bold">Enviar</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};