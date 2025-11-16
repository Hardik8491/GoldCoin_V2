/**
 * User Service
 * Handles user profile and account management operations
 */

'use client'

import { API_ENDPOINTS, SUCCESS_MESSAGES } from '@/config/constants'
import type { ApiResponse, User, UserUpdate } from '@/types'
import { apiService } from './api.service'
import { StorageService } from './storage.service'

class UserService {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiService.get<User>(API_ENDPOINTS.USERS.ME)

    if (response.success && response.data) {
      StorageService.setUserData(response.data)
    }

    return response
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: UserUpdate): Promise<ApiResponse<User>> {
    const response = await apiService.put<User>(
      API_ENDPOINTS.USERS.UPDATE_ME,
      data
    )

    if (response.success && response.data) {
      StorageService.setUserData(response.data)
    }

    return response
  }

  /**
   * Delete current user account
   */
  async deleteAccount(): Promise<ApiResponse<void>> {
    const response = await apiService.delete<void>(API_ENDPOINTS.USERS.DELETE_ME)

    if (response.success) {
      // Clear all stored data after account deletion
      StorageService.clearAuth()
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }

    return response
  }

  /**
   * Get user by ID (admin only or self)
   */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return apiService.get<User>(API_ENDPOINTS.USERS.DETAIL(userId))
  }

  /**
   * Get cached user data from storage
   */
  getCachedUser(): User | null {
    return StorageService.getUserData()
  }
}

// Export singleton instance
export const userService = new UserService()
export default userService
