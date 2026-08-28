import React, { useState } from 'react';
import type { User, UserProfile } from '../../../core/types';
import { useApp } from '../../../context/AppContext';
import { PROVINCE_OPTIONS } from '../../../config/locations';

interface EditProfileModalProps {
  currentUser: User;
  onClose: () => void;
  onSave: (
    updatedProfile: Partial<UserProfile>,
    email: string,
    province: string,
    phone?: string
  ) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  currentUser,
  onClose,
  onSave
}) => {
  const { showNotification } = useApp();

  const [fullName, setFullName] = useState(currentUser.profile.full_name || '');
  const [email] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [areaOfInterest, setAreaOfInterest] = useState(
    currentUser.profile.area_of_interest || ''
  );
  const [skillsStr, setSkillsStr] = useState(
    currentUser.profile.skills?.join(', ') || ''
  );
  const [bio, setBio] = useState(currentUser.profile.bio || '');
  const [birthYear, setBirthYear] = useState<number | ''>(
    currentUser.profile.age ? new Date().getFullYear() - currentUser.profile.age : ''
  );
  const [gender, setGender] = useState(currentUser.profile.gender || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showNotification('Họ và tên không được để trống.', 'error');
      return;
    }
    if (fullName.trim().length > 100) {
      showNotification('Họ và tên không được vượt quá 100 ký tự.', 'error');
      return;
    }
    if (!phone.trim()) {
      showNotification('Số điện thoại không được để trống.', 'error');
      return;
    }
    const cleanPhone = phone.trim().replace(/[\s\-()]/g, '');
    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      showNotification('Số điện thoại không hợp lệ (phải từ 10-15 chữ số).', 'error');
      return;
    }

    let finalAge: number | undefined;
    if (birthYear !== '') {
      const yearNum = Number(birthYear);
      const currentYear = new Date().getFullYear();
      if (yearNum < 1900 || yearNum > currentYear) {
        showNotification(`Năm sinh không hợp lệ (phải từ 1900 đến ${currentYear}).`, 'error');
        return;
      }
      finalAge = currentYear - yearNum;
    }

    const skills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    onSave(
      {
        full_name: fullName.trim(),
        skills,
        bio: bio.trim() || null,
        avatar_url: currentUser.profile.avatar_url,
        age: finalAge,
        gender: gender || undefined
      },
      email || '',
      areaOfInterest || '',
      phone.trim()
    );
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 sm:p-6 text-left animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Chỉnh sửa thông tin cá nhân</h3>
          <p className="text-xs text-slate-400 mt-0.5">Cập nhật chi tiết hồ sơ thành viên</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer border-none bg-transparent"
        >
          Hủy bỏ
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006d37] focus:ring-1 focus:ring-[#006d37] transition-all"
            placeholder="Nguyễn Văn A"
          />
        </div>

        {/* Phone & Email Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006d37] focus:ring-1 focus:ring-[#006d37] transition-all"
              placeholder="0987654321"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Email (Không thể thay đổi)
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3.5 py-2.5 border border-slate-100 rounded-xl text-sm font-medium text-slate-400 bg-slate-50 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Birth Year & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Năm sinh
            </label>
            <input
              type="number"
              value={birthYear}
              onChange={(e) =>
                setBirthYear(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="VD: 2002"
              min={1900}
              max={new Date().getFullYear()}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006d37] focus:ring-1 focus:ring-[#006d37] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Giới tính
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006d37] focus:ring-1 focus:ring-[#006d37] transition-all bg-white cursor-pointer"
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>

        {/* Area of Interest */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Khu vực quan tâm / Tỉnh thành
          </label>
          <select
            value={areaOfInterest}
            onChange={(e) => setAreaOfInterest(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006d37] focus:ring-1 focus:ring-[#006d37] transition-all bg-white cursor-pointer"
          >
            <option value="">Chọn tỉnh thành</option>
            {PROVINCE_OPTIONS.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>
        </div>

        {/* Skills */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Kỹ năng / Thế mạnh
          </label>
          <input
            type="text"
            value={skillsStr}
            onChange={(e) => setSkillsStr(e.target.value)}
            placeholder="Dạy học, Sơ cứu, Tổ chức sự kiện, Nhiếp ảnh..."
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006d37] focus:ring-1 focus:ring-[#006d37] transition-all"
          />
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Giới thiệu bản thân
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Chia sẻ đôi điều về bạn và lý do bạn muốn cống hiến vì cộng đồng..."
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-[#006d37] focus:ring-1 focus:ring-[#006d37] transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 text-xs transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#006d37] hover:bg-[#005027] text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileModal;
