import React from 'react';
import type { ActivityStatus, RegistrationStatus, OrganizerRequestStatus } from '../../../core/types';

interface ActivityStatusBadgeProps {
  status: ActivityStatus | string;
  className?: string;
}

export const ActivityStatusBadge: React.FC<ActivityStatusBadgeProps> = ({ status, className = '' }) => {
  const map: Record<string, { label: string; cls: string }> = {
    Draft: { label: 'Bản nháp', cls: 'bg-slate-100 text-slate-600 border border-slate-200/50' },
    'Pending Review': { label: 'Chờ duyệt', cls: 'bg-[#fef7e0] text-[#b06000] border border-[#b06000]/10' },
    Open: { label: 'Đang tuyển', cls: 'bg-emerald-50 text-[#006d37] border border-emerald-100/50' },
    Full: { label: 'Đã đầy', cls: 'bg-teal-50 text-teal-800 border border-teal-100/50' },
    Ongoing: { label: 'Đang diễn ra', cls: 'bg-blue-50 text-blue-800 border border-blue-100/50' },
    Completed: { label: 'Đã kết thúc', cls: 'bg-slate-100 text-slate-600 border border-slate-200/50' },
    Rejected: { label: 'Bị từ chối', cls: 'bg-red-50 text-red-700 border border-red-200/50' },
    Cancelled: { label: 'Đã hủy', cls: 'bg-slate-50 text-slate-500 border border-slate-100/50' },
  };

  const s = map[status] || { label: status, cls: 'bg-slate-100 text-slate-600 border border-slate-200/50' };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${s.cls} ${className}`}>
      {s.label}
    </span>
  );
};

interface RegistrationStatusBadgeProps {
  status: RegistrationStatus | string;
  className?: string;
}

export const RegistrationStatusBadge: React.FC<RegistrationStatusBadgeProps> = ({ status, className = '' }) => {
  const map: Record<string, { label: string; cls: string }> = {
    Pending: { label: 'Đang chờ', cls: 'bg-[#fef7e0] text-[#b06000] border border-amber-200/50' },
    Approved: { label: 'Đã duyệt', cls: 'bg-[#e8f5e9] text-[#006d37] border border-emerald-200/50' },
    Rejected: { label: 'Từ chối', cls: 'bg-red-50 text-red-600 border border-rose-200/50' },
    Completed: { label: 'Đã hoàn thành', cls: 'bg-blue-50 text-blue-700 border border-blue-200/50' },
    Absent: { label: 'Vắng mặt', cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
    Cancelled: { label: 'Đã hủy', cls: 'bg-slate-50 text-slate-500 border border-slate-100' },
  };

  const s = map[status] || { label: status, cls: 'bg-slate-100 text-slate-600' };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${s.cls} ${className}`}>
      {s.label}
    </span>
  );
};

interface OrganizerRequestStatusBadgeProps {
  status: OrganizerRequestStatus | string;
  className?: string;
}

export const OrganizerRequestStatusBadge: React.FC<OrganizerRequestStatusBadgeProps> = ({ status, className = '' }) => {
  const map: Record<string, { label: string; cls: string }> = {
    Pending: { label: 'Đang chờ duyệt', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
    Approved: { label: 'Đã phê duyệt', cls: 'bg-emerald-50 text-[#006d37] border border-emerald-200' },
    Rejected: { label: 'Đã từ chối', cls: 'bg-rose-50 text-rose-700 border border-rose-200' },
  };

  const s = map[status] || { label: status, cls: 'bg-slate-50 text-slate-600 border border-slate-200' };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${s.cls} ${className}`}>
      {s.label}
    </span>
  );
};
