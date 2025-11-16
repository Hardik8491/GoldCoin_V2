/**
 * Service Layer Index
 * Central export point for all services
 */

import aiService from './ai.service'
import apiService from './api.service'
import authService from './auth.service'
import budgetService from './budget.service'
import expenseService from './expense.service'
import predictionService from './prediction.service'
import analyticsService from './analytics.service'
import StorageService from './storage.service'
import userService from './user.service'
import onboardingService from './onboarding.service'

export { apiService } from './api.service'
export { authService } from './auth.service'
export { StorageService } from './storage.service'
export { expenseService } from './expense.service'
export { budgetService } from './budget.service'
export { predictionService } from './prediction.service'
export { analyticsService } from './analytics.service'
export { aiService } from './ai.service'
export { userService } from './user.service'
export { onboardingService } from './onboarding.service'

// Re-export for convenience
export default {
  api: apiService,
  auth: authService,
  storage: StorageService,
  expense: expenseService,
  budget: budgetService,
  prediction: predictionService,
  analytics: analyticsService,
  ai: aiService,
  user: userService,
  onboarding: onboardingService,
}
