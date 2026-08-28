import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import type { Activity } from '../../../core/types';
import { formatDateVi } from '../../../core/utils/formatters';
import { ActivityStatusBadge } from '../../../shared/components/ui/StatusBadge';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { CreateActivityModal } from '../components/CreateActivityModal';
import { EditActivityModal } from '../components/EditActivityModal';
import { VolunteerApplicantsTable } from '../components/VolunteerApplicantsTable';
import { AttendanceTable } from '../components/AttendanceTable';

export const OrganizerDashboard: React.FC = () => {
  const {
    currentUser,
    activities,
    registrations,
    createActivity,
    editActivity
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'activities' | 'registrations' | 'attendance'
  >('overview');

  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Filters for activities tab
  const [activitySearch, setActivitySearch] = useState('');
  const [activityStatusFilter, setActivityStatusFilter] = useState('All');
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('All');
  const [activitiesPage, setActivitiesPage] = useState(1);
  const itemsPerPage = 5;

  const myCampaigns = useMemo(
    () =>
      activities
        .filter((a) => a.organizer_id === currentUser?._id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [activities, currentUser]
  );

  const myCampaignIds = useMemo(() => myCampaigns.map((a) => a._id), [myCampaigns]);

  const allOrgRegs = useMemo(
    () => registrations.filter((r) => myCampaignIds.includes(r.activity_id)),
    [registrations, myCampaignIds]
  );

  // Stat metrics
  const totalCampaignsCount = myCampaigns.length;
  const pendingApplicantsCount = allOrgRegs.filter((r) => r.status === 'Pending').length;
  const approvedApplicantsCount = allOrgRegs.filter((r) => r.status === 'Approved').length;
  const completedApplicantsCount = allOrgRegs.filter((r) => r.status === 'Completed').length;

  const filteredCampaigns = useMemo(() => {
    return myCampaigns.filter((act) => {
      if (activityStatusFilter !== 'All' && act.status !== activityStatusFilter) return false;
      if (activityCategoryFilter !== 'All' && !act.categories.includes(activityCategoryFilter))
        return false;
      if (activitySearch.trim()) {
        const q = activitySearch.toLowerCase();
        if (
          !act.title.toLowerCase().includes(q) &&
          !act.description.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [myCampaigns, activityStatusFilter, activityCategoryFilter, activitySearch]);

  const totalActPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const paginatedCampaigns = useMemo(() => {
    const start = (activitiesPage - 1) * itemsPerPage;
    return filteredCampaigns.slice(start, start + itemsPerPage);
  }, [filteredCampaigns, activitiesPage, itemsPerPage]);

  const handleCreateSubmit = async (data: Partial<Activity>) => {
    const res = await createActivity(data);
    if (res && res.error) {
      throw new Error(res.error);
    }
  };

  const handleEditSubmit = async (id: string, data: Partial<Activity>) => {
    const res = await editActivity(id, data);
    if (res && res.error) {
      throw new Error(res.error);
    }
  };

  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen pb-16 text-left font-body-md">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 md:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header Title & CTA Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-headline-md tracking-tight">
              Bảng điều khiển Nhà tổ chức
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Quản lý các hoạt động thiện nguyện, kiểm duyệt tình nguyện viên và điểm danh tham gia.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#006d37] hover:bg-[#005027] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer w-fit"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            Tạo hoạt động mới
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 w-full sm:w-fit overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-[#006d37] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'activities'
                ? 'bg-white text-[#006d37] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hoạt động ({myCampaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'registrations'
                ? 'bg-white text-[#006d37] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đăng ký tham gia ({allOrgRegs.length})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-white text-[#006d37] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Điểm danh
          </button>
        </div>

        {/* ================= TAB: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tổng hoạt động
                </span>
                <div className="text-3xl font-black text-slate-800">{totalCampaignsCount}</div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Chờ duyệt
                </span>
                <div className="text-3xl font-black text-amber-600">
                  {pendingApplicantsCount}
                </div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Đã chấp nhận
                </span>
                <div className="text-3xl font-black text-[#006d37]">
                  {approvedApplicantsCount}
                </div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Đã hoàn thành
                </span>
                <div className="text-3xl font-black text-blue-600">
                  {completedApplicantsCount}
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent campaigns */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-base">Hoạt động gần đây</h3>
                <button
                  onClick={() => setActiveTab('activities')}
                  className="text-[#006d37] hover:underline text-xs font-bold cursor-pointer border-none bg-transparent"
                >
                  Xem tất cả ({myCampaigns.length}) →
                </button>
              </div>

              {myCampaigns.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs italic">
                  Bạn chưa tạo hoạt động nào. Hãy bấm &quot;Tạo hoạt động mới&quot; để bắt đầu.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myCampaigns.slice(0, 3).map((act) => (
                    <div
                      key={act._id}
                      className="py-3 flex items-center justify-between gap-4"
                    >
                      <div>
                        <a
                          href={`#/activity/${act._id}`}
                          className="font-bold text-slate-800 text-sm hover:text-[#006d37]"
                        >
                          {act.title}
                        </a>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {formatDateVi(act.start_date)} · {act.location.province}
                        </div>
                      </div>
                      <ActivityStatusBadge status={act.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB: ACTIVITIES ================= */}
        {activeTab === 'activities' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4 p-4 sm:p-6">
            {/* Filter bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Tìm hoạt động..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006d37]"
              />
              <select
                value={activityStatusFilter}
                onChange={(e) => setActivityStatusFilter(e.target.value)}
                className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006d37] bg-white cursor-pointer"
              >
                <option value="All">Tất cả trạng thái</option>
                <option value="Draft">Bản nháp</option>
                <option value="Pending Review">Chờ duyệt</option>
                <option value="Open">Đang mở</option>
                <option value="Full">Đã đầy</option>
                <option value="Ongoing">Đang diễn ra</option>
                <option value="Completed">Đã hoàn thành</option>
                <option value="Rejected">Bị từ chối</option>
              </select>
              <select
                value={activityCategoryFilter}
                onChange={(e) => setActivityCategoryFilter(e.target.value)}
                className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006d37] bg-white cursor-pointer"
              >
                <option value="All">Tất cả lĩnh vực</option>
                <option value="Môi trường">Môi trường</option>
                <option value="Giáo dục">Giáo dục</option>
                <option value="Y tế">Y tế</option>
                <option value="Từ thiện">Từ thiện</option>
                <option value="Gây quỹ">Gây quỹ</option>
              </select>
            </div>

            {/* Campaign List */}
            {filteredCampaigns.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs italic">
                Không tìm thấy hoạt động nào.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {paginatedCampaigns.map((act) => {
                  const approvedCount = registrations.filter(
                    (r) =>
                      r.activity_id === act._id &&
                      (r.status === 'Approved' || r.status === 'Completed')
                  ).length;

                  return (
                    <div
                      key={act._id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={`#/activity/${act._id}`}
                            className="font-bold text-sm text-[#006d37] hover:underline"
                          >
                            {act.title}
                          </a>
                          <ActivityStatusBadge status={act.status} />
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-4">
                          <span>{formatDateVi(act.start_date)}</span>
                          <span>
                            {approvedCount}/{act.limit_volunteers} TNV
                          </span>
                          <span>{act.location.province}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {act.status === 'Pending Review' && (
                          <button
                            onClick={() => setEditingActivity(act)}
                            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Sửa
                          </button>
                        )}
                        {(act.status === 'Completed' || act.status === 'Ongoing') && (
                          <button
                            onClick={() => {
                              setSelectedActivityId(act._id);
                              setActiveTab('attendance');
                            }}
                            className="px-3.5 py-1.5 bg-[#006d37] hover:bg-[#005027] text-white rounded-lg text-xs font-bold transition-all cursor-pointer border-none"
                          >
                            Điểm danh
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                <Pagination
                  currentPage={activitiesPage}
                  totalPages={totalActPages}
                  onPageChange={setActivitiesPage}
                  totalItems={filteredCampaigns.length}
                />
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: REGISTRATIONS ================= */}
        {activeTab === 'registrations' && (
          <VolunteerApplicantsTable
            registrations={allOrgRegs}
            activities={myCampaigns}
          />
        )}

        {/* ================= TAB: ATTENDANCE ================= */}
        {activeTab === 'attendance' && (
          <AttendanceTable
            activities={myCampaigns}
            registrations={allOrgRegs}
            selectedActivityId={selectedActivityId}
            onSelectActivity={setSelectedActivityId}
          />
        )}
      </div>

      {/* Create Activity Modal */}
      {showCreateModal && (
        <CreateActivityModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {/* Edit Activity Modal */}
      {editingActivity && (
        <EditActivityModal
          activity={editingActivity}
          onClose={() => setEditingActivity(null)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
};

export default OrganizerDashboard;
