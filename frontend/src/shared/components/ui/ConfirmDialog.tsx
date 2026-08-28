import React from 'react';

export interface ConfirmDialogData {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
}

interface ConfirmDialogProps {
  dialog: ConfirmDialogData | null;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ dialog, onClose }) => {
  if (!dialog) return null;

  const isDanger = dialog.isDanger !== false; // default to danger style for destructive actions

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-3 sm:p-4 text-left animate-fadeIn">
      <div className="bg-white border border-surface-variant/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl w-full max-w-sm space-y-4 animate-scaleUp">
        <div>
          <h3 className="text-base font-bold text-on-surface">
            {dialog.title || 'Xác nhận hành động'}
          </h3>
          <p className="text-xs text-on-surface-variant mt-2 font-semibold leading-relaxed">
            {dialog.message}
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 text-xs font-semibold pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border border-surface-variant rounded-xl text-on-surface-variant hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {dialog.cancelText || 'Hủy bỏ'}
          </button>
          <button
            type="button"
            onClick={() => {
              try {
                dialog.onConfirm();
              } catch (e) {
                console.error('Error during confirm action:', e);
              }
              onClose();
            }}
            className={`w-full sm:w-auto px-4 py-2 text-white rounded-xl transition-colors cursor-pointer ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {dialog.confirmText || 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
