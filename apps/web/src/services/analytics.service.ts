/**
 * Analytics Service
 * Handles all analytics-related API operations
 */

import { API_ENDPOINTS } from '@/config/constants'
import type { ApiResponse } from '@/types'
import { apiService } from './api.service'

export interface AnalyticsOverview {
  period: {
    start_date: string
    end_date: string
  }
  expenses: {
    total: number
    count: number
    average: number
  }
  budget: {
    total: number
    spent: number
    remaining: number
    percentage_used: number
  }
}

export interface AnalyticsTrend {
  month: string
  total: number
  count: number
}

export interface AnalyticsTrends {
  period_months: number
  trends: AnalyticsTrend[]
}

export interface CategoryAnalytic {
  category: string
  total: number
  count: number
  percentage: number
}

export interface AnalyticsCategories {
  period: {
    start_date: string
    end_date: string
  }
  total: number
  categories: CategoryAnalytic[]
}

export interface MonthlyAnalytic {
  month: number
  total: number
  count: number
}

export interface AnalyticsMonthly {
  year: number
  months: MonthlyAnalytic[]
}

class AnalyticsService {
  /**
   * Get analytics overview
   */
  async getOverview(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<AnalyticsOverview>> {
    const params: Record<string, string> = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate

    return apiService.get<AnalyticsOverview>(API_ENDPOINTS.ANALYTICS.OVERVIEW, {
      params,
    })
  }

  /**
   * Get spending trends
   */
  async getTrends(months = 6): Promise<ApiResponse<AnalyticsTrends>> {
    return apiService.get<AnalyticsTrends>(API_ENDPOINTS.ANALYTICS.TRENDS, {
      params: { months },
    })
  }

  /**
   * Get category breakdown
   */
  async getCategories(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<AnalyticsCategories>> {
    const params: Record<string, string> = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate

    return apiService.get<AnalyticsCategories>(API_ENDPOINTS.ANALYTICS.CATEGORIES, {
      params,
    })
  }

  /**
   * Get monthly breakdown
   */
  async getMonthly(year?: number): Promise<ApiResponse<AnalyticsMonthly>> {
    const params: Record<string, number> = {}
    if (year) params.year = year

    return apiService.get<AnalyticsMonthly>(API_ENDPOINTS.ANALYTICS.MONTHLY, {
      params,
    })
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService()
export default analyticsService

