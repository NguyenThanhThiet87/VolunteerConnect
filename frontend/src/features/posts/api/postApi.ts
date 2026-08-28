import api, { rootApi } from '../../../core/api/client';
import type { Post } from '../../../core/types';
import { fixImageUrl } from '../../../core/utils/image';

export const mapPost = (post: any): Post => ({
  _id: post._id || post.id,
  title: post.title,
  author_id: post.author_id,
  content: post.content,
  images: post.images || [],
  video_url: fixImageUrl(post.video_url),
  visibility: 'Public',
  status: 'Active',
  hashtags: post.hashtags || [],
  like_count: post.like_count ?? post.likes ?? 0,
  comment_count: post.comment_count ?? 0,
  share_count: post.share_count ?? post.shares ?? 0,
  created_at: post.created_at,
  updated_at: post.updated_at,
  deleted_at: post.deleted_at ?? null,
  denormalized_author: post.denormalized_author
    ? {
        name: post.denormalized_author.name || 'Thành viên',
        role: post.denormalized_author.role || 'Volunteer',
        avatar_url: fixImageUrl(post.denormalized_author.avatar_url)
      }
    : undefined,
  likedByUserIds: post.likedByUserIds || []
});

export const postApi = {
  getAll: async (): Promise<Post[]> => {
    const res = await rootApi.get('/posts/');
    const posts = res.data?.items || [];
    return posts.map(mapPost);
  },
  create: async (
    title: string,
    content: string,
    images: string[],
    video_url: string | null,
    hashtags: string[]
  ): Promise<Post> => {
    const res = await rootApi.post('/posts/', { title, content, images, video_url, hashtags });
    return mapPost(res.data);
  },
  update: async (
    postId: string,
    title: string,
    content: string,
    images: string[],
    video_url: string | null,
    hashtags: string[]
  ): Promise<Post> => {
    const res = await rootApi.put(`/posts/${postId}`, {
      title,
      content,
      images,
      video_url,
      hashtags
    });
    return mapPost(res.data);
  },
  like: async (postId: string): Promise<Post> => {
    const res = await rootApi.patch(`/posts/${postId}/like`);
    return mapPost(res.data);
  },
  delete: async (postId: string): Promise<void> => {
    await rootApi.delete(`/posts/${postId}`);
  },
  share: async (postId: string): Promise<Post> => {
    const res = await rootApi.patch(`/posts/${postId}/share`);
    return mapPost(res.data);
  }
};

export const mediaApi = {
  upload: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  }
};
