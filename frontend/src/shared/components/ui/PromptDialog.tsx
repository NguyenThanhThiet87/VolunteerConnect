import React, { useState } from 'react';

export interface PromptDialogData {
  title?: string;
  message: string;
  placeholder?: string;
  initialValue?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (val: string) => void;
}

interface PromptDialogProps {
  dialog: PromptDialogData | null;
  onClose: () => void;
}

export const PromptDialog: React.FC<PromptDialogProps> = ({ dialog, onClose }) => {
  if (!dialog) return null;

  const [value, setValue] = useState(dialog.initialValue || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dialog.onConfirm(value);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4 text-left animate-fadeIn">
      <div className="bg-white border border-surface-variant/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl w-full max-w-sm space-y-4 animate-scaleUp">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-on-surface">
              {dialog.title || 'Nhập thông tin'}
            </h3>
            <p className="text-xs text-on-surface-variant mt-2 font-medium leading-relaxed">
              {dialog.message}
            </p>
          </div>
          <textarea
            rows={2}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={dialog.placeholder || 'Nhập tại đây...'}
            className="w-full px-3 py-2 border border-outline-variant rounded-xl text-sm leading-relaxed text-justify focus:outline-none focus:border-primary text-on-surface resize-y min-h-[64px] max-h-[132px] overflow-y-auto"
            autoFocus
          />
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border border-surface-variant rounded-xl text-on-surface-variant hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {dialog.cancelText || 'Hủy bỏ'}
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-primary text-on-primary rounded-xl hover:bg-tertiary transition-colors cursor-pointer"
            >
              {dialog.confirmText || 'Đồng ý'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromptDialog;
