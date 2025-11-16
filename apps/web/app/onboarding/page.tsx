/**
 * Onboarding Page
 * Main onboarding flow with step navigation
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { useOnboarding } from '@/features/onboarding/hooks/use-onboarding'
import { StepWelcome } from '@/features/onboarding/components/StepWelcome'
import { StepProfile } from '@/features/onboarding/components/StepProfile'
import { StepFinancial } from '@/features/onboarding/components/StepFinancial'
import { StepBudget } from '@/features/onboarding/components/StepBudget'
import { StepGoals } from '@/features/onboarding/components/StepGoals'
import { StepReview } from '@/features/onboarding/components/StepReview'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'

export default function OnboardingPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const {
    step,
    profile,
    financialSetup,
    budgets,
    goals,
    isLoading,
    handleStepNext,
    handleComplete,
    handleBack,
  } = useOnboarding()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, authLoading, router])

  // Redirect if already onboarded
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.is_onboarded) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, authLoading, user, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const totalSteps = 6
  const progress = (step / totalSteps) * 100

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepWelcome onNext={() => handleStepNext({} as any)} />
      case 2:
        return (
          <StepProfile
            initialData={profile}
            onNext={(data) => handleStepNext(data)}
            onBack={handleBack}
          />
        )
      case 3:
        return (
          <StepFinancial
            initialData={financialSetup}
            onNext={(data) => handleStepNext(data)}
            onBack={handleBack}
          />
        )
      case 4:
        return (
          <StepBudget
            initialData={budgets}
            onNext={(data) => handleStepNext(data)}
            onBack={handleBack}
          />
        )
      case 5:
        return (
          <StepGoals
            initialData={goals}
            onNext={(data) => handleStepNext(data)}
            onBack={handleBack}
          />
        )
      case 6:
        return (
          <StepReview
            profile={profile}
            financialSetup={financialSetup}
            budgets={budgets}
            goals={goals}
            onBack={handleBack}
            onComplete={handleComplete}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Progress Bar */}
        <Card className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Step {step} of {totalSteps}
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </Card>

        {/* Step Content */}
        <div className="min-h-[400px]">{renderStep()}</div>
      </div>
    </div>
  )
}

