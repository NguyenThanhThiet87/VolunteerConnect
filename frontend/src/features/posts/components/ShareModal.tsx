import React from 'react';
import type { Post } from '../../../core/types';
import { useApp } from '../../../context/AppContext';

interface ShareModalProps {
  post: Post;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ post, onClose }) => {
  const { showNotification } = useApp();
  const shareUrl = `${window.location.origin}/#/posts?postId=${post._id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    showNotification('Đã sao chép liên kết bài viết vào bộ nhớ tạm!', 'success');
    onClose();
  };

  const handleShareSocial = (platform: 'facebook' | 'twitter' | 'zalo') => {
    let url = '';
    const text = encodeURIComponent(post.title || post.content.slice(0, 100));
    const encodedShareUrl = encodeURIComponent(shareUrl);

    if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`;
    } else if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${text}`;
    } else if (platform === 'zalo') {
      url = `https://sp.zalo.me/share_inline?link=${encodedShareUrl}`;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 p-5 space-y-4 animate-scaleUp text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-gray-900 text-base">Chia sẻ bài viết</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer border-none bg-transparent"
          >
            ×
          </button>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => handleShareSocial('facebook')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-100 hover:bg-blue-50/50 hover:border-blue-200 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-lg">
              f
            </div>
            <span className="text-xs font-semibold text-slate-700">Facebook</span>
          </button>

          <button
            onClick={() => handleShareSocial('zalo')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-100 hover:bg-blue-50/50 hover:border-blue-200 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#0068FF] text-white flex items-center justify-center font-bold text-xs">
              Zalo
            </div>
            <span className="text-xs font-semibold text-slate-700">Zalo</span>
          </button>

          <button
            onClick={() => handleShareSocial('twitter')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-100 hover:bg-sky-50/50 hover:border-sky-200 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center text-sm">
              𝕏
            </div>
            <span className="text-xs font-semibold text-slate-700">Twitter</span>
          </button>
        </div>

        {/* Copy Link Input */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Sao chép liên kết
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 truncate focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="bg-[#006d37] hover:bg-[#005027] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
            >
              Sao chép
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
