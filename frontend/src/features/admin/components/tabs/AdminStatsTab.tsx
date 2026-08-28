import React, { useState } from 'react';
import type { Activity, Registration, User } from '../../../../core/types';
import { formatDateVi } from '../../../../core/utils/formatters';
import { ActivityStatusBadge } from '../../../../shared/components/ui/StatusBadge';
import { Pagination } from '../../../../shared/components/ui/Pagination';

interface AdminStatsTabProps {
  activities: Activity[];
  registrations: Registration[];
  users: User[];
}

export const AdminStatsTab: React.FC<AdminStatsTabProps> = ({
  activities,
  registrations
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalActs = activities.length || 1;
  const openActsCount = activities.filter((a) => a.status === 'Open').length;
  const pendingActsCount = activities.filter((a) => a.status === 'Pending Review').length;
  const completedActsCount = activities.filter((a) => a.status === 'Completed').length;
  const completedRegsCount = registrations.filter((r) => r.status === 'Completed').length;

  const filteredActivities = activities.filter((act) => {
    if (statusFilter !== 'All' && act.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !act.title.toLowerCase().includes(q) &&
        !(act.denormalized_organizer?.name || '').toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginated = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 text-left">
      {/* Top Section: Progress Breakdown & Completed count */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Progress Breakdown */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-[#006d37]">analytics</span>
            <h3 className="text-base font-bold text-slate-800">
              Phân bổ tình trạng hoạt động trên hệ thống
            </h3>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            {/* Open */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-700">
                <span>Đang mở đăng ký (Open)</span>
                <span>
                  {openActsCount} / {activities.length} (
                  {Math.round((openActsCount / totalActs) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#006d37] h-full rounded-full transition-all"
                  style={{ width: `${(openActsCount / totalActs) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Pending */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-700">
                <span>Chờ kiểm duyệt (Pending Review)</span>
                <span>
                  {pendingActsCount} / {activities.length} (
                  {Math.round((pendingActsCount / totalActs) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${(pendingActsCount / totalActs) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Completed */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-700">
                <span>Đã kết thúc (Completed)</span>
                <span>
                  {completedActsCount} / {activities.length} (
                  {Math.round((completedActsCount / totalActs) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${(completedActsCount / totalActs) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Box */}
        <div className="lg:col-span-4 bg-[#e8f5e9]/50 border border-emerald-100 rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-center space-y-2">
          <div className="w-14 h-14 bg-white border border-[#006d37]/20 rounded-2xl flex items-center justify-center text-[#006d37] shadow-sm">
            <span className="material-symbols-outlined text-3xl font-bold">
              task_alt
            </span>
          </div>
          <div className="text-4xl font-black text-[#006d37]">{completedRegsCount}</div>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Lượt tham gia đã hoàn thành và được chứng nhận
          </p>
        </div>
      </div>

      {/* Activities Detail List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-slate-800 text-base">
            Danh sách chiến dịch ({activities.length})
          </h3>
          <div className="flex items-center gap-2.5">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006d37]"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006d37] bg-white cursor-pointer"
            >
              <option value="All">Tất cả</option>
              <option value="Open">Đang mở</option>
              <option value="Pending Review">Chờ duyệt</option>
              <option value="Completed">Đã kết thúc</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3">Chiến dịch</th>
                <th className="px-5 py-3">Ban tổ chức</th>
                <th className="px-5 py-3">Tình nguyện viên</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((act) => {
                const approvedCount = registrations.filter(
                  (r) =>
                    r.activity_id === act._id &&
                    (r.status === 'Approved' || r.status === 'Completed')
                ).length;

                return (
                  <tr key={act._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-800">
                      <a
                        href={`#/activity/${act._id}`}
                        className="hover:text-[#006d37] line-clamp-1 max-w-[260px]"
                      >
                        {act.title}
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold">
                      {act.denormalized_organizer?.name || 'Ban tổ chức'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-700 font-semibold">
                      {approvedCount} / {act.limit_volunteers} TNV
                    </td>
                    <td className="px-5 py-3.5">
                      <ActivityStatusBadge status={act.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-slate-400">
                      {formatDateVi(act.start_date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredActivities.length}
        />
      </div>
    </div>
  );
};

export default AdminStatsTab;
