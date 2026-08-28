import api from '../../../core/api/client';
import type { Activity, OrganizerRequest } from '../../../core/types';
import { mapActivity } from '../../activities/api/activityApi';

export const organizerApi = {
  requestOrganizer: async (
    reason: string,
    organization_name?: string
  ): Promise<OrganizerRequest> => {
    const res = await api.post('/users/me/request-organizer', {
      reason,
      organization_name
    });
    return res.data?.data || res.data;
  },
  getMyActivities: async (): Promise<Activity[]> => {
    const res = await api.get('/organizer/activities');
    const acts = res.data?.data?.activities || res.data?.data || res.data?.activities || [];
    return acts.map(mapActivity);
  },
  getStats: async (): Promise<any> => {
    const res = await api.get('/organizer/stats');
    return res.data?.data || res.data;
  },
  createActivity: async (activityData: Partial<Activity>): Promise<Activity> => {
    const payload = {
      title: activityData.title,
      description: activityData.description,
      categories: activityData.categories,
      start_date: activityData.start_date,
      end_date: activityData.end_date,
      limit_volunteers: activityData.limit_volunteers,
      image_url: activityData.image_url,
      requirements: activityData.requirements,
      location: {
        province: activityData.location?.province || '',
        district: activityData.location?.district || '',
        address_detail: activityData.location?.address_detail || ''
      }
    };
    const res = await api.post('/organizer/activities', payload);
    return mapActivity(res.data?.data || res.data);
  },
  updateActivity: async (
    activityId: string,
    activityData: Partial<Activity>
  ): Promise<Activity> => {
    const payload = {
      title: activityData.title,
      description: activityData.description,
      categories: activityData.categories,
      start_date: activityData.start_date,
      end_date: activityData.end_date,
      limit_volunteers: activityData.limit_volunteers,
      image_url: activityData.image_url,
      requirements: activityData.requirements,
      status: activityData.status ? activityData.status.toLowerCase() : undefined,
      location: {
        province: activityData.location?.province || '',
        district: activityData.location?.district || '',
        address_detail: activityData.location?.address_detail || ''
      }
    };
    const res = await api.put(`/organizer/activities/${activityId}`, payload);
    return mapActivity(res.data?.data || res.data);
  },
  deleteActivity: async (activityId: string): Promise<void> => {
    await api.delete(`/organizer/activities/${activityId}`);
  }
};
