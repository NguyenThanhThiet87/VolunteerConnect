import React from 'react';

export interface ToastNotification {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  notification: ToastNotification | null;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div
      className={`fixed top-20 left-3 right-3 sm:left-auto sm:right-8 sm:w-auto sm:max-w-sm z-[9999] p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-start gap-2 animate-fadeIn ${
        notification.type === 'success'
          ? 'bg-[#e8f5e9] text-[#006d37] border-[#006d37]/20 shadow-[#006d37]/5'
          : notification.type === 'error'
          ? 'bg-red-50 text-red-700 border-red-200 shadow-red-200/5'
          : 'bg-blue-50 text-blue-700 border-blue-200 shadow-blue-200/5'
      }`}
    >
      <span className="material-symbols-outlined text-lg shrink-0">
        {notification.type === 'success'
          ? 'check_circle'
          : notification.type === 'error'
          ? 'error'
          : 'info'}
      </span>
      <span className="min-w-0 break-words flex-1">{notification.message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 ml-1 p-0.5"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      )}
    </div>
  );
};

export default Toast;
