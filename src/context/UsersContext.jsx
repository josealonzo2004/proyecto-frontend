// src/context/UsersContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { usersAPI } from "../services/api";
import { useAuth } from "./AuthContext";

const UsersContext = createContext();

export const useUsers = () => {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within UsersProvider");
  return ctx;
};

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState(null);
  const { user: currentUser } = useAuth();

  const fetchUsers = async (query = "") => {
    // PROTECCIÓN ADICIONAL: Si no es admin, no hacemos nada (por si se llama manualmente)
    if (!currentUser || currentUser.rolId !== 2) return;

    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data || []);
      if (query) {
        const q = query.toLowerCase();
        setUsers((res.data || []).filter(u =>
          `${u.nombre} ${u.apellido}`.toLowerCase().includes(q) ||
          (u.correoElectronico || '').toLowerCase().includes(q)
        ));
      }
    } catch (err) {
      console.error("Error cargando usuarios", err);
      // Solo mostramos error si realmente falló algo técnico, no por permisos (aunque el if de arriba ya lo evita)
      if (err.response?.status !== 403) {
          setErrorUsers(err?.response?.data || "No se pudieron cargar los usuarios");
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    // --- CORRECCIÓN AQUÍ ---
    // Solo cargar usuarios si existe usuario Y es ADMINISTRADOR (rolId === 2)
    if (currentUser && currentUser.rolId === 2) {
      fetchUsers();
    } else {
      // Si deja de ser admin o hace logout, limpiamos la lista por seguridad
      setUsers([]);
    }
  }, [currentUser]);

  // Create
  const createUser = async (data) => {
    try {
      const payload = {
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono || '',
        correoElectronico: data.correoElectronico,
        contrasenaFriada: data.contrasenaFriada,
        estadoCuenta: data.estadoCuenta ?? true,
        rolId: data.rolId ?? 1,
        usuarioCreaId: currentUser?.usuarioId ?? 1,
      };

      const res = await usersAPI.create(payload);
      if (res?.data) {
        setUsers(prev => [...prev, res.data]);
        return res.data;
      }
      await fetchUsers();
      return null;
    } catch (err) {
      console.error("createUser error", err);
      const message = err?.response?.data?.message || err?.response?.data || err.message;
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  // Update
  const updateUser = async (id, data) => {
    try {
      const payload = { ...data };
      const res = await usersAPI.update(id, payload);
      await fetchUsers();
      return res.data;
    } catch (err) {
      console.error("updateUser error", err);
      const message = err?.response?.data?.message || err?.response?.data || err.message;
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  // Delete
  const deleteUser = async (id) => {
    try {
      await usersAPI.delete(id);
      setUsers(prev => prev.filter(u => u.usuarioId !== id));
    } catch (err) {
      console.error("deleteUser error", err);
      throw err;
    }
  };

  return (
    <UsersContext.Provider value={{
      users, loadingUsers, errorUsers,
      fetchUsers, createUser, updateUser, deleteUser
    }}>
      {children}
    </UsersContext.Provider>
  );
};