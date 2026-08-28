import React from 'react';
import type { Post } from '../../../core/types';
import { formatDateVi } from '../../../core/utils/formatters';

interface ProfilePostCardProps {
  post: Post;
}

export const ProfilePostCard: React.FC<ProfilePostCardProps> = ({ post }) => {
  const contentLines = post.content.split('\n');
  const fallbackTitle = contentLines.length > 1 ? contentLines[0] : null;
  const fallbackBody = contentLines.length > 1 ? contentLines.slice(1).join('\n') : post.content;
  const title = post.title || fallbackTitle || 'Bài đăng cộng đồng';
  const body = post.title ? post.content : fallbackBody;
  const firstImage = post.images?.[0];

  return (
    <a
      href="#/posts"
      className="group flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-emerald-100 hover:bg-[#f0f9f4]/40 hover:shadow-md text-left"
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
        {firstImage ? (
          <img src={firstImage} alt={title} className="h-full w-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-2xl text-[#006d37]">
            {post.video_url ? 'smart_display' : 'forum'}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#006d37]">
            {formatDateVi(post.created_at)}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">
            {post.like_count || 0} thích · {post.comment_count || 0} bình luận
          </span>
        </div>
        <h5 className="mt-1 line-clamp-1 text-sm font-extrabold text-slate-800 group-hover:text-[#006d37] transition-colors">
          {title}
        </h5>
        <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-slate-500">
          {body || 'Chưa có nội dung mô tả cho bài đăng này.'}
        </p>
      </div>
    </a>
  );
};

export default ProfilePostCard;
