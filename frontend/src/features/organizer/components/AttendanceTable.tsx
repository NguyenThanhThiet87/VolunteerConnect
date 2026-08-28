import React, { useState } from 'react';
import type { Registration, Activity } from '../../../core/types';
import { useApp } from '../../../context/AppContext';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { RegistrationStatusBadge } from '../../../shared/components/ui/StatusBadge';

interface AttendanceTableProps {
  activities: Activity[];
  registrations: Registration[];
  selectedActivityId: string;
  onSelectActivity: (id: string) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  activities,
  registrations,
  selectedActivityId,
  onSelectActivity
}) => {
  const { updateParticipation, showNotification } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter registrations belonging to selected activity and approved
  const activityRegs = registrations.filter(
    (r) =>
      r.activity_id === selectedActivityId &&
      (r.status === 'Approved' || r.status === 'Completed' || r.status === 'Absent')
  );

  const filtered = activityRegs.filter((reg) => {
    if (statusFilter !== 'All' && reg.status !== statusFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const name = (reg.denormalized_volunteer?.name || '').toLowerCase();
      const email = (reg.denormalized_volunteer?.email || '').toLowerCase();
      const phone = (reg.denormalized_volunteer?.phone || '').toLowerCase();
      if (!name.includes(q) && !email.includes(q) && !phone.includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleUpdateStatus = async (
    regId: string,
    newStatus: 'Completed' | 'Absent'
  ) => {
    const res = await updateParticipation(regId, newStatus);
    if (res && res.error) {
      showNotification(res.error, 'error');
    } else {
      showNotification(
        `Đã điểm danh: ${newStatus === 'Completed' ? 'Hoàn thành' : 'Vắng mặt'}`,
        'success'
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm text-left">
      {/* Activity Select Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
            Chọn hoạt động để điểm danh
          </label>
          <select
            value={selectedActivityId}
            onChange={(e) => {
              onSelectActivity(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-80 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#006d37] bg-white cursor-pointer"
          >
            <option value="">-- Chọn hoạt động --</option>
            {activities.map((act) => (
              <option key={act._id} value={act._id}>
                {act.title}
              </option>
            ))}
          </select>
        </div>

        {selectedActivityId && (
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Tìm TNV theo tên, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006d37]"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006d37] bg-white cursor-pointer"
            >
              <option value="All">Tất cả</option>
              <option value="Approved">Chưa điểm danh</option>
              <option value="Completed">Đã tham gia</option>
              <option value="Absent">Vắng mặt</option>
            </select>
          </div>
        )}
      </div>

      {!selectedActivityId ? (
        <div className="p-12 text-center text-slate-400 text-sm italic">
          Vui lòng chọn một hoạt động ở menu phía trên để tiến hành điểm danh tình nguyện viên.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3">Tình nguyện viên</th>
                  <th className="px-5 py-3">Liên hệ</th>
                  <th className="px-5 py-3">Trạng thái hiện tại</th>
                  <th className="px-5 py-3 text-right">Điểm danh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center text-slate-400 text-xs italic"
                    >
                      Không có tình nguyện viên nào trong danh sách duyệt của hoạt động này.
                    </td>
                  </tr>
                ) : (
                  paginated.map((reg) => {
                    const volName = reg.denormalized_volunteer?.name || 'Tình nguyện viên';
                    const volEmail = reg.denormalized_volunteer?.email || 'Chưa cập nhật';
                    const volPhone = reg.denormalized_volunteer?.phone || 'Chưa cập nhật';

                    return (
                      <tr key={reg._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-800">
                          <a
                            href={`#/profile?userId=${reg.volunteer_id}`}
                            className="hover:text-[#006d37] hover:underline"
                          >
                            {volName}
                          </a>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          <div>{volPhone}</div>
                          <div className="text-slate-400">{volEmail}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <RegistrationStatusBadge status={reg.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleUpdateStatus(reg._id, 'Completed')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                                reg.status === 'Completed'
                                  ? 'bg-[#006d37] text-white shadow-sm'
                                  : 'bg-emerald-50 text-[#006d37] hover:bg-emerald-100'
                              }`}
                            >
                              ✓ Có mặt
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(reg._id, 'Absent')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                                reg.status === 'Absent'
                                  ? 'bg-rose-600 text-white shadow-sm'
                                  : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              }`}
                            >
                              ✕ Vắng mặt
                            </button>
                          </div>
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
            totalItems={filtered.length}
          />
        </>
      )}
    </div>
  );
};

export default AttendanceTable;
