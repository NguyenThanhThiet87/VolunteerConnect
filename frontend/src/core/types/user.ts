export type UserRole = 'Volunteer' | 'Organizer' | 'Admin';

export interface UserProfile {
  full_name: string;
  bio: string | null;
  area_of_interest: string | null;
  skills: string[];
  joined_activity_count: number;
  avatar_url?: string;
  organizer_request_status?: 'None' | 'Pending' | 'Approved' | 'Rejected';
  organizer_request_feedback?: string | null;
  age?: number;
  gender?: string;
}

export interface User {
  _id: string;
  phone: string;
  is_phone_verified: boolean;
  otp_code: string | null;
  otp_expires_at: string | null;
  otp_send_count: number;
  otp_cooldown_until: string | null;
  email: string | null;
  password_hash: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  profile: UserProfile;
  status?: string;
  is_active?: boolean;
}
