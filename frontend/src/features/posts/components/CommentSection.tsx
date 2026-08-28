import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { commentApi } from '../api/commentApi';
import { fixImageUrl } from '../../../core/utils/image';
import { formatDateVi } from '../../../core/utils/formatters';
import { Avatar } from '../../../shared/components/ui/Avatar';

export interface CommentItemData {
  _id: string;
  post_id: string;
  author_id?: string;
  author_name: string;
  author_avatar?: string | null;
  content: string;
  created_at: string;
}

interface CommentSectionProps {
  postId: string;
  isOpen: boolean;
  onCommentCountChange?: (delta: number) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  isOpen,
  onCommentCountChange
}) => {
  const { currentUser, showNotification } = useApp();
  const [comments, setComments] = useState<CommentItemData[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    setLoading(true);

    commentApi
      .getComments(postId)
      .then((fetched) => {
        if (active) {
          const mapped: CommentItemData[] = (fetched || []).map((c: any) => ({
            _id: c.id || c._id,
            post_id: postId,
            author_id: c.author_id,
            author_name: c.author_name || c.denormalized_author?.name || 'Thành viên',
            author_avatar: fixImageUrl(c.author_avatar || c.denormalized_author?.avatar_url),
            content: c.content,
            created_at: c.created_at
          }));
          setComments(mapped);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Lỗi tải bình luận:', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [postId, isOpen]);

  if (!isOpen) return null;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isSubmitting) return;

    if (!currentUser) {
      showNotification('Vui lòng đăng nhập để bình luận.', 'info');
      window.location.hash = '#/login';
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await commentApi.createComment(postId, text);
      const newComment: CommentItemData = {
        _id: (created as any).id || (created as any)._id || `comment_${Date.now()}`,
        post_id: postId,
        author_id: currentUser._id,
        author_name: currentUser.profile.full_name,
        author_avatar: fixImageUrl(currentUser.profile.avatar_url),
        content: text,
        created_at: new Date().toISOString()
      };

      setComments((prev) => [...prev, newComment]);
      setInputText('');
      if (onCommentCountChange) onCommentCountChange(1);
    } catch (err: any) {
      console.error(err);
      showNotification('Không thể gửi bình luận. Vui lòng thử lại.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentApi.deleteComment(postId, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      if (onCommentCountChange) onCommentCountChange(-1);
    } catch (err: any) {
      console.error(err);
      showNotification('Không thể xóa bình luận.', 'error');
    }
  };

  return (
    <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4 rounded-b-3xl animate-fadeIn">
      {/* Input Box */}
      {currentUser ? (
        <form onSubmit={handleAddComment} className="flex items-center gap-2">
          <Avatar
            name={currentUser.profile.full_name}
            src={currentUser.profile.avatar_url}
            size={36}
          />
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-semibold focus:outline-none focus:border-[#006d37] text-slate-800 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSubmitting}
            className="bg-[#006d37] hover:bg-[#005027] disabled:opacity-50 text-white px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center shrink-0"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-sm font-bold">send</span>
            )}
          </button>
        </form>
      ) : (
        <div className="text-center py-2 text-xs text-slate-500 font-semibold">
          <a href="#/login" className="text-[#006d37] hover:underline font-bold">
            Đăng nhập
          </a>{' '}
          để tham gia bình luận bài viết.
        </div>
      )}

      {/* Comment List */}
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#006d37]"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-3 text-xs text-slate-400 font-medium">
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
        </div>
      ) : (
        <div className="space-y-3 pt-1 max-h-[300px] overflow-y-auto pr-1">
          {comments.map((comment) => {
            const canDelete =
              currentUser &&
              (currentUser._id === comment.author_id || currentUser.role === 'Admin');

            return (
              <div key={comment._id} className="flex items-start gap-2.5 group">
                <Avatar
                  name={comment.author_name}
                  src={comment.author_avatar}
                  size={32}
                />
                <div className="flex-1 bg-white border border-slate-200/70 rounded-2xl px-3.5 py-2 text-left relative shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-800">
                      {comment.author_name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatDateVi(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1 break-words">
                    {comment.content}
                  </p>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment._id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 text-slate-400 hover:text-red-500 text-xs cursor-pointer border-none bg-transparent"
                      title="Xóa bình luận"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
