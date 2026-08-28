export const APP_CONSTANTS = {
  APP_NAME: 'Volunteer Connect',
  DEFAULT_ITEMS_PER_PAGE: 10,
  DEFAULT_FEED_PAGE_SIZE: 10,
  DEFAULT_ACTIVITY_PAGE_SIZE: 9,
  LOCAL_STORAGE_KEY: 'volunteer_connect_db',
  TOKEN_KEY: 'token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  DISMISSED_PROFILE_REMINDER_KEY: 'dismissedProfileReminder',
  DEFAULT_FEEDBACK_PLACEHOLDER: 'Nhập lý do hoặc phản hồi...'
} as const;

export const ACTIVITY_CATEGORIES = [
  'Môi trường',
  'Giáo dục',
  'Y tế',
  'Cộng đồng',
  'Cứu trợ thiên tai',
  'Trẻ em',
  'Người cao tuổi',
  'Văn hóa - Nghệ thuật'
] as const;
