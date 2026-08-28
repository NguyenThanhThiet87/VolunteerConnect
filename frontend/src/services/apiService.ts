import api, { rootApi, refreshClient, apiRootURL } from '../core/api/client';
import { authApi, mapBackendUserToFrontend } from '../features/auth/api/authApi';
import { activityApi, mapActivity } from '../features/activities/api/activityApi';
import { registrationApi, mapRegistration } from '../features/registrations/api/registrationApi';
import { postApi, mediaApi, mapPost } from '../features/posts/api/postApi';
import { commentApi } from '../features/posts/api/commentApi';
import { profileApi } from '../features/profile/api/profileApi';
import { organizerApi } from '../features/organizer/api/organizerApi';
import { adminApi } from '../features/admin/api/adminApi';
import { formatPhoneE164, formatDateVi, formatSchedule } from '../core/utils/formatters';
import { fixImageUrl } from '../core/utils/image';

export {
  api,
  rootApi,
  refreshClient,
  apiRootURL,
  formatPhoneE164,
  formatDateVi,
  formatSchedule,
  fixImageUrl,
  mapBackendUserToFrontend,
  mapActivity,
  mapRegistration,
  mapPost
};

export const authService = authApi;
export const activityService = activityApi;
export const registrationService = registrationApi;
export const postService = postApi;
export const commentService = commentApi;
export const mediaService = mediaApi;
export const userService = profileApi;
export const organizerService = organizerApi;
export const adminService = adminApi;
export const statsService = {
  getGlobalStats: adminApi.getGlobalStats
};
