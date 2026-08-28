import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import type { Activity, User } from '../../../core/types';
import { profileApi } from '../api/profileApi';
import { mediaApi } from '../../posts/api/postApi';
import { USE_REAL_BACKEND } from '../../../config/backend';
import { Avatar } from '../../../shared/components/ui/Avatar';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { ProfileInfoItem } from '../components/ProfileInfoItem';
import { ProfilePostCard } from '../components/ProfilePostCard';
import { ProfileActivityCard } from '../components/ProfileActivityCard';
import { EditProfileModal } from '../components/EditProfileModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';

type ProfileViewMode =
  | 'details'
  | 'posts'
  | 'edit'
  | 'upgrade'
  | 'password'
  | 'participated'
  | 'org_management';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    users,
    activities,
    registrations,
    posts,
    updateProfile,
    showNotification,
    refreshAllData
  } = useApp();

  const [viewMode, setViewMode] = useState<ProfileViewMode>('details');
  const [orgActsPage, setOrgActsPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setOrgActsPage(1);
  }, [viewMode]);

  // Sync state if URL specifies a tab
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('tab=upgrade')) {
        window.location.hash = '#/request-organizer';
      } else if (hash.includes('tab=password')) {
        setViewMode('password');
      } else if (hash.includes('tab=edit')) {
        setViewMode('edit');
      } else if (hash.includes('tab=posts')) {
        setViewMode('posts');
      } else if (hash.includes('tab=participated')) {
        setViewMode('participated');
      } else if (hash.includes('tab=org_management')) {
        setViewMode('org_management');
      } else {
        setViewMode('details');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const getUserIdFromHash = () => {
    const hash = window.location.hash;
    const match = hash.match(/[?&]userId=([^&]+)/);
    return match ? match[1] : null;
  };

  const viewedUserId = getUserIdFromHash();
  const isOwnProfile = !viewedUserId || viewedUserId === currentUser?._id;

  const [fetchedUser, setFetchedUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  useEffect(() => {
    if (!isOwnProfile && viewedUserId) {
      setLoadingUser(true);
      if (USE_REAL_BACKEND) {
        profileApi
          .getById(viewedUserId)
          .then((user) => {
            setFetchedUser(user);
            setLoadingUser(false);
          })
          .catch((err) => {
            console.error('Lỗi khi tải thông tin người dùng từ backend:', err);
            setFetchedUser(null);
            setLoadingUser(false);
          });
      } else {
        const localUser = users.find((u) => u._id === viewedUserId);
        setFetchedUser(localUser || null);
        setLoadingUser(false);
      }
    } else {
      setFetchedUser(null);
      setLoadingUser(false);
    }
  }, [viewedUserId, isOwnProfile, users]);

  useEffect(() => {
    if (isOwnProfile && USE_REAL_BACKEND) {
      refreshAllData().catch((err) =>
        console.error('Error refreshing profile stats:', err)
      );
    }
  }, [isOwnProfile, refreshAllData]);

  const displayUser = isOwnProfile ? currentUser : viewedUserId ? fetchedUser : null;

  const myRegs = useMemo(
    () => registrations.filter((r) => r.volunteer_id === displayUser?._id),
    [registrations, displayUser]
  );

  const orgActs = useMemo(
    () =>
      activities
        .filter((a) => a.organizer_id === displayUser?._id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [activities, displayUser]
  );

  const userPosts = useMemo(
    () =>
      posts
        .filter((post) => post.author_id === displayUser?._id && post.status === 'Active')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [posts, displayUser]
  );

  const participatedActivityItems = useMemo(
    () =>
      myRegs
        .map((reg) => {
          const act = activities.find((a) => a._id === reg.activity_id);
          return act ? { activity: act, registration: reg } : null;
        })
        .filter((item): item is { activity: Activity; registration: typeof myRegs[0] } =>
          Boolean(item)
        ),
    [myRegs, activities]
  );

  const paginatedOrgActs = useMemo(() => {
    const start = (orgActsPage - 1) * itemsPerPage;
    return orgActs.slice(start, start + itemsPerPage);
  }, [orgActs, orgActsPage, itemsPerPage]);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showNotification('File ảnh quá lớn! Vui lòng chọn ảnh có dung lượng dưới 2MB.', 'error');
      return;
    }

    try {
      showNotification('Đang tải ảnh đại diện lên...', 'info');
      const uploadRes = await mediaApi.upload(file);
      const publicUrl = uploadRes.url;

      updateProfile(
        {
          avatar_url: publicUrl,
          full_name: currentUser.profile.full_name,
          skills: currentUser.profile.skills,
          bio: currentUser.profile.bio,
          age: currentUser.profile.age,
          gender: currentUser.profile.gender
        },
        currentUser.email || '',
        currentUser.profile.area_of_interest || '',
        currentUser.phone
      );
      showNotification('Đã cập nhật ảnh đại diện mới thành công!', 'success');
    } catch (err: any) {
      console.error('Lỗi upload avatar:', err);
      showNotification(
        err.response?.data?.detail || 'Có lỗi xảy ra khi tải ảnh lên máy chủ.',
        'error'
      );
    }
  };

  if (loadingUser) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006d37] mx-auto"></div>
        <p className="text-sm text-slate-500 font-medium">Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto text-left">
        <span className="material-symbols-outlined text-slate-300 text-6xl">person_off</span>
        <h2 className="font-headline-md text-xl font-bold text-slate-800">
          Không tìm thấy người dùng
        </h2>
        <p className="text-sm text-slate-500">
          Hồ sơ này không tồn tại hoặc tài khoản đã bị khóa/xóa khỏi hệ thống.
        </p>
        <a
          href="#/feed"
          className="inline-block bg-[#006d37] text-white px-6 py-2.5 rounded-xl font-semibold text-xs shadow-sm transition-all active:scale-95"
        >
          Quay lại trang chủ
        </a>
      </div>
    );
  }

  const roleText =
    displayUser.role === 'Volunteer'
      ? 'Tình nguyện viên'
      : displayUser.role === 'Organizer'
      ? 'Nhà tổ chức'
      : 'Quản trị viên';

  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen pb-16 text-left font-body-md">
      <div className="max-w-[1100px] mx-auto px-3 sm:px-4 md:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6">
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-200/60 pb-5">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 font-headline-md">
              {isOwnProfile ? 'Hồ sơ tài khoản' : 'Hồ sơ thành viên'}
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 font-medium leading-relaxed">
              {isOwnProfile
                ? 'Quản lý thông tin bảo mật, chỉnh sửa các chi tiết hồ sơ cá nhân và theo dõi hoạt động cộng đồng.'
                : 'Thông tin liên hệ, giới thiệu và lịch sử cống hiến của thành viên.'}
            </p>
          </div>
          {!isOwnProfile && (
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto justify-center flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-xl transition-all text-sm shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Quay lại
            </button>
          )}
        </div>

        {/* 2-Column Profile Layout */}
        <div className="grid grid-cols-12 gap-5 sm:gap-8 items-start">
          {/* ================= COLUMN 1: LEFT SIDEBAR ================= */}
          <div className="col-span-12 md:col-span-4 space-y-6">
            {/* Avatar & Basic Info Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 sm:p-6 text-center space-y-4">
              <div className="flex flex-col items-center">
                <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-[#006d37] shrink-0 bg-slate-50 shadow-sm">
                  <Avatar
                    name={displayUser.profile.full_name || 'ND'}
                    src={displayUser.profile.avatar_url}
                    size={128}
                  />
                  {isOwnProfile && (
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer">
                      <span className="material-symbols-outlined text-xl mb-1">photo_camera</span>
                      Đổi ảnh
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 mt-4 leading-tight break-words">
                  {displayUser.profile.full_name}
                </h3>
                <span className="bg-[#e8f5e9] text-[#006d37] text-xs px-3 py-1 rounded-full font-bold uppercase mt-2">
                  {roleText}
                </span>
                <p className="text-xs text-slate-400 font-medium mt-2.5">
                  Thành viên Volunteer Connect
                </p>
              </div>

              {/* Vertical Tab Navigation (Only shown for own profile) */}
              {isOwnProfile && (
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-1">
                  <button
                    onClick={() => {
                      setViewMode('details');
                      window.location.hash = '#/profile';
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      viewMode === 'details'
                        ? 'bg-[#e8f5e9] text-[#006d37] font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">account_circle</span>
                    Thông tin hồ sơ
                  </button>

                  <button
                    onClick={() => {
                      setViewMode('posts');
                      window.location.hash = '#/profile?tab=posts';
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      viewMode === 'posts'
                        ? 'bg-[#e8f5e9] text-[#006d37] font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">post_add</span>
                    Bài viết ({userPosts.length})
                  </button>

                  {displayUser.role === 'Volunteer' && (
                    <button
                      onClick={() => {
                        setViewMode('participated');
                        window.location.hash = '#/profile?tab=participated';
                      }}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        viewMode === 'participated'
                          ? 'bg-[#e8f5e9] text-[#006d37] font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">volunteer_activism</span>
                      Hoạt động đã tham gia ({participatedActivityItems.length})
                    </button>
                  )}

                  {displayUser.role === 'Organizer' && (
                    <button
                      onClick={() => {
                        setViewMode('org_management');
                        window.location.hash = '#/profile?tab=org_management';
                      }}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        viewMode === 'org_management'
                          ? 'bg-[#e8f5e9] text-[#006d37] font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">event_available</span>
                      Hoạt động đã tổ chức ({orgActs.length})
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setViewMode('edit');
                      window.location.hash = '#/profile?tab=edit';
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      viewMode === 'edit'
                        ? 'bg-[#e8f5e9] text-[#006d37] font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                    Chỉnh sửa hồ sơ
                  </button>

                  <button
                    onClick={() => {
                      setViewMode('password');
                      window.location.hash = '#/profile?tab=password';
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      viewMode === 'password'
                        ? 'bg-[#e8f5e9] text-[#006d37] font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">lock</span>
                    Đổi mật khẩu
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ================= COLUMN 2: MAIN CONTENT ================= */}
          <div className="col-span-12 md:col-span-8 space-y-6">
            {viewMode === 'edit' && isOwnProfile ? (
              <EditProfileModal
                currentUser={currentUser!}
                onClose={() => setViewMode('details')}
                onSave={(updatedProfile, email, province, phone) => {
                  updateProfile(updatedProfile, email, province, phone);
                  showNotification('Cập nhật thông tin hồ sơ thành công!', 'success');
                  setViewMode('details');
                  window.location.hash = '#/profile';
                }}
              />
            ) : viewMode === 'password' && isOwnProfile ? (
              <ChangePasswordModal onClose={() => setViewMode('details')} />
            ) : viewMode === 'posts' ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
                <h4 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
                  Tất cả bài viết ({userPosts.length})
                </h4>
                {userPosts.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm italic">
                    Chưa có bài viết nào được đăng tải.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {userPosts.map((post) => (
                      <ProfilePostCard key={post._id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            ) : viewMode === 'participated' ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
                <h4 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
                  Hoạt động đã tham gia ({participatedActivityItems.length})
                </h4>
                {participatedActivityItems.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm italic">
                    Chưa tham gia hoạt động nào.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {participatedActivityItems.map(({ activity, registration }) => (
                      <ProfileActivityCard
                        key={registration._id}
                        activity={activity}
                        registration={registration}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : viewMode === 'org_management' ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
                <h4 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
                  Hoạt động đã tổ chức ({orgActs.length})
                </h4>
                {orgActs.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm italic">
                    Chưa tạo hoạt động nào.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {paginatedOrgActs.map((act) => (
                        <ProfileActivityCard key={act._id} activity={act} />
                      ))}
                    </div>
                    <Pagination
                      currentPage={orgActsPage}
                      totalPages={Math.ceil(orgActs.length / itemsPerPage)}
                      onPageChange={setOrgActsPage}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* DETAILS TAB */
              <div className="space-y-6">
                {/* Information Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 sm:p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-bold text-slate-800 text-base">Thông tin cá nhân</h4>
                    {isOwnProfile && (
                      <button
                        onClick={() => setViewMode('edit')}
                        className="text-[#006d37] hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer border-none bg-transparent"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Chỉnh sửa
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <ProfileInfoItem
                      icon="mail"
                      iconColorClass="text-[#006d37]"
                      bgClass="bg-[#e8f5e9]"
                      label="Email liên hệ"
                      value={displayUser.email || 'Chưa cập nhật'}
                    />

                    <ProfileInfoItem
                      icon="phone"
                      iconColorClass="text-[#006d37]"
                      bgClass="bg-[#e8f5e9]"
                      label="Số điện thoại"
                      value={displayUser.phone || 'Chưa cập nhật'}
                    />

                    <ProfileInfoItem
                      icon="location_on"
                      iconColorClass="text-[#006d37]"
                      bgClass="bg-[#e8f5e9]"
                      label="Khu vực hoạt động"
                      value={displayUser.profile.area_of_interest || 'Chưa cập nhật'}
                    />

                    <ProfileInfoItem
                      icon="cake"
                      iconColorClass="text-[#006d37]"
                      bgClass="bg-[#e8f5e9]"
                      label="Tuổi & Giới tính"
                      value={
                        displayUser.profile.age || displayUser.profile.gender
                          ? `${displayUser.profile.age ? `${displayUser.profile.age} tuổi` : ''}${
                              displayUser.profile.age && displayUser.profile.gender ? ' · ' : ''
                            }${displayUser.profile.gender || ''}`
                          : 'Chưa cập nhật'
                      }
                    />
                  </div>

                  {/* Skills & Bio */}
                  {displayUser.profile.skills && displayUser.profile.skills.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Kỹ năng / Thế mạnh
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {displayUser.profile.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="bg-[#e8f5e9] text-[#006d37] font-semibold text-xs px-3 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {displayUser.profile.bio && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Giới thiệu bản thân
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {displayUser.profile.bio}
                      </p>
                    </div>
                  )}
                </div>

                {/* Recent Activities / Posts preview */}
                {userPosts.length > 0 && (
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="font-bold text-slate-800 text-base">Bài viết gần đây</h4>
                      <button
                        onClick={() => setViewMode('posts')}
                        className="text-[#006d37] hover:underline text-xs font-bold cursor-pointer border-none bg-transparent"
                      >
                        Xem tất cả ({userPosts.length}) →
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {userPosts.slice(0, 3).map((post) => (
                        <ProfilePostCard key={post._id} post={post} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
