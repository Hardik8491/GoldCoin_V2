/**
 * Budget Service
 * Handles all budget-related API operations
 */

import { API_ENDPOINTS, SUCCESS_MESSAGES } from '@/config/constants'
import type {
  ApiResponse,
  Budget,
  BudgetCreate,
  BudgetStatus,
  PaginatedResponse,
} from '@/types'
import { apiService } from './api.service'

class BudgetService {
  /**
   * Get all budgets
   */
  async getBudgets(
    page = 1,
    perPage = 20
  ): Promise<ApiResponse<PaginatedResponse<Budget>>> {
    return apiService.get<PaginatedResponse<Budget>>(API_ENDPOINTS.BUDGETS.LIST, {
      params: { page, per_page: perPage },
    })
  }

  /**
   * Get single budget by ID
   */
  async getBudget(id: string | number): Promise<ApiResponse<Budget>> {
    return apiService.get<Budget>(API_ENDPOINTS.BUDGETS.DETAIL(id))
  }

  /**
   * Create new budget
   */
  async createBudget(data: BudgetCreate): Promise<ApiResponse<Budget>> {
    const response = await apiService.post<Budget>(
      API_ENDPOINTS.BUDGETS.CREATE,
      data
    )

    if (response.success) {
      response.message = SUCCESS_MESSAGES.BUDGET_CREATED
    }

    return response
  }

  /**
   * Update existing budget
   */
  async updateBudget(
    id: string | number,
    data: Partial<BudgetCreate>
  ): Promise<ApiResponse<Budget>> {
    const response = await apiService.put<Budget>(
      API_ENDPOINTS.BUDGETS.UPDATE(id),
      data
    )

    if (response.success) {
      response.message = SUCCESS_MESSAGES.BUDGET_UPDATED
    }

    return response
  }

  /**
   * Delete budget
   */
  async deleteBudget(id: string | number): Promise<ApiResponse<void>> {
    const response = await apiService.delete<void>(
      API_ENDPOINTS.BUDGETS.DELETE(id)
    )

    if (response.success) {
      response.message = SUCCESS_MESSAGES.BUDGET_DELETED
    }

    return response
  }

  /**
   * Get budget status (spent vs allocated)
   */
  async getBudgetStatus(): Promise<ApiResponse<BudgetStatus[]>> {
    return apiService.get<BudgetStatus[]>(API_ENDPOINTS.BUDGETS.STATUS)
  }
}

// Export singleton instance
export const budgetService = new BudgetService()
export default budgetService
