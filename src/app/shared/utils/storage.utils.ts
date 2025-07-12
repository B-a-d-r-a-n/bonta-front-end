import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export class StorageUtils {
  // Helper to check if running in browser
  static isBrowser(): boolean {
    try {
      const platformId =
        typeof ngDevMode !== 'undefined' ? inject(PLATFORM_ID) : 'browser';
      return isPlatformBrowser(platformId);
    } catch {
      // Fallback for direct browser usage
      return (
        typeof window !== 'undefined' && typeof localStorage !== 'undefined'
      );
    }
  }

  // Local Storage
  static setLocalItem(key: string, value: any): void {
    if (!this.isBrowser()) return;
    try {
      // FIX: Only stringify if the value is an object or array
      const valueToStore =
        typeof value === 'object' && value !== null
          ? JSON.stringify(value)
          : String(value);
      localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  static getLocalItem<T>(key: string, defaultValue?: T): T | null {
    if (!this.isBrowser()) return defaultValue || null;
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue || null;
      }
      // FIX: Try to parse as JSON, but if it fails, return the raw string.
      // This handles both "my-uuid" and {"key":"value"} correctly.
      try {
        return JSON.parse(item) as T;
      } catch (e) {
        return item as unknown as T; // Return the raw item if it's not JSON
      }
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue || null;
    }
  }

  static removeLocalItem(key: string): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }

  static clearLocalStorage(): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  // Session Storage
  static setSessionItem(key: string, value: any): void {
    if (!this.isBrowser()) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to sessionStorage:', error);
    }
  }

  static getSessionItem<T>(key: string, defaultValue?: T): T | null {
    if (!this.isBrowser()) return defaultValue || null;
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Failed to read from sessionStorage:', error);
      return defaultValue || null;
    }
  }

  static removeSessionItem(key: string): void {
    if (!this.isBrowser()) return;
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from sessionStorage:', error);
    }
  }

  static clearSessionStorage(): void {
    if (!this.isBrowser()) return;
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error);
    }
  }

  // Utility methods
  static hasLocalItem(key: string): boolean {
    if (!this.isBrowser()) return false;
    return localStorage.getItem(key) !== null;
  }

  static hasSessionItem(key: string): boolean {
    if (!this.isBrowser()) return false;
    return sessionStorage.getItem(key) !== null;
  }

  // Get all keys from storage
  static getLocalKeys(): string[] {
    if (!this.isBrowser()) return [];
    return Object.keys(localStorage);
  }

  static getSessionKeys(): string[] {
    if (!this.isBrowser()) return [];
    return Object.keys(sessionStorage);
  }

  // Storage size utilities
  static getLocalStorageSize(): number {
    if (!this.isBrowser()) return 0;
    let size = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length + key.length;
      }
    }
    return size;
  }

  static getSessionStorageSize(): number {
    if (!this.isBrowser()) return 0;
    let size = 0;
    for (const key in sessionStorage) {
      if (sessionStorage.hasOwnProperty(key)) {
        size += sessionStorage[key].length + key.length;
      }
    }
    return size;
  }

  // Check if storage is available
  static isLocalStorageAvailable(): boolean {
    if (!this.isBrowser()) return false;
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  static isSessionStorageAvailable(): boolean {
    if (!this.isBrowser()) return false;
    try {
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Batch operations
  static setMultipleLocalItems(items: Record<string, any>): void {
    if (!this.isBrowser()) return;
    Object.entries(items).forEach(([key, value]) => {
      this.setLocalItem(key, value);
    });
  }

  static getMultipleLocalItems<T>(keys: string[]): Record<string, T | null> {
    if (!this.isBrowser()) return {};
    const result: Record<string, T | null> = {};
    keys.forEach((key) => {
      result[key] = this.getLocalItem<T>(key);
    });
    return result;
  }

  static removeMultipleLocalItems(keys: string[]): void {
    if (!this.isBrowser()) return;
    keys.forEach((key) => {
      this.removeLocalItem(key);
    });
  }

  // Expiration utilities
  static setLocalItemWithExpiry(
    key: string,
    value: any,
    expiryInMinutes: number
  ): void {
    if (!this.isBrowser()) return;
    const item = {
      value,
      expiry: Date.now() + expiryInMinutes * 60 * 1000,
    };
    this.setLocalItem(key, item);
  }

  static getLocalItemWithExpiry<T>(key: string): T | null {
    if (!this.isBrowser()) return null;
    const item = this.getLocalItem<{ value: T; expiry: number }>(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.removeLocalItem(key);
      return null;
    }

    return item.value;
  }

  // Encryption utilities (basic)
  static setEncryptedLocalItem(
    key: string,
    value: any,
    password: string
  ): void {
    if (!this.isBrowser()) return;
    try {
      const encrypted = btoa(JSON.stringify(value));
      this.setLocalItem(key, encrypted);
    } catch (error) {
      console.error('Failed to encrypt data:', error);
    }
  }

  static getEncryptedLocalItem<T>(key: string, password: string): T | null {
    if (!this.isBrowser()) return null;
    try {
      const encrypted = this.getLocalItem<string>(key);
      if (!encrypted) return null;

      const decrypted = JSON.parse(atob(encrypted));
      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return null;
    }
  }
}
