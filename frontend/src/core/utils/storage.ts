/**
 * Safe LocalStorage and SessionStorage wrappers
 */
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving to localStorage [${key}]`, e);
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing from localStorage [${key}]`, e);
    }
  },
  getSession(key: string, defaultValue: string = ''): string {
    try {
      return sessionStorage.getItem(key) || defaultValue;
    } catch {
      return defaultValue;
    }
  },
  setSession(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      console.error(`Error saving to sessionStorage [${key}]`, e);
    }
  }
};
