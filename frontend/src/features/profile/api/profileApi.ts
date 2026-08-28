import api from '../../../core/api/client';
import type { User, UserProfile } from '../../../core/types';
import { mapBackendUserToFrontend, authApi } from '../../auth/api/authApi';

export const profileApi = {
  updateProfile: async (
    updatedProfile: Partial<UserProfile> & { phone?: string; age?: number; gender?: string }
  ): Promise<User> => {
    const res = await api.put('/users/me', {
      full_name: updatedProfile.full_name,
      avatar_url: updatedProfile.avatar_url,
      bio: updatedProfile.bio,
      skills: updatedProfile.skills,
      area_of_interest: updatedProfile.area_of_interest,
      phone_number: updatedProfile.phone,
      age: updatedProfile.age,
      gender: updatedProfile.gender
    });
    return mapBackendUserToFrontend(res.data);
  },
  getById: async (userId: string): Promise<User> => {
    const res = await api.get(`/users/${userId}`);
    return mapBackendUserToFrontend(res.data);
  },
  changePassword: authApi.changePassword
};
