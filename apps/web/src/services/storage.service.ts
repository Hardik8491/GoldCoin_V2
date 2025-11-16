/**
 * Storage Service
 * Handles local storage operations with type safety
 */

import { STORAGE_KEYS } from '@/config/constants'
import type { User, UserPreferences } from '@/types'

class StorageServices {
  /**
   * Check if localStorage is available
   */
  private isAvailable(): boolean {
    if (typeof window === 'undefined') {
      return false
    }

    try {
      const testKey = '__storage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get item from localStorage
   */
  private getItem<T>(key: string): T | null {
    if (!this.isAvailable()) {
      return null
    }

    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error getting item ${key}:`, error)
      return null
    }
  }

  /**
   * Set item in localStorage
   */
  private setItem<T>(key: string, value: T): void {
    if (!this.isAvailable()) {
      return
    }

    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting item ${key}:`, error)
    }
  }

  /**
   * Remove item from localStorage
   */
  private removeItem(key: string): void {
    if (!this.isAvailable()) {
      return
    }

    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing item ${key}:`, error)
    }
  }

  /**
   * Clear all items from localStorage
   */
  clear(): void {
    if (!this.isAvailable()) {
      return
    }

    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
  }

  // ============================================================================
  // Authentication
  // ============================================================================

  getAuthToken(): string | null {
    return this.getItem<string>(STORAGE_KEYS.AUTH_TOKEN)
  }

  setAuthToken(token: string): void {
    this.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
  }

  getRefreshToken(): string | null {
    return this.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN)
  }

  setRefreshToken(token: string): void {
    this.setItem(STORAGE_KEYS.REFRESH_TOKEN, token)
  }

  getUserData(): User | null {
    return this.getItem<User>(STORAGE_KEYS.USER_DATA)
  }

  setUserData(user: User): void {
    this.setItem(STORAGE_KEYS.USER_DATA, user)
  }

  clearAuth(): void {
    this.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    this.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    this.removeItem(STORAGE_KEYS.USER_DATA)
  }

  // ============================================================================
  // User Preferences
  // ============================================================================

  getPreferences(): UserPreferences | null {
    return this.getItem<UserPreferences>(STORAGE_KEYS.PREFERENCES)
  }

  setPreferences(preferences: UserPreferences): void {
    this.setItem(STORAGE_KEYS.PREFERENCES, preferences)
  }

  getTheme(): string {
    return this.getItem<string>(STORAGE_KEYS.THEME) || 'system'
  }

  setTheme(theme: string): void {
    this.setItem(STORAGE_KEYS.THEME, theme)
  }

  getLanguage(): string {
    return this.getItem<string>(STORAGE_KEYS.LANGUAGE) || 'en'
  }

  setLanguage(language: string): void {
    this.setItem(STORAGE_KEYS.LANGUAGE, language)
  }
}

// Export singleton instance
export const StorageService = new StorageServices()
export default StorageService
