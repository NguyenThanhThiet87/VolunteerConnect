import React from 'react';

interface IncompleteProfileBannerProps {
  show: boolean;
  onDismiss: () => void;
}

export const IncompleteProfileBanner: React.FC<IncompleteProfileBannerProps> = ({
  show,
  onDismiss
}) => {
  if (!show) return null;

  return (
    <div className="fixed top-[76px] sm:top-[88px] left-3 right-3 md:left-auto md:right-8 z-40 md:w-[360px] animate-fadeIn shadow-2xl rounded-2xl overflow-hidden border border-amber-100">
      <div className="bg-white p-4 flex items-start gap-3.5 relative">
        <div className="bg-amber-100/80 text-amber-600 p-2 rounded-full shrink-0 flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">warning</span>
        </div>
        <div className="flex-grow pr-5">
          <h4 className="text-sm font-bold text-slate-800 mb-1">Thiếu thông tin</h4>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            Hồ sơ của bạn chưa hoàn thiện. Hãy cập nhật để dễ dàng ứng tuyển các hoạt động nhé.
          </p>
          <button
            onClick={() => {
              window.location.hash = '#/profile';
            }}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            Cập nhật ngay
          </button>
        </div>
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Đóng thông báo"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
};

export default IncompleteProfileBanner;
