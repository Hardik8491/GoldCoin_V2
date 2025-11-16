/**
 * Onboarding Service
 * Handles all onboarding-related API operations
 */

'use client'

import { API_ENDPOINTS, SUCCESS_MESSAGES } from '@/config/constants'
import type {
  ApiResponse,
  ProfileSetup,
  FinancialSetup,
  CategoryBudget,
  Goal,
} from '@/types'
import { apiService } from './api.service'

class OnboardingService {
  /**
   * Save profile setup
   */
  async saveProfile(data: ProfileSetup): Promise<ApiResponse<ProfileSetup>> {
    const response = await apiService.post<ProfileSetup>(
      API_ENDPOINTS.ONBOARDING.PROFILE,
      data
    )

    if (response.success) {
      response.message = 'Profile saved successfully'
    }

    return response
  }

  /**
   * Save financial setup
   */
  async saveFinancialSetup(
    data: FinancialSetup
  ): Promise<ApiResponse<FinancialSetup>> {
    const response = await apiService.post<FinancialSetup>(
      API_ENDPOINTS.ONBOARDING.FINANCIAL,
      data
    )

    if (response.success) {
      response.message = 'Financial setup saved successfully'
    }

    return response
  }

  /**
   * Save budgets
   */
  async saveBudgets(
    data: CategoryBudget[]
  ): Promise<ApiResponse<CategoryBudget[]>> {
    const response = await apiService.post<CategoryBudget[]>(
      API_ENDPOINTS.ONBOARDING.BUDGETS,
      { budgets: data }
    )

    if (response.success) {
      response.message = 'Budgets saved successfully'
    }

    return response
  }

  /**
   * Save goals
   */
  async saveGoals(data: Goal[]): Promise<ApiResponse<Goal[]>> {
    const response = await apiService.post<Goal[]>(
      API_ENDPOINTS.ONBOARDING.GOALS,
      { goals: data }
    )

    if (response.success) {
      response.message = 'Goals saved successfully'
    }

    return response
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(): Promise<ApiResponse<void>> {
    const response = await apiService.post<void>(
      API_ENDPOINTS.ONBOARDING.COMPLETE
    )

    if (response.success) {
      response.message = SUCCESS_MESSAGES.ONBOARDING_COMPLETE
    }

    return response
  }

  /**
   * Get onboarding status
   */
  async getOnboardingStatus(): Promise<ApiResponse<{ is_onboarded: boolean }>> {
    return apiService.get<{ is_onboarded: boolean }>(
      API_ENDPOINTS.ONBOARDING.STATUS
    )
  }
}

// Export singleton instance
export const onboardingService = new OnboardingService()
export default onboardingService

