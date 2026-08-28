import api, { rootApi } from '../../../core/api/client';
import type { Activity, OrganizerRequest, User } from '../../../core/types';
import { mapActivity } from '../../activities/api/activityApi';
import { mapBackendUserToFrontend } from '../../auth/api/authApi';

export const adminApi = {
  getPendingOrganizers: async (): Promise<OrganizerRequest[]> => {
    const res = await api.get('/admin/organizer-requests?status=pending&limit=100');
    return res.data?.data?.requests || res.data?.data || res.data || [];
  },
  approveOrganizer: async (requestId: string): Promise<any> => {
    const res = await api.patch(`/admin/organizer-requests/${requestId}/approve`);
    return res.data?.data || res.data;
  },
  rejectOrganizer: async (requestId: string, reason?: string): Promise<any> => {
    const res = await api.patch(`/admin/organizer-requests/${requestId}/reject`, {
      rejection_reason: reason
    });
    return res.data?.data || res.data;
  },
  getPendingActivities: async (): Promise<Activity[]> => {
    const res = await api.get('/admin/activities/pending?limit=100');
    const acts = res.data?.data?.activities || res.data?.data || res.data || [];
    return acts.map(mapActivity);
  },
  approveActivity: async (activityId: string): Promise<Activity> => {
    const res = await api.patch(`/admin/activities/${activityId}/approve`);
    return mapActivity(res.data?.data || res.data);
  },
  rejectActivity: async (activityId: string, reason?: string): Promise<Activity> => {
    const res = await api.patch(`/admin/activities/${activityId}/reject`, {
      rejection_reason: reason
    });
    return mapActivity(res.data?.data || res.data);
  },
  getAllUsers: async (): Promise<User[]> => {
    const res = await api.get('/admin/users?limit=100');
    const users = res.data?.data?.users || res.data?.data || res.data || [];
    return users.map(mapBackendUserToFrontend);
  },
  toggleUserBan: async (userId: string, is_active: boolean): Promise<any> => {
    const res = await rootApi.patch(`/admin/users/${userId}/status`, { is_active });
    return res.data?.data || res.data;
  },
  getGlobalStats: async (): Promise<any> => {
    const res = await api.get('/admin/stats');
    return res.data?.data || res.data;
  },
  getSystemLogs: async (): Promise<any[]> => {
    const res = await rootApi.get('/admin/logs');
    return res.data?.data || res.data || [];
  }
};
