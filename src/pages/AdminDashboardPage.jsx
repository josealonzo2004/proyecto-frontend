import { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { useOrders } from '../context/OrdersContext';
import { useUsers } from '../context/UsersContext';
import { devolucionesAPI, pedidosAPI } from "../services/api"; 

// ICONOS
import { 
  HiOutlineChartBar, HiOutlineShoppingBag, HiOutlineUsers, HiOutlineCube,
  HiCheck, HiX, HiFilter, HiPrinter, HiDocumentText, 
  HiSearch, HiChevronLeft, HiChevronRight, HiPlus,
  HiEye, HiTrash, HiPencil, HiSave,
  HiCheckCircle, HiExclamationCircle,
  HiClipboardList, HiDownload, HiRefresh 
} from 'react-icons/hi';

import { ProductForm } from '../components/admin/ProductForm';

// --- COMPONENTE PAGINACIÓN ---
const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-b-lg">
            <div className="flex flex-1 justify-between sm:hidden">
                <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Anterior</button>
                <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Siguiente</button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <p className="text-sm text-gray-700">Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> de <span className="font-medium">{totalItems}</span> resultados</p>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                    <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50"><HiChevronLeft className="h-5 w-5" /></button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button key={i + 1} onClick={() => onPageChange(i + 1)} className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === i + 1 ? 'z-10 bg-cyan-600 text-white focus:outline-none' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}`}>{i + 1}</button>
                    ))}
                    <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50"><HiChevronRight className="h-5 w-5" /></button>
                </nav>
            </div>
        </div>
    );
};

