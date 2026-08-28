import api from '../../../core/api/client';
import type { Registration } from '../../../core/types';

const REGISTRATION_STATUS_MAP: Record<string, Registration['status']> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  absent: 'Absent',
  cancelled: 'Cancelled'
};

export const mapRegistration = (reg: any): Registration => {
  if (!reg) return reg;
  const rawStatus = (reg.status || '').toLowerCase();
  const activityInfo = reg.denormalized_activity || reg.activity || {};
  return {
    ...reg,
    _id: reg._id || reg.id,
    status: REGISTRATION_STATUS_MAP[rawStatus] || reg.status,
    reject_reason: reg.rejection_reason,
    denormalized_volunteer: reg.denormalized_volunteer || reg.volunteer || {
      name: '',
      phone: '',
      email: ''
    },
    denormalized_activity: {
      title: activityInfo.title || '',
      status: activityInfo.status || '',
      start_date: activityInfo.start_date || '',
      end_date: activityInfo.end_date || '',
      organizer_id: activityInfo.organizer_id || reg.organizer_id || null,
      organizer_name: activityInfo.organizer_name || reg.organizer_name || null
    }
  };
};

export const registrationApi = {
  getVolunteerRegistrations: async (): Promise<Registration[]> => {
    const res = await api.get('/users/me/registrations?limit=100');
    const regs = res.data?.data?.registrations || [];
    return regs.map(mapRegistration);
  },
  getActivityRegistrations: async (activityId: string): Promise<Registration[]> => {
    const res = await api.get(`/activities/${activityId}/registrations?limit=100`);
    const regs = res.data?.data?.registrations || [];
    return regs.map(mapRegistration);
  },
  register: async (activityId: string): Promise<Registration> => {
    const res = await api.post(`/activities/${activityId}/registrations`);
    return mapRegistration(res.data?.data);
  },
  cancel: async (registrationId: string): Promise<Registration> => {
    const res = await api.post(`/registrations/${registrationId}/cancel`);
    return mapRegistration(res.data?.data || res.data);
  },
  approve: async (registrationId: string): Promise<Registration> => {
    const res = await api.patch(`/registrations/${registrationId}/approve`);
    return mapRegistration(res.data?.data || res.data);
  },
  reject: async (registrationId: string, reason?: string): Promise<Registration> => {
    const res = await api.patch(`/registrations/${registrationId}/reject`, {
      rejection_reason: reason
    });
    return mapRegistration(res.data?.data || res.data);
  },
  updateParticipation: async (
    registrationId: string,
    status: 'Completed' | 'Absent'
  ): Promise<Registration> => {
    const res = await api.patch(`/registrations/${registrationId}/attendance`, {
      status: status.toLowerCase()
    });
    return mapRegistration(res.data?.data || res.data);
  },
  bulkApprove: async (activityId: string, registrationIds: string[]): Promise<any> => {
    const res = await api.patch(`/activities/${activityId}/registrations/bulk-approve`, {
      registration_ids: registrationIds
    });
    return res.data;
  },
  bulkReject: async (
    activityId: string,
    registrationIds: string[],
    reason: string
  ): Promise<any> => {
    const res = await api.patch(`/activities/${activityId}/registrations/bulk-reject`, {
      registration_ids: registrationIds,
      rejection_reason: reason
    });
    return res.data;
  }
};
