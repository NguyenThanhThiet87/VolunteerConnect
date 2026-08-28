import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { activityApi } from '../api/activityApi';
import { USE_REAL_BACKEND } from '../../../config/backend';
import type { Activity } from '../../../core/types';
import { Avatar } from '../../../shared/components/ui/Avatar';

interface ActivityDetailViewProps {
  activityId: string;
}

export const ActivityDetailView: React.FC<ActivityDetailViewProps> = ({ activityId }) => {
  const {
    currentUser,
    users,
    activities,
    registrations,
    registerForActivity,
    cancelOrRejectRegistration,
    showNotification,
    showConfirm
  } = useApp();

  const [activity, setActivity] = useState<Activity | null>(
    activities.find((a) => a._id === activityId) || null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (USE_REAL_BACKEND && activityId) {
      setLoading(true);
      activityApi
        .getById(activityId)
        .then((act) => {
          if (active) {
            setActivity(act);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Lỗi lấy chi tiết hoạt động từ server:', err);
          if (active) {
            setLoading(false);
          }
        });
    } else {
      const act = activities.find((a) => a._id === activityId);
      setActivity(act || null);
      setLoading(false);
    }
    return () => {
      active = false;
    };
  }, [activityId, activities]);

  const organizerUser = users.find((u) => u._id === activity?.organizer_id);

  // Check if current user is registered for this activity
  const userRegistration = registrations.find(
    (r) => r.volunteer_id === currentUser?._id && r.activity_id === activityId
  );

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006d37] mx-auto"></div>
        <p className="text-sm text-on-surface-variant font-medium">Đang tải thông tin hoạt động...</p>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto text-left">
        <span className="material-symbols-outlined text-outline text-6xl">campaign</span>
        <h2 className="font-headline-md text-xl font-bold text-on-surface">Không tìm thấy hoạt động</h2>
        <p className="text-sm text-on-surface-variant">Hoạt động có thể đã bị xóa hoặc đường dẫn không chính xác.</p>
        <button
          onClick={() => window.history.back()}
          className="inline-block bg-[#006d37] text-white px-6 py-2 rounded-lg font-medium text-xs shadow cursor-pointer border-none"
        >
          Quay lại trang trước
        </button>
      </div>
    );
  }

  const handleRegister = async () => {
    const res = registerForActivity(activity._id);
    const result = res instanceof Promise ? await res : res;
    if (result.success) {
      showNotification('Yêu cầu tham gia của bạn đã được gửi. Vui lòng chờ Ban tổ chức duyệt.', 'success');
    } else {
      showNotification(result.error || 'Có lỗi xảy ra khi đăng ký', 'error');
    }
  };

  const handleCancelRegistration = () => {
    if (userRegistration) {
      showConfirm(
        'Bạn chắc chắn muốn hủy đăng ký tham gia hoạt động này?',
        async () => {
          const res = cancelOrRejectRegistration(userRegistration._id);
          const result = res instanceof Promise ? await res : res;
          if (result && result.error) {
            showNotification(result.error, 'error');
          } else {
            showNotification('Đã hủy đăng ký thành công!', 'success');
          }
        },
        'Hủy đăng ký tham gia'
      );
    }
  };

  // Status badge config for registration sidebar
  let statusText = 'Chưa đăng ký';
  let statusClass = 'bg-slate-100 text-slate-700';
  if (userRegistration) {
    if (userRegistration.status === 'Approved') {
      statusText = 'Đã duyệt tham gia';
      statusClass = 'bg-[#e8f5e9] text-[#006d37]';
    } else if (userRegistration.status === 'Pending') {
      statusText = 'Đang chờ duyệt';
      statusClass = 'bg-[#fef7e0] text-[#b06000]';
    } else if (userRegistration.status === 'Rejected') {
      statusText = 'Bị từ chối';
      statusClass = 'bg-red-50 text-red-650';
    } else if (userRegistration.status === 'Cancelled') {
      statusText = 'Đã hủy đăng ký';
      statusClass = 'bg-slate-100 text-slate-500';
    } else if (userRegistration.status === 'Completed') {
      statusText = 'Đã hoàn thành';
      statusClass = 'bg-emerald-50 text-[#006d37]';
    } else if (userRegistration.status === 'Absent') {
      statusText = 'Vắng mặt';
      statusClass = 'bg-red-50 text-red-600';
    }
  }

  // Formatting date string nicely: HH:MM:SS DD/MM/YYYY
  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
  };

  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen pb-16">
      {/* Container */}
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 md:px-8 py-5 sm:py-8 text-left">
        {/* Back Link */}
        <button
          onClick={() => window.history.back()}
          className="text-[#006d37] hover:underline font-semibold text-sm inline-flex items-center gap-1 mb-6 border-none bg-transparent cursor-pointer p-0"
        >
          &larr; Quay lại
        </button>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
          {/* Left Column (8 cols): Content */}
          <div className="lg:col-span-8 bg-white border border-surface-variant/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
            {/* Wide Campaign Image */}
            <div className="w-full h-[220px] sm:h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-sm bg-surface-container-low">
              <img
                src={
                  activity.image_url ||
                  'https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=600'
                }
                alt={activity.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=600';
                }}
              />
            </div>

            {/* Category Tag */}
            <div>
              <span className="bg-[#006d37] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                {activity.categories[0] || 'Tình nguyện'}
              </span>
            </div>

            {/* Campaign Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-on-surface font-headline-md leading-tight break-words">
              {activity.title}
            </h1>

            {/* Description Block */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-on-surface border-b border-surface-variant/40 pb-2">
                Mô tả hoạt động
              </h2>
              <p className="text-on-surface-variant text-sm md:text-base leading-relaxed whitespace-pre-line">
                {activity.description}
              </p>
            </div>

            {/* Requirements & Notes Block */}
            {activity.requirements && activity.requirements.trim() && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-on-surface border-b border-surface-variant/40 pb-2">
                  Yêu cầu & Ghi chú
                </h2>
                <div className="rounded-2xl border border-emerald-100 bg-[#e8f5e9]/35 p-4 text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                  {activity.requirements}
                </div>
              </div>
            )}

            {/* Contact Person Card */}
            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-bold text-on-surface border-b border-surface-variant/40 pb-2">
                Người liên hệ & Tổ chức
              </h2>
              <a
                href={`#/profile?userId=${activity.organizer_id}`}
                className="flex items-center gap-4 bg-white border border-surface-variant/40 rounded-2xl p-4 shadow-sm w-full sm:w-fit min-w-0 sm:min-w-[320px] hover:bg-slate-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-container bg-surface-container-high shrink-0">
                  <Avatar
                    name={activity.denormalized_organizer?.name || 'Ban tổ chức'}
                    src={organizerUser?.profile?.avatar_url}
                    size={48}
                  />
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="font-bold text-sm text-on-surface hover:text-[#006d37] transition-colors flex items-center gap-1 break-words">
                    {activity.denormalized_organizer?.name || 'Ban tổ chức'}
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    Đại diện Ban tổ chức hoạt động
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column (4 cols): Information & Action Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-surface-variant/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-5 sm:space-y-6 sticky top-24">
              <h2 className="text-lg font-bold text-on-surface border-b border-surface-variant/40 pb-3">
                Thông tin tham gia
              </h2>

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Trạng thái đăng ký
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusClass}`}>
                  {statusText}
                </span>
              </div>

              {/* Detail Items */}
              <div className="space-y-4 text-sm">
                {/* Dates */}
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#006d37] text-xl">
                    calendar_month
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase">Thời gian</p>
                    <p className="font-semibold text-on-surface mt-0.5">
                      Bắt đầu: {formatDateTime(activity.start_date)}
                    </p>
                    <p className="font-semibold text-on-surface mt-0.5">
                      Kết thúc: {formatDateTime(activity.end_date)}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#006d37] text-xl">
                    location_on
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase">Địa điểm</p>
                    <p className="font-semibold text-on-surface mt-0.5 break-words">
                      {activity.location?.address_detail || 'Chưa cập nhật'},{' '}
                      {activity.location?.district || ''}, {activity.location?.province || ''}
                    </p>
                  </div>
                </div>

                {/* Volunteers Limit Progress */}
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#006d37] text-xl">group</span>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-on-surface-variant uppercase">Số lượng tuyển</span>
                      <span className="text-on-surface">
                        {activity.approved_volunteers_count || 0}/{activity.limit_volunteers} TNV
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#006d37] h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              ((activity.approved_volunteers_count || 0) /
                                (activity.limit_volunteers || 1)) *
                                100
                            )
                          )}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-surface-variant/40 space-y-3">
                {!currentUser ? (
                  <a
                    href="#/login"
                    className="w-full bg-[#006d37] hover:bg-[#005027] text-white py-3 rounded-full font-bold text-sm transition-all shadow flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">login</span>
                    Đăng nhập để tham gia
                  </a>
                ) : currentUser.role !== 'Volunteer' ? (
                  <div className="bg-slate-50 border border-slate-200 text-slate-600 p-3 rounded-xl text-xs font-medium text-center">
                    Tài khoản {currentUser.role === 'Organizer' ? 'Nhà tổ chức' : 'Quản trị viên'} không thể đăng ký tham gia hoạt động.
                  </div>
                ) : userRegistration && userRegistration.status === 'Pending' ? (
                  <div className="space-y-2">
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs font-semibold text-center">
                      Đơn đăng ký của bạn đang chờ duyệt.
                    </div>
                    <button
                      onClick={handleCancelRegistration}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-full font-bold text-xs transition-colors cursor-pointer"
                    >
                      Hủy yêu cầu tham gia
                    </button>
                  </div>
                ) : userRegistration && userRegistration.status === 'Approved' ? (
                  <div className="space-y-2">
                    <div className="bg-emerald-50 border border-emerald-200 text-[#006d37] p-3 rounded-xl text-xs font-semibold text-center">
                      Bạn đã được duyệt tham gia hoạt động này!
                    </div>
                    <button
                      onClick={handleCancelRegistration}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-full font-bold text-xs transition-colors cursor-pointer"
                    >
                      Hủy tham gia
                    </button>
                  </div>
                ) : userRegistration && userRegistration.status === 'Completed' ? (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-xl text-xs font-semibold text-center">
                    Bạn đã hoàn thành hoạt động này. Cảm ơn bạn!
                  </div>
                ) : userRegistration && userRegistration.status === 'Rejected' ? (
                  <div className="space-y-2">
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold text-center">
                      Đơn đăng ký của bạn đã bị từ chối.
                    </div>
                    <button
                      onClick={handleRegister}
                      className="w-full bg-[#006d37] hover:bg-[#005027] text-white py-3 rounded-full font-bold text-sm transition-all shadow cursor-pointer"
                    >
                      Gửi lại yêu cầu tham gia
                    </button>
                  </div>
                ) : activity.status === 'Full' ? (
                  <button
                    disabled
                    className="w-full bg-slate-200 text-slate-400 py-3 rounded-full font-bold text-sm cursor-not-allowed"
                  >
                    Hoạt động đã đủ số lượng
                  </button>
                ) : activity.status === 'Completed' || activity.status === 'Cancelled' ? (
                  <button
                    disabled
                    className="w-full bg-slate-200 text-slate-400 py-3 rounded-full font-bold text-sm cursor-not-allowed"
                  >
                    Hoạt động đã kết thúc
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    className="w-full bg-[#006d37] hover:bg-[#005027] text-white py-3 rounded-full font-bold text-sm transition-all shadow cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">how_to_reg</span>
                    Đăng ký tham gia ngay
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailView;
