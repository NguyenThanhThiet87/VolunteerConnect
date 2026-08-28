import React from 'react';
import logoImg from '../../../assets/logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-[#f0f9f4] to-[#e8f5e9]/60 text-slate-600 border-t border-[#006d37]/10 w-full mt-auto py-12 sm:py-16 transition-all duration-300">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 text-left">
        {/* Column 1: Brand & Info */}
        <div className="space-y-4 md:col-span-5">
          <a
            href="#/feed"
            className="font-headline-md text-xl text-[#006d37] font-bold flex items-center gap-2.5 select-none hover:opacity-90 transition-opacity"
          >
            <img src={logoImg} alt="Volunteer Connect Logo" className="h-10 w-auto object-contain shrink-0" />
            <span className="tracking-tight text-[#006d37]">Volunteer Connect</span>
          </a>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            Nền tảng kết nối tình nguyện cộng đồng, cầu nối giữa những tấm lòng nhân ái và các tổ chức hoạt động xã hội ý nghĩa trên khắp cả nước.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-4 md:col-span-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#006d37]">Liên Kết Nhanh</h4>
          <ul className="space-y-3 text-xs font-semibold">
            <li>
              <a
                href="#/feed"
                className="group flex items-center gap-1.5 text-slate-600 hover:text-[#006d37] transition-colors duration-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#006d37] scale-0 group-hover:scale-100 transition-transform duration-200"></span>
                Trang chủ
              </a>
            </li>
            <li>
              <a
                href="#/activities"
                className="group flex items-center gap-1.5 text-slate-600 hover:text-[#006d37] transition-colors duration-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#006d37] scale-0 group-hover:scale-100 transition-transform duration-200"></span>
                Hoạt động tình nguyện
              </a>
            </li>
            <li>
              <a
                href="#/my-registrations"
                className="group flex items-center gap-1.5 text-slate-600 hover:text-[#006d37] transition-colors duration-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#006d37] scale-0 group-hover:scale-100 transition-transform duration-200"></span>
                Đăng ký của tôi
              </a>
            </li>
            <li>
              <a
                href="#/posts"
                className="group flex items-center gap-1.5 text-slate-600 hover:text-[#006d37] transition-colors duration-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#006d37] scale-0 group-hover:scale-100 transition-transform duration-200"></span>
                Bản tin cộng đồng
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact Info & Support */}
        <div className="space-y-4 md:col-span-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#006d37]">Liên Hệ & Hỗ Trợ</h4>
          <ul className="space-y-3 text-xs font-medium">
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-sm mt-0.5 text-[#006d37]">location_on</span>
              <span className="leading-relaxed">168 Nguyễn Văn Cừ Nối Dài, An Bình, Cần Thơ, Việt Nam</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-sm text-[#006d37]">mail</span>
              <a href="mailto:support@volunteerconnect.vn" className="hover:text-[#006d37] transition-colors">
                support@volunteerconnect.vn
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-sm text-[#006d37]">call</span>
              <a href="tel:+84849633511" className="hover:text-[#006d37] transition-colors">
                +84 849 633 511
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 mt-12 sm:mt-16 pt-6 border-t border-[#006d37]/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium text-center sm:text-left">
        <span className="break-words">
          © 2026 Volunteer Connect. Tất cả các quyền được bảo lưu.
        </span>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="hover:text-[#006d37] transition-colors" href="#/terms">
            Chính Sách Bảo Mật
          </a>
          <a className="hover:text-[#006d37] transition-colors" href="#/terms">
            Điều Khoản Sử Dụng
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
