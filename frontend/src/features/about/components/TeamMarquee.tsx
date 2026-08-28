import React from 'react';
import luongDuyKhangImg from '../../../assets/Team/Luong_Duy_Khang.jpg';
import nguyenChauTruongHuyImg from '../../../assets/Team/Nguyen_Chau_Truong_Huy.jpg';
import nguyenThanhThietImg from '../../../assets/Team/Nguyen_Thanh_Thiet.jpg';
import nguyenTrongHieuImg from '../../../assets/Team/Nguyen_Trong_Hieu.png';
import voVanKhanhImg from '../../../assets/Team/Vo_Van_Khanh.jpg';
import doThanhNhanTaiImg from '../../../assets/Team/Do_Thanh_Nhan_Tai.jpg';
import nguyenDinhThaiImg from '../../../assets/Team/Nguyen_Dinh_Thai.jpg';
import nguyenNgocTrucPhuongImg from '../../../assets/Team/Nguyen_Ngoc_Truc_Phuong.jpg';
import chauThiThuyVyImg from '../../../assets/Team/Chau_Thi_Thuy_Vi.jpg';
import leCongVinhImg from '../../../assets/Team/Le_Cong_Vinh.jpg';

interface Member {
  name: string;
  role: string;
  color: string;
  img: string;
}

const MEMBERS: Member[] = [
  { name: 'Lê Công Vinh', role: 'BA', color: 'text-[#1a56db]', img: leCongVinhImg },
  { name: 'Nguyễn Thanh Thiệt', role: 'BE', color: 'text-[#006d37]', img: nguyenThanhThietImg },
  { name: 'Võ Văn Khanh', role: 'BE', color: 'text-[#006d37]', img: voVanKhanhImg },
  { name: 'Nguyễn Châu Trường Huy', role: 'BE', color: 'text-[#006d37]', img: nguyenChauTruongHuyImg },
  { name: 'Nguyễn Trọng Hiếu', role: 'BE', color: 'text-[#006d37]', img: nguyenTrongHieuImg },
  { name: 'Đỗ Thành Nhân Tài', role: 'FE', color: 'text-[#1a56db]', img: doThanhNhanTaiImg },
  { name: 'Lương Duy Khang', role: 'UI/UX', color: 'text-amber-600', img: luongDuyKhangImg },
  { name: 'Nguyễn Ngọc Trúc Phương', role: 'UI/UX', color: 'text-amber-600', img: nguyenNgocTrucPhuongImg },
  { name: 'Nguyễn Đăng Khoa', role: 'QA', color: 'text-purple-600', img: luongDuyKhangImg },
  { name: 'Nguyễn Quỳnh Thảo Trang', role: 'QA', color: 'text-purple-600', img: luongDuyKhangImg },
  { name: 'Châu Thị Thúy Vy', role: 'QA', color: 'text-purple-600', img: chauThiThuyVyImg },
  { name: 'Nguyễn Đình Thái', role: 'QA', color: 'text-purple-600', img: nguyenDinhThaiImg }
];

export const TeamMarquee: React.FC = () => {
  const doubleList = [...MEMBERS, ...MEMBERS];

  return (
    <div className="relative overflow-hidden w-full py-4">
      <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

      <div className="animate-scroll gap-8 md:gap-12 pl-4">
        {doubleList.map((m, idx) => (
          <div key={idx} className="flex flex-col items-center group shrink-0 min-w-[140px]">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-200 mb-3 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 ring-2 ring-transparent group-hover:ring-[#1a56db]/20">
              <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm md:text-base text-center">
              {m.name}
            </h4>
            <span className={`text-xs ${m.color} font-semibold mt-1 text-center`}>
              {m.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMarquee;
