import React from 'react';
import toast from 'react-hot-toast';

/**
 * Sistema de notificaciones unificado para reemplazar alert(), confirm() y prompt()
 * Uso: import { notifySuccess, notifyError, notifyWarning, notifyInfo, confirmAction } from '@/utils/notifications';
 */

// Configuración de estilos personalizados que coinciden con el diseño Tailwind del proyecto
const customStyles = {
  success: {
    duration: 3000,
    style: {
      background: '#10b981',
      color: '#ffffff',
      fontWeight: '500',
      padding: '16px',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    iconTheme: {
      primary: '#ffffff',
      secondary: '#10b981',
    },
  },
  error: {
    duration: 4000,
    style: {
      background: '#ef4444',
      color: '#ffffff',
      fontWeight: '500',
      padding: '16px',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    iconTheme: {
      primary: '#ffffff',
      secondary: '#ef4444',
    },
  },
  warning: {
    duration: 3500,
    style: {
      background: '#f59e0b',
      color: '#ffffff',
      fontWeight: '500',
      padding: '16px',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    iconTheme: {
      primary: '#ffffff',
      secondary: '#f59e0b',
    },
  },
  info: {
    duration: 3000,
    style: {
      background: '#3b82f6',
      color: '#ffffff',
      fontWeight: '500',
      padding: '16px',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    iconTheme: {
      primary: '#ffffff',
      secondary: '#3b82f6',
    },
  },
};

/**
 * Muestra un mensaje de éxito
 * @param {string} message - Mensaje a mostrar
 */
export const notifySuccess = (message) => {
  toast.success(message, customStyles.success);
};

/**
 * Muestra un mensaje de error
 * @param {string} message - Mensaje a mostrar
 */
export const notifyError = (message) => {
  toast.error(message, customStyles.error);
};

/**
 * Muestra un mensaje de advertencia
 * @param {string} message - Mensaje a mostrar
 */
export const notifyWarning = (message) => {
  toast(message, {
    icon: '⚠️',
    ...customStyles.warning,
  });
};

/**
 * Muestra un mensaje informativo
 * @param {string} message - Mensaje a mostrar
 */
export const notifyInfo = (message) => {
  toast(message, {
    icon: 'ℹ️',
    ...customStyles.info,
  });
};

/**
 * Reemplazo visual de confirm() - muestra un toast con botones de acción
 * @param {string} message - Mensaje de confirmación
 * @param {function} onConfirm - Callback al confirmar
 * @param {function} onCancel - Callback al cancelar (opcional)
 */
export const confirmAction = (message, onConfirm, onCancel = null) => {
  toast(
    (t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-gray-800">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if (onCancel) onCancel();
            }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              onConfirm();
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      style: {
        background: '#ffffff',
        color: '#1f2937',
        padding: '16px',
        borderRadius: '0.75rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        minWidth: '350px',
      },
    }
  );
};

/**
 * Muestra un mensaje de carga y lo actualiza cuando termine
 * @param {Promise} promise - Promesa a ejecutar
 * @param {object} messages - Mensajes para loading, success y error
 * @returns {Promise} La promesa original
 */
export const notifyPromise = (promise, messages) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Procesando...',
      success: messages.success || '¡Operación exitosa!',
      error: messages.error || 'Error al procesar',
    },
    {
      success: customStyles.success,
      error: customStyles.error,
      loading: {
        style: {
          background: '#3b82f6',
          color: '#ffffff',
          fontWeight: '500',
          padding: '16px',
          borderRadius: '0.5rem',
        },
      },
    }
  );
};

export default {
  success: notifySuccess,
  error: notifyError,
  warning: notifyWarning,
  info: notifyInfo,
  confirm: confirmAction,
  promise: notifyPromise,
};
