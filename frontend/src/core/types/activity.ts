export interface LocationInfo {
  province: string;
  district: string;
  address_detail: string;
}

export type ActivityStatus =
  | 'Draft'
  | 'Pending Review'
  | 'Open'
  | 'Full'
  | 'Ongoing'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export interface Activity {
  _id: string;
  organizer_id: string;
  title: string;
  description: string;
  categories: string[];
  location: LocationInfo;
  start_date: string;
  end_date: string;
  limit_volunteers: number;
  approved_volunteers_count: number;
  requirements: string | null;
  image_url: string | null;
  status: ActivityStatus;
  created_at: string;
  updated_at: string;
  denormalized_organizer: {
    name: string;
  };
}
