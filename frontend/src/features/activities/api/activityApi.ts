import api from '../../../core/api/client';
import type { Activity } from '../../../core/types';
import { fixImageUrl } from '../../../core/utils/image';

const STATUS_MAP: Record<string, Activity['status']> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  open: 'Open',
  full: 'Full',
  ongoing: 'Ongoing',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  approved: 'Open'
};

export const mapActivity = (act: any): Activity => {
  if (!act) return act;
  const rawStatus = (act.status || '').toLowerCase().replace(/ /g, '_');
  return {
    ...act,
    _id: act._id || act.id,
    image_url: fixImageUrl(act.image_url),
    status: STATUS_MAP[rawStatus] || act.status,
    denormalized_organizer: act.denormalized_organizer || {
      name: act.organizer_name || 'Ban tổ chức'
    }
  };
};

export const activityApi = {
  getAll: async (): Promise<Activity[]> => {
    const res = await api.get('/activities?limit=100');
    const acts = res.data?.data?.activities || [];
    return acts.map(mapActivity);
  },
  list: async (params: {
    search?: string;
    category?: string;
    province?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ activities: Activity[]; total: number }> => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.province && params.province !== 'All') query.append('province', params.province);
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    const res = await api.get(`/activities?${query.toString()}`);
    const data = res.data?.data || {};
    const acts = data.activities || [];
    return {
      activities: acts.map(mapActivity),
      total: data.total || 0
    };
  },
  getById: async (id: string): Promise<Activity> => {
    const res = await api.get(`/activities/${id}`);
    return mapActivity(res.data?.data);
  },
  create: async (activityData: Partial<Activity>, submitForReview: boolean): Promise<Activity> => {
    const res = await api.post('/activities', activityData);
    const created = mapActivity(res.data?.data);
    if (submitForReview && created?._id) {
      const submitRes = await api.post(`/activities/${created._id}/submit`);
      return mapActivity(submitRes.data?.data);
    }
    return created;
  },
  edit: async (id: string, activityData: Partial<Activity>): Promise<Activity> => {
    const res = await api.patch(`/activities/${id}`, activityData);
    return mapActivity(res.data?.data);
  },
  submit: async (id: string): Promise<Activity> => {
    const res = await api.post(`/activities/${id}/submit`);
    return mapActivity(res.data?.data);
  },
  cancel: async (id: string): Promise<void> => {
    await api.post(`/activities/${id}/cancel`);
  },
  getOrganizerActivities: async (): Promise<Activity[]> => {
    const res = await api.get('/organizer/activities?limit=100');
    const acts = res.data?.data?.activities || [];
    return acts.map(mapActivity);
  }
};
