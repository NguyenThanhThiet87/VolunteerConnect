export type OrganizerRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface OrganizerRequest {
  _id: string;
  volunteer_id: string;
  reason: string;
  experience?: string;
  contact_phone?: string;
  organization_name?: string;
  status: OrganizerRequestStatus;
  admin_feedback?: string | null;
  created_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  denormalized_volunteer?: {
    name: string;
    email: string;
  };
}
