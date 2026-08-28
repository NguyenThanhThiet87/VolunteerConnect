import React, { useState } from 'react';
import type { Activity, OrganizerRequest, User } from '../../../../core/types';
import { formatDateVi } from '../../../../core/utils/formatters';
import { Pagination } from '../../../../shared/components/ui/Pagination';

interface AdminHistoryTabProps {
  organizerRequests: OrganizerRequest[];
  activities: Activity[];
  users: User[];
}

export const AdminHistoryTab: React.FC<AdminHistoryTabProps> = ({
  organizerRequests,
  activities,
  users
}) => {
  const [subTab, setSubTab] = useState<'organizers' | 'activities'>('organizers');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Approved' | 'Rejected'>('All');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // History for organizer requests (Approved or Rejected)
  const historyOrgRequests = organizerRequests
    .filter((r) => r.status === 'Approved' || r.status === 'Rejected')
    .filter((req) => {
      if (statusFilter !== 'All' && req.status !== statusFilter) return false;
      const requesterUser = users.find((u) => u._id === req.volunteer_id);
      const name = (req.denormalized_volunteer?.name || '').toLowerCase();
      const email = (
        requesterUser?.email ||
        req.denormalized_volunteer?.email ||
        ''
      ).toLowerCase();
      const q = search.toLowerCase();

      if (q && !name.includes(q) && !email.includes(q)) return false;

      if (dateFilter && req.created_at) {
        const itemDateStr = new Date(req.created_at).toISOString().split('T')[0];
        if (itemDateStr !== dateFilter) return false;
      }
      return true;
    });

  // History for activities (Open, Rejected, Completed, Cancelled)
  const historyActivities = activities
    .filter(
      (a) =>
        a.status === 'Open' ||
        a.status === 'Rejected' ||
        a.status === 'Completed' ||
        a.status === 'Cancelled'
    )
    .filter((act) => {
      if (statusFilter === 'Approved') {
        if (act.status !== 'Open' && act.status !== 'Completed') return false;
      } else if (statusFilter === 'Rejected') {
        if (act.status !== 'Rejected') return false;
      }

      const title = (act.title || '').toLowerCase();
      const orgName = (act.denormalized_organizer?.name || '').toLowerCase();
      const q = search.toLowerCase();

      if (q && !title.includes(q) && !orgName.includes(q)) return false;

      if (dateFilter && act.created_at) {
        const itemDateStr = new Date(act.created_at).toISOString().split('T')[0];
        if (itemDateStr !== dateFilter) return false;
      }
      return true;
    });

  const currentList = subTab === 'organizers' ? historyOrgRequests : historyActivities;
  const totalPages = Math.ceil(currentList.length / itemsPerPage);
  const paginated = currentList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm text-left">
      {/* Header & Sub-Tabs */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 w-full md:w-auto">
          <button
            onClick={() => {
              setSubTab('organizers');
              setCurrentPage(1);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'organizers'
                ? 'bg-white text-[#006d37] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Yêu cầu nâng cấp ({historyOrgRequests.length})
          </button>
          <button
            onClick={() => {
              setSubTab('activities');
              setCurrentPage(1);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'activities'
                ? 'bg-white text-[#006d37] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Hoạt động ({historyActivities.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48 px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006d37]"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006d37] bg-white cursor-pointer"
          >
            <option value="All">Tất cả kết quả</option>
            <option value="Approved">Đã duyệt</option>
            <option value="Rejected">Bị từ chối</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006d37] bg-white cursor-pointer"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              <th className="px-5 py-3">
                {subTab === 'organizers' ? 'Tình nguyện viên' : 'Tên hoạt động'}
              </th>
              <th className="px-5 py-3">
                {subTab === 'organizers' ? 'Tổ chức / Lý do' : 'Ban tổ chức'}
              </th>
              <th className="px-5 py-3">Kết quả</th>
              <th className="px-5 py-3">Ghi chú / Lý do từ chối</th>
              <th className="px-5 py-3 text-right">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-slate-400 text-xs italic"
                >
                  Không có dữ liệu lịch sử nào phù hợp.
                </td>
              </tr>
            ) : (
              paginated.map((item: any) => {
                const isApproved =
                  item.status === 'Approved' ||
                  item.status === 'Open' ||
                  item.status === 'Completed';

                return (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-800">
                      {subTab === 'organizers' ? (
                        <a
                          href={`#/profile?userId=${item.volunteer_id}`}
                          className="hover:text-[#006d37]"
                        >
                          {item.denormalized_volunteer?.name || 'Tình nguyện viên'}
                        </a>
                      ) : (
                        <a
                          href={`#/activity/${item._id}`}
                          className="hover:text-[#006d37] line-clamp-1 max-w-[220px]"
                        >
                          {item.title}
                        </a>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold max-w-[220px]">
                      <div className="line-clamp-2">
                        {subTab === 'organizers'
                          ? item.organization_name || item.reason
                          : item.denormalized_organizer?.name || 'Ban tổ chức'}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isApproved
                            ? 'bg-emerald-50 text-[#006d37]'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {isApproved ? 'Đã duyệt' : 'Từ chối'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-xs text-slate-500 max-w-[250px]">
                      <div className="line-clamp-2 italic">
                        {item.rejection_reason || item.reject_reason || '—'}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right text-xs text-slate-400 whitespace-nowrap">
                      {formatDateVi(item.updated_at || item.created_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={currentList.length}
      />
    </div>
  );
};

export default AdminHistoryTab;
