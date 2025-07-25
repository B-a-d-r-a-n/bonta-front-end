export class StorageUtils {
  // Make this method public so other services can call it.
  public static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  static setLocalItem(key: string, value: any): void {
    if (!this.isBrowser()) return;
    try {
      const valueToStore =
        typeof value === 'object' && value !== null
          ? JSON.stringify(value)
          : String(value);
      localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error(`Failed to save key "${key}" to localStorage:`, error);
    }
  }

  static getLocalItem<T>(key: string): T | null {
    if (!this.isBrowser()) return null;
    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;
      try {
        return JSON.parse(item) as T;
      } catch (e) {
        return item as unknown as T;
      }
    } catch (error) {
      console.error(`Failed to read key "${key}" from localStorage:`, error);
      return null;
    }
  }

  static removeLocalItem(key: string): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(key);
  }
}
