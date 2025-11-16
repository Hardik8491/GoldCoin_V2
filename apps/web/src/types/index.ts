/**
 * Core Type Definitions
 * Centralized type definitions for the entire application
 */

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface ErrorResponse {
  detail: string
  status_code: number
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface AuthTokens {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in?: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
}

export interface User {
  id: number
  email: string
  full_name: string
  is_active: boolean
  is_onboarded?: boolean
  currency?: string
  theme?: string
  created_at: string
  updated_at: string
}

export interface UserUpdate {
  email?: string
  full_name?: string
  password?: string
  is_active?: boolean
  currency?: string
  theme?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
}

// ============================================================================
// Expense Types
// ============================================================================

export enum ExpenseCategory {
  FOOD = 'food',
  TRANSPORTATION = 'transportation',
  ENTERTAINMENT = 'entertainment',
  UTILITIES = 'utilities',
  HEALTHCARE = 'healthcare',
  SHOPPING = 'shopping',
  EDUCATION = 'education',
  OTHER = 'other',
}

export interface Expense {
  id: string | number
  user_id: string
  amount: number
  category: ExpenseCategory | string
  description: string
  date: string
  recurring: boolean
  tags?: string[]
  created_at?: string
  updated_at?: string
}

export interface ExpenseCreate {
  amount: number
  category: ExpenseCategory | string
  description: string
  date: string
  recurring?: boolean
  tags?: string[]
}

export interface ExpenseUpdate {
  amount?: number
  category?: ExpenseCategory | string
  description?: string
  date?: string
  recurring?: boolean
  tags?: string[]
}

export interface ExpenseFilters {
  category?: ExpenseCategory | string
  start_date?: string
  end_date?: string
  min_amount?: number
  max_amount?: number
  recurring?: boolean
  search?: string
}

// ============================================================================
// Budget Types
// ============================================================================

export interface Budget {
  id: number
  user_id: number
  category: ExpenseCategory | string
  limit_amount: number
  month: string
  created_at?: string
  updated_at?: string
}

export interface BudgetCreate {
  category: ExpenseCategory | string
  limit_amount: number
  month: string
}

export interface BudgetStatus {
  budget_id?: number
  category: ExpenseCategory | string
  month: string
  limit: number
  spent: number
  remaining: number
  percentage_used: number
}

// ============================================================================
// Prediction Types
// ============================================================================

export interface SpendingPrediction {
  id: string | number
  user_id: string
  predicted_amount: number
  confidence_score: number
  prediction_date: string
  prediction_period: string
  category?: ExpenseCategory | string
  insights?: string[]
  category_breakdown?: Record<string, number>
  created_at?: string
}

export interface PredictionRequest {
  period: 'week' | 'month' | 'quarter' | 'year'
  category?: ExpenseCategory | string
  include_breakdown?: boolean
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface SpendingTrend {
  period: string
  amount: number
  category?: string
  change_percentage?: number
}

export interface CategoryAnalytics {
  category: ExpenseCategory | string
  total_amount: number
  transaction_count: number
  average_amount: number
  percentage_of_total: number
}

export interface MonthlyAnalytics {
  month: string
  total_spent: number
  total_income?: number
  savings?: number
  categories: CategoryAnalytics[]
  trends: SpendingTrend[]
}

// ============================================================================
// Alert Types
// ============================================================================

export interface Alert {
  id: string | number
  user_id: string
  type: 'budget_warning' | 'budget_exceeded' | 'unusual_spending' | 'prediction' | 'info'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  is_read: boolean
  related_entity_id?: string
  related_entity_type?: 'expense' | 'budget' | 'prediction'
  created_at: string
}

// ============================================================================
// AI Advisor Types
// ============================================================================

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface FinancialAdvice {
  id: string
  user_id: string
  question: string
  advice: string
  category?: string
  confidence: number
  sources?: string[]
  created_at: string
}

export interface AdvisorRequest {
  message: string
  conversation_history?: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  context?: {
    expenses?: Expense[]
    budgets?: Budget[]
    predictions?: SpendingPrediction[]
  }
}

// ============================================================================
// UI State Types
// ============================================================================

export interface ToastNotification {
  id: string
  title: string
  description?: string
  variant: 'default' | 'destructive' | 'success' | 'warning'
  duration?: number
}

export interface LoadingState {
  [key: string]: boolean
}

export interface FormErrors {
  [key: string]: string | undefined
}

// ============================================================================
// Chart & Visualization Types
// ============================================================================

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
  metadata?: Record<string, any>
}

export interface TimeSeriesData {
  timestamp: string
  value: number
  category?: string
}

export interface PieChartData {
  name: string
  value: number
  color?: string
  percentage?: number
}

// ============================================================================
// Settings Types
// ============================================================================

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  currency: string
  language: string
  notifications_enabled: boolean
  email_notifications: boolean
  budget_alerts: boolean
  prediction_insights: boolean
}

export interface AppSettings {
  api_url: string
  app_name: string
  version: string
  environment: 'development' | 'staging' | 'production'
}

// ============================================================================
// Onboarding Types
// ============================================================================

export interface ProfileSetup {
  name: string
  currency: string
  theme?: string
}

export interface RecurringExpense {
  name: string
  amount: number
}

export interface FinancialSetup {
  currentSavings: number
  monthlyIncome: number
  recurringExpenses: RecurringExpense[]
}

export interface CategoryBudget {
  category: string
  limit: number
}

export interface Goal {
  title: string
  targetAmount: number
  targetDate: string
}

export interface OnboardingData {
  profile: ProfileSetup | null
  financialSetup: FinancialSetup | null
  budgets: CategoryBudget[]
  goals: Goal[]
}

export interface OnboardingState {
  step: number
  profile: ProfileSetup | null
  financialSetup: FinancialSetup | null
  budgets: CategoryBudget[]
  goals: Goal[]
  setStep: (step: number) => void
  setProfile: (data: ProfileSetup) => void
  setFinancialSetup: (data: FinancialSetup) => void
  setBudgets: (data: CategoryBudget[]) => void
  setGoals: (data: Goal[]) => void
  reset: () => void
}
