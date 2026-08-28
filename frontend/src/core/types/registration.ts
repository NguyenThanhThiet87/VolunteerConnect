export type RegistrationStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Completed'
  | 'Absent'
  | 'Cancelled';

export interface Registration {
  _id: string;
  volunteer_id: string;
  activity_id: string;
  status: RegistrationStatus;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  participation_updated_at: string | null;
  denormalized_volunteer: {
    name: string;
    phone: string;
    email: string;
  };
  denormalized_activity: {
    title: string;
    status: string;
    start_date: string;
    end_date: string;
    organizer_id?: string | null;
    organizer_name?: string | null;
  };
  reject_reason?: string;
}
