import React from 'react';
import type { Registration, Activity } from '../../../core/types';
import { formatSchedule } from '../../../core/utils/formatters';
import { RegistrationStatusBadge } from '../../../shared/components/ui/StatusBadge';

interface RegistrationCardProps {
  registration: Registration;
  activity?: Activity;
}

export const RegistrationCard: React.FC<RegistrationCardProps> = ({ registration, activity }) => {
  const organizerId =
    registration.denormalized_activity.organizer_id || activity?.organizer_id;
  const organizerName =
    registration.denormalized_activity.organizer_name || activity?.denormalized_organizer?.name;

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left Side: Info */}
      <div className="space-y-1 min-w-0">
        <span className="text-xs text-gray-500 font-semibold block mb-1">
          {formatSchedule(
            registration.denormalized_activity.start_date,
            registration.denormalized_activity.end_date
          )}
        </span>
        <h3 className="text-base font-bold text-gray-900 hover:text-[#006d37] transition-colors leading-snug block mb-2 break-words">
          <a href={`#/activity/${registration.activity_id}`}>
            {registration.denormalized_activity.title}
          </a>
        </h3>

        {/* Additional Details */}
        <div className="flex flex-col gap-1.5 text-xs text-slate-500 pt-1">
          <div className="flex items-start gap-1.5">
            <span className="material-symbols-outlined text-[#006d37] text-[16px] font-bold">
              corporate_fare
            </span>
            <span className="min-w-0 break-words">
              <strong>Ban tổ chức:</strong>{' '}
              {organizerId ? (
                <a
                  href={`#/profile?userId=${organizerId}`}
                  className="font-bold text-[#006d37] hover:underline"
                >
                  {organizerName || 'Ban tổ chức'}
                </a>
              ) : (
                organizerName || 'Chưa cập nhật'
              )}
            </span>
          </div>

          <div className="flex items-start gap-1.5">
            <span className="material-symbols-outlined text-[#006d37] text-[16px] font-bold">
              category
            </span>
            <span className="min-w-0 break-words">
              <strong>Lĩnh vực:</strong>{' '}
              {activity?.categories?.join(', ') || 'Chưa cập nhật'}
            </span>
          </div>

          <div className="flex items-start gap-1.5">
            <span className="material-symbols-outlined text-[#006d37] text-[16px] font-bold">
              location_on
            </span>
            <span className="min-w-0 break-words">
              <strong>Địa điểm:</strong>{' '}
              {activity?.location
                ? `${activity.location.address_detail}, ${activity.location.district}, ${activity.location.province}`
                : 'Chưa cập nhật'}
            </span>
          </div>
        </div>

        {registration.status === 'Rejected' &&
          (registration.reject_reason || (registration as any).rejection_reason) && (
            <div className="mt-3.5 text-xs text-red-700 bg-red-50/60 border border-red-200/50 rounded-xl p-3 flex items-start gap-2 max-w-[500px]">
              <span className="material-symbols-outlined text-[16px] shrink-0 text-red-600 mt-0.5 font-bold">
                info
              </span>
              <span>
                <strong>Lý do từ chối:</strong>{' '}
                {registration.reject_reason || (registration as any).rejection_reason}
              </span>
            </div>
          )}
      </div>

      {/* Right Side: Badges & Action Buttons */}
      <div className="flex w-full flex-wrap items-center gap-3 self-start md:w-auto md:self-auto md:shrink-0">
        <div className="flex items-center gap-2">
          <RegistrationStatusBadge status={registration.status} />
        </div>

        <div className="flex w-full items-center gap-2 border-t border-gray-200 pt-3 md:w-auto md:border-l md:border-t-0 md:pl-2 md:pt-0">
          <a
            href={`#/activity/${registration.activity_id}`}
            className="block w-full md:w-auto text-center border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
          >
            Xem chi tiết
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegistrationCard;
