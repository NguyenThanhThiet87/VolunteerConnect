import api from '../../../core/api/client';
import type { User } from '../../../core/types';
import { formatPhoneE164 } from '../../../core/utils/formatters';
import { fixImageUrl } from '../../../core/utils/image';

export const mapBackendUserToFrontend = (beUser: any): User => {
  const roleMap: Record<string, 'Volunteer' | 'Organizer' | 'Admin'> = {
    admin: 'Admin',
    organizer: 'Organizer',
    volunteer: 'Volunteer'
  };
  const statusMap: Record<string, 'None' | 'Pending' | 'Approved' | 'Rejected'> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected'
  };

  const userId = beUser.id || beUser._id;

  return {
    _id: userId,
    phone: beUser.phone_number || '',
    is_phone_verified: beUser.status === 'active',
    otp_code: null,
    otp_expires_at: null,
    otp_send_count: 0,
    otp_cooldown_until: null,
    email: beUser.email,
    password_hash: '',
    role: roleMap[beUser.role] || 'Volunteer',
    profile: {
      full_name: beUser.full_name || 'Người dùng',
      avatar_url: fixImageUrl(beUser.avatar_url) ?? undefined,
      bio: beUser.bio || null,
      joined_activity_count: beUser.joined_activity_count || 0,
      skills: beUser.skills || [],
      area_of_interest: beUser.area_of_interest || null,
      organizer_request_status: statusMap[beUser.organizer_request_status] || 'None',
      organizer_request_feedback: beUser.organizer_request_feedback || null,
      age: beUser.age ?? undefined,
      gender: beUser.gender || undefined
    },
    created_at: beUser.created_at,
    updated_at: beUser.updated_at || beUser.created_at,
    status: beUser.status || 'active'
  };
};

export const authApi = {
  changePassword: async (old_password: string, new_password: string): Promise<any> => {
    const res = await api.post('/auth/change-password', { old_password, new_password });
    return res.data;
  },
  login: async (email: string, password_raw: string): Promise<{ token: string; user: User }> => {
    const res = await api.post('/auth/login', { email, password: password_raw });
    const token = res.data.access_token;
    const refreshToken = res.data.refresh_token;

    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }

    const user = await authApi.getCurrentUser();
    return { token, user };
  },
  register: async (
    fullname: string,
    email: string,
    phone: string,
    password_raw: string
  ): Promise<{ message: string; user_id: string }> => {
    const formattedPhone = formatPhoneE164(phone);
    const res = await api.post('/auth/register', {
      email,
      phone_number: formattedPhone,
      password: password_raw,
      full_name: fullname
    });
    return res.data;
  },
  verifyOtp: async (email: string, otpCode: string): Promise<any> => {
    const res = await api.post('/auth/verify-otp', {
      email,
      otp_code: otpCode
    });
    return res.data;
  },
  verifyResetOtp: async (email: string, otpCode: string): Promise<any> => {
    const res = await api.post('/auth/verify-reset-otp', { email, otp_code: otpCode });
    return res.data;
  },
  getCurrentUser: async (): Promise<User> => {
    const res = await api.get('/users/me');
    return mapBackendUserToFrontend(res.data);
  },
  forgotPassword: async (email: string): Promise<any> => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (email: string, otpCode: string, newPasswordRaw: string): Promise<any> => {
    const res = await api.post('/auth/reset-password', {
      email,
      otp_code: otpCode,
      new_password: newPasswordRaw
    });
    return res.data;
  },
  resendOtp: async (email: string): Promise<any> => {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data;
  },
  refreshToken: async (token: string): Promise<any> => {
    const res = await api.post('/auth/refresh', { refresh_token: token });
    return res.data;
  },
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Server logout failed', e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  }
};
