import React from 'react';
import type { Activity, Registration } from '../../../core/types';
import { formatDateVi } from '../../../core/utils/formatters';
import { RegistrationStatusBadge, ActivityStatusBadge } from '../../../shared/components/ui/StatusBadge';

interface ProfileActivityCardProps {
  activity: Activity;
  registration?: Registration;
}

export const ProfileActivityCard: React.FC<ProfileActivityCardProps> = ({
  activity,
  registration
}) => {
  return (
    <a
      href={`#/activity/${activity._id}`}
      className="group flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-emerald-100 hover:bg-[#f0f9f4]/40 hover:shadow-md text-left"
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
        <img
          src={
            activity.image_url ||
            'https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=300'
          }
          alt={activity.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=300';
          }}
        />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          {registration ? (
            <RegistrationStatusBadge status={registration.status} />
          ) : (
            <ActivityStatusBadge status={activity.status} />
          )}
          <span className="text-[10px] font-semibold text-slate-400">
            {formatDateVi(activity.start_date)}
          </span>
        </div>
        <h5 className="mt-1 line-clamp-1 text-sm font-extrabold text-slate-800 group-hover:text-[#006d37] transition-colors">
          {activity.title}
        </h5>
        <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">
          {activity.location?.province ||
            activity.location?.address_detail ||
            'Chưa cập nhật địa điểm'}
        </p>
      </div>
    </a>
  );
};

export default ProfileActivityCard;
