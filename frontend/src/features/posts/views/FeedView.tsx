import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import type { Post } from '../../../core/types';
import { PostCard } from '../components/PostCard';
import { CreatePostModal } from '../components/CreatePostModal';
import { EditPostModal } from '../components/EditPostModal';
import { ImageLightbox } from '../../../shared/components/ui/ImageLightbox';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { AnimatedCounter } from '../../../shared/components/ui/AnimatedCounter';
import { ActivitySkeleton, PostSkeleton, PaginationSkeleton } from '../../../shared/components/ui/Skeletons';

interface FeedViewProps {
  mode?: 'home' | 'posts';
}

const POST_FIELD_OPTIONS = [
  'Môi trường',
  'Giáo dục',
  'Y tế',
  'Từ thiện',
  'Gây quỹ',
  'Động vật',
  'Cộng đồng'
];

const normalizeSearchText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const FeedView: React.FC<FeedViewProps> = ({ mode = 'home' }) => {
  const isPostsPage = mode === 'posts';
  const {
    currentUser,
    isDataLoading,
    globalStats,
    activities,
    posts,
    createPost,
    editPost,
    deletePost,
    showNotification
  } = useApp();

  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [lightboxPost, setLightboxPost] = useState<Post | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [fieldFilter, setFieldFilter] = useState('All');
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'mine'>('all');

  const itemsPerPage = 3;
  const [feedPage, setFeedPage] = useState(1);
  const postsPerPage = 5;

  useEffect(() => {
    setFeedPage(1);
  }, [searchQuery, fieldFilter, ownerFilter]);

  // Banner slide state
  const bannerImages = [
    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80'
  ];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImageIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerImages.length]);

  // Featured Activities
  const featuredActivities = useMemo(() => {
    return activities
      .filter((a) => a.status === 'Open' || a.status === 'Ongoing')
      .slice(0, 9);
  }, [activities]);

  const totalPages = Math.ceil(featuredActivities.length / itemsPerPage);

  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return featuredActivities.slice(start, start + itemsPerPage);
  }, [featuredActivities, currentPage, itemsPerPage]);

  // Filtered Community Posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (ownerFilter === 'mine' && currentUser) {
      result = result.filter((p) => p.author_id === currentUser._id);
    }

    if (fieldFilter !== 'All') {
      const normalizedField = normalizeSearchText(fieldFilter);
      result = result.filter(
        (p) =>
          p.hashtags?.some((tag) => normalizeSearchText(tag).includes(normalizedField)) ||
          normalizeSearchText(p.content).includes(normalizedField) ||
          (p.title && normalizeSearchText(p.title).includes(normalizedField))
      );
    }

    if (searchQuery.trim()) {
      const normalizedQuery = normalizeSearchText(searchQuery.trim());
      result = result.filter(
        (p) =>
          (p.title && normalizeSearchText(p.title).includes(normalizedQuery)) ||
          normalizeSearchText(p.content).includes(normalizedQuery) ||
          p.hashtags?.some((tag) => normalizeSearchText(tag).includes(normalizedQuery))
      );
    }

    return result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [posts, ownerFilter, currentUser, fieldFilter, searchQuery]);

  const totalFeedPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedFeedPosts = useMemo(() => {
    const start = (feedPage - 1) * postsPerPage;
    return filteredPosts.slice(start, start + postsPerPage);
  }, [filteredPosts, feedPage, postsPerPage]);

  const handleOpenCreateModal = () => {
    if (!currentUser) {
      showNotification('Vui lòng đăng nhập để đăng bài viết.', 'info');
      window.location.hash = '#/login';
      return;
    }
    setShowCreateModal(true);
  };

  const handleCreatePost = async (
    title: string,
    content: string,
    images: string[],
    videoUrl: string | null,
    hashtags: string[]
  ) => {
    const res = await createPost(title, content, images, videoUrl, hashtags);
    if (res.success) {
      showNotification('Đăng bài viết thành công!', 'success');
      setShowCreateModal(false);
    } else {
      throw new Error(res.error || 'Đăng bài viết thất bại.');
    }
  };

  const handleEditPost = async (
    title: string,
    content: string,
    images: string[],
    videoUrl: string | null,
    hashtags: string[]
  ) => {
    if (!editingPost) return;
    const res = await editPost(editingPost._id, title, content, images, videoUrl, hashtags);
    if (res.success) {
      showNotification('Cập nhật bài viết thành công!', 'success');
      setShowEditModal(false);
      setEditingPost(null);
    } else {
      throw new Error(res.error || 'Cập nhật bài viết thất bại.');
    }
  };

  const handleDeletePost = async (postId: string) => {
    const res = await deletePost(postId);
    if (res.success) {
      showNotification('Đã xóa bài viết thành công.', 'success');
    } else {
      showNotification(res.error || 'Không thể xóa bài viết.', 'error');
    }
  };

  const handleImageClick = (post: Post, index: number) => {
    setLightboxPost(post);
    setLightboxIndex(index);
  };

  // Stats values with fallbacks
  const totalCampaigns = globalStats?.totalCampaigns ?? activities.length;
  const totalVolunteers = globalStats?.totalVolunteers ?? 120;
  const totalOrganizers = globalStats?.totalOrganizers ?? 15;
  const totalCompleted = globalStats?.totalCompleted ?? activities.filter((a) => a.status === 'Completed').length;

  return (
    <div className="bg-surface text-on-surface font-body-md text-left py-6 sm:py-8">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 space-y-12 sm:space-y-16">
        {/* ===================== HERO SECTION ===================== */}
        {!isPostsPage && (
          <>
            <section className="bg-white border border-surface-variant/40 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Hero Text */}
                <div className="lg:col-span-7 space-y-5 text-left">
                  <span className="bg-[#e8f5e9] text-[#006d37] font-bold text-xs px-3.5 py-1.5 rounded-full inline-block uppercase tracking-wider shadow-sm">
                    Cộng Đồng Tình Nguyện Việt Nam
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-on-surface font-headline-md tracking-tight leading-[1.15]">
                    Kết nối yêu thương, <br />
                    <span className="text-[#006d37]">Lan tỏa hạnh phúc</span>
                  </h1>
                  <p className="text-on-surface-variant text-sm md:text-base leading-relaxed max-w-xl font-medium">
                    Nền tảng gắn kết những trái tim thiện nguyện cùng các tổ chức xã hội uy tín. Tham gia ngay để tạo nên những thay đổi tích cực cho cộng đồng.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <a
                      href="#/activities"
                      className="bg-[#006d37] hover:bg-[#005027] text-white font-bold rounded-full py-3.5 px-7 text-sm transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-2"
                    >
                      <span>Khám phá hoạt động</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </a>
                    <button
                      onClick={handleOpenCreateModal}
                      className="bg-white hover:bg-slate-50 text-[#006d37] border border-[#006d37] font-bold rounded-full py-3.5 px-6 text-sm transition-all shadow-sm cursor-pointer flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">edit_square</span>
                      <span>Đăng bài chia sẻ</span>
                    </button>
                  </div>
                </div>

                {/* Right Hero Carousel */}
                <div className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-lg h-[260px] sm:h-[340px] group bg-slate-100">
                  {bannerImages.map((img, idx) => (
                    <div
                      key={idx}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        idx === activeImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                    >
                      <img src={img} alt="Volunteer activity" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>

                  {/* Carousel Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {bannerImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === activeImageIndex ? 'bg-white w-6' : 'bg-white/50'
                        }`}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Prev / Next controls */}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex(
                        (prev) => (prev - 1 + bannerImages.length) % bannerImages.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev + 1) % bannerImages.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>
              </div>
            </section>

            {/* ===================== STATS ===================== */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {[
                { value: totalCampaigns, label: 'Tổng chiến dịch' },
                { value: totalVolunteers, label: 'Tình nguyện viên' },
                { value: totalOrganizers, label: 'Nhà tổ chức' },
                { value: totalCompleted, label: 'Đã hoàn thành' }
              ].map((s, i) => (
                <div
                  key={i}
                  className="bg-white border border-surface-variant/40 rounded-2xl p-4 sm:p-6 text-center shadow-sm"
                >
                  <h3 className="text-3xl sm:text-4xl font-bold text-[#006d37] flex items-center justify-center">
                    <AnimatedCounter target={s.value} />
                    {s.value > 0 && (
                      <span className="text-2xl sm:text-3xl ml-0.5 text-[#006d37]/80">+</span>
                    )}
                  </h3>
                  <p className="text-on-surface-variant font-semibold text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </section>

            {/* ===================== FEATURED ACTIVITIES ===================== */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 border-b border-surface-variant/40 pb-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-on-surface font-headline-md">
                    Hoạt động nổi bật
                  </h2>
                  <p className="text-on-surface-variant text-sm">
                    Tham gia các hoạt động xã hội đang diễn ra gần bạn
                  </p>
                </div>
                <a
                  href="#/activities"
                  className="text-[#006d37] hover:underline font-bold text-sm flex items-center gap-1"
                >
                  Xem tất cả →
                </a>
              </div>

              {isDataLoading ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <ActivitySkeleton key={i} />
                    ))}
                  </div>
                  <PaginationSkeleton count={3} className="pt-2" />
                </div>
              ) : featuredActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 bg-white border border-slate-100 rounded-3xl">
                  <span className="material-symbols-outlined text-5xl text-slate-300">
                    volunteer_activism
                  </span>
                  <p className="text-slate-500 font-semibold text-sm">
                    Hiện chưa có hoạt động nổi bật nào đang mở đăng ký.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {paginatedActivities.map((act) => (
                      <div
                        key={act._id}
                        onClick={() => {
                          window.location.hash = `#/activity/${act._id}`;
                        }}
                        className="bg-white border border-surface-variant/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer"
                      >
                        <div className="relative h-[200px] shrink-0">
                          <img
                            src={
                              act.image_url ||
                              'https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=600'
                            }
                            alt={act.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=600';
                            }}
                          />
                          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#006d37] font-bold text-xs px-3 py-1 rounded-full uppercase border border-[#006d37]/20">
                            {act.categories[0] || 'Tình nguyện'}
                          </span>
                          {act.status === 'Open' && (
                            <span className="absolute top-4 right-4 bg-[#006d37] text-white text-xs font-bold px-3 py-1 rounded-full">
                              Đang mở
                            </span>
                          )}
                        </div>
                        <div className="p-5 flex flex-col justify-between flex-grow space-y-3">
                          <div className="space-y-2">
                            <h3 className="text-lg font-bold text-on-surface line-clamp-2 leading-tight">
                              {act.title}
                            </h3>
                            <div className="space-y-1 text-sm text-on-surface-variant">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#006d37] text-base">
                                  calendar_month
                                </span>
                                <span>{new Date(act.start_date).toLocaleDateString('vi-VN')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#006d37] text-base">
                                  location_on
                                </span>
                                <span className="line-clamp-1">
                                  {act.location?.province ||
                                    act.location?.address_detail ||
                                    'Toàn quốc'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                            <a
                              href={`#/activity/${act._id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 text-center bg-[#006d37] hover:bg-emerald-800 text-white font-bold py-2 rounded-xl text-xs transition-all"
                            >
                              Đang mở đăng ký
                            </a>
                            <a
                              href={`#/activity/${act._id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 text-center border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-2 rounded-xl text-xs transition-all"
                            >
                              Xem chi tiết
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </section>
          </>
        )}

        {/* ===================== BẢNG TIN CỘNG ĐỒNG ===================== */}
        <section id="community-feed-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-surface-variant/40 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-on-surface font-headline-md">
                {isPostsPage ? 'Tất cả bài đăng cộng đồng' : 'Bản tin cộng đồng'}
              </h2>
              <p className="text-on-surface-variant text-sm mt-1">
                Khám phá những khoảnh khắc đẹp, chia sẻ câu chuyện ý nghĩa từ các tình nguyện viên.
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="bg-[#006d37] hover:bg-[#005027] text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-2 w-fit cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>Tạo bài viết mới</span>
            </button>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <span
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  style={{ fontSize: 18 }}
                >
                  search
                </span>
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết, hashtag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006d37] text-slate-800 transition-all"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setOwnerFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    ownerFilter === 'all'
                      ? 'bg-[#006d37] text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Tất cả bài viết
                </button>
                {currentUser && (
                  <button
                    onClick={() => setOwnerFilter('mine')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      ownerFilter === 'mine'
                        ? 'bg-[#006d37] text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    Bài viết của tôi
                  </button>
                )}
              </div>
            </div>

            {/* Field/Tag pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Chủ đề:</span>
              <button
                onClick={() => setFieldFilter('All')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  fieldFilter === 'All'
                    ? 'bg-[#e8f5e9] text-[#006d37] font-bold'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Tất cả
              </button>
              {POST_FIELD_OPTIONS.map((field) => (
                <button
                  key={field}
                  onClick={() => setFieldFilter(field)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    fieldFilter === field
                      ? 'bg-[#e8f5e9] text-[#006d37] font-bold'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {field}
                </button>
              ))}
            </div>
          </div>

          {/* Posts List */}
          {isDataLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          ) : paginatedFeedPosts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-16 text-center space-y-3 shadow-sm">
              <span className="material-symbols-outlined text-4xl text-slate-300">feed</span>
              <p className="text-slate-500 text-sm font-semibold italic">
                Không tìm thấy bài viết nào phù hợp.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {paginatedFeedPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onEdit={(p) => {
                    setEditingPost(p);
                    setShowEditModal(true);
                  }}
                  onDelete={handleDeletePost}
                  onImageClick={handleImageClick}
                />
              ))}
            </div>
          )}

          {/* Feed Pagination */}
          <Pagination
            currentPage={feedPage}
            totalPages={totalFeedPages}
            onPageChange={setFeedPage}
            totalItems={filteredPosts.length}
          />
        </section>
      </div>

      {/* Lightbox Viewer */}
      {lightboxPost && (
        <ImageLightbox
          post={lightboxPost}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxPost(null)}
        />
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePost}
        />
      )}

      {/* Edit Post Modal */}
      {showEditModal && editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => {
            setShowEditModal(false);
            setEditingPost(null);
          }}
          onSubmit={handleEditPost}
        />
      )}
    </div>
  );
};

export default FeedView;
