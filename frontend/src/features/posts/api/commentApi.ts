import api from '../../../core/api/client';
import type { Comment } from '../../../core/types';

export const commentApi = {
  getComments: async (postId: string, page = 1, limit = 10): Promise<Comment[]> => {
    const res = await api.get(`/posts/${postId}/comments/`, { params: { page, limit } });
    return res.data.items || res.data.data?.items || res.data;
  },
  createComment: async (postId: string, content: string): Promise<Comment> => {
    const res = await api.post(`/posts/${postId}/comments/`, { content });
    return res.data.data || res.data;
  },
  deleteComment: async (postId: string, commentId: string): Promise<void> => {
    await api.delete(`/posts/${postId}/comments/${commentId}`);
  }
};
