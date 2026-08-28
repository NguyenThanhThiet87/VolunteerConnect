import React, { useState } from 'react';
import type { Post } from '../../../core/types';
import { useApp } from '../../../context/AppContext';
import { formatDateVi } from '../../../core/utils/formatters';
import { Avatar } from '../../../shared/components/ui/Avatar';
import { SmartVideoPlayer } from '../../../shared/components/ui/SmartVideoPlayer';
import { CommentSection } from './CommentSection';
import { ShareModal } from './ShareModal';

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onImageClick?: (post: Post, index: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onEdit,
  onDelete,
  onImageClick
}) => {
  const { currentUser, likePost, showConfirm, showNotification } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comment_count || 0);

  const isLiked =
    Boolean(currentUser?._id && post.likedByUserIds?.includes(currentUser._id));

  const authorName = post.denormalized_author?.name || 'Thành viên';
  const avatarUrl = post.denormalized_author?.avatar_url;
  const authorRoleRaw = post.denormalized_author?.role || 'Volunteer';
  const authorRole =
    authorRoleRaw === 'Organizer'
      ? 'Nhà tổ chức'
      : authorRoleRaw === 'Admin'
      ? 'Quản trị viên'
      : 'Tình nguyện viên';

  const canManage =
    currentUser &&
    (currentUser._id === post.author_id || currentUser.role === 'Admin');

  const handleLike = () => {
    if (!currentUser) {
      showNotification('Vui lòng đăng nhập để thích bài viết.', 'info');
      window.location.hash = '#/login';
      return;
    }
    likePost(post._id);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    showConfirm(
      'Bạn chắc chắn muốn xóa bài viết này?',
      () => {
        if (onDelete) onDelete(post._id);
      },
      'Xác nhận xóa bài viết'
    );
  };

  const images = post.images || [];

  return (
    <article className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4 text-left relative">
      {/* Header: Author Info & Dropdown Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={authorName} src={avatarUrl} size={44} />
          <div>
            <h4 className="font-bold text-slate-900 text-sm hover:text-[#006d37] transition-colors leading-snug">
              {authorName}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <span className="font-semibold text-[#006d37]">{authorRole}</span>
              <span>·</span>
              <span>{formatDateVi(post.created_at)}</span>
            </div>
          </div>
        </div>

        {canManage && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
              aria-label="Tùy chọn bài viết"
            >
              <span className="material-symbols-outlined text-lg">more_horiz</span>
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                ></div>
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 animate-scaleUp">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(post);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer border-none bg-transparent"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Chỉnh sửa
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer border-none bg-transparent"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Xóa bài viết
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="space-y-2">
        {post.title && (
          <h3 className="font-bold text-slate-900 text-base leading-snug">
            {post.title}
          </h3>
        )}
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words font-normal">
          {post.content}
        </p>

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold text-[#006d37] bg-[#e8f5e9] px-2.5 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media: Video Player */}
      {post.video_url && (
        <div className="pt-1">
          <SmartVideoPlayer src={post.video_url} />
        </div>
      )}

      {/* Media: Images Grid */}
      {images.length > 0 && (
        <div className="pt-1">
          {images.length === 1 ? (
            <div
              onClick={() => onImageClick && onImageClick(post, 0)}
              className="rounded-2xl overflow-hidden max-h-[420px] bg-slate-100 cursor-pointer border border-slate-100"
            >
              <img
                src={images[0]}
                alt="Post media"
                className="w-full h-full object-cover hover:scale-101 transition-transform"
              />
            </div>
          ) : images.length === 2 ? (
            <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden max-h-[320px]">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => onImageClick && onImageClick(post, idx)}
                  className="h-full bg-slate-100 cursor-pointer overflow-hidden"
                >
                  <img
                    src={img}
                    alt={`Post media ${idx}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden max-h-[280px]">
              {images.slice(0, 3).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => onImageClick && onImageClick(post, idx)}
                  className="relative h-full bg-slate-100 cursor-pointer overflow-hidden"
                >
                  <img
                    src={img}
                    alt={`Post media ${idx}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                  {idx === 2 && images.length > 3 && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center text-white font-extrabold text-xl">
                      +{images.length - 3}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interaction Buttons Bar */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-slate-500 text-xs font-semibold">
        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent ${
            isLiked ? 'text-red-500 font-bold' : 'text-slate-600'
          }`}
        >
          <span className={`material-symbols-outlined text-lg ${isLiked ? 'font-fill' : ''}`}>
            favorite
          </span>
          <span>{post.like_count || 0} Thích</span>
        </button>

        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-lg">chat_bubble</span>
          <span>{commentCount} Bình luận</span>
        </button>

        <button
          type="button"
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-lg">share</span>
          <span>Chia sẻ</span>
        </button>
      </div>

      {/* Embedded Comments Section */}
      <CommentSection
        postId={post._id}
        isOpen={showComments}
        onCommentCountChange={(delta) => setCommentCount((prev) => Math.max(0, prev + delta))}
      />

      {/* Share Modal Dialog */}
      {showShareModal && (
        <ShareModal post={post} onClose={() => setShowShareModal(false)} />
      )}
    </article>
  );
};

export default PostCard;
