import React, { useState } from 'react';
import type { Activity } from '../../../core/types';
import { useApp } from '../../../context/AppContext';
import { LOCATION_DATA, PROVINCE_OPTIONS } from '../../../config/locations';
import { ACTIVITY_CATEGORIES } from '../../../config/constants';
import { formatDateTimeToISO } from '../../../core/utils/formatters';
import { mediaApi } from '../../posts/api/postApi';

interface CreateActivityModalProps {
  onClose: () => void;
  onSubmit: (activityData: Partial<Activity>) => Promise<void>;
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
  onClose,
  onSubmit
}) => {
  const { showNotification } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(ACTIVITY_CATEGORIES[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [limitVolunteers, setLimitVolunteers] = useState<number>(10);
  const [province, setProvince] = useState(PROVINCE_OPTIONS[0]);
  const [district, setDistrict] = useState(LOCATION_DATA[PROVINCE_OPTIONS[0]]?.[0] || '');
  const [addressDetail, setAddressDetail] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [requirements, setRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);
    const districts = LOCATION_DATA[newProvince] || [];
    setDistrict(districts[0] || '');
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification('Dung lượng ảnh không được vượt quá 5MB.', 'error');
      return;
    }

    try {
      showNotification('Đang tải ảnh hoạt động lên...', 'info');
      const res = await mediaApi.upload(file);
      setImageUrl(res.url);
      showNotification('Tải ảnh lên thành công!', 'success');
    } catch (err: any) {
      console.error('Lỗi upload ảnh:', err);
      showNotification(err.response?.data?.detail || 'Không thể tải ảnh lên.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !startDate || !endDate) {
      showNotification('Vui lòng điền đầy đủ các trường bắt buộc (*).', 'error');
      return;
    }

    const startISO = formatDateTimeToISO(startDate, '08:00:00');
    const endISO = formatDateTimeToISO(endDate, '17:00:00');

    if (new Date(startISO).getTime() >= new Date(endISO).getTime()) {
      showNotification('Thời gian kết thúc phải sau thời gian bắt đầu.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        categories: [selectedCategory],
        start_date: startISO,
        end_date: endISO,
        limit_volunteers: Number(limitVolunteers) || 10,
        image_url:
          imageUrl ||
          'https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=600',
        requirements: requirements.trim() || undefined,
        location: {
          province,
          district,
          address_detail: addressDetail.trim() || province
        }
      });
      showNotification('Tạo hoạt động mới thành công!', 'success');
      onClose();
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Không thể tạo hoạt động.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableDistricts = LOCATION_DATA[province] || [];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-y-auto max-h-[92dvh] sm:max-h-[90vh] animate-scaleUp text-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-gray-900 text-xl">Tạo hoạt động tình nguyện mới</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl font-bold cursor-pointer border-none bg-transparent"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tên hoạt động <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="VD: Chiến dịch Mùa hè xanh 2026..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006d37] transition-all"
            />
          </div>

          {/* Category & Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Lĩnh vực <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006d37] transition-all bg-white cursor-pointer"
              >
                {ACTIVITY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Số lượng TNV tối đa <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={limitVolunteers}
                onChange={(e) => setLimitVolunteers(Math.max(1, Number(e.target.value)))}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006d37] transition-all"
              />
            </div>
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Thời gian bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006d37] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Thời gian kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006d37] transition-all"
              />
            </div>
          </div>

          {/* Location: Province & District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tỉnh / Thành phố <span className="text-red-500">*</span>
              </label>
              <select
                value={province}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006d37] transition-all bg-white cursor-pointer"
              >
                {PROVINCE_OPTIONS.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Quận / Huyện
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006d37] transition-all bg-white cursor-pointer"
              >
                {availableDistricts.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Detail Address */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Địa chỉ chi tiết
            </label>
            <input
              type="text"
              value={addressDetail}
              onChange={(e) => setAddressDetail(e.target.value)}
              placeholder="VD: Số 123 Đường Nguyễn Huệ, Phường Bến Nghé..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006d37] transition-all"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Ảnh bìa hoạt động
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Dán đường dẫn ảnh hoặc tải lên tệp..."
                className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006d37] transition-all"
              />
              <label className="border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer shrink-0">
                Tải ảnh lên
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Mô tả hoạt động <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Mô tả mục tiêu, ý nghĩa và nội dung chi tiết của hoạt động..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-[#006d37] transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Requirements */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Yêu cầu & Ghi chú đối với TNV
            </label>
            <textarea
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Yêu cầu về độ tuổi, kỹ năng, trang phục, vật dụng cần mang theo..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-[#006d37] transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#006d37] hover:bg-[#005027] text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo hoạt động'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateActivityModal;
