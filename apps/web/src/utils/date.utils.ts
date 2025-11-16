/**
 * Date Utilities
 * Helper functions for date formatting and manipulation
 */

import { format, parseISO, isValid, differenceInDays, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { DATE_FORMATS } from '@/config/constants'

/**
 * Format date to display format
 */
export function formatDate(
  date: string | Date,
  formatString: string = DATE_FORMATS.DISPLAY
): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? format(dateObj, formatString) : ''
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

/**
 * Format date to ISO string
 */
export function toISODate(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? format(dateObj, DATE_FORMATS.ISO_DATE) : ''
  } catch (error) {
    console.error('Error converting to ISO date:', error)
    return ''
  }
}

/**
 * Get relative time string (e.g., "2 days ago")
 */
export function getRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const days = differenceInDays(new Date(), dateObj)

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    if (days < 365) return `${Math.floor(days / 30)} months ago`
    return `${Math.floor(days / 365)} years ago`
  } catch (error) {
    console.error('Error getting relative time:', error)
    return ''
  }
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return differenceInDays(new Date(), dateObj) === 0
  } catch (error) {
    return false
  }
}

/**
 * Get date range for period
 */
export function getDateRange(
  period: 'week' | 'month' | 'quarter' | 'year'
): { start: Date; end: Date } {
  const today = new Date()

  switch (period) {
    case 'week':
      return {
        start: startOfWeek(today),
        end: endOfWeek(today),
      }
    case 'month':
      return {
        start: startOfMonth(today),
        end: endOfMonth(today),
      }
    case 'quarter':
      const quarter = Math.floor(today.getMonth() / 3)
      const quarterStart = new Date(today.getFullYear(), quarter * 3, 1)
      const quarterEnd = new Date(today.getFullYear(), quarter * 3 + 3, 0)
      return {
        start: quarterStart,
        end: quarterEnd,
      }
    case 'year':
      return {
        start: startOfYear(today),
        end: endOfYear(today),
      }
    default:
      return {
        start: today,
        end: today,
      }
  }
}

/**
 * Add days to date
 */
export function addDaysToDate(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return addDays(dateObj, days)
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateString: string): Date | null {
  try {
    const parsed = parseISO(dateString)
    return isValid(parsed) ? parsed : null
  } catch (error) {
    return null
  }
}
