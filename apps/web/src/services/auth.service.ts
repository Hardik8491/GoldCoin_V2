/**
 * Authentication Service
 * Handles all authentication-related operations
 */

'use client'

import { API_ENDPOINTS, SUCCESS_MESSAGES } from '@/config/constants'
import type {
  ApiResponse,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  User,
} from '@/types'
import { apiService } from './api.service'
import { StorageService } from './storage.service'

class AuthService {
  /**
   * User registration
   */
  async register(data: RegisterData): Promise<ApiResponse<User>> {
    const response = await apiService.post<User>(
      API_ENDPOINTS.AUTH.REGISTER,
      data,
      { skipAuth: true }
    )

    if (response.success && response.data) {
      // Automatically log in after registration
      const loginResponse = await this.login({
        email: data.email,
        password: data.password,
      })

      return loginResponse.success
        ? { success: true, data: response.data, message: SUCCESS_MESSAGES.REGISTER }
        : response
    }

    return response
  }

  /**
   * User login
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    // FastAPI OAuth2 requires form data
    const formData = new URLSearchParams()
    formData.append('username', credentials.email)
    formData.append('password', credentials.password)
    console.log(credentials)
    try {
      const response = await fetch(
        `${apiService['baseURL']}${API_ENDPOINTS.AUTH.LOGIN}`,
        {
          method: 'POST',
          headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: credentials.email,
    password: credentials.password
  })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          error: error.detail || 'Login failed',
        }
      }

      const tokens: AuthTokens = await response.json()

      // Store tokens
      StorageService.setAuthToken(tokens.access_token)
      if (tokens.refresh_token) {
        StorageService.setRefreshToken(tokens.refresh_token)
      }

      // Fetch user data
      const userResponse = await this.getCurrentUser()

      if (userResponse.success && userResponse.data) {
        StorageService.setUserData(userResponse.data)
        return {
          success: true,
          data: userResponse.data,
          message: SUCCESS_MESSAGES.LOGIN,
        }
      }

      return {
        success: false,
        error: 'Failed to fetch user data',
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  /**
   * User logout
   */
  async logout(): Promise<void> {
    try {
      // Optionally call logout endpoint
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local storage
      StorageService.clearAuth()

      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    const refreshToken = StorageService.getRefreshToken()

    if (!refreshToken) {
      return {
        success: false,
        error: 'No refresh token available',
      }
    }

    const response = await apiService.post<AuthTokens>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refresh_token: refreshToken },
      { skipAuth: true }
    )

    if (response.success && response.data) {
      StorageService.setAuthToken(response.data.access_token)
      if (response.data.refresh_token) {
        StorageService.setRefreshToken(response.data.refresh_token)
      }
    }

    return response
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiService.get<User>(API_ENDPOINTS.AUTH.ME)

    if (response.success && response.data) {
      StorageService.setUserData(response.data)
    }

    return response
  }

  /**
   * Update user profile
   */
  async updateProfile(
    data: Partial<User>
  ): Promise<ApiResponse<User>> {
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
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    return apiService.post('/api/v1/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!StorageService.getAuthToken()
  }

  /**
   * Get stored user data
   */
  getUser(): User | null {
    return StorageService.getUserData()
  }
}

// Export singleton instance
export const authService = new AuthService()
export default authService
