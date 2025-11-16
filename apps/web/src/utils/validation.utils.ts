/**
 * Validation Utilities
 * Helper functions for form validation
 */

import { VALIDATION_RULES } from '@/config/constants'

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return VALIDATION_RULES.EMAIL.PATTERN.test(email)
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  return (
    password.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH &&
    VALIDATION_RULES.PASSWORD.PATTERN.test(password)
  )
}

/**
 * Validate amount
 */
export function isValidAmount(amount: number): boolean {
  return (
    amount >= VALIDATION_RULES.AMOUNT.MIN &&
    amount <= VALIDATION_RULES.AMOUNT.MAX
  )
}

/**
 * Validate required field
 */
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

/**
 * Validate string length
 */
export function isValidLength(
  value: string,
  min: number,
  max: number
): boolean {
  const length = value.trim().length
  return length >= min && length <= max
}

/**
 * Validate number range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate phone number (simple)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

/**
 * Validate date format
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Get validation error message
 */
export function getValidationError(
  field: string,
  value: any,
  rules?: any
): string | null {
  if (!isRequired(value)) {
    return `${field} is required`
  }

  if (typeof value === 'string') {
    if (field.toLowerCase().includes('email') && !isValidEmail(value)) {
      return VALIDATION_RULES.EMAIL.MESSAGE
    }

    if (field.toLowerCase().includes('password') && !isValidPassword(value)) {
      return VALIDATION_RULES.PASSWORD.MESSAGE
    }

    if (
      rules?.minLength &&
      value.length < rules.minLength
    ) {
      return `${field} must be at least ${rules.minLength} characters`
    }

    if (
      rules?.maxLength &&
      value.length > rules.maxLength
    ) {
      return `${field} must be no more than ${rules.maxLength} characters`
    }
  }

  if (typeof value === 'number') {
    if (field.toLowerCase().includes('amount') && !isValidAmount(value)) {
      return VALIDATION_RULES.AMOUNT.MESSAGE
    }

    if (rules?.min !== undefined && value < rules.min) {
      return `${field} must be at least ${rules.min}`
    }

    if (rules?.max !== undefined && value > rules.max) {
      return `${field} must be no more than ${rules.max}`
    }
  }

  return null
}
