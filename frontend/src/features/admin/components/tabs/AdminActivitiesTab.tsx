import React, { useState } from 'react';
import type { Activity } from '../../../../core/types';
import { useApp } from '../../../../context/AppContext';
import { formatDateVi } from '../../../../core/utils/formatters';
import { Pagination } from '../../../../shared/components/ui/Pagination';

interface AdminActivitiesTabProps {
  activities: Activity[];
}

export const AdminActivitiesTab: React.FC<AdminActivitiesTabProps> = ({ activities }) => {
  const {
    reviewActivity,
    bulkReviewActivities,
    showPrompt,
    showNotification
  } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reviewingActivity, setReviewingActivity] = useState<Activity | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const pendingActivities = activities.filter((a) => a.status === 'Pending Review');

  const filteredActivities = pendingActivities.filter((act) => {
    if (categoryFilter !== 'All' && !act.categories.includes(categoryFilter)) return false;

    const title = (act.title || '').toLowerCase();
    const orgName = (act.denormalized_organizer?.name || '').toLowerCase();
    const q = search.toLowerCase();

    if (q && !title.includes(q) && !orgName.includes(q)) {
      return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredActivities.map((a) => a._id));
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

  const handleSingleApprove = async (actId: string) => {
    const res = await reviewActivity(actId, true);
    if (res.success) {
      showNotification('Đã duyệt mở hoạt động tình nguyện!', 'success');
      setReviewingActivity(null);
      setSelectedIds((prev) => prev.filter((id) => id !== actId));
    } else {
      showNotification(res.error || 'Duyệt hoạt động thất bại.', 'error');
    }
  };

  const handleSingleReject = (actId: string) => {
    showPrompt(
      'Nhập lý do từ chối hoạt động này (từ 5 đến 500 ký tự):',
      async (reason) => {
        const trimmed = reason.trim();
        if (trimmed.length < 5 || trimmed.length > 500) {
          showNotification('Lý do từ chối phải từ 5 đến 500 ký tự.', 'error');
          return;
        }
        const res = await reviewActivity(actId, false, trimmed);
        if (res.success) {
          showNotification('Đã từ chối hoạt động.', 'success');
          setReviewingActivity(null);
          setSelectedIds((prev) => prev.filter((id) => id !== actId));
        } else {
          showNotification(res.error || 'Từ chối hoạt động thất bại.', 'error');
        }
      },
      'Từ chối hoạt động'
    );
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    const res = await bulkReviewActivities(selectedIds, true);
    if (res.success) {
      showNotification(`Đã duyệt mở ${selectedIds.length} hoạt động thành công!`, 'success');
      setSelectedIds([]);
    } else {
      showNotification(res.error || 'Duyệt hàng loạt thất bại.', 'error');
    }
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return;
    showPrompt(
      `Nhập lý do từ chối chung cho ${selectedIds.length} hoạt động đã chọn:`,
      async (reason) => {
        const trimmed = reason.trim();
        if (trimmed.length < 5 || trimmed.length > 500) {
          showNotification('Lý do từ chối phải từ 5 đến 500 ký tự.', 'error');
          return;
        }
        const res = await bulkReviewActivities(selectedIds, false, trimmed);
        if (res.success) {
          showNotification(`Đã từ chối ${selectedIds.length} hoạt động.`, 'success');
          setSelectedIds([]);
        } else {
          showNotification(res.error || 'Từ chối hàng loạt thất bại.', 'error');
        }
      },
      'Từ chối hàng loạt'
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm text-left">
      {/* Header controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-bold text-slate-800 text-base">
          Hoạt động chờ kiểm duyệt ({pendingActivities.length})
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <input
            type="text"
            placeholder="Tìm tên hoạt động, tổ chức..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-64 px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006d37]"
          />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006d37] bg-white cursor-pointer"
          >
            <option value="All">Tất cả lĩnh vực</option>
            <option value="Môi trường">Môi trường</option>
            <option value="Giáo dục">Giáo dục</option>
            <option value="Y tế">Y tế</option>
            <option value="Từ thiện">Từ thiện</option>
            <option value="Gây quỹ">Gây quỹ</option>
          </select>
        </div>
      </div>

      {/* Bulk action toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-50/70 border-b border-amber-100 px-6 py-3 flex items-center justify-between animate-fadeIn">
          <span className="text-xs font-bold text-amber-900">
            Đã chọn <strong>{selectedIds.length}</strong> hoạt động
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              <th className="px-5 py-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={
                    filteredActivities.length > 0 &&
                    filteredActivities.every((a) => selectedIds.includes(a._id))
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-5 py-3">Tên hoạt động</th>
              <th className="px-5 py-3">Nhà tổ chức</th>
              <th className="px-5 py-3">Địa điểm / Lĩnh vực</th>
              <th className="px-5 py-3">Thời gian</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedActivities.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-slate-400 text-xs italic"
                >
                  Không có hoạt động nào đang chờ kiểm duyệt.
                </td>
              </tr>
            ) : (
              paginatedActivities.map((act) => {
                const isSelected = selectedIds.includes(act._id);

                return (
                  <tr key={act._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(act._id, e.target.checked)}
                      />
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800">
                      <span className="hover:text-[#006d37] line-clamp-1 max-w-[220px]">
                        {act.title}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-700 font-semibold">
                      {act.denormalized_organizer?.name || 'Ban tổ chức'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      <div className="font-semibold text-slate-700">
                        {act.categories.join(', ')}
                      </div>
                      <div>{act.location?.province || 'Toàn quốc'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {formatDateVi(act.start_date)}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setReviewingActivity(act)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer border-none"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleSingleApprove(act._id)}
                          className="px-3 py-1 bg-[#006d37] hover:bg-[#005027] text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer border-none"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleSingleReject(act._id)}
                          className="px-3 py-1 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Từ chối
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

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredActivities.length}
      />

      {/* Activity Detail Modal */}
      {reviewingActivity && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-4 animate-scaleUp text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">
                Chi tiết hoạt động kiểm duyệt
              </h3>
              <button
                onClick={() => setReviewingActivity(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer border-none bg-transparent"
              >
                ×
              </button>
            </div>

            {/* Banner preview */}
            <div className="h-44 rounded-xl overflow-hidden bg-slate-100">
              <img
                src={reviewingActivity.image_url || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a'}
                alt={reviewingActivity.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="text-base font-bold text-slate-900 leading-snug">
                {reviewingActivity.title}
              </h4>
              <div className="grid grid-cols-2 gap-3 text-slate-600">
                <div>
                  <strong className="text-slate-700">Ban tổ chức:</strong>{' '}
                  {reviewingActivity.denormalized_organizer?.name}
                </div>
                <div>
                  <strong className="text-slate-700">Lĩnh vực:</strong>{' '}
                  {reviewingActivity.categories.join(', ')}
                </div>
                <div>
                  <strong className="text-slate-700">Địa điểm:</strong>{' '}
                  {reviewingActivity.location.address_detail},{' '}
                  {reviewingActivity.location.district},{' '}
                  {reviewingActivity.location.province}
                </div>
                <div>
                  <strong className="text-slate-700">Chỉ tiêu TNV:</strong>{' '}
                  {reviewingActivity.limit_volunteers}
                </div>
              </div>

              <div>
                <strong className="text-slate-700 block mb-1">Mô tả hoạt động:</strong>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed whitespace-pre-line">
                  {reviewingActivity.description}
                </p>
              </div>

              {reviewingActivity.requirements && (
                <div>
                  <strong className="text-slate-700 block mb-1">Yêu cầu TNV:</strong>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed whitespace-pre-line">
                    {reviewingActivity.requirements}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleSingleReject(reviewingActivity._id)}
                className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Từ chối duyệt
              </button>
              <button
                onClick={() => handleSingleApprove(reviewingActivity._id)}
                className="px-5 py-2 bg-[#006d37] hover:bg-[#005027] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border-none"
              >
                Duyệt & Cho phép mở
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActivitiesTab;
