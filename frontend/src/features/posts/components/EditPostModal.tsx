import React, { useState, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import type { Post } from '../../../core/types';
import { mediaApi } from '../api/postApi';

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onSubmit: (
    title: string,
    content: string,
    images: string[],
    videoUrl: string | null,
    hashtags: string[]
  ) => Promise<void>;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onSubmit }) => {
  const { showNotification } = useApp();

  const contentLines = post.content.split('\n');
  const fallbackTitle = contentLines.length > 1 ? contentLines[0] : '';
  const fallbackBody = contentLines.length > 1 ? contentLines.slice(1).join('\n') : post.content;
  const initialTitle = post.title || fallbackTitle;
  const initialBody = post.title ? post.content : fallbackBody;

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialBody);

  const [existingImages, setExistingImages] = useState<string[]>(post.images || []);
  const [existingVideo, setExistingVideo] = useState<string | null>(post.video_url || null);

  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [newVideoPreviewUrl, setNewVideoPreviewUrl] = useState<string>('');

  const [hashtagsStr, setHashtagsStr] = useState((post.hashtags || []).join(', '));
  const [isDragging, setIsDragging] = useState(false);
  const [isVideoDragging, setIsVideoDragging] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const handleRemoveExistingImage = (idx: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveExistingVideo = () => {
    setExistingVideo(null);
  };

  const handleNewFilesAdded = (files: File[] | FileList | null) => {
    if (!files) return;
    setLocalError('');
    const filesArr = files instanceof FileList ? Array.from(files) : files;

    if (existingImages.length + newImageFiles.length + filesArr.length > 10) {
      setLocalError('Tổng số lượng hình ảnh vượt quá giới hạn 10 ảnh.');
      showNotification('Tổng số lượng hình ảnh vượt quá giới hạn 10 ảnh.', 'error');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    const validFiles: File[] = [];
    for (const file of filesArr) {
      if (file.size > 5 * 1024 * 1024) {
        setLocalError(`Kích thước ảnh "${file.name}" vượt quá giới hạn 5MB.`);
        showNotification(`Kích thước ảnh "${file.name}" vượt quá giới hạn 5MB.`, 'error');
        if (fileRef.current) fileRef.current.value = '';
        return;
      }
      validFiles.push(file);
    }

    setNewImageFiles((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const imageFilesList = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (imageFilesList.length > 0) {
        handleNewFilesAdded(imageFilesList);
      }
    }
  };

  const handleVideoFileChange = (file: File | null) => {
    if (!file) return;
    setLocalError('');
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/ogg'];
    if (!validTypes.includes(file.type)) {
      setLocalError('Chỉ chấp nhận file video (MP4, MOV, AVI, WebM).');
      showNotification('Chỉ chấp nhận file video (MP4, MOV, AVI, WebM).', 'error');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setLocalError('Kích thước video vượt quá giới hạn cho phép (Tối đa 100MB).');
      showNotification('Kích thước video vượt quá giới hạn cho phép (Tối đa 100MB).', 'error');
      return;
    }
    setNewVideoFile(file);
    setNewVideoPreviewUrl(URL.createObjectURL(file));
    setExistingVideo(null);
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsVideoDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) handleVideoFileChange(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setLocalError('Vui lòng nhập tiêu đề bài viết.');
      return;
    }
    if (!content.trim()) {
      setLocalError('Vui lòng nhập nội dung bài viết.');
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLocalError('');

    try {
      let finalImages = [...existingImages];
      let finalVideo = existingVideo;

      if (newImageFiles.length > 0) {
        const uploadPromises = newImageFiles.map((file) => mediaApi.upload(file));
        const uploadResults = await Promise.all(uploadPromises);
        const newUrls = uploadResults.map((res) => res.url);
        finalImages = [...finalImages, ...newUrls];
      }

      if (newVideoFile) {
        const uploadRes = await mediaApi.upload(newVideoFile);
        finalVideo = uploadRes.url;
      }

      const tags = hashtagsStr
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      await onSubmit(title, content, finalImages, finalVideo, tags);
    } catch (err: any) {
      console.error(err);
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Không thể cập nhật bài viết. Vui lòng kiểm tra lại.';
      setLocalError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-y-auto max-h-[92dvh] sm:max-h-[90vh] animate-scaleUp text-left">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-gray-900 text-xl">Chỉnh sửa bài viết</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none font-bold cursor-pointer transition-colors border-none bg-transparent"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {localError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{localError}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">
              Tiêu đề bài viết <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề..."
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#006d37] focus:ring-1 focus:ring-[#006d37] text-sm text-slate-800 transition-all font-semibold"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">
              Nội dung chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung chi tiết bài viết..."
              rows={5}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#006d37] focus:ring-1 focus:ring-[#006d37] text-sm text-slate-800 transition-all leading-relaxed font-medium"
            />
          </div>

          {/* Image Management */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">
              Hình ảnh minh họa <span className="text-slate-400 font-normal">(Tùy chọn, tối đa 10 ảnh)</span>
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragging ? 'border-[#006d37] bg-[#e8f5e9]' : 'border-slate-200 hover:border-[#006d37]/50 hover:bg-slate-50'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleImageDrop}
              onClick={() => fileRef.current?.click()}
            >
              {existingImages.length > 0 || newImagePreviews.length > 0 ? (
                <div className="grid grid-cols-3 gap-2" onClick={(e) => e.stopPropagation()}>
                  {existingImages.map((img, idx) => (
                    <div key={`existing-${idx}`} className="relative w-full h-24 border rounded-lg overflow-hidden group">
                      <img src={img} alt={`existing ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold shadow-md cursor-pointer border-none"
                      >
                        ×
                      </button>
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1 rounded">
                        Đã đăng
                      </span>
                    </div>
                  ))}
                  {newImagePreviews.map((preview, idx) => (
                    <div key={`new-${idx}`} className="relative w-full h-24 border rounded-lg overflow-hidden group">
                      <img src={preview} alt={`new ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold shadow-md cursor-pointer border-none"
                      >
                        ×
                      </button>
                      <span className="absolute bottom-1 left-1 bg-[#006d37]/80 text-white text-[8px] px-1 rounded">
                        Mới
                      </span>
                    </div>
                  ))}
                  {existingImages.length + newImagePreviews.length < 10 && (
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="border border-dashed border-slate-300 hover:border-[#006d37] rounded-lg h-24 flex flex-col items-center justify-center text-slate-400 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-2xl">add</span>
                      <span className="text-[10px] font-bold">Thêm ảnh</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-3xl text-slate-300">image</span>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    Kéo thả hình ảnh hoặc nhấp để chọn tệp (tối đa 10 ảnh)
                  </p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleNewFilesAdded(e.target.files)}
              />
            </div>
            <div className="flex items-center gap-2 mt-1 w-fit">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="border border-slate-300 bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Chọn nhiều ảnh
              </button>
              <span className="text-xs text-slate-400">
                {existingImages.length + newImagePreviews.length > 0
                  ? `${existingImages.length + newImagePreviews.length} tệp đã chọn`
                  : 'Không tệp nào được chọn'}
              </span>
            </div>
          </div>

          {/* Video Management */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">
              Video minh họa <span className="text-slate-400 font-normal">(Tùy chọn, tối đa 100MB)</span>
            </label>

            {existingVideo ? (
              <div className="flex items-center gap-3 justify-center border border-slate-200 rounded-xl p-4 bg-slate-50">
                <video src={existingVideo} className="h-20 rounded-lg" controls />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-700">Video hiện tại</p>
                  <button
                    type="button"
                    onClick={handleRemoveExistingVideo}
                    className="text-[10px] text-red-500 font-bold hover:underline mt-1 cursor-pointer border-none bg-transparent"
                  >
                    Xóa video hiện tại
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  isVideoDragging ? 'border-[#006d37] bg-[#e8f5e9]' : 'border-slate-200 hover:border-[#006d37]/50 hover:bg-slate-50'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsVideoDragging(true);
                }}
                onDragLeave={() => setIsVideoDragging(false)}
                onDrop={handleVideoDrop}
                onClick={() => videoRef.current?.click()}
              >
                {newVideoFile && newVideoPreviewUrl ? (
                  <div className="flex items-center gap-3 justify-center" onClick={(e) => e.stopPropagation()}>
                    <video src={newVideoPreviewUrl} className="h-20 rounded-lg" controls />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-700 truncate max-w-[160px]">{newVideoFile.name}</p>
                      <p className="text-[10px] text-slate-400">{(newVideoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewVideoFile(null);
                          setNewVideoPreviewUrl('');
                        }}
                        className="text-[10px] text-red-500 font-bold hover:underline mt-0.5 cursor-pointer border-none bg-transparent"
                      >
                        Xóa video
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-3xl text-slate-300">videocam</span>
                    <p className="text-xs text-slate-400 font-semibold mt-1">Kéo thả file video hoặc nhấp để tải lên</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">MP4, MOV, AVI, WebM — tối đa 100MB</p>
                  </>
                )}
                <input
                  ref={videoRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/ogg"
                  className="hidden"
                  onChange={(e) => handleVideoFileChange(e.target.files?.[0] || null)}
                />
              </div>
            )}
            {!newVideoFile && !existingVideo && (
              <label
                className="flex items-center gap-2 mt-1 cursor-pointer w-fit"
                onClick={() => videoRef.current?.click()}
              >
                <span className="border border-slate-300 bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer">
                  Chọn Tệp Video
                </span>
                <span className="text-xs text-slate-400">Không tệp nào được chọn</span>
              </label>
            )}
          </div>

          {/* Hashtags */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">
              Thẻ Hashtags <span className="text-slate-400 font-normal">(Tùy chọn)</span>
            </label>
            <input
              type="text"
              value={hashtagsStr}
              onChange={(e) => setHashtagsStr(e.target.value)}
              placeholder="Ngăn cách các thẻ bằng dấu phẩy (ví dụ: MuaHeXanh, MôiTrường)"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#006d37] focus:ring-1 focus:ring-[#006d37] text-sm text-slate-800 transition-all font-semibold"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#1a6c3a] hover:bg-[#155c30] text-white font-bold rounded-xl text-sm transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
