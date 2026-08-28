import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { AdminOverviewTab } from '../components/tabs/AdminOverviewTab';
import { AdminOrganizersTab } from '../components/tabs/AdminOrganizersTab';
import { AdminActivitiesTab } from '../components/tabs/AdminActivitiesTab';
import { AdminUsersTab } from '../components/tabs/AdminUsersTab';
import { AdminStatsTab } from '../components/tabs/AdminStatsTab';
import { AdminHistoryTab } from '../components/tabs/AdminHistoryTab';

type AdminTab = 'overview' | 'organizers' | 'activities' | 'users' | 'stats' | 'history';

export const AdminDashboard: React.FC = () => {
  const { currentUser, users, activities, registrations, organizerRequests } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <span className="material-symbols-outlined text-rose-500 text-6xl">gpp_bad</span>
        <h2 className="text-xl font-bold text-slate-800 font-headline-md">
          Không có quyền truy cập
        </h2>
        <p className="text-sm text-slate-500">
          Trang quản trị chỉ dành cho tài khoản có quyền Quản trị viên (Admin).
        </p>
        <a
          href="#/feed"
          className="inline-block bg-[#006d37] text-white px-6 py-2.5 rounded-xl font-bold text-xs"
        >
          Quay lại trang chủ
        </a>
      </div>
    );
  }

  const pendingOrgCount = organizerRequests.filter((r) => r.status === 'Pending').length;
  const pendingActCount = activities.filter((a) => a.status === 'Pending Review').length;

  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen pb-16 text-left font-body-md">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 md:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header Title */}
        <div className="border-b border-slate-200/60 pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-headline-md tracking-tight">
            Bảng điều khiển Quản trị viên
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Giám sát toàn bộ hoạt động của hệ thống, kiểm duyệt tổ chức, chiến dịch và quản trị thành viên.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 w-full overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-white text-[#006d37] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tổng quan
          </button>

          <button
            onClick={() => setActiveTab('organizers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'organizers'
                ? 'bg-white text-[#006d37] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Duyệt Organizer</span>
            {pendingOrgCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingOrgCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'activities'
                ? 'bg-white text-[#006d37] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Duyệt Hoạt động</span>
            {pendingActCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingActCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-white text-[#006d37] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quản lý Người dùng ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'stats'
                ? 'bg-white text-[#006d37] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Thống kê hệ thống
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-white text-[#006d37] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lịch sử kiểm duyệt
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <AdminOverviewTab
            users={users}
            activities={activities}
            organizerRequests={organizerRequests}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'organizers' && (
          <AdminOrganizersTab
            organizerRequests={organizerRequests}
            users={users}
          />
        )}

        {activeTab === 'activities' && (
          <AdminActivitiesTab activities={activities} />
        )}

        {activeTab === 'users' && <AdminUsersTab users={users} />}

        {activeTab === 'stats' && (
          <AdminStatsTab
            activities={activities}
            registrations={registrations}
            users={users}
          />
        )}

        {activeTab === 'history' && (
          <AdminHistoryTab
            organizerRequests={organizerRequests}
            activities={activities}
            users={users}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
