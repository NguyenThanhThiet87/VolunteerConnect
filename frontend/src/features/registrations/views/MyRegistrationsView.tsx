import React from 'react';
import { useApp } from '../../../context/AppContext';
import { RegistrationCard } from '../components/RegistrationCard';

export const MyRegistrationsView: React.FC = () => {
  const { currentUser, registrations, activities } = useApp();

  if (!currentUser) return null;

  // Filter volunteer's registrations
  const userRegs = registrations.filter((r) => r.volunteer_id === currentUser._id);

  // Compute stat counts dynamically
  const pendingCount = userRegs.filter((r) => r.status === 'Pending').length;
  const approvedCount = userRegs.filter((r) => r.status === 'Approved').length;
  const completedCount = userRegs.filter((r) => r.status === 'Completed').length;

  return (
    <div className="w-full bg-[#f5f5f5] min-h-screen pb-16 text-left font-body-md">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 md:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
        {/* Title block */}
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 font-headline-md">
            Đăng ký của tôi
          </h1>
          <p className="text-slate-500 text-sm md:text-base mt-1.5 font-semibold">
            Theo dõi trạng thái và hành trình các hoạt động tình nguyện bạn đã đăng ký tham gia
          </p>
        </div>

        {/* Header stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center shadow-sm min-h-[110px] sm:min-h-[120px] space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">{pendingCount}</span>
            <span className="text-sm font-bold text-gray-600">Đang chờ duyệt</span>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center shadow-sm min-h-[110px] sm:min-h-[120px] space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">{approvedCount}</span>
            <span className="text-sm font-bold text-gray-600">Sắp diễn ra</span>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center shadow-sm min-h-[110px] sm:min-h-[120px] space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">{completedCount}</span>
            <span className="text-sm font-bold text-gray-600">Đã hoàn thành</span>
          </div>
        </div>

        {/* Section Title */}
        <div className="space-y-1 pt-2">
          <h2 className="text-xl font-bold text-gray-900 font-headline-md">
            Dòng thời gian hoạt động
          </h2>
          <p className="text-sm text-gray-500 font-semibold">
            Theo dõi hành trình tình nguyện của bạn theo trình tự thời gian
          </p>
        </div>

        {/* Timeline Items List */}
        <div className="space-y-4">
          {userRegs.length === 0 ? (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-8 sm:p-16 text-center shadow-sm space-y-4">
              <span className="material-symbols-outlined text-gray-300 text-5xl">event_busy</span>
              <p className="text-sm text-gray-500 font-semibold italic">
                Bạn chưa đăng ký tham gia hoạt động nào.
              </p>
              <a
                href="#/activities"
                className="inline-block w-full sm:w-auto bg-[#006d37] hover:bg-[#005027] text-white font-bold px-6 py-2.5 rounded-xl transition-all text-sm shadow-sm"
              >
                Khám phá hoạt động ngay
              </a>
            </div>
          ) : (
            userRegs.map((reg) => {
              const actDetails = activities.find((a) => a._id === reg.activity_id);
              return <RegistrationCard key={reg._id} registration={reg} activity={actDetails} />;
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRegistrationsView;
