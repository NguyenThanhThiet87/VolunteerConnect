import React from 'react';
import type { Activity } from '../../../core/types';
import { formatDateVi } from '../../../core/utils/formatters';

interface ActivityCardProps {
  activity: Activity;
  onClick?: () => void;
  className?: string;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onClick,
  className = ''
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.hash = `#/activity/${activity._id}`;
    }
  };

  const percent = Math.min(
    100,
    Math.round(
      ((activity.approved_volunteers_count || 0) / (activity.limit_volunteers || 1)) * 100
    )
  );

  return (
    <div
      onClick={handleClick}
      className={`bg-white border border-surface-variant/40 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col min-h-[520px] sm:min-h-[550px] cursor-pointer group ${className}`}
    >
      {/* Image Section */}
      <div className="relative h-[210px] sm:h-[250px] w-full shrink-0 overflow-hidden">
        <img
          src={
            activity.image_url ||
            'https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=600'
          }
          alt={activity.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=600';
          }}
        />
        {/* Floating Category Badge */}
        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#006d37] font-bold text-xs px-3 py-1 rounded-full uppercase border border-[#006d37]/20 shadow-sm">
          {activity.categories[0] || 'Tình nguyện'}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex flex-col justify-between flex-grow">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-on-surface line-clamp-1 leading-tight group-hover:text-[#006d37] transition-colors">
            {activity.title}
          </h3>

          <div className="space-y-2 text-sm text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006d37] text-lg font-bold">
                calendar_month
              </span>
              <span>{formatDateVi(activity.start_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006d37] text-lg font-bold">
                location_on
              </span>
              <span className="line-clamp-1">
                {activity.location?.address_detail || 'Chưa cập nhật'}, {activity.location?.district || ''},{' '}
                {activity.location?.province || ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006d37] text-lg font-bold">
                group
              </span>
              <span>
                {activity.approved_volunteers_count || 0}/{activity.limit_volunteers} đã duyệt
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#006d37] h-full rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
        </div>

        {/* Buttons Action */}
        <div className="flex gap-2 pt-4 mt-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="flex-1 bg-[#006d37] hover:bg-[#005027] text-white py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Xem chi tiết</span>
            <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
