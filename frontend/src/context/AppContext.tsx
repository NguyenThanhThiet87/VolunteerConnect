import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from 'react';
import type {
  User,
  UserProfile,
  LocationInfo,
  Activity,
  Registration,
  OrganizerRequest,
  Post,
  Comment
} from '../core/types';
import type { ToastNotification } from '../shared/components/ui/Toast';
import type { ConfirmDialogData } from '../shared/components/ui/ConfirmDialog';
import type { PromptDialogData } from '../shared/components/ui/PromptDialog';
import initialMockData from '../mocks/mockData.json';
import {
  authService,
  activityService,
  registrationService,
  organizerService,
  postService,
  userService,
  adminService,
  statsService
} from '../services/apiService';
import { USE_REAL_BACKEND } from '../config/backend';

// Re-export core domain types for backward compatibility
export type {
  User,
  UserProfile,
  LocationInfo,
  Activity,
  Registration,
  OrganizerRequest,
  Post,
  Comment
};

export interface AppContextType {
  currentUser: User | null;
  users: User[];
  activities: Activity[];
  registrations: Registration[];
  organizerRequests: OrganizerRequest[];
  posts: Post[];
  isDataLoading: boolean;
  isAuthLoading: boolean;
  notification: ToastNotification | null;
  confirmDialog: ConfirmDialogData | null;
  promptDialog: PromptDialogData | null;
  globalStats: {
    totalVolunteers: number;
    totalCampaigns: number;
    totalOrganizers: number;
    totalCompleted: number;
  } | null;

