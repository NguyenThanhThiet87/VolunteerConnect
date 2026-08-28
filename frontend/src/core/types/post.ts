export type PostVisibility = 'Public' | 'Organization' | 'Private';
export type PostStatus = 'Active' | 'Deleted' | 'Flagged';

export interface Post {
  _id: string;
  author_id: string;
  title?: string;
  content: string;
  images: string[];
  video_url?: string | null;
  visibility: PostVisibility;
  status: PostStatus;
  hashtags: string[];
  like_count: number;
  comment_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  denormalized_author?: {
    name: string;
    role: string;
    avatar_url?: string | null;
  };
  likedByUserIds?: string[];
}

export interface Comment {
  _id?: string;
  id?: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  denormalized_author?: {
    name: string;
    role: string;
    avatar_url?: string | null;
  };
}
