/**
 * Expense Service
 * Handles all expense-related API operations
 */

import { API_ENDPOINTS, SUCCESS_MESSAGES } from '@/config/constants'
import type {
  ApiResponse,
  Expense,
  ExpenseCreate,
  ExpenseUpdate,
  ExpenseFilters,
  PaginatedResponse,
} from '@/types'
import { apiService } from './api.service'

class ExpenseService {
  /**
   * Get all expenses with optional filters
   */
  async getExpenses(
    filters?: ExpenseFilters,
    page = 1,
    perPage = 20
  ): Promise<ApiResponse<PaginatedResponse<Expense>>> {
    return apiService.get<PaginatedResponse<Expense>>(API_ENDPOINTS.EXPENSES.LIST , {
      params: {
        ...filters,
        page,
        per_page: perPage,
      },
    })
  }

  /**
   * Get single expense by ID
   */
  async getExpense(id: string | number): Promise<ApiResponse<Expense>> {
    return apiService.get<Expense>(API_ENDPOINTS.EXPENSES.DETAIL(id))
  }

  /**
   * Create new expense
   */
  async createExpense(data: ExpenseCreate): Promise<ApiResponse<Expense>> {
    const response = await apiService.post<Expense>(
      API_ENDPOINTS.EXPENSES.CREATE,
      data
    )

    if (response.success) {
      response.message = SUCCESS_MESSAGES.EXPENSE_CREATED
    }

    return response
  }

  /**
   * Update existing expense
   */
  async updateExpense(
    id: string | number,
    data: ExpenseUpdate
  ): Promise<ApiResponse<Expense>> {
    const response = await apiService.put<Expense>(
      API_ENDPOINTS.EXPENSES.UPDATE(id),
      data
    )

    if (response.success) {
      response.message = SUCCESS_MESSAGES.EXPENSE_UPDATED
    }

    return response
  }

  /**
   * Delete expense
   */
  async deleteExpense(id: string | number): Promise<ApiResponse<void>> {
    const response = await apiService.delete<void>(
      API_ENDPOINTS.EXPENSES.DELETE(id)
    )

    if (response.success) {
      response.message = SUCCESS_MESSAGES.EXPENSE_DELETED
    }

    return response
  }

  /**
   * Get expense statistics
   */
  async getStats(filters?: ExpenseFilters): Promise<ApiResponse<any>> {
    return apiService.get(API_ENDPOINTS.EXPENSES.STATS, {
      params: filters,
    })
  }

  /**
   * Export expenses to file
   */
  async exportExpenses(
    format: 'csv' | 'xlsx' | 'pdf' = 'csv',
    filters?: ExpenseFilters
  ): Promise<boolean> {
    const filename = `expenses_${new Date().toISOString().split('T')[0]}.${format}`
    
    return apiService.download(
      API_ENDPOINTS.EXPENSES.EXPORT,
      filename,
      {
        params: {
          ...filters,
          format,
        },
      }
    )
  }
}

// Export singleton instance
export const expenseService = new ExpenseService()
export default expenseService
