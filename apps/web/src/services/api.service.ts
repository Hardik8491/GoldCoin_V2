/**
 * API Service
 * Core HTTP client for all API communications
 */

'use client'

import { API_CONFIG, API_ENDPOINTS, ERROR_MESSAGES } from '@/config/constants'
import type { ApiResponse, PaginatedResponse } from '@/types'
import { StorageService } from './storage.service'

interface RequestConfig extends RequestInit {
  params?: Record<string, any>
  skipAuth?: boolean
  retry?: boolean
}

class ApiService {
  private baseURL: string
  private timeout: number
  private retryAttempts: number
  private retryDelay: number

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.timeout = API_CONFIG.TIMEOUT
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS
    this.retryDelay = API_CONFIG.RETRY_DELAY
  }

  /**
   * Get authorization headers
   */
  private getAuthHeaders(): HeadersInit {
    const token = StorageService.getAuthToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  /**
   * Build URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseURL}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url.toString()
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true, data: undefined as T }
    }

    // Parse JSON response
    let data: any
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json()
      } catch (error) {
        console.error('Failed to parse JSON response:', error)
        data = {}
      }
    }

    // Handle success responses
    if (response.ok) {
      return {
        success: true,
        data: data as T,
      }
    }

    // Handle error responses
    const errorMessage = data?.detail || data?.message || this.getErrorMessage(response.status)

    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
      StorageService.clearAuth()
      
      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login'
      }
    }

    return {
      success: false,
      error: errorMessage,
    }
  }

  /**
   * Get error message based on status code
   */
  private getErrorMessage(status: number): string {
    switch (status) {
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED
      case 403:
        return ERROR_MESSAGES.FORBIDDEN
      case 404:
        return ERROR_MESSAGES.NOT_FOUND
      case 500:
      case 502:
      case 503:
      case 504:
        return ERROR_MESSAGES.SERVER_ERROR
      default:
        return ERROR_MESSAGES.GENERIC
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  private async requestWithRetry<T>(
    url: string,
    config: RequestInit,
    attempt = 1
  ): Promise<Response> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      // Retry on network errors
      if (attempt < this.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt))
        return this.requestWithRetry<T>(url, config, attempt + 1)
      }
      throw error
    }
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { params, skipAuth, retry = true, ...fetchConfig } = config

    try {
      const url = this.buildURL(endpoint, params)
      const headers = skipAuth ? { 'Content-Type': 'application/json' } : this.getAuthHeaders()

      const requestConfig: RequestInit = {
        ...fetchConfig,
        headers: {
          ...headers,
          ...fetchConfig.headers,
        },
      }

      const response = retry
        ? await this.requestWithRetry<T>(url, requestConfig)
        : await fetch(url, requestConfig)

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('API Request Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK,
      }
    }
  }

  /**
   * HTTP Methods
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }

  /**
   * Upload file
   */
  async upload<T>(
    endpoint: string,
    file: File,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    const headers = this.getAuthHeaders()
    delete (headers as any)['Content-Type'] // Let browser set content-type for FormData

    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      headers,
      body: formData,
    })
  }

  /**
   * Download file
   */
  async download(endpoint: string, filename: string, config?: RequestConfig): Promise<boolean> {
    try {
      const url = this.buildURL(endpoint, config?.params)
      const headers = this.getAuthHeaders()

      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        return false
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      return true
    } catch (error) {
      console.error('Download Error:', error)
      return false
    }
  }
}

// Export singleton instance
export const apiService = new ApiService()
export default apiService
