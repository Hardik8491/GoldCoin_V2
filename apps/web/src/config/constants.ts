/**
 * Application Constants
 * Centralized configuration values and constants
 */

// ============================================================================
// API Configuration
// ============================================================================

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  API_VERSION: 'v1',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    REFRESH: '/api/v1/auth/refresh',
    LOGOUT: '/api/v1/auth/logout',
    ME: '/api/v1/auth/me',
  },
  USERS: {
    ME: '/api/v1/users/me',
    UPDATE_ME: '/api/v1/users/me',
    DELETE_ME: '/api/v1/users/me',
    DETAIL: (id: string) => `/api/v1/users/${id}`,
  },
  EXPENSES: {
    LIST: '/api/v1/expenses',
    CREATE: '/api/v1/expenses',
    DETAIL: (id: string | number) => `/api/v1/expenses/${id}`,
    UPDATE: (id: string | number) => `/api/v1/expenses/${id}`,
    DELETE: (id: string | number) => `/api/v1/expenses/${id}`,
    STATS: '/api/v1/expenses/stats',
    EXPORT: '/api/v1/expenses/export',
  },
  BUDGETS: {
    LIST: '/api/v1/budgets',
    CREATE: '/api/v1/budgets',
    DETAIL: (id: string | number) => `/api/v1/budgets/${id}`,
    UPDATE: (id: string | number) => `/api/v1/budgets/${id}`,
    DELETE: (id: string | number) => `/api/v1/budgets/${id}`,
    STATUS: '/api/v1/budgets/status',
  },
  PREDICTIONS: {
    LIST: '/api/v1/predictions',
    CREATE: '/api/v1/predictions',
    DETAIL: (id: string | number) => `/api/v1/predictions/${id}`,
    LATEST: '/api/v1/predictions/latest',
  },
  ANALYTICS: {
    OVERVIEW: '/api/v1/analytics/overview',
    TRENDS: '/api/v1/analytics/trends',
    CATEGORIES: '/api/v1/analytics/categories',
    MONTHLY: '/api/v1/analytics/monthly',
  },
  AI: {
    CHAT: '/api/v1/ai/chat',
    ADVICE: '/api/v1/ai/advice',
    INSIGHTS: '/api/v1/ai/insights',
  },
  ALERTS: {
    LIST: '/api/v1/alerts',
    MARK_READ: (id: string | number) => `/api/v1/alerts/${id}/read`,
    MARK_ALL_READ: '/api/v1/alerts/read-all',
  },
  ONBOARDING: {
    PROFILE: '/api/v1/onboarding/profile',
    FINANCIAL: '/api/v1/onboarding/financial',
    BUDGETS: '/api/v1/onboarding/budgets',
    GOALS: '/api/v1/onboarding/goals',
    COMPLETE: '/api/v1/onboarding/complete',
    STATUS: '/api/v1/onboarding/status',
  },
} as const

// ============================================================================
// Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  PREFERENCES: 'user_preferences',
  LANGUAGE: 'language',
} as const

// ============================================================================
// Expense Categories
// ============================================================================

export const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
  { value: 'transportation', label: 'Transportation', icon: '🚗', color: '#4ECDC4' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#45B7D1' },
  { value: 'utilities', label: 'Utilities', icon: '💡', color: '#FFA07A' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥', color: '#98D8C8' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️', color: '#F7DC6F' },
  { value: 'education', label: 'Education', icon: '📚', color: '#BB8FCE' },
  { value: 'other', label: 'Other', icon: '📦', color: '#95A5A6' },
] as const

export const CATEGORY_COLORS: Record<string, string> = {
  food: '#FF6B6B',
  transportation: '#4ECDC4',
  entertainment: '#45B7D1',
  utilities: '#FFA07A',
  healthcare: '#98D8C8',
  shopping: '#F7DC6F',
  education: '#BB8FCE',
  other: '#95A5A6',
}

// ============================================================================
// Date & Time
// ============================================================================

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_LONG: 'MMMM dd, yyyy',
  DISPLAY_SHORT: 'MM/dd/yyyy',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
  ISO_DATE: 'yyyy-MM-dd',
  TIME: 'HH:mm:ss',
  TIME_SHORT: 'HH:mm',
} as const

export const TIME_PERIODS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
] as const

export const BUDGET_PERIODS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const

// ============================================================================
// UI Configuration
// ============================================================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_VISIBLE_PAGES: 5,
} as const

export const THEME_CONFIG = {
  STORAGE_KEY: 'theme',
  DEFAULT: 'system',
  OPTIONS: ['light', 'dark', 'system'],
} as const

export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
} as const

// ============================================================================
// Validation Rules
// ============================================================================

export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address',
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    MESSAGE: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  },
  AMOUNT: {
    MIN: 0.01,
    MAX: 1000000,
    MESSAGE: 'Amount must be between 0.01 and 1,000,000',
  },
  DESCRIPTION: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 500,
    MESSAGE: 'Description must be between 3 and 500 characters',
  },
} as const

// ============================================================================
// Feature Flags
// ============================================================================

export const FEATURE_FLAGS = {
  AI_ADVISOR: process.env.NEXT_PUBLIC_ENABLE_AI_ADVISOR !== 'false',
  PREDICTIONS: process.env.NEXT_PUBLIC_ENABLE_PREDICTIONS !== 'false',
  ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false',
  EXPORT: process.env.NEXT_PUBLIC_ENABLE_EXPORT !== 'false',
  NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false',
} as const

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
  GENERIC: 'Something went wrong. Please try again.',
} as const

// ============================================================================
// Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome back!',
  REGISTER: 'Account created successfully!',
  LOGOUT: 'Logged out successfully',
  EXPENSE_CREATED: 'Expense added successfully',
  EXPENSE_UPDATED: 'Expense updated successfully',
  EXPENSE_DELETED: 'Expense deleted successfully',
  BUDGET_CREATED: 'Budget created successfully',
  BUDGET_UPDATED: 'Budget updated successfully',
  BUDGET_DELETED: 'Budget deleted successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  ONBOARDING_COMPLETE: 'Onboarding completed successfully!',
} as const

// ============================================================================
// Currency Options
// ============================================================================

export const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
] as const

// ============================================================================
// Chart Configuration
// ============================================================================

export const CHART_CONFIG = {
  COLORS: [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#95A5A6',
  ],
  DEFAULT_HEIGHT: 300,
  ANIMATION_DURATION: 750,
} as const

// ============================================================================
// App Metadata
// ============================================================================

export const APP_METADATA = {
  NAME: 'GoldCoin',
  DESCRIPTION: 'GoldCoin - Personal Finance Management',
  VERSION: '1.0.0',
  AUTHOR: 'Your Company',
  SUPPORT_EMAIL: 'support@financeai.com',
} as const