  // Actions
  login: (email: string, password_raw: string) => Promise<{ success: boolean; error?: string }>;
  loginAs: (role: 'Volunteer' | 'Organizer' | 'Admin') => void;
  register: (fullname: string, email: string, phone: string, password_raw: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  verifyOtp: (email: string, otpCode: string, flow?: 'register' | 'forgot_password') => Promise<{ success: boolean; error?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  setCurrentUser: (user: User | null) => void;

  createActivity: (activityData: Partial<Activity>) => Promise<{ success: boolean; error?: string; activity?: Activity }>;
  editActivity: (activityId: string, activityData: Partial<Activity>) => Promise<{ success: boolean; error?: string }>;
  registerForActivity: (activityId: string) => Promise<{ success: boolean; error?: string }>;
  cancelOrRejectRegistration: (registrationId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  approveRegistration: (registrationId: string) => Promise<{ success: boolean; error?: string }>;
  updateParticipation: (registrationId: string, status: 'Completed' | 'Absent') => Promise<{ success: boolean; error?: string }>;
  bulkReviewRegistrations: (registrationIds: string[], action: 'approve' | 'reject', reason?: string) => Promise<{ success: boolean; error?: string }>;

  createPost: (title: string, content: string, images: string[], videoUrl: string | null, hashtags: string[]) => Promise<{ success: boolean; error?: string }>;
  editPost: (postId: string, title: string, content: string, images: string[], videoUrl: string | null, hashtags: string[]) => Promise<{ success: boolean; error?: string }>;
  likePost: (postId: string) => Promise<{ success: boolean; error?: string }>;
  sharePost: (postId: string) => Promise<{ success: boolean; error?: string }>;
  deletePost: (postId: string) => Promise<{ success: boolean; error?: string }>;
  incrementCommentCount: (postId: string) => void;

  updateProfile: (updatedProfile: Partial<UserProfile>, email?: string, province?: string, phone?: string) => void;
  changePassword: (old_password: string, new_password: string) => Promise<{ success: boolean; error?: string }>;

  submitOrganizerRequest: (reason: string, organizationName?: string, contactPhone?: string) => Promise<{ success: boolean; error?: string }>;
  reviewOrganizerRequest: (requestId: string, isApproved: boolean, feedback?: string) => Promise<{ success: boolean; error?: string }>;
  bulkReviewOrganizerRequests: (requestIds: string[], isApproved: boolean, feedback?: string) => Promise<{ success: boolean; error?: string }>;

  reviewActivity: (activityId: string, isApproved: boolean, feedback?: string) => Promise<{ success: boolean; error?: string }>;
  bulkReviewActivities: (activityIds: string[], isApproved: boolean, feedback?: string) => Promise<{ success: boolean; error?: string }>;
  toggleUserBan: (userId: string, is_active: boolean) => Promise<{ success: boolean; error?: string }>;

  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  showConfirm: (message: string, onConfirm: () => void, title?: string, confirmText?: string, cancelText?: string) => void;
  closeConfirm: () => void;
  showPrompt: (message: string, onConfirm: (value: string) => void, title?: string, defaultValue?: string, placeholder?: string) => void;
  closePrompt: () => void;
  refreshAllData: (options?: { silent?: boolean }) => Promise<void>;
  resetToInitial: () => void;
  resetDatabase: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [organizerRequests, setOrganizerRequests] = useState<OrganizerRequest[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<ToastNotification | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData | null>(null);
  const [promptDialog, setPromptDialog] = useState<PromptDialogData | null>(null);
  const [globalStats, setGlobalStats] = useState<{
    totalVolunteers: number;
    totalCampaigns: number;
    totalOrganizers: number;
    totalCompleted: number;
  } | null>(null);

  const currentUserRef = useRef<User | null>(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const setCurrentUserInternal = (user: User | null) => {
    currentUserRef.current = user;
    setCurrentUserState(user);
  };

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  }, []);

  const showConfirm = useCallback(
    (
      message: string,
      onConfirm: () => void,
      title: string = 'Xác nhận',
      confirmText: string = 'Xác nhận',
      cancelText: string = 'Hủy bỏ'
    ) => {
      setConfirmDialog({
        title,
        message,
        confirmText,
        cancelText,
        onConfirm: () => {
          setConfirmDialog(null);
          onConfirm();
        }
      });
    },
    []
  );

  const closeConfirm = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  const showPrompt = useCallback(
    (
      message: string,
      onConfirm: (value: string) => void,
      title: string = 'Nhập thông tin',
      defaultValue: string = '',
      placeholder: string = ''
    ) => {
      setPromptDialog({
        title,
        message,
        placeholder,
        initialValue: defaultValue,
        onConfirm: (val) => {
          setPromptDialog(null);
          onConfirm(val);
        }
      });
    },
    []
  );

  const closePrompt = useCallback(() => {
    setPromptDialog(null);
  }, []);

  const resetToInitial = useCallback(() => {
    const rawData = initialMockData as any;
    const defaultUsers = rawData.users || [];
    const defaultActivities = rawData.activities || [];
    const defaultRegistrations = rawData.registrations || [];
    const defaultRequests = rawData.organizer_requests || rawData.organizerRequests || [];
    const defaultPosts = rawData.posts || [];

    setUsers(defaultUsers);
    setActivities(defaultActivities);
    setRegistrations(defaultRegistrations);
    setOrganizerRequests(defaultRequests);
    setPosts(defaultPosts);

    if (!USE_REAL_BACKEND && defaultUsers.length > 0) {
      setCurrentUserInternal(defaultUsers[0]);
    }
  }, []);

  const resetDatabase = useCallback(() => {
    resetToInitial();
    showNotification('Đã đặt lại cơ sở dữ liệu về ban đầu.', 'info');
  }, [resetToInitial, showNotification]);

  const refreshAllData = useCallback(async (options: { silent?: boolean } = {}) => {
    const isSilent = options.silent === true;
    if (USE_REAL_BACKEND) {
      try {
        if (!isSilent) {
          setIsDataLoading(true);
        }
        let activeUser = currentUserRef.current;
        const token = localStorage.getItem('token');
        if (token) {
          try {
            activeUser = await authService.getCurrentUser();
            setCurrentUserInternal(activeUser);
          } catch (e) {
            console.warn('Lỗi khôi phục phiên đăng nhập backend:', e);
            setCurrentUserInternal(null);
            activeUser = null;
          }
        }

        // Fetch global stats
        try {
          const stats = await statsService.getGlobalStats();
          if (stats) {
            setGlobalStats(stats);
          }
        } catch (e) {
          console.error('Lỗi tải thống kê hệ thống:', e);
        }

        // Load activities
        try {
          const actsRes = await activityService.list({ limit: 100 });
          setActivities(actsRes.activities || []);
        } catch (e) {
          console.error('Lỗi tải danh sách hoạt động:', e);
        }

        // Load posts
        try {
          const postsList = await postService.getAll();
          setPosts(postsList || []);
        } catch (e) {
          console.error('Lỗi tải danh sách bài viết:', e);
        }

        // Load user registrations if logged in
        if (activeUser) {
          if (activeUser.role === 'Volunteer') {
            try {
              const myRegs = await registrationService.getVolunteerRegistrations();
              setRegistrations(myRegs);
            } catch (e) {
              console.error('Lỗi tải đăng ký TNV:', e);
            }
          } else if (activeUser.role === 'Organizer') {
            try {
              const orgActs = await organizerService.getMyActivities();
              const regsPromises = orgActs.map((act) =>
                registrationService.getActivityRegistrations(act._id).catch(() => [] as Registration[])
              );
              const regsLists = await Promise.all(regsPromises);
              setRegistrations(regsLists.flat());
            } catch (e) {
              console.error('Lỗi tải danh sách đăng ký cho Organizer:', e);
            }
          } else if (activeUser.role === 'Admin') {
            try {
              const [pendingOrgs, pendingActsRes, allUsers] = await Promise.allSettled([
                adminService.getPendingOrganizers(),
                adminService.getPendingActivities(),
                adminService.getAllUsers()
              ]);
              if (pendingOrgs.status === 'fulfilled') {
                setOrganizerRequests(pendingOrgs.value);
              }
              if (pendingActsRes.status === 'fulfilled') {
                // Keep loaded
              }
              if (allUsers.status === 'fulfilled') {
                setUsers(allUsers.value);
              }
            } catch (e) {
              console.error('Lỗi tải dữ liệu admin:', e);
            }
          }
        }
      } catch (err) {
        console.error('Lỗi refresh dữ liệu:', err);
      } finally {
        setIsDataLoading(false);
      }
    } else {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Auth Methods
  const login = async (email: string, password_raw: string) => {
    setIsAuthLoading(true);
    try {
      const res = await authService.login(email, password_raw);
      setCurrentUserInternal(res.user);
      await refreshAllData({ silent: true });
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Đăng nhập thất bại';
      return { success: false, error: msg };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const loginAs = (role: 'Volunteer' | 'Organizer' | 'Admin') => {
    const user = users.find((u) => u.role === role);
    if (user) {
      setCurrentUserInternal(user);
      showNotification(`Đã chuyển sang tài khoản ${role}: ${user.profile?.full_name}`, 'info');
    }
  };

  const register = async (fullname: string, email: string, phone: string, password_raw: string) => {
    setIsAuthLoading(true);
    try {
      await authService.register(fullname, email, phone, password_raw);
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Đăng ký thất bại';
      return { success: false, error: msg };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setCurrentUserInternal(null);
    window.location.hash = '#/feed';
    showNotification('Đã đăng xuất tài khoản thành công!', 'info');
  };

  const verifyOtp = async (email: string, otpCode: string, flow: 'register' | 'forgot_password' = 'register') => {
    try {
      if (flow === 'forgot_password') {
        await authService.verifyResetOtp(email, otpCode);
      } else {
        await authService.verifyOtp(email, otpCode);
      }
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Mã xác thực không hợp lệ';
      return { success: false, error: msg };
    }
  };

  const resendOtp = async (email: string) => {
    try {
      await authService.resendOtp(email);
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Gửi lại OTP thất bại';
      return { success: false, error: msg };
    }
  };

  // Activity Methods
  const createActivity = async (activityData: Partial<Activity>) => {
    try {
      const created = await organizerService.createActivity(activityData);
      setActivities((prev) => [created, ...prev]);
      return { success: true, activity: created };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || err.message || 'Tạo hoạt động thất bại' };
    }
  };

  const editActivity = async (activityId: string, activityData: Partial<Activity>) => {
    try {
      const updated = await organizerService.updateActivity(activityId, activityData);
      setActivities((prev) => prev.map((a) => (a._id === activityId ? updated : a)));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || err.message || 'Cập nhật thất bại' };
    }
  };

  const registerForActivity = async (activityId: string) => {
    try {
      const reg = await registrationService.register(activityId);
      setRegistrations((prev) => [reg, ...prev]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || err.message || 'Đăng ký thất bại' };
    }
  };

  const cancelOrRejectRegistration = async (registrationId: string, reason?: string) => {
    try {
      const reg = await registrationService.cancel(registrationId);
      setRegistrations((prev) => prev.map((r) => (r._id === registrationId ? reg : r)));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || reason || err.message || 'Hủy đăng ký thất bại' };
    }
  };

  const approveRegistration = async (registrationId: string) => {
    try {
      const reg = await registrationService.approve(registrationId);
      setRegistrations((prev) => prev.map((r) => (r._id === registrationId ? reg : r)));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || err.message || 'Duyệt thất bại' };
    }
  };

  const updateParticipation = async (registrationId: string, status: 'Completed' | 'Absent') => {
    try {
      const reg = await registrationService.updateParticipation(registrationId, status);
      setRegistrations((prev) => prev.map((r) => (r._id === registrationId ? reg : r)));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || err.message || 'Cập nhật thất bại' };
    }
  };

  const bulkReviewRegistrations = async (registrationIds: string[], action: 'approve' | 'reject', reason?: string) => {
    try {
      for (const id of registrationIds) {
        if (action === 'approve') {
          await registrationService.approve(id);
        } else {
          await registrationService.reject(id, reason);
        }
      }
      await refreshAllData({ silent: true });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Posts Methods
  const createPost = async (title: string, content: string, images: string[], videoUrl: string | null, hashtags: string[]) => {
    try {
      const post = await postService.create(title, content, images, videoUrl, hashtags);
      setPosts((prev) => [post, ...prev]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || err.message || 'Đăng bài thất bại' };
    }
  };

  const editPost = async (postId: string, title: string, content: string, images: string[], videoUrl: string | null, hashtags: string[]) => {
    try {
      const updated = await postService.update(postId, title, content, images, videoUrl, hashtags);
      setPosts((prev) => prev.map((p) => (p._id === postId ? updated : p)));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || err.message || 'Cập nhật bài viết thất bại' };
    }
  };

  const likePost = async (postId: string) => {
    try {
      const updated = await postService.like(postId);
      setPosts((prev) => prev.map((p) => (p._id === postId ? updated : p)));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const sharePost = async (postId: string) => {
    try {
      const updated = await postService.share(postId);
      setPosts((prev) => prev.map((p) => (p._id === postId ? updated : p)));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await postService.delete(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const incrementCommentCount = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p))
    );
  };

  // Profile Methods
  const updateProfile = async (updatedProfile: Partial<UserProfile>, _email?: string, province?: string, phone?: string) => {
    try {
      const user = await userService.updateProfile({
        ...updatedProfile,
        area_of_interest: province,
        phone
      });
      setCurrentUserInternal(user);
    } catch (err) {
      console.error('Lỗi update profile:', err);
    }
  };

  const changePassword = async (old_password: string, new_password: string) => {
    try {
      await userService.changePassword(old_password, new_password);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || err.message || 'Đổi mật khẩu thất bại' };
    }
  };

  // Organizer Requests & Admin Methods
  const submitOrganizerRequest = async (reason: string, organizationName?: string) => {
    try {
      const req = await organizerService.requestOrganizer(reason, organizationName);
      setOrganizerRequests((prev) => [req, ...prev]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || err.message || 'Gửi yêu cầu thất bại' };
    }
  };

  const reviewOrganizerRequest = async (requestId: string, isApproved: boolean, feedback?: string) => {
    try {
      if (isApproved) {
        await adminService.approveOrganizer(requestId);
      } else {
        await adminService.rejectOrganizer(requestId, feedback);
      }
      setOrganizerRequests((prev) =>
        prev.map((r) =>
          r._id === requestId
            ? { ...r, status: isApproved ? 'Approved' : 'Rejected', admin_feedback: feedback || null }
            : r
        )
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || err.message || 'Duyệt thất bại' };
    }
  };

  const bulkReviewOrganizerRequests = async (requestIds: string[], isApproved: boolean, feedback?: string) => {
    try {
      for (const id of requestIds) {
        if (isApproved) {
          await adminService.approveOrganizer(id);
        } else {
          await adminService.rejectOrganizer(id, feedback);
        }
      }
      await refreshAllData({ silent: true });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const reviewActivity = async (activityId: string, isApproved: boolean, feedback?: string) => {
    try {
      if (isApproved) {
        await adminService.approveActivity(activityId);
      } else {
        await adminService.rejectActivity(activityId, feedback);
      }
      setActivities((prev) =>
        prev.map((a) =>
          a._id === activityId ? { ...a, status: isApproved ? 'Open' : 'Rejected' } : a
        )
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || err.message || 'Duyệt hoạt động thất bại' };
    }
  };

  const bulkReviewActivities = async (activityIds: string[], isApproved: boolean, feedback?: string) => {
    try {
      for (const id of activityIds) {
        if (isApproved) {
          await adminService.approveActivity(id);
        } else {
          await adminService.rejectActivity(id, feedback);
        }
      }
      await refreshAllData({ silent: true });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const toggleUserBan = async (userId: string, is_active: boolean) => {
    try {
      await adminService.toggleUserBan(userId, is_active);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, is_active } : u)));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || err.message || 'Thao tác thất bại' };
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      users,
      activities,
      registrations,
      organizerRequests,
      posts,
      isDataLoading,
      isAuthLoading,
      notification,
      confirmDialog,
      promptDialog,
      globalStats,
      login,
      loginAs,
      register,
      logout,
      verifyOtp,
      resendOtp,
      setCurrentUser: setCurrentUserInternal,
      createActivity,
      editActivity,
      registerForActivity,
      cancelOrRejectRegistration,
      approveRegistration,
      updateParticipation,
      bulkReviewRegistrations,
      createPost,
      editPost,
      likePost,
      sharePost,
      deletePost,
      incrementCommentCount,
      updateProfile,
      changePassword,
      submitOrganizerRequest,
      reviewOrganizerRequest,
      bulkReviewOrganizerRequests,
      reviewActivity,
      bulkReviewActivities,
      toggleUserBan,
      showNotification,
      showConfirm,
      closeConfirm,
      showPrompt,
      closePrompt,
      refreshAllData,
      resetToInitial,
      resetDatabase
    }),
    [
      currentUser,
      users,
      activities,
      registrations,
      organizerRequests,
      posts,
      isDataLoading,
      isAuthLoading,
      notification,
      confirmDialog,
      promptDialog,
      globalStats,
      showNotification,
      showConfirm,
      closeConfirm,
      showPrompt,
      closePrompt,
      refreshAllData,
      resetToInitial,
      resetDatabase
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
