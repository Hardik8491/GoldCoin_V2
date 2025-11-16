/**
 * AI Service
 * Handles all AI advisor and insights API operations
 */

import { API_ENDPOINTS } from '@/config/constants'
import type {
  ApiResponse,
  ChatMessage,
  FinancialAdvice,
  AdvisorRequest,
} from '@/types'
import { apiService } from './api.service'

class AIService {
  /**
   * Send message to AI advisor
   */
  async chat(request: AdvisorRequest): Promise<ApiResponse<ChatMessage>> {
    const response = await apiService.post<{ response: string; suggestions?: string[] }>(
      API_ENDPOINTS.AI.CHAT,
      {
        message: request.message,
        conversation_history: request.conversation_history || [],
      }
    )
    
    // Transform response to ChatMessage format
    if (response.success && response.data) {
      return {
        ...response,
        data: {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.data.response || '',
          timestamp: new Date().toISOString(),
        } as ChatMessage,
      }
    }
    
    return response as any
  }

  /**
   * Get financial advice
   */
  async getAdvice(question: string): Promise<ApiResponse<FinancialAdvice>> {
    return apiService.post<FinancialAdvice>(API_ENDPOINTS.AI.ADVICE, {
      question,
    })
  }

  /**
   * Get AI-generated insights
   */
  async getInsights(): Promise<ApiResponse<any>> {
    return apiService.get(API_ENDPOINTS.AI.INSIGHTS)
  }
}

// Export singleton instance
export const aiService = new AIService()
export default aiService
