import React from 'react';

interface ProfileInfoItemProps {
  icon: string;
  iconColorClass: string;
  bgClass: string;
  label: string;
  value: React.ReactNode;
}

export const ProfileInfoItem: React.FC<ProfileInfoItemProps> = ({
  icon,
  iconColorClass,
  bgClass,
  label,
  value
}) => (
  <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 border border-slate-100 rounded-2xl items-start sm:items-center hover:shadow-sm transition-all duration-150 text-left">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass} shrink-0`}>
      <span className={`material-symbols-outlined text-lg ${iconColorClass}`}>{icon}</span>
    </div>
    <div className="min-w-0 space-y-0.5 text-left flex-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block break-words">
        {label}
      </span>
      <span className="text-slate-800 text-sm font-semibold block break-words">{value}</span>
    </div>
  </div>
);

export default ProfileInfoItem;
