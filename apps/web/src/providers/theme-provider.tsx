/**
 * Theme Provider
 * Manages theme state (light/dark/system)
 */

'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { StorageService } from '@/services'
import { THEME_CONFIG } from '@/config/constants'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = THEME_CONFIG.STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  /**
   * Initialize theme from storage or default
   */
  useEffect(() => {
    const stored = StorageService.getTheme() as Theme
    if (stored) {
      setThemeState(stored)
    } else if (defaultTheme) {
      setThemeState(defaultTheme)
    }
  }, [defaultTheme])

  /**
   * Update actual theme based on system preference
   */
  useEffect(() => {
    const updateActualTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        setActualTheme(systemTheme)
      } else {
        setActualTheme(theme)
      }
    }

    updateActualTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => updateActualTheme()
    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  /**
   * Apply theme to document
   */
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(actualTheme)
  }, [actualTheme])

  /**
   * Set theme and persist to storage
   */
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    StorageService.setTheme(newTheme)
  }

  const value: ThemeContextType = {
    theme,
    setTheme,
    actualTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * Hook to use theme context
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