export const AdminDashboardPage = () => {
  const { isAdmin } = useAuth();
  const { products, deleteProduct, updateProduct, addProduct, fetchProducts } = useProducts();
  const { orders, fetchOrders, updateOrderStatus } = useOrders(); 
  const { users = [], fetchUsers, createUser, updateUser, deleteUser } = useUsers();
  
  // ESTADOS DE UI
  const [activeSection, setActiveSection] = useState('reports');
  const ITEMS_PER_PAGE = 8;
  const [lastUpdate, setLastUpdate] = useState(new Date()); 
  
  // Estados para filtros y modales
  const [productSearch, setProductSearch] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [orderSearch, setOrderSearch] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [returnsList, setReturnsList] = useState([]);
  const [returnFilter, setReturnFilter] = useState('pending');
  const [returnPage, setReturnPage] = useState(1);

  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userForm, setUserForm] = useState({ nombre: '', apellido: '', correoElectronico: '', telefono: '', contrasenaFriada: '', rolId: 1 });
  const [editingUserId, setEditingUserId] = useState(null);

  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);

  // --- AUTO-REFRESCO (POLLING) ---
  useEffect(() => {
      const intervalId = setInterval(() => {
          if (fetchProducts) fetchProducts();
          if (fetchOrders) fetchOrders();
          if (activeSection === 'returns') fetchReturns();
          setLastUpdate(new Date());
      }, 5000); 

      return () => clearInterval(intervalId); 
  }, [fetchProducts, fetchOrders, activeSection]);

  const handleManualRefresh = () => {
      if (fetchProducts) fetchProducts();
      if (fetchOrders) fetchOrders();
      if (fetchUsers) fetchUsers();
      if (activeSection === 'returns') fetchReturns();
      showToast('Datos actualizados', 'success');
      setLastUpdate(new Date());
  };
  // ---------------------------------

  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
      setNotification({ show: true, message, type });
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  const handleExport = (type) => {
      let dataToExport = [];
      let filename = `reporte_${type}_${new Date().toISOString().slice(0,10)}`;

      if (type === 'pedidos') {
          dataToExport = orders.map(o => ({
              ID: o.pedidoId,
              Fecha: new Date(o.fechaCreacion).toLocaleDateString(),
              Cliente: `${o.usuario?.nombre || 'N/A'} ${o.usuario?.apellido || ''}`,
              Total: o.contenidoTotal,
              Estado: o.estadoId === 1 ? 'Pendiente' : o.estadoId === 2 ? 'Procesando' : 'Otro'
          }));
      } else if (type === 'usuarios') {
          dataToExport = users.map(u => ({
              ID: u.usuarioId,
              Nombre: u.nombre,
              Email: u.correoElectronico,
              Rol: u.rolId === 2 ? 'ADMIN' : 'CLIENTE'
          }));
      } else if (type === 'devoluciones') {
          dataToExport = returnsList.map(r => ({
              ID: r.devolucionId,
              Motivo: r.motivo,
              Estado: r.estadoId === 1 ? 'PENDIENTE' : 'PROCESADO'
          }));
      }

      if (dataToExport.length === 0) return showToast(`No hay datos de ${type} para exportar`, 'error');

      const headers = Object.keys(dataToExport[0]);
      const csvContent = [
          headers.join(','), 
          ...dataToExport.map(row => headers.map(fieldName => JSON.stringify(row[fieldName], (key, value) => value === null ? '' : value)).join(','))
      ].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();
      showToast(`Reporte de ${type} exportado exitosamente`, 'success');
  };

  const reportData = useMemo(() => {
      if (!orders || !returnsList) return null;
      const totalRevenue = orders.reduce((acc, o) => acc + Number(o.contenidoTotal || 0), 0);
      const statusCounts = { pendiente: 0, procesando: 0, enviado: 0, entregado: 0, cancelado: 0 };
      orders.forEach(o => {
          if (o.estadoId === 1) statusCounts.pendiente++;
          else if (o.estadoId === 2) statusCounts.procesando++;
          else if (o.estadoId === 3) statusCounts.enviado++;
          else if (o.estadoId === 4) statusCounts.entregado++;
          else if (o.estadoId === 5) statusCounts.cancelado++;
      });
      const productSales = {};
      orders.forEach(o => {
          if (o.estadoId !== 5 && o.detalles) {
              o.detalles.forEach(d => {
                  const pName = d.variante?.producto?.nombre || 'Desconocido';
                  const qty = Number(d.cantidad);
                  const total = Number(d.precio) * qty;
                  if (!productSales[pName]) productSales[pName] = { quantity: 0, revenue: 0 };
                  productSales[pName].quantity += qty;
                  productSales[pName].revenue += total;
              });
          }
      });
      const topProducts = Object.entries(productSales).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
      const totalReturns = returnsList.length;
      const pendingReturns = returnsList.filter(r => r.estadoId === 1).length;
      return { totalRevenue, statusCounts, topProducts, totalReturns, pendingReturns };
  }, [orders, returnsList]);

  useEffect(() => {
      if (activeSection === 'returns' || activeSection === 'reports') fetchReturns();
      if (users.length === 0) fetchUsers();
  }, [activeSection]);

  const fetchReturns = async () => {
      try {
        const res = await devolucionesAPI.getAll();
        setReturnsList(res.data);
    } catch (error) { console.error(error); }
  };

  // Handlers
  const handleToggleProductStatus = async (product) => {
      if (!updateProduct) return;
      try {
          const newStatus = product.activo === undefined ? false : !product.activo;
          await updateProduct(product.productoId, { activo: newStatus });
          if (fetchProducts) fetchProducts();
      } catch (error) { showToast("Error al cambiar estado", 'error'); }
  };
  const getStockStatus = (stock) => {
      if (stock === 0) return { label: 'AGOTADO', color: 'bg-red-100 text-red-800', border: 'border-red-200' };
      if (stock < 5) return { label: 'BAJO STOCK', color: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-200' };
      return { label: 'DISPONIBLE', color: 'bg-green-100 text-green-800', border: 'border-green-200' };
  };
  const handleOrderStatusChange = async (orderId, newStatus) => {
      try { 
          await updateOrderStatus(orderId, Number(newStatus)); 
          if(fetchOrders) fetchOrders(); 
          showToast("Estado actualizado", 'success'); 
      } 
      catch (error) { showToast("Error al actualizar", 'error'); }
  };
  const handleDeleteOrder = async (orderId) => {
      if(!confirm("¿Eliminar pedido permanentemente?")) return;
      try {
          await pedidosAPI.delete(orderId);
          if(fetchOrders) await fetchOrders();
          setShowOrderDetails(false);
          showToast("Pedido eliminado", 'success');
      } catch (error) { showToast("Error al eliminar", 'error'); }
  };
  const handleOpenOrderDetails = (order) => { setSelectedOrder(order); setShowOrderDetails(true); };
  const handleOpenInvoice = (order) => {
      if (!order?.factura) return showToast("Sin factura generada", 'error');
      setSelectedOrderForInvoice(order);
      setShowInvoice(true);
  };
  const handleOpenInvoiceFromReturn = (devolucion) => {
      const facturaId = devolucion.factura?.facturaId || devolucion.facturaId;
      const order = orders.find(o => (o.factura?.facturaId === facturaId) || (o.facturaId === facturaId));
      if (order) handleOpenInvoice(order);
      else showToast("Factura no encontrada", 'error');
  };
  const handleReturnAction = async (id, nuevoEstadoId) => {
    if(!confirm(`¿Confirmar acción?`)) return;
    try {
        await devolucionesAPI.update(id, { estadoId: nuevoEstadoId });
        fetchReturns(); 
        showToast("Devolución actualizada", 'success');
    } catch (error) { showToast("Error al procesar", 'error'); }
  };

  // --- CORRECCIÓN AQUÍ: handleUserSubmit ---
  const handleUserSubmit = async (e) => { 
      e.preventDefault();
      try {
        // 1. Copiamos el formulario
        const payload = { ...userForm };

        // 2. ELIMINAMOS PROPIEDADES QUE EL BACKEND NO ACEPTA
        delete payload.usuarioId;
        delete payload.fechaCreacion;
        delete payload.fechaActualizacion;
        delete payload.rol;      // El objeto rol completo no se debe enviar
        delete payload.pedidos;  // Relaciones no se envían
        delete payload.direcciones;

        // 3. Limpieza de contraseña vacía
        if (!payload.contrasenaFriada) {
            delete payload.contrasenaFriada;
        }

        // 4. Enviar datos limpios
        if (editingUserId) {
            await updateUser(editingUserId, payload);
        } else {
            await createUser(userForm);
        }

        setUserForm({ nombre: '', apellido: '', correoElectronico: '', telefono: '', contrasenaFriada: '', rolId: 1 });
        setEditingUserId(null);
        await fetchUsers();
        showToast('Usuario guardado exitosamente', 'success');
      } catch (err) { 
          // Manejo de errores más amigable
          const errorMsg = err.response?.data?.message 
            ? (Array.isArray(err.response.data.message) ? err.response.data.message.join(', ') : err.response.data.message)
            : err.message;
          showToast(errorMsg, 'error'); 
      }
  };
  // -----------------------------------------

  // Filtros
  const filteredProducts = (products || []).filter(p => p.nombre.toLowerCase().includes(productSearch.toLowerCase()));
  const paginatedProducts = filteredProducts.slice((productPage - 1) * ITEMS_PER_PAGE, productPage * ITEMS_PER_PAGE);
  const filteredOrders = (orders || []).filter(o => o.pedidoId.toString().includes(orderSearch) || `${o.usuario?.nombre} ${o.usuario?.apellido}`.toLowerCase().includes(orderSearch.toLowerCase())).sort((a,b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
  const paginatedOrders = filteredOrders.slice((orderPage - 1) * ITEMS_PER_PAGE, orderPage * ITEMS_PER_PAGE);
  const filteredReturns = returnsList.filter(dev => returnFilter === 'pending' ? dev.estadoId === 1 : dev.estadoId !== 1);
  const paginatedReturns = filteredReturns.slice((returnPage - 1) * ITEMS_PER_PAGE, returnPage * ITEMS_PER_PAGE);
  const filteredUsers = users.filter(u => `${u.nombre} ${u.apellido} ${u.correoElectronico}`.toLowerCase().includes(userSearch.toLowerCase()));
  const paginatedUsers = filteredUsers.slice((userPage - 1) * ITEMS_PER_PAGE, userPage * ITEMS_PER_PAGE);

  if (!isAdmin) return <div className='flex h-screen items-center justify-center text-red-600 font-bold'>Acceso Denegado</div>;

  return (
    <div className='max-w-7xl mx-auto px-4 py-8 min-h-screen bg-gray-50 relative'>
      
      {notification.show && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in transition-all transform duration-300 ${notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
              {notification.type === 'error' ? <HiExclamationCircle size={24} /> : <HiCheckCircle size={24} />}
              <div><p className="font-bold">{notification.type === 'error' ? 'Atención' : 'Éxito'}</p><p className="text-sm">{notification.message}</p></div>
          </div>
      )}

      {/* HEADER + BOTÓN REFRESCAR */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 print:hidden">
          <div className="flex items-center gap-4">
              <h1 className='text-3xl font-bold text-gray-800 tracking-tight'>Panel de Administración</h1>
              <button 
                  onClick={handleManualRefresh} 
                  title="Actualizar datos ahora"
                  className="p-2 bg-white text-gray-500 rounded-full hover:bg-gray-100 hover:text-cyan-600 transition-all shadow-sm border border-gray-200"
              >
                  <HiRefresh className={`w-5 h-5 ${false ? 'animate-spin' : ''}`} />
              </button>
          </div>
          
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200 overflow-x-auto">
             {['reports', 'products', 'orders', 'returns', 'users'].map(sec => (
                <button key={sec} onClick={() => setActiveSection(sec)} className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeSection === sec ? 'bg-cyan-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                    {sec === 'returns' ? 'Devoluciones' : sec === 'users' ? 'Usuarios' : sec === 'orders' ? 'Pedidos' : sec === 'products' ? 'Productos' : 'Reportes'}
                </button>
            ))}
          </div>
      </div>

      {/* 1. REPORTES */}
      {activeSection === 'reports' && reportData && (
        <div className='animate-fade-in space-y-8'>
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div><h2 className="text-2xl font-bold text-gray-800">Resumen General</h2><p className="text-gray-500 text-sm mt-1">Reportes y métricas de rendimiento (Actualizado: {lastUpdate.toLocaleTimeString()})</p></div>
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors print:hidden"><HiDownload size={20} /> Guardar PDF</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><div className="flex items-center gap-4"><div className="p-3 bg-green-100 text-green-700 rounded-full"><HiOutlineChartBar size={24}/></div><div><p className="text-sm font-medium text-gray-500">Ingresos Totales</p><p className="text-2xl font-bold text-gray-900">${reportData.totalRevenue.toLocaleString()}</p></div></div></div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><div className="flex items-center gap-4"><div className="p-3 bg-blue-100 text-blue-700 rounded-full"><HiClipboardList size={24}/></div><div><p className="text-sm font-medium text-gray-500">Total Pedidos</p><p className="text-2xl font-bold text-gray-900">{orders.length}</p></div></div></div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><div className="flex items-center gap-4"><div className="p-3 bg-red-100 text-red-700 rounded-full"><HiFilter size={24}/></div><div><p className="text-sm font-medium text-gray-500">Tasa de Devolución</p><p className="text-2xl font-bold text-gray-900">{orders.length > 0 ? ((reportData.totalReturns / orders.length) * 100).toFixed(1) : 0}%</p></div></div></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h3 className="font-bold text-gray-800 text-lg mb-6">Productos Más Vendidos</h3><div className="space-y-4">{reportData.topProducts.map((p, i) => (<div key={i} className="relative"><div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-700">{p.name}</span><span className="font-bold text-gray-900">{p.quantity} unds.</span></div><div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-cyan-600 h-2.5 rounded-full" style={{ width: `${(p.quantity / (reportData.topProducts[0]?.quantity || 1)) * 100}%` }}></div></div></div>))}</div></div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h3 className="font-bold text-gray-800 text-lg mb-6">Estado de Pedidos</h3><div className="space-y-3">{[{ label: 'Entregados', count: reportData.statusCounts.entregado, color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' },{ label: 'Enviados', count: reportData.statusCounts.enviado, color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },{ label: 'Procesando', count: reportData.statusCounts.procesando, color: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50' },{ label: 'Pendientes', count: reportData.statusCounts.pendiente, color: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50' },{ label: 'Cancelados', count: reportData.statusCounts.cancelado, color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' }].map((status, i) => (<div key={i} className={`flex items-center p-3 rounded-lg ${status.bg}`}><div className={`w-3 h-3 rounded-full mr-3 ${status.color}`}></div><span className={`flex-1 font-medium ${status.text}`}>{status.label}</span><span className={`font-bold ${status.text}`}>{status.count}</span></div>))}</div></div>
            </div>
        </div>
      )}

      {/* 2. PRODUCTOS */}
      {activeSection === 'products' && (
        <div className="animate-fade-in">
          <div className='flex flex-col sm:flex-row justify-between items-center mb-6 gap-4'>
            <div className="relative w-full sm:w-96">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Buscar producto..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" value={productSearch} onChange={e => { setProductSearch(e.target.value); setProductPage(1); }} />
            </div>
            {/* BOTONES LIMPIOS */}
            <button onClick={() => { setEditingProduct(null); setShowProductForm(true); }} className='flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 shadow-sm font-medium'>
                <HiPlus /> Nuevo Producto
            </button>
          </div>

          {showProductForm && (<div className="mb-8 p-4 bg-white rounded-lg border border-cyan-100 shadow-sm"><ProductForm product={editingProduct} onClose={() => { setShowProductForm(false); setEditingProduct(null); }} /></div>)}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {paginatedProducts.map(p => {
                const status = getStockStatus(p.stock !== undefined ? p.stock : 10);
                const isActive = p.activo !== undefined ? p.activo : true;
                return (
                  <div key={p.productoId} className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group ${!isActive ? 'opacity-80' : ''}`}>
                    <div className="h-48 bg-gray-100 relative overflow-hidden">{p.imagen ? <img src={p.imagen} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${!isActive ? 'grayscale' : ''}`} alt=""/> : <div className="flex h-full items-center justify-center text-gray-400">Sin imagen</div>}<div className="absolute top-2 right-2 flex flex-col gap-1 items-end"><span className={`px-2 py-1 text-[10px] font-bold rounded-md border shadow-sm uppercase ${status.color} ${status.border} bg-opacity-90`}>{status.label}</span>{!isActive && <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-gray-800 text-white shadow-sm uppercase">BORRADOR</span>}</div></div>
                    <div className="p-4"><div className="flex justify-between items-start mb-2 gap-2"><h3 className='font-bold text-gray-800 truncate flex-1' title={p.nombre}>{p.nombre}</h3><label className="relative inline-flex items-center cursor-pointer shrink-0" title={isActive ? 'Desactivar' : 'Activar'}><input type="checkbox" className="sr-only peer" checked={isActive} onChange={() => handleToggleProductStatus(p)} /><div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div></label></div><p className='text-cyan-600 font-bold text-lg mb-3'>${Number(p.precio).toFixed(2)}</p><div className='flex gap-2 pt-3 border-t border-gray-100'><button onClick={() => { setEditingProduct(p); setShowProductForm(true); }} className='flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 transition-colors'><HiPencil /> Editar</button><button onClick={() => deleteProduct(p.productoId)} className='px-3 text-red-500 bg-red-50 rounded hover:bg-red-100 transition-colors'><HiTrash /></button></div></div>
                  </div>
                );
            })}
          </div>
          <Pagination totalItems={filteredProducts.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={productPage} onPageChange={setProductPage} />
        </div>
      )}

      {/* 3. PEDIDOS */}
      {activeSection === 'orders' && (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in'>
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center flex-wrap gap-4">
                <h2 className='font-bold text-gray-700 text-lg'>Gestión de Pedidos</h2>
                <div className="flex gap-3">
                    <div className="relative"><HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64 focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Buscar..." value={orderSearch} onChange={e => { setOrderSearch(e.target.value); setOrderPage(1); }} /></div>
                    <button onClick={() => handleExport('pedidos')} className='flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm text-sm font-medium'><HiDownload /> Exportar Tabla</button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 uppercase font-semibold border-b"><tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Cliente</th><th className="px-6 py-4">Total</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4 text-center">Acciones</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedOrders.map(order => (
                            <tr key={order.pedidoId} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">#{order.pedidoId}</td>
                                <td className="px-6 py-4"><div className="font-medium text-gray-900">{order.usuario?.nombre} {order.usuario?.apellido}</div><div className="text-xs text-gray-500">{order.usuario?.correoElectronico}</div></td>
                                <td className="px-6 py-4 font-mono font-bold text-gray-900">${Number(order.contenidoTotal).toFixed(2)}</td>
                                <td className="px-6 py-4"><select value={order.estadoId} onChange={(e) => handleOrderStatusChange(order.pedidoId, e.target.value)} className={`block w-full py-1 pl-2 pr-6 text-xs font-semibold rounded-full border-0 ring-1 ring-inset focus:ring-2 focus:ring-cyan-600 sm:text-sm sm:leading-6 cursor-pointer ${order.estadoId === 1 ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' : order.estadoId === 2 ? 'bg-blue-50 text-blue-700 ring-blue-600/20' : order.estadoId === 5 ? 'bg-red-50 text-red-700 ring-red-600/20' : 'bg-green-50 text-green-700 ring-green-600/20'}`}><option value={1}>Pendiente</option><option value={2}>Procesando</option><option value={3}>Enviado</option><option value={4}>Entregado</option><option value={5}>Cancelado</option></select></td>
                                <td className="px-6 py-4 text-center"><div className="flex justify-center gap-2"><button onClick={() => handleOpenOrderDetails(order)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"><HiEye size={18}/></button><button onClick={() => handleDeleteOrder(order.pedidoId)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"><HiTrash size={18}/></button></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination totalItems={filteredOrders.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={orderPage} onPageChange={setOrderPage} />
        </div>
      )}

      {/* 4. DEVOLUCIONES */}
      {activeSection === 'returns' && (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in'>
            <div className="flex justify-between items-center border-b border-gray-200 pr-4">
                <div className="flex flex-1">
                    {['pending', 'history'].map(filter => (
                        <button key={filter} onClick={() => { setReturnFilter(filter); setReturnPage(1); }} className={`px-6 py-4 text-sm font-medium transition-colors ${returnFilter === filter ? 'bg-white text-cyan-700 border-b-2 border-cyan-600' : 'bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>{filter === 'pending' ? `Pendientes (${returnsList.filter(r=>r.estadoId===1).length})` : 'Historial'}</button>
                    ))}
                </div>
                <button onClick={() => handleExport('devoluciones')} className='flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-200'><HiDownload /> Exportar</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 uppercase font-semibold"><tr><th className="px-6 py-4">Producto</th><th className="px-6 py-4">Cliente</th><th className="px-6 py-4">Detalles</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4 text-center">Acciones</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedReturns.map(dev => (
                            <tr key={dev.devolucionId} className="hover:bg-gray-50"><td className="px-6 py-4 flex items-center gap-4"><div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">{dev.variante?.producto?.imagen ? <img src={dev.variante?.producto?.imagen} className="w-full h-full object-cover" alt=""/> : <div className="w-full h-full bg-gray-200" />}</div><div><p className="font-bold text-gray-900">{dev.variante?.producto?.nombre}</p><p className="text-xs text-gray-500">Factura #{dev.factura?.facturaId}</p></div></td><td className="px-6 py-4"><div className="font-medium text-gray-900">{users.find(u=>u.usuarioId===dev.usuarioCreaId)?.nombre}</div></td><td className="px-6 py-4 max-w-xs"><p className="text-gray-900 truncate" title={dev.motivo}>{dev.motivo}</p></td><td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${dev.estadoId===1?'bg-yellow-100 text-yellow-800':dev.estadoId===2?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>{dev.estadoId===1?'PENDIENTE':dev.estadoId===2?'APROBADO':'RECHAZADO'}</span></td><td className="px-6 py-4 flex justify-center gap-2"><button onClick={() => handleOpenInvoiceFromReturn(dev)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><HiDocumentText size={18}/></button>{returnFilter === 'pending' && (<><button onClick={() => handleReturnAction(dev.devolucionId, 2)} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg"><HiCheck size={18}/></button><button onClick={() => handleReturnAction(dev.devolucionId, 3)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"><HiX size={18}/></button></>)}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination totalItems={filteredReturns.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={returnPage} onPageChange={setReturnPage} />
        </div>
      )}

      {/* 5. USUARIOS */}
      {activeSection === 'users' && (
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in'>
          <div className='xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
             <div className="p-6 border-b border-gray-100 flex justify-between items-center gap-4">
                 <h2 className='font-bold text-gray-800 text-lg'>Usuarios</h2>
                 <div className="flex gap-2">
                     <div className="relative w-full sm:w-48"><HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input className='w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none' placeholder='Buscar...' value={userSearch} onChange={e => {setUserSearch(e.target.value); setUserPage(1)}} /></div>
                     <button onClick={() => handleExport('usuarios')} className='p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm' title="Exportar a CSV"><HiDownload size={20}/></button>
                 </div>
             </div>
             <div className="overflow-x-auto"><table className='w-full text-sm text-left'><thead className="bg-gray-50 text-gray-600 uppercase font-semibold"><tr><th className="px-6 py-3">Usuario</th><th className="px-6 py-3">Rol</th><th className="px-6 py-3 text-right">Acción</th></tr></thead><tbody className="divide-y divide-gray-100">{paginatedUsers.map(u => (<tr key={u.usuarioId} className="hover:bg-gray-50"><td className="px-6 py-3"><div className="font-medium text-gray-900">{u.nombre} {u.apellido}</div><div className="text-xs text-gray-500">{u.correoElectronico}</div></td><td className="px-6 py-3"><span className={`px-2 py-1 rounded-md text-xs font-medium ${u.rolId === 2 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{u.rolId === 2 ? 'ADMINISTRADOR' : 'CLIENTE'}</span></td><td className="px-6 py-3 text-right"><button onClick={() => { setEditingUserId(u.usuarioId); setUserForm({...u, contrasenaFriada: '', rolId: u.rolId??1}); }} className="text-cyan-600 hover:text-cyan-800 font-medium mr-4">Editar</button><button onClick={() => { if(confirm('Eliminar?')) deleteUser(u.usuarioId) }} className="text-red-500 hover:text-red-700 font-medium">Borrar</button></td></tr>))}</tbody></table></div>
             <Pagination totalItems={filteredUsers.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={userPage} onPageChange={setUserPage} />
          </div>
          <div className='bg-white p-6 border border-gray-200 rounded-xl shadow-sm h-fit sticky top-6'>
            <h2 className='font-bold text-gray-800 text-lg mb-6'>{editingUserId?'Editar Usuario':'Crear Usuario'}</h2>
            <form onSubmit={handleUserSubmit} className="space-y-4">
                <input required className='w-full border rounded-lg px-3 py-2 text-sm' placeholder="Nombre" value={userForm.nombre} onChange={e=>setUserForm({...userForm, nombre:e.target.value})} />
                <input required className='w-full border rounded-lg px-3 py-2 text-sm' placeholder="Apellido" value={userForm.apellido} onChange={e=>setUserForm({...userForm, apellido:e.target.value})} />
                <input required type="email" className='w-full border rounded-lg px-3 py-2 text-sm' placeholder="Email" value={userForm.correoElectronico} onChange={e=>setUserForm({...userForm, correoElectronico:e.target.value})} />
                <input className='w-full border rounded-lg px-3 py-2 text-sm' placeholder="Teléfono" value={userForm.telefono} onChange={e=>setUserForm({...userForm, telefono:e.target.value})} />
                <input type="password" className='w-full border rounded-lg px-3 py-2 text-sm' placeholder="Contraseña" value={userForm.contrasenaFriada} onChange={e=>setUserForm({...userForm, contrasenaFriada:e.target.value})} />
                <select className='w-full border rounded-lg px-3 py-2 text-sm bg-white' value={userForm.rolId} onChange={e=>setUserForm({...userForm, rolId:Number(e.target.value)})}> <option value={1}>Cliente</option><option value={2}>Administrador</option></select>
                <div className="flex gap-3 pt-2"><button type="submit" className='flex-1 bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 font-medium'>Guardar</button>{editingUserId && <button type='button' onClick={() => { setEditingUserId(null); setUserForm({ nombre:'', apellido:'', correoElectronico:'', telefono:'', contrasenaFriada:'', rolId:1 }); }} className='px-4 border rounded-lg hover:bg-gray-50 text-gray-600'>Cancelar</button>}</div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODALES --- */}
      {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
                  <div className="flex justify-between items-center p-6 border-b border-gray-100">
                      <div><h3 className="text-xl font-bold text-gray-800">Pedido #{selectedOrder.pedidoId}</h3><p className="text-sm text-gray-500">{new Date(selectedOrder.fechaCreacion).toLocaleString()}</p></div>
                      <button onClick={() => setShowOrderDetails(false)} className="text-gray-400 hover:text-red-500 transition-colors"><HiX size={28}/></button>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg"><h4 className="font-bold text-gray-700 mb-2 uppercase text-xs tracking-wider">Cliente</h4><p className="font-medium text-lg">{selectedOrder.usuario?.nombre} {selectedOrder.usuario?.apellido}</p><p className="text-gray-600">{selectedOrder.usuario?.correoElectronico}</p></div>
                      <div className="bg-gray-50 p-4 rounded-lg"><h4 className="font-bold text-gray-700 mb-2 uppercase text-xs tracking-wider">Envío</h4><p className="text-gray-800 font-medium">{selectedOrder.transporte || "Estándar"}</p><p className="text-gray-600 text-sm mt-1">{selectedOrder.direccionEnvio || "Recogida en tienda"}</p></div>
                  </div>
                  <div className="px-6 py-2"><div className="border rounded-lg overflow-hidden"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-600 font-medium border-b"><tr><th className="px-4 py-3">Producto</th><th className="px-4 py-3 text-center">Cant.</th><th className="px-4 py-3 text-right">Precio</th><th className="px-4 py-3 text-right">Total</th></tr></thead><tbody className="divide-y divide-gray-100">{selectedOrder.detalles?.map((item, idx) => (<tr key={idx}><td className="px-4 py-3"><p className="font-medium text-gray-900">{item.variante?.producto?.nombre}</p><p className="text-xs text-gray-500">{item.variante?.nombre}</p></td><td className="px-4 py-3 text-center">{item.cantidad}</td><td className="px-4 py-3 text-right">${Number(item.precio).toFixed(2)}</td><td className="px-4 py-3 text-right font-bold text-gray-900">${(item.precio * item.cantidad).toFixed(2)}</td></tr>))}</tbody></table></div><div className="flex justify-end mt-4"><div className="text-right"><p className="text-sm text-gray-500">Total a Pagar</p><p className="text-2xl font-bold text-cyan-600">${Number(selectedOrder.contenidoTotal).toFixed(2)}</p></div></div></div>
                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl"><button onClick={() => handleDeleteOrder(selectedOrder.pedidoId)} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2 font-medium"><HiTrash /> Eliminar</button>{selectedOrder.factura ? (<button onClick={() => handleOpenInvoice(selectedOrder)} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black flex items-center gap-2 font-medium"><HiDocumentText /> Ver Factura</button>) : (<span className="px-4 py-2 text-gray-400 text-sm italic flex items-center">Sin factura</span>)}</div>
              </div>
          </div>
      )}

      {showInvoice && selectedOrderForInvoice && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
                <div className="flex justify-between items-center p-4 border-b bg-gray-50"><h3 className="font-bold text-lg text-gray-800">Factura #{selectedOrderForInvoice.factura?.facturaId}</h3><button onClick={() => setShowInvoice(false)} className="text-gray-400 hover:text-red-500 transition-colors"><HiX size={24}/></button></div>
                <div className="p-8 print:p-0" id="invoice-content"><div className="flex justify-between items-start mb-8 border-b pb-6"><div><h2 className="text-2xl font-black text-gray-800 tracking-tight">INNOVA ARTE</h2><p className="text-sm text-gray-500 mt-1">RUC: 0999999999001</p><p className="text-sm text-gray-500">Manta, Ecuador</p></div><div className="text-right"><p className="text-xs font-bold text-gray-400 tracking-wider uppercase">FECHA DE EMISIÓN</p><p className="text-lg font-mono text-gray-900">{new Date(selectedOrderForInvoice.fechaCreacion).toLocaleDateString()}</p></div></div><div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-100"><div className="grid grid-cols-2 gap-4"><div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Facturar a</p><p className="font-bold text-gray-800">{selectedOrderForInvoice.usuario?.nombre} {selectedOrderForInvoice.usuario?.apellido}</p><p className="text-sm text-gray-600">{selectedOrderForInvoice.usuario?.correoElectronico}</p></div><div className="text-right"><p className="text-xs font-bold text-gray-400 uppercase mb-1">Enviar a</p><p className="text-sm text-gray-600 max-w-xs ml-auto">{selectedOrderForInvoice.direccionEnvio || 'Dirección no registrada'}</p></div></div></div><table className="w-full text-sm mb-6"><thead><tr className="border-b-2 border-gray-100 text-gray-500 uppercase text-xs tracking-wider"><th className="text-left py-3">Descripción</th><th className="text-center py-3">Cant.</th><th className="text-right py-3">P. Unit</th><th className="text-right py-3">Importe</th></tr></thead><tbody className="divide-y divide-gray-50">{selectedOrderForInvoice.detalles?.map((item, i) => (<tr key={i}><td className="py-4"><p className="font-medium text-gray-900">{item.variante?.producto?.nombre}</p></td><td className="py-4 text-center text-gray-600">{item.cantidad}</td><td className="py-4 text-right text-gray-600">${Number(item.precio).toFixed(2)}</td><td className="py-4 text-right font-bold text-gray-900">${(item.precio * item.cantidad).toFixed(2)}</td></tr>))}</tbody></table><div className="flex justify-end border-t border-gray-100 pt-6"><div className="w-64 space-y-3"><div className="flex justify-between text-gray-500 text-sm"><span>Subtotal</span><span>${Number(selectedOrderForInvoice.factura?.subtotal || (selectedOrderForInvoice.contenidoTotal / 1.15)).toFixed(2)}</span></div><div className="flex justify-between text-gray-500 text-sm"><span>IVA (15%)</span><span>${Number(selectedOrderForInvoice.factura?.iva || (selectedOrderForInvoice.contenidoTotal - (selectedOrderForInvoice.contenidoTotal / 1.15))).toFixed(2)}</span></div><div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-3"><span>Total</span><span className="text-cyan-600">${Number(selectedOrderForInvoice.contenidoTotal).toFixed(2)}</span></div></div></div></div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-lg"><button onClick={() => setShowInvoice(false)} className="px-4 py-2 border bg-white rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors">Cerrar</button><button onClick={() => window.print()} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black flex items-center gap-2 font-medium transition-colors"><HiPrinter /> Imprimir Recibo</button></div>
            </div>
        </div>
      )}
    </div>
  );
};