import React, { useState } from 'react';
import type { User } from '../../../../core/types';
import { useApp } from '../../../../context/AppContext';
import { Avatar } from '../../../../shared/components/ui/Avatar';
import { Pagination } from '../../../../shared/components/ui/Pagination';

interface AdminUsersTabProps {
  users: User[];
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ users }) => {
  const { toggleUserBan, showConfirm, showNotification, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;

    const name = (u.profile?.full_name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = (u.phone || '').toLowerCase();
    const q = search.toLowerCase();

    if (q && !name.includes(q) && !email.includes(q) && !phone.includes(q)) {
      return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleToggleBan = (user: User) => {
    if (user._id === currentUser?._id) {
      showNotification('Bạn không thể tự khóa tài khoản của chính mình.', 'error');
      return;
    }

    const actionText = user.is_active ? 'khóa' : 'mở khóa';
    showConfirm(
      `Bạn chắc chắn muốn ${actionText} tài khoản của ${user.profile?.full_name || user.email}?`,
      async () => {
        const res = await toggleUserBan(user._id, !user.is_active);
        if (res && res.error) {
          showNotification(res.error, 'error');
        } else {
          showNotification(`Đã ${actionText} tài khoản thành công!`, 'success');
        }
      },
      `Xác nhận ${actionText} tài khoản`
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm text-left">
      {/* Search & Filter Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-bold text-slate-800 text-base">
          Quản lý người dùng ({users.length})
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <input
            type="text"
            placeholder="Tìm theo tên, email, SĐT..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-64 px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006d37]"
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006d37] bg-white cursor-pointer"
          >
            <option value="All">Tất cả vai trò</option>
            <option value="Volunteer">Tình nguyện viên</option>
            <option value="Organizer">Nhà tổ chức</option>
            <option value="Admin">Quản trị viên</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              <th className="px-5 py-3">Người dùng</th>
              <th className="px-5 py-3">Vai trò</th>
              <th className="px-5 py-3">Khu vực quan tâm</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-slate-400 text-xs italic"
                >
                  Không tìm thấy người dùng nào phù hợp.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => {
                const name = u.profile?.full_name || 'Thành viên';
                const roleClass =
                  u.role === 'Admin'
                    ? 'bg-purple-50 text-purple-700 border-purple-100'
                    : u.role === 'Organizer'
                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                    : 'bg-emerald-50 text-[#006d37] border-emerald-100';

                return (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={name}
                          src={u.profile?.avatar_url}
                          size={36}
                        />
                        <div>
                          <a
                            href={`#/profile?userId=${u._id}`}
                            className="font-bold text-slate-800 hover:text-[#006d37] block"
                          >
                            {name}
                          </a>
                          <span className="text-slate-400 text-xs">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${roleClass}`}
                      >
                        {u.role === 'Volunteer'
                          ? 'TNV'
                          : u.role === 'Organizer'
                          ? 'Organizer'
                          : 'Admin'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold">
                      {u.profile?.area_of_interest || 'Chưa cập nhật'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          u.is_active
                            ? 'bg-emerald-50 text-[#006d37]'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.is_active ? 'bg-[#006d37]' : 'bg-rose-600'
                          }`}
                        />
                        {u.is_active ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {u._id !== currentUser?._id && (
                        <button
                          onClick={() => handleToggleBan(u)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            u.is_active
                              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                              : 'border-emerald-200 text-[#006d37] hover:bg-emerald-50'
                          }`}
                        >
                          {u.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
                        </button>
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
        totalItems={filteredUsers.length}
      />
    </div>
  );
};

export default AdminUsersTab;
