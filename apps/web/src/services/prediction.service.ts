/**
 * Prediction Service
 * Handles all AI prediction-related API operations
 */

import { API_ENDPOINTS } from '@/config/constants'
import type {
  ApiResponse,
  SpendingPrediction,
  PredictionRequest,
  PaginatedResponse,
} from '@/types'
import { apiService } from './api.service'

class PredictionService {
  /**
   * Get all predictions
   */
  async getPredictions(
    page = 1,
    perPage = 20
  ): Promise<ApiResponse<PaginatedResponse<SpendingPrediction>>> {
    return apiService.get<PaginatedResponse<SpendingPrediction>>(
      API_ENDPOINTS.PREDICTIONS.LIST,
      {
        params: { page, per_page: perPage },
      }
    )
  }

  /**
   * Get single prediction by ID
   */
  async getPrediction(id: string | number): Promise<ApiResponse<SpendingPrediction>> {
    return apiService.get<SpendingPrediction>(API_ENDPOINTS.PREDICTIONS.DETAIL(id))
  }

  /**
   * Create new prediction
   */
  async createPrediction(
    data: PredictionRequest
  ): Promise<ApiResponse<SpendingPrediction>> {
    return apiService.post<SpendingPrediction>(
      API_ENDPOINTS.PREDICTIONS.CREATE,
      data
    )
  }

  /**
   * Get latest prediction
   */
  async getLatestPrediction(): Promise<ApiResponse<SpendingPrediction>> {
    return apiService.get<SpendingPrediction>(API_ENDPOINTS.PREDICTIONS.LATEST)
  }
}

// Export singleton instance
export const predictionService = new PredictionService()
export default predictionService
