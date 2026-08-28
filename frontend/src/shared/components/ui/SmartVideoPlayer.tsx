import React, { useState, useRef, useEffect } from 'react';

interface SmartVideoPlayerProps {
  src: string;
  className?: string;
  maxHeightClass?: string;
}

export const SmartVideoPlayer: React.FC<SmartVideoPlayerProps> = ({
  src,
  className = '',
  maxHeightClass = 'max-h-[360px]'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [preloadState, setPreloadState] = useState<'none' | 'metadata'>('none');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setPreloadState('metadata');
          } else {
            setPreloadState('none');
            if (videoRef.current) {
              videoRef.current.pause();
            }
          }
        });
      },
      {
        rootMargin: '200px 0px',
        threshold: 0.1,
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <div
      className={`rounded-xl overflow-hidden border border-slate-200/85 ${maxHeightClass} bg-black flex items-center justify-center shadow-inner relative group w-full ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        preload={preloadState}
        controls
        className={`w-full ${maxHeightClass} object-contain`}
      />
    </div>
  );
};

export default SmartVideoPlayer;
