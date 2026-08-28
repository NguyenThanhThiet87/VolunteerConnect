import React, { useState } from 'react';
import type { Registration, Activity } from '../../../core/types';
import { useApp } from '../../../context/AppContext';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { RegistrationStatusBadge } from '../../../shared/components/ui/StatusBadge';

interface VolunteerApplicantsTableProps {
  registrations: Registration[];
  activities: Activity[];
}

export const VolunteerApplicantsTable: React.FC<VolunteerApplicantsTableProps> = ({
  registrations,
  activities
}) => {
  const {
    approveRegistration,
    cancelOrRejectRegistration,
    bulkReviewRegistrations,
    showPrompt,
    showNotification
  } = useApp();

  const [subTab, setSubTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [search, setSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredRegistrations = registrations.filter((reg) => {
    if (subTab === 'pending' && reg.status !== 'Pending') return false;
    if (subTab === 'approved' && reg.status !== 'Approved' && reg.status !== 'Completed')
      return false;
    if (subTab === 'rejected' && reg.status !== 'Rejected' && reg.status !== 'Cancelled')
      return false;

    if (activityFilter !== 'All' && reg.activity_id !== activityFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const name = (reg.denormalized_volunteer?.name || '').toLowerCase();
      const email = (reg.denormalized_volunteer?.email || '').toLowerCase();
      const phone = (reg.denormalized_volunteer?.phone || '').toLowerCase();
      const actTitle = (reg.denormalized_activity?.title || '').toLowerCase();
      if (
        !name.includes(q) &&
        !email.includes(q) &&
        !phone.includes(q) &&
        !actTitle.includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const paginatedRegistrations = filteredRegistrations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pendingCount = registrations.filter((r) => r.status === 'Pending').length;
  const approvedCount = registrations.filter(
    (r) => r.status === 'Approved' || r.status === 'Completed'
  ).length;
  const rejectedCount = registrations.filter(
    (r) => r.status === 'Rejected' || r.status === 'Cancelled'
  ).length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredRegistrations.map((r) => r._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSingleApprove = async (regId: string) => {
    const res = await approveRegistration(regId);
    if (res && res.error) {
      showNotification(res.error, 'error');
    } else {
      showNotification('Đã duyệt đơn đăng ký của tình nguyện viên!', 'success');
      setSelectedIds((prev) => prev.filter((id) => id !== regId));
    }
  };

  const handleSingleReject = (regId: string) => {
    showPrompt(
      'Nhập lý do từ chối đơn đăng ký này (tùy chọn):',
      async (reason) => {
        const res = await cancelOrRejectRegistration(regId, reason || undefined);
        if (res && res.error) {
          showNotification(res.error, 'error');
        } else {
          showNotification('Đã từ chối đơn đăng ký.', 'success');
          setSelectedIds((prev) => prev.filter((id) => id !== regId));
        }
      },
      'Từ chối đơn đăng ký'
    );
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkReviewRegistrations(selectedIds, 'approve');
      showNotification(`Đã duyệt thành công ${selectedIds.length} đơn đăng ký!`, 'success');
      setSelectedIds([]);
    } catch (err: any) {
      showNotification('Không thể duyệt hàng loạt. Vui lòng thử lại.', 'error');
    }
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return;
    showPrompt(
      `Nhập lý do từ chối chung cho ${selectedIds.length} đơn đăng ký đã chọn:`,
      async (reason) => {
        try {
          await bulkReviewRegistrations(selectedIds, 'reject', reason || undefined);
          showNotification(`Đã từ chối ${selectedIds.length} đơn đăng ký.`, 'success');
          setSelectedIds([]);
        } catch (err: any) {
          showNotification('Không thể từ chối hàng loạt.', 'error');
        }
      },
      'Từ chối hàng loạt'
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm text-left">
      {/* Sub Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 border-b border-slate-100 gap-3">
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 w-full md:w-auto">
          <button
            onClick={() => {
              setSubTab('pending');
              setCurrentPage(1);
              setSelectedIds([]);
            }}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'pending'
                ? 'bg-white text-[#006d37] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Chờ duyệt ({pendingCount})
          </button>

          <button
            onClick={() => {
              setSubTab('approved');
              setCurrentPage(1);
              setSelectedIds([]);
            }}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'approved'
                ? 'bg-white text-[#006d37] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Đã duyệt ({approvedCount})
          </button>

          <button
            onClick={() => {
              setSubTab('rejected');
              setCurrentPage(1);
              setSelectedIds([]);
            }}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'rejected'
                ? 'bg-white text-[#006d37] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Từ chối ({rejectedCount})
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <input
            type="text"
            placeholder="Tìm theo tên TNV, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-56 px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006d37]"
          />

          <select
            value={activityFilter}
            onChange={(e) => {
              setActivityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006d37] bg-white cursor-pointer"
          >
            <option value="All">Tất cả hoạt động</option>
            {activities.map((act) => (
              <option key={act._id} value={act._id}>
                {act.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && subTab === 'pending' && (
        <div className="bg-[#e8f5e9]/70 border-b border-emerald-100 px-6 py-3 flex items-center justify-between animate-fadeIn">
          <span className="text-xs font-bold text-[#006d37]">
            Đã chọn <strong>{selectedIds.length}</strong> đơn đăng ký
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkApprove}
              className="px-3.5 py-1.5 bg-[#006d37] hover:bg-[#005027] text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer border-none"
            >
              Duyệt tất cả đã chọn
            </button>
            <button
              onClick={handleBulkReject}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer border-none"
            >
              Từ chối tất cả đã chọn
            </button>
          </div>
        </div>
      )}

      {/* Registrations Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {subTab === 'pending' && (
                <th className="px-5 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredRegistrations.length > 0 &&
                      filteredRegistrations.every((r) => selectedIds.includes(r._id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              <th className="px-5 py-3">Tình nguyện viên</th>
              <th className="px-5 py-3">Hoạt động</th>
              <th className="px-5 py-3">Liên hệ</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRegistrations.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-slate-400 text-xs italic"
                >
                  Không có đơn đăng ký nào trong danh sách này.
                </td>
              </tr>
            ) : (
              paginatedRegistrations.map((reg) => {
                const volName = reg.denormalized_volunteer?.name || 'Tình nguyện viên';
                const volEmail = reg.denormalized_volunteer?.email || 'Chưa cập nhật';
                const volPhone = reg.denormalized_volunteer?.phone || 'Chưa cập nhật';
                const isSelected = selectedIds.includes(reg._id);

                return (
                  <tr key={reg._id} className="hover:bg-slate-50/50 transition-colors">
                    {subTab === 'pending' && (
                      <td className="px-5 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectOne(reg._id, e.target.checked)}
                        />
                      </td>
                    )}
                    <td className="px-5 py-3.5 font-bold text-slate-800">
                      <a
                        href={`#/profile?userId=${reg.volunteer_id}`}
                        className="hover:text-[#006d37] hover:underline"
                      >
                        {volName}
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">
                      <a
                        href={`#/activity/${reg.activity_id}`}
                        className="hover:text-[#006d37] line-clamp-1 max-w-[200px]"
                      >
                        {reg.denormalized_activity?.title}
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
                      {reg.status === 'Pending' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSingleApprove(reg._id)}
                            className="px-3 py-1 bg-[#006d37] hover:bg-[#005027] text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer border-none"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleSingleReject(reg._id)}
                            className="px-3 py-1 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <a
                          href={`#/activity/${reg.activity_id}`}
                          className="text-xs font-semibold text-slate-500 hover:text-[#006d37]"
                        >
                          Xem chi tiết
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredRegistrations.length}
      />
    </div>
  );
};

export default VolunteerApplicantsTable;
