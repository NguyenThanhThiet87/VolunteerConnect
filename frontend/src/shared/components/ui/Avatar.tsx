import React from 'react';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number | string;
  className?: string;
  textClassName?: string;
  shape?: 'circle' | 'rounded';
}

const AVATAR_COLORS = ['#006d37', '#0d6efd', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'];

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 40,
  className = '',
  textClassName = '',
  shape = 'circle'
}) => {
  const roundedCls = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const sizeStyle = typeof size === 'number' ? { width: size, height: size } : {};

  if (src) {
    return (
      <div
        style={sizeStyle}
        className={`${roundedCls} overflow-hidden border border-slate-200 shrink-0 bg-slate-50 flex items-center justify-center ${className}`}
      >
        <img alt={`Avatar của ${name}`} className="w-full h-full object-cover" src={src} />
      </div>
    );
  }

  const initials = (name || 'U')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const charCode = (name && name.length > 0) ? name.charCodeAt(0) : 0;
  const bg = AVATAR_COLORS[charCode % AVATAR_COLORS.length];
  const fontSize = typeof size === 'number' ? Math.max(12, Math.floor(size * 0.36)) : 14;

  return (
    <div
      style={{
        ...sizeStyle,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
      className={`${roundedCls} border border-white shadow-sm select-none ${className}`}
      aria-label={`Avatar của ${name}`}
    >
      <span
        style={{ fontSize }}
        className={`text-white font-bold tracking-wider font-sans leading-none ${textClassName}`}
      >
        {initials}
      </span>
    </div>
  );
};

export default Avatar;
