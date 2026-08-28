import React, { useState } from 'react';
import type { OrganizerRequest, User } from '../../../../core/types';
import { useApp } from '../../../../context/AppContext';
import { formatDateVi } from '../../../../core/utils/formatters';
import { Pagination } from '../../../../shared/components/ui/Pagination';

interface AdminOrganizersTabProps {
  organizerRequests: OrganizerRequest[];
  users: User[];
}

export const AdminOrganizersTab: React.FC<AdminOrganizersTabProps> = ({
  organizerRequests,
  users
}) => {
  const {
    reviewOrganizerRequest,
    bulkReviewOrganizerRequests,
    showPrompt,
    showNotification
  } = useApp();

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reviewingRequest, setReviewingRequest] = useState<OrganizerRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const pendingRequests = organizerRequests.filter((r) => r.status === 'Pending');

  const filteredRequests = pendingRequests.filter((req) => {
    const requesterUser = users.find((u) => u._id === req.volunteer_id);
    const name = (req.denormalized_volunteer?.name || '').toLowerCase();
    const email = (
      requesterUser?.email ||
      req.denormalized_volunteer?.email ||
      ''
    ).toLowerCase();
    const phone = (requesterUser?.phone || req.contact_phone || '').toLowerCase();
    const orgName = (req.organization_name || '').toLowerCase();
    const q = search.toLowerCase();

    if (
      q &&
      !name.includes(q) &&
      !email.includes(q) &&
      !phone.includes(q) &&
      !orgName.includes(q)
    ) {
      return false;
    }

    if (dateFilter && req.created_at) {
      const itemDateStr = new Date(req.created_at).toISOString().split('T')[0];
      if (itemDateStr !== dateFilter) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredRequests.map((r) => r._id));
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

  const handleSingleApprove = async (reqId: string) => {
    const res = await reviewOrganizerRequest(reqId, true);
    if (res.success) {
      showNotification('Đã duyệt nâng cấp tài khoản thành Nhà tổ chức!', 'success');
      setReviewingRequest(null);
      setSelectedIds((prev) => prev.filter((id) => id !== reqId));
    } else {
      showNotification(res.error || 'Duyệt yêu cầu thất bại.', 'error');
    }
  };

  const handleSingleReject = (reqId: string) => {
    showPrompt(
      'Nhập lý do từ chối yêu cầu nâng cấp (từ 5 đến 500 ký tự):',
      async (reason) => {
        const trimmed = reason.trim();
        if (trimmed.length < 5 || trimmed.length > 500) {
          showNotification('Lý do từ chối phải từ 5 đến 500 ký tự.', 'error');
          return;
        }
        const res = await reviewOrganizerRequest(reqId, false, trimmed);
        if (res.success) {
          showNotification('Đã từ chối yêu cầu nâng cấp.', 'success');
          setReviewingRequest(null);
          setSelectedIds((prev) => prev.filter((id) => id !== reqId));
        } else {
          showNotification(res.error || 'Từ chối thất bại.', 'error');
        }
      },
      'Từ chối yêu cầu nâng cấp'
    );
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    const res = await bulkReviewOrganizerRequests(selectedIds, true);
    if (res.success) {
      showNotification(`Đã duyệt nâng cấp ${selectedIds.length} tài khoản.`, 'success');
      setSelectedIds([]);
    } else {
      showNotification(res.error || 'Duyệt hàng loạt thất bại.', 'error');
    }
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return;
    showPrompt(
      `Nhập lý do từ chối chung cho ${selectedIds.length} yêu cầu đã chọn:`,
      async (reason) => {
        const trimmed = reason.trim();
        if (trimmed.length < 5 || trimmed.length > 500) {
          showNotification('Lý do từ chối phải từ 5 đến 500 ký tự.', 'error');
          return;
        }
        const res = await bulkReviewOrganizerRequests(selectedIds, false, trimmed);
        if (res.success) {
          showNotification(`Đã từ chối ${selectedIds.length} yêu cầu nâng cấp.`, 'success');
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
      {/* Header filter controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-bold text-slate-800 text-base">
          Yêu cầu cấp quyền Organizer ({pendingRequests.length})
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <input
            type="text"
            placeholder="Tìm theo tên, email, tổ chức..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-64 px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006d37]"
          />
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

      {/* Bulk action toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-50/70 border-b border-amber-100 px-6 py-3 flex items-center justify-between animate-fadeIn">
          <span className="text-xs font-bold text-amber-900">
            Đã chọn <strong>{selectedIds.length}</strong> yêu cầu
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
                    filteredRequests.length > 0 &&
                    filteredRequests.every((r) => selectedIds.includes(r._id))
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-5 py-3">Người gửi</th>
              <th className="px-5 py-3">Tổ chức / Kinh nghiệm</th>
              <th className="px-5 py-3">Lý do xin cấp quyền</th>
              <th className="px-5 py-3">Thời gian</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRequests.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-slate-400 text-xs italic"
                >
                  Không có yêu cầu nâng cấp nào đang chờ xử lý.
                </td>
              </tr>
            ) : (
              paginatedRequests.map((req) => {
                const requester = users.find((u) => u._id === req.volunteer_id);
                const name =
                  requester?.profile?.full_name ||
                  req.denormalized_volunteer?.name ||
                  'Tình nguyện viên';
                const isSelected = selectedIds.includes(req._id);

                return (
                  <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(req._id, e.target.checked)}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <a
                        href={`#/profile?userId=${req.volunteer_id}`}
                        className="font-bold text-slate-800 hover:text-[#006d37]"
                      >
                        {name}
                      </a>
                      <div className="text-xs text-slate-400">
                        {requester?.phone || req.contact_phone || 'Chưa cập nhật SĐT'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 text-xs font-semibold max-w-[200px]">
                      <div className="line-clamp-2">
                        {req.organization_name || 'Cá nhân hoạt động'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs max-w-[280px]">
                      <div className="line-clamp-2">{req.reason}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {formatDateVi(req.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setReviewingRequest(req)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer border-none"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleSingleApprove(req._id)}
                          className="px-3 py-1 bg-[#006d37] hover:bg-[#005027] text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer border-none"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleSingleReject(req._id)}
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
        totalItems={filteredRequests.length}
      />

      {/* Detail Modal */}
      {reviewingRequest && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 animate-scaleUp text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">
                Chi tiết yêu cầu nâng cấp
              </h3>
              <button
                onClick={() => setReviewingRequest(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer border-none bg-transparent"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Tình nguyện viên
                </span>
                <span className="font-bold text-slate-800">
                  {reviewingRequest.denormalized_volunteer?.name || 'Thành viên'}
                </span>
                <span className="text-slate-500 text-xs block">
                  SĐT: {reviewingRequest.contact_phone || 'Chưa cập nhật'}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Kinh nghiệm / Tổ chức đại diện
                </span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl text-xs mt-1 leading-relaxed">
                  {reviewingRequest.organization_name || 'Không có mô tả tổ chức'}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Lý do muốn trở thành Nhà tổ chức
                </span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl text-xs mt-1 leading-relaxed">
                  {reviewingRequest.reason}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleSingleReject(reviewingRequest._id)}
                className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Từ chối
              </button>
              <button
                onClick={() => handleSingleApprove(reviewingRequest._id)}
                className="px-5 py-2 bg-[#006d37] hover:bg-[#005027] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border-none"
              >
                Duyệt nâng cấp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrganizersTab;
