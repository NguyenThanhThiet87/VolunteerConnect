/**
 * Translate phone formats to E164 (+84...)
 */
export const formatPhoneE164 = (phone: string): string => {
  let cleaned = phone.replace(/\s+/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '+84' + cleaned.substring(1);
  }
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
};

/**
 * Format string date time into ISO format with specified default time if missing
 */
export const formatDateTimeToISO = (dateStr: string, defaultTime: string = '00:00'): string => {
  if (!dateStr) return '';
  if (dateStr.endsWith('Z') || dateStr.includes('+')) return dateStr;

  let normalized = dateStr.replace(' ', 'T');
  if (!normalized.includes('T')) {
    normalized = `${normalized}T${defaultTime}`;
  }

  const [datePart, timePart] = normalized.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

  const localDate = new Date(year, month - 1, day, hours, minutes);
  return localDate.toISOString();
};

/**
 * Format ISO datetime string to HTML local datetime input (yyyy-MM-ddThh:mm)
 */
export const formatISOToLocalInput = (isoStr: string): string => {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return '';

  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Format date string to Vietnamese localized date format (dd/mm/yyyy)
 */
export const formatDateVi = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Chưa cập nhật';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật';
  return date.toLocaleDateString('vi-VN');
};

/**
 * Format datetime schedule for display (e.g. 08:00 - 17:00 | 25/12/2026)
 */
export const formatSchedule = (startStr: string, endStr: string): string => {
  try {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const startTime = start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    const endTime = end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    const startDate = start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const endDate = end.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    if (startDate === endDate) {
      return `${startTime} - ${endTime} | ${startDate}`;
    } else {
      return `${startTime} ${startDate} - ${endTime} ${endDate}`;
    }
  } catch {
    return `${startStr} - ${endStr}`;
  }
};
