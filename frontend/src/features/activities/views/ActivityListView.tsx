import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import type { Activity } from '../../../core/types';
import { activityApi } from '../api/activityApi';
import { ActivityCard } from '../components/ActivityCard';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { USE_REAL_BACKEND } from '../../../config/backend';

export const ActivityListView: React.FC = () => {
  const { activities } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Open/Full');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [serverActivities, setServerActivities] = useState<Activity[]>([]);
  const [totalServerCount, setTotalServerCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, statusFilter]);

  // Load navbar search query if present in URL hash params
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('?')) {
        const queryParams = new URLSearchParams(hash.split('?')[1]);
        const search = queryParams.get('search');
        if (search) {
          setSearchQuery(decodeURIComponent(search));
        }
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch activities from backend if using real backend
  useEffect(() => {
    if (USE_REAL_BACKEND) {
      setLoading(true);
      activityApi
        .list({
          search: searchQuery,
          category: selectedCategory,
          status: statusFilter,
          page: currentPage,
          limit: itemsPerPage
        })
        .then((res) => {
          setServerActivities(res.activities);
          setTotalServerCount(res.total);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Lỗi lấy danh sách hoạt động từ server:', err);
          setLoading(false);
        });
    }
  }, [searchQuery, selectedCategory, statusFilter, currentPage]);

  // Filter activities for local mock simulation mode
  const filteredActivities = activities.filter((act) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = act.title.toLowerCase().includes(q);
      const matchDesc = act.description.toLowerCase().includes(q);
      const matchLoc = (
        act.location.district +
        ' ' +
        act.location.province +
        ' ' +
        act.location.address_detail
      )
        .toLowerCase()
        .includes(q);
      if (!matchTitle && !matchDesc && !matchLoc) return false;
    }

    if (selectedCategory !== 'All') {
      const matchCategory = act.categories.includes(selectedCategory);
      if (!matchCategory) return false;
    }

    if (statusFilter === 'Open/Full') {
      if (act.status !== 'Open' && act.status !== 'Full') return false;
    } else if (statusFilter === 'Open') {
      if (act.status !== 'Open') return false;
    } else if (statusFilter === 'Full') {
      if (act.status !== 'Full') return false;
    } else if (statusFilter === 'Completed') {
      if (act.status !== 'Completed') return false;
    }

    return true;
  });

  const totalPages = USE_REAL_BACKEND
    ? Math.ceil(totalServerCount / itemsPerPage)
    : Math.ceil(filteredActivities.length / itemsPerPage);

  const sortedActivities = useMemo(() => {
    return [...filteredActivities].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });
  }, [filteredActivities]);

  const paginatedActivities = useMemo(() => {
    if (USE_REAL_BACKEND) {
      return serverActivities;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedActivities.slice(startIndex, startIndex + itemsPerPage);
  }, [USE_REAL_BACKEND, serverActivities, sortedActivities, currentPage, itemsPerPage]);

  return (
    <div className="bg-surface text-on-surface text-left font-body-md py-8">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 space-y-8">
        {/* Header section */}
        <div className="text-center sm:text-left space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#006d37] font-headline-md tracking-tight">
            Danh Sách Hoạt Động
          </h1>
          <p className="text-sm text-on-surface-variant font-medium max-w-2xl">
            Khám phá các hoạt động tình nguyện ý nghĩa đang diễn ra trên khắp cả nước và cùng chung tay đóng góp cho cộng đồng.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border border-surface-variant/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="flex flex-col gap-2 md:col-span-6">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Tìm kiếm hoạt động
              </label>
              <div className="relative">
                <span
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  style={{ fontSize: 18 }}
                >
                  search
                </span>
                <input
                  type="text"
                  placeholder="Nhập tên hoạt động, địa điểm hoặc mô tả..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-surface-variant rounded-xl bg-surface focus:outline-none focus:border-[#006d37] focus:ring-1 focus:ring-[#006d37] text-sm text-on-surface placeholder-outline transition-all"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="flex flex-col gap-2 md:col-span-3">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Lĩnh vực
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-surface-variant rounded-xl bg-surface focus:outline-none focus:border-[#006d37] focus:ring-1 focus:ring-[#006d37] text-sm text-on-surface transition-all cursor-pointer"
              >
                <option value="All">Tất cả lĩnh vực</option>
                <option value="Môi trường">Môi trường</option>
                <option value="Giáo dục">Giáo dục</option>
                <option value="Y tế">Y tế</option>
                <option value="Từ thiện">Từ thiện</option>
                <option value="Gây quỹ">Gây quỹ</option>
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="flex flex-col gap-2 md:col-span-3">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-surface-variant rounded-xl bg-surface focus:outline-none focus:border-[#006d37] focus:ring-1 focus:ring-[#006d37] text-sm text-on-surface transition-all cursor-pointer"
              >
                <option value="Open/Full/Completed">Tất cả</option>
                <option value="Open">Đang mở</option>
                <option value="Full">Đã đầy chỗ</option>
                <option value="Completed">Đã kết thúc</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count & Reset Filter */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-sm text-on-surface-variant">
          <span>
            Tìm thấy{' '}
            <strong>{USE_REAL_BACKEND ? totalServerCount : filteredActivities.length}</strong>{' '}
            hoạt động phù hợp
          </span>
          {(searchQuery || selectedCategory !== 'All' || statusFilter !== 'Open/Full') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setStatusFilter('Open/Full');
                window.location.hash = '#/activities';
              }}
              className="text-[#006d37] hover:underline font-bold cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>

        {/* Grid List or Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006d37]"></div>
          </div>
        ) : (USE_REAL_BACKEND ? paginatedActivities.length === 0 : filteredActivities.length === 0) ? (
          <div className="bg-white rounded-3xl p-8 sm:p-16 border border-surface-variant/40 text-center space-y-4 shadow-sm">
            <span className="material-symbols-outlined text-outline text-5xl">search_off</span>
            <p className="text-sm text-on-surface-variant italic">
              Không tìm thấy hoạt động nào phù hợp.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedActivities.map((act) => (
              <ActivityCard key={act._id} activity={act} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={USE_REAL_BACKEND ? totalServerCount : filteredActivities.length}
        />
      </div>
    </div>
  );
};

export default ActivityListView;
