import React, { useState, useEffect } from 'react';
import type { Post } from '../../../core/types';
import { Avatar } from './Avatar';

interface ImageLightboxProps {
  post: Post;
  initialIndex?: number;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  post,
  initialIndex = 0,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const images = post.images || [];

  const authorName = post.denormalized_author?.name || 'Thành viên';
  const avatarUrl = post.denormalized_author?.avatar_url;
  const authorRoleRaw = post.denormalized_author?.role || 'Volunteer';
  const authorRole =
    authorRoleRaw === 'Organizer'
      ? 'Nhà tổ chức'
      : authorRoleRaw === 'Admin'
      ? 'Quản trị viên'
      : 'Tình nguyện viên';

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  if (images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex bg-black/95 backdrop-blur-md select-none animate-fadeIn"
      onClick={onClose}
    >
      {/* Left Media Pane */}
      <div
        className="flex-1 h-full flex flex-col items-center justify-center relative p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-50 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors backdrop-blur-sm cursor-pointer border-none flex items-center justify-center"
          title="Đóng (Esc)"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={images[currentIndex]}
            alt={`Ảnh ${currentIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl transition-all duration-200"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 p-3 rounded-full transition-all cursor-pointer border border-white/10"
                title="Ảnh trước"
              >
                <span className="material-symbols-outlined text-3xl">chevron_left</span>
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 p-3 rounded-full transition-all cursor-pointer border border-white/10"
                title="Ảnh tiếp"
              >
                <span className="material-symbols-outlined text-3xl">chevron_right</span>
              </button>
            </>
          )}
        </div>

        {/* Bottom thumbnail bar */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full max-w-[90vw] overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                  idx === currentIndex ? 'border-primary scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Details Sidebar */}
      <div
        className="hidden md:flex flex-col w-[360px] lg:w-[400px] h-full bg-surface border-l border-surface-variant/40 p-6 overflow-y-auto text-left shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 pb-4 border-b border-surface-variant/40">
          <Avatar name={authorName} src={avatarUrl} size={44} />
          <div>
            <h4 className="font-bold text-slate-800 text-sm leading-snug">{authorName}</h4>
            <span className="text-[11px] text-on-surface-variant font-medium">{authorRole}</span>
          </div>
        </div>

        {post.title && (
          <h3 className="font-bold text-slate-900 text-base mt-4 mb-2">{post.title}</h3>
        )}

        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line mt-2">
          {post.content}
        </p>

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {post.hashtags.map((tag, i) => (
              <span
                key={i}
                className="text-xs font-semibold text-primary bg-primary-container/30 px-2.5 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
