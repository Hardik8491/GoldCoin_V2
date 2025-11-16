/**
 * Hook to sync theme with user preferences
 */

import { useEffect } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { useTheme } from '@/providers/theme-provider'
import { StorageService } from '@/services'

export function useThemeSync() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (user?.theme && user.theme !== theme) {
      setTheme(user.theme as 'light' | 'dark' | 'system')
      StorageService.setTheme(user.theme)
    }
  }, [user?.theme, theme, setTheme])
}

