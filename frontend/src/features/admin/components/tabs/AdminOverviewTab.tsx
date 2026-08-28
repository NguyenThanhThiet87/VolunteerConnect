import React from 'react';
import type { Activity, OrganizerRequest, User } from '../../../../core/types';
import { formatDateVi } from '../../../../core/utils/formatters';

interface AdminOverviewTabProps {
  users: User[];
  activities: Activity[];
  organizerRequests: OrganizerRequest[];
  onNavigateTab: (tab: 'organizers' | 'activities' | 'users' | 'stats' | 'history') => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  users,
  activities,
  organizerRequests,
  onNavigateTab
}) => {
  const pendingRequests = organizerRequests.filter((r) => r.status === 'Pending');
  const pendingActivities = activities.filter((a) => a.status === 'Pending Review');
  const totalVolunteers = users.filter((u) => u.role === 'Volunteer').length;
  const activeActivities = activities.filter(
    (a) => a.status === 'Open' || a.status === 'Ongoing'
  ).length;

  return (
    <div className="space-y-6 text-left">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('organizers')}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1 hover:border-[#006d37] transition-all cursor-pointer"
        >
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Yêu cầu tổ chức chờ duyệt
          </span>
          <div className="text-3xl font-black text-amber-600">{pendingRequests.length}</div>
        </div>

        <div
          onClick={() => onNavigateTab('activities')}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1 hover:border-[#006d37] transition-all cursor-pointer"
        >
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Hoạt động chờ duyệt
          </span>
          <div className="text-3xl font-black text-amber-600">{pendingActivities.length}</div>
        </div>

        <div
          onClick={() => onNavigateTab('users')}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1 hover:border-[#006d37] transition-all cursor-pointer"
        >
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Tổng tình nguyện viên
          </span>
          <div className="text-3xl font-black text-[#006d37]">{totalVolunteers}</div>
        </div>

        <div
          onClick={() => onNavigateTab('stats')}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1 hover:border-[#006d37] transition-all cursor-pointer"
        >
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Hoạt động đang mở
          </span>
          <div className="text-3xl font-black text-blue-600">{activeActivities}</div>
        </div>
      </div>

      {/* Queues Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Organizer Requests */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-lg">
                hourglass_top
              </span>
              Yêu cầu nâng cấp Organizer ({pendingRequests.length})
            </h3>
            <button
              onClick={() => onNavigateTab('organizers')}
              className="text-[#006d37] hover:underline text-xs font-bold cursor-pointer border-none bg-transparent"
            >
              Xem tất cả →
            </button>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs italic">
              Không có yêu cầu nâng cấp nào đang chờ duyệt.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingRequests.slice(0, 3).map((req) => (
                <div
                  key={req._id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800">
                      {req.denormalized_volunteer?.name || 'Tình nguyện viên'}
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5 line-clamp-1">
                      {req.organization_name || req.reason}
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('organizers')}
                    className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold cursor-pointer transition-colors shrink-0"
                  >
                    Kiểm duyệt
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Activities */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-lg">
                campaign
              </span>
              Hoạt động chờ kiểm duyệt ({pendingActivities.length})
            </h3>
            <button
              onClick={() => onNavigateTab('activities')}
              className="text-[#006d37] hover:underline text-xs font-bold cursor-pointer border-none bg-transparent"
            >
              Xem tất cả →
            </button>
          </div>

          {pendingActivities.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs italic">
              Không có hoạt động nào đang chờ kiểm duyệt.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingActivities.slice(0, 3).map((act) => (
                <div
                  key={act._id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800 line-clamp-1">{act.title}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      {act.denormalized_organizer?.name || 'Ban tổ chức'} ·{' '}
                      {formatDateVi(act.start_date)}
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('activities')}
                    className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold cursor-pointer transition-colors shrink-0"
                  >
                    Kiểm duyệt
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewTab;
