/**
 * Onboarding Guard
 * Redirects users who haven't completed onboarding
 */

'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'

interface OnboardingGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function OnboardingGuard({
  children,
  fallback,
}: OnboardingGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !user.is_onboarded) {
      router.push('/onboarding')
    }
  }, [isAuthenticated, isLoading, user, router])

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated && user && !user.is_onboarded) {
    return null
  }

  return <>{children}</>
}

