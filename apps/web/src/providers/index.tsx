/**
 * Providers Index
 * Combines all providers for easy import
 */

'use client'

import React, { ReactNode } from 'react'
import { AuthProvider, useAuth } from './auth-provider'
import { ThemeProvider, useTheme } from './theme-provider'

interface AppProvidersProps {
  children: ReactNode
}

/**
 * App Providers
 * Wraps the application with all necessary providers
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <ThemeSyncWrapper>
          {children}
        </ThemeSyncWrapper>
      </AuthProvider>
    </ThemeProvider>
  )
}

// Component to sync theme with user data
function ThemeSyncWrapper({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { setTheme } = useTheme()
  
  React.useEffect(() => {
    if (user?.theme) {
      const { StorageService } = require('@/services')
      setTheme(user.theme as 'light' | 'dark' | 'system')
      StorageService.setTheme(user.theme)
    }
  }, [user?.theme, setTheme])
  
  return <>{children}</>
}

// Re-export individual providers
export { AuthProvider, useAuth, AuthGuard, GuestGuard } from './auth-provider'
export { OnboardingGuard } from './onboarding-guard'
export { ThemeProvider, useTheme } from './theme-provider'
