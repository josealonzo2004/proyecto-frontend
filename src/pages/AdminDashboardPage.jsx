// src/pages/AdminDashboardPage.jsx
import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { useOrders } from '../context/OrdersContext';
import { useNavigate } from 'react-router-dom';
import { HiOutlineChartBar, HiOutlineShoppingBag, HiOutlineUsers } from 'react-icons/hi2';
import { HiX } from 'react-icons/hi';
import { ProductForm } from '../components/admin/ProductForm';
import { OrderCard } from '../components/admin/OrderCard';
import { useUsers } from '../context/UsersContext';

export const AdminDashboardPage = () => {
  const { isAdmin } = useAuth();
  const { products, deleteProduct } = useProducts();
  const { orders } = useOrders();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // USERS
  const { users = [], loadingUsers = false, fetchUsers, createUser, updateUser, deleteUser } = useUsers();

  // Form state para crear/editar usuario
  const [userForm, setUserForm] = useState({
    nombre: '',
    apellido: '',
    correoElectronico: '',
    telefono: '',
    contrasenaFriada: '',
    rolId: 1,
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [search, setSearch] = useState('');

  if (!isAdmin) {
    return (
      <div className='text-center py-12'>
        <p className='text-red-600 text-lg'>No tienes permisos para acceder a esta página</p>
      </div>
    );
  }

  // Estadísticas del dashboard

  const pendingOrders = (orders || []).filter(o => o.estado === 'pendiente');
  const totalRevenue = (orders || []).reduce((sum, order) => sum + (order.total || 0), 0);

  // Filtrar usuarios "normales" (no admins).
  // Aquí se asume rolId === 2 == admin. Si en tu DB el id es otro, cámbialo.
  //useMemo para evitar recalculos innecesarios cuando users no cambia
  const normalUsers = useMemo(() => {
    //retorna todos los usuarios que no son admin
    return (users || []).filter(u => u.rolId !== 2);
  }, [users]);

  const stats = [
    { label: 'Ventas totales', value: `$${totalRevenue.toLocaleString()}`, icon: HiOutlineChartBar },
    { label: 'Pedidos pendientes', value: pendingOrders.length.toString(), icon: HiOutlineShoppingBag },
    { label: 'Total pedidos', value: (orders || []).length.toString(), icon: HiOutlineShoppingBag },
    // Nueva tarjeta para usuarios normales
    { label: 'Usuarios', value: (normalUsers || []).length.toString(), icon: HiOutlineUsers },
  ];

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleCloseForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  // USUARIOS: filtrado cliente-side para la pestaña Users
  const q = search.trim().toLowerCase();
  const filteredUsers = users.filter(u => {
    if (!q) return true;
    return (`${u.nombre} ${u.apellido}`).toLowerCase().includes(q) ||
      (u.correoElectronico || '').toLowerCase().includes(q);
  });

  const startEditUser = (u) => {
    setEditingUserId(u.usuarioId);
    setUserForm({
      nombre: u.nombre || '',
      apellido: u.apellido || '',
      correoElectronico: u.correoElectronico || '',
      telefono: u.telefono || '',
      contrasenaFriada: '',
      rolId: u.rolId ?? 1,
    });
    setActiveSection('users');
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        const payload = { ...userForm };
        if (!payload.contrasenaFriada) delete payload.contrasenaFriada;
        await updateUser(editingUserId, payload);
        alert('Usuario actualizado');
        setEditingUserId(null);
      } else {
        await createUser(userForm);
        alert('Usuario creado');
      }
      setUserForm({ nombre: '', apellido: '', correoElectronico: '', telefono: '', contrasenaFriada: '', rolId: 1 });
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al guardar usuario');
    }
  };

  return (
    <div className='max-w-7xl mx-auto'>
      <h1 className='text-3xl font-bold mb-8'>Panel de administración</h1>

      {/* Tabs */}
      <div className='flex gap-2 mb-8 border-b overflow-x-auto'>
        <button onClick={() => setActiveSection('dashboard')} className={`pb-2 px-4 font-semibold whitespace-nowrap ${activeSection === 'dashboard' ? 'border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'}`}>Dashboard</button>
        <button onClick={() => setActiveSection('products')} className={`pb-2 px-4 font-semibold whitespace-nowrap ${activeSection === 'products' ? 'border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'}`}>Productos</button>
        <button onClick={() => setActiveSection('orders')} className={`pb-2 px-4 font-semibold whitespace-nowrap ${activeSection === 'orders' ? 'border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'}`}>Pedidos</button>
        <button onClick={() => setActiveSection('returns')} className={`pb-2 px-4 font-semibold whitespace-nowrap ${activeSection === 'returns' ? 'border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'}`}>Devoluciones</button>
        <button onClick={() => setActiveSection('users')} className={`pb-2 px-4 font-semibold whitespace-nowrap ${activeSection === 'users' ? 'border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'}`}>Usuarios</button>
      </div>

      {/* Contenido: Dashboard */}
      {activeSection === 'dashboard' && (
        <div className='space-y-6'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {stats.map((stat, index) => (
              <div key={index} className='bg-white rounded-lg p-6 border border-gray-200'>
                <div className='flex items-center justify-between mb-2'>
                  <stat.icon size={32} className='text-cyan-600' />
                </div>
                <p className='text-2xl font-bold'>{stat.value}</p>
                <p className='text-gray-600 text-sm'>{stat.label}</p>
              </div>
            ))}
          </div>

          {orders && orders.length > 0 && (
            <div className='bg-white rounded-lg p-6 border border-gray-200'>
              <h2 className='text-xl font-bold mb-4'>Pedidos recientes</h2>
              <div className='space-y-3'>
                {orders.slice(0, 3).map(order => (
                  <div key={order.id} className='flex justify-between items-center pb-3 border-b last:border-0'>
                    <div>
                      <p className='font-semibold'>Pedido #{order.id}</p>
                      <p className='text-sm text-gray-600'>Cliente: {order.cliente?.nombre || 'N/A'} {order.cliente?.apellido || ''}</p>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold'>${(order.total || 0).toLocaleString()}</p>
                      <p className={`text-sm ${order.estado === 'pendiente' ? 'text-yellow-600' :
                        order.estado === 'en proceso' ? 'text-blue-600' :
                          order.estado === 'enviado' ? 'text-purple-600' :
                            order.estado === 'entregado' ? 'text-green-600' :
                              'text-gray-600'}`}>{order.estado || 'pendiente'}</p>
                    </div>
                  </div>
                ))} 
              </div>
            </div>
          )}
        </div>
      )}

      {/* Productos */}
      {activeSection === 'products' && (
        <div>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-bold'>Gestión de productos</h2>
            <button onClick={() => setShowProductForm(true)} className='bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700'>+ Agregar producto</button>
          </div>

          {showProductForm && <div className='mb-6'><ProductForm product={editingProduct} onClose={handleCloseForm} /></div>}

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {(products || []).map(product => (
              <div key={product.productoId} className='bg-white rounded-lg border border-gray-200 p-4'>
                {product.imagen && <img src={product.imagen} alt={product.nombre} className='w-full h-48 object-cover rounded-lg mb-3' />}
                <h3 className='font-bold text-lg mb-2'>{product.nombre}</h3>
                <p className='text-gray-600 text-sm mb-2 line-clamp-2'>{product.descripcion}</p>
                <p className='text-cyan-600 font-bold mb-3'>${Number(product.precio).toLocaleString()}</p>
                <div className='flex gap-2'>
                  <button onClick={() => handleEditProduct(product)} className='flex-1 bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 text-sm'>Editar</button>
                  <button onClick={() => deleteProduct(product.productoId)} className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600'><HiX size={20} /></button>
                </div>
              </div>
            ))}
            {(!products || products.length === 0) && <div className='col-span-full text-center py-12 text-gray-500'>No hay productos. Agrega tu primer producto.</div>}
          </div>
        </div>
      )}

      {/* Pedidos */}
      {activeSection === 'orders' && (
        <div>
          <h2 className='text-xl font-bold mb-4'>Gestión de pedidos</h2>
          <div className='space-y-4'>
            {(!orders || orders.length === 0) ? <div className='text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200'>No hay pedidos aún</div> : (orders || []).map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        </div>
      )}

      {/* Devoluciones */}
      {activeSection === 'returns' && (
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h2 className='text-xl font-bold mb-4'>Solicitudes de devolución</h2>
          <div className='space-y-3'>
            {[1, 2].map(item => (
              <div key={item} className='p-4 bg-gray-50 rounded-lg'>
                <div className='flex justify-between items-start mb-2'>
                  <div><p className='font-semibold'>Devolución #RET00{item}</p><p className='text-sm text-gray-600'>Pedido: #1234{item}</p></div>
                  <span className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'>Pendiente</span>
                </div>
                <p className='text-gray-600 mb-2'>Razón: Producto con defecto</p>
                <div className='flex gap-2'>
                  <button className='px-4 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700'>Aprobar</button>
                  <button className='px-4 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700'>Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usuarios */}
      {activeSection === 'users' && (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Lista */}
          <div className='lg:col-span-2 bg-white rounded-lg p-6 border border-gray-200'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-bold'>Usuarios registrados</h2>
              <div className='flex gap-2'>
                <input className='border rounded px-3 py-2' placeholder='Buscar por nombre o correo' value={search} onChange={e => setSearch(e.target.value)} />
                <button className='px-3 py-2 border rounded' onClick={() => { setSearch(''); fetchUsers(); }}>Limpiar</button>
              </div>
            </div>

            {loadingUsers ? (
              <p className='text-gray-500'>Cargando usuarios...</p>
            ) : filteredUsers.length === 0 ? (
              <p className='text-gray-500'>No hay usuarios registrados.</p>
            ) : (
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-2'>ID</th>
                    <th className='text-left py-2'>Nombre</th>
                    <th className='text-left py-2'>Correo</th>
                    <th className='text-left py-2'>Rol</th>
                    <th className='text-right py-2'>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.usuarioId} className='border-b last:border-0'>
                      <td className='py-2'>{u.usuarioId}</td>
                      <td className='py-2'>{u.nombre} {u.apellido}</td>
                      <td className='py-2'>{u.correoElectronico}</td>
                      <td className='py-2'>{u.rolId === 2 ? 'ADMIN' : 'USER'}</td>
                      <td className='py-2 text-right'>
                        {/* aqui tenemos que arreglar despues con que ID se quedan los roles  */}
                        <button onClick={() => startEditUser(u)} className='px-3 py-1 mr-2 bg-blue-600 text-white rounded'>Editar</button>
                        <button onClick={() => { if (confirm('Eliminar usuario?')) deleteUser(u.usuarioId); }} className='px-3 py-1 bg-red-600 text-white rounded'>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Formulario crear/editar */}
          <div className='bg-white rounded-lg p-6 border border-gray-200'>
            <h2 className='text-xl font-bold mb-4'>{editingUserId ? 'Editar usuario' : 'Crear nuevo usuario'}</h2>

            <form className='space-y-4' onSubmit={handleUserSubmit}>
              <div>
                <label className='block text-sm font-semibold mb-1'>Nombre</label>
                <input required className='w-full border rounded-lg px-3 py-2' value={userForm.nombre} onChange={e => setUserForm({ ...userForm, nombre: e.target.value })} />
              </div>

              <div>
                <label className='block text-sm font-semibold mb-1'>Apellido</label>
                <input required className='w-full border rounded-lg px-3 py-2' value={userForm.apellido} onChange={e => setUserForm({ ...userForm, apellido: e.target.value })} />
              </div>

              <div>
                <label className='block text-sm font-semibold mb-1'>Correo electrónico</label>
                <input required type='email' className='w-full border rounded-lg px-3 py-2' value={userForm.correoElectronico} onChange={e => setUserForm({ ...userForm, correoElectronico: e.target.value })} />
              </div>

              <div>
                <label className='block text-sm font-semibold mb-1'>Teléfono</label>
                <input className='w-full border rounded-lg px-3 py-2' value={userForm.telefono} onChange={e => setUserForm({ ...userForm, telefono: e.target.value })} />
              </div>

              <div>
                <label className='block text-sm font-semibold mb-1'>Contraseña</label>
                <input type='password' className='w-full border rounded-lg px-3 py-2' value={userForm.contrasenaFriada} onChange={e => setUserForm({ ...userForm, contrasenaFriada: e.target.value })} placeholder={editingUserId ? 'Dejar vacío para no cambiar' : ''} />
              </div>

              <div>
                <label className='block text-sm font-semibold mb-1'>Rol</label>
                <select className='w-full border rounded-lg px-3 py-2' value={userForm.rolId} onChange={e => setUserForm({ ...userForm, rolId: Number(e.target.value) })}>
                  {/* aqui tenemos que ver despues con que ID se quedan los roles  */}
                  <option value={1}>Usuario</option>
                  <option value={2}>Administrador</option>
                </select>
              </div>

              <div className='flex gap-2'>
                <button type='submit' className='w-full bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700'>{editingUserId ? 'Actualizar' : 'Guardar usuario'}</button>
                {editingUserId && <button type='button' onClick={() => { setEditingUserId(null); setUserForm({ nombre:'', apellido:'', correoElectronico:'', telefono:'', contrasenaFriada:'', rolId:1 }); }} className='px-4 py-2 border rounded-lg'>Cancelar</button>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};