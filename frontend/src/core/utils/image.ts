/**
 * Helper to fix wrong dev port/hosts in backend-returned image/media URLs
 */
export const fixImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  return url.replace('http://localhost:3000/', 'http://localhost:8000/');
};
