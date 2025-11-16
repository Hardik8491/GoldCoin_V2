/**
 * Onboarding Hook
 * Custom hook for managing onboarding flow logic
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '../store/use-onboarding-store'
import { onboardingService } from '@/services/onboarding.service'
import { useAuth } from '@/providers/auth-provider'
import { toast } from '@/hooks/use-toast'
import type { ProfileSetup, FinancialSetup, CategoryBudget, Goal } from '@/types'

export function useOnboarding() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const {
    step,
    profile,
    financialSetup,
    budgets,
    goals,
    setStep,
    setProfile,
    setFinancialSetup,
    setBudgets,
    setGoals,
    reset,
  } = useOnboardingStore()

  const [isLoading, setIsLoading] = useState(false)

  const handleStepNext = async (
    stepData: ProfileSetup | FinancialSetup | CategoryBudget[] | Goal[]
  ) => {
    try {
      setIsLoading(true)

      // Save data based on current step
      switch (step) {
        case 1:
          // Welcome step - just move to next
          setStep(step + 1)
          return true
        case 2: {
          const profileData = stepData as ProfileSetup
          const response = await onboardingService.saveProfile(profileData)
          if (response.success) {
            setProfile(profileData)
            setStep(step + 1)
          } else {
            toast({
              title: 'Error',
              description: response.error || 'Failed to save profile',
              variant: 'destructive',
            })
            return false
          }
          break
        }
        case 3: {
          const financialData = stepData as FinancialSetup
          const response = await onboardingService.saveFinancialSetup(
            financialData
          )
          if (response.success) {
            setFinancialSetup(financialData)
            setStep(step + 1)
          } else {
            toast({
              title: 'Error',
              description: response.error || 'Failed to save financial setup',
              variant: 'destructive',
            })
            return false
          }
          break
        }
        case 4: {
          const budgetData = stepData as CategoryBudget[]
          const response = await onboardingService.saveBudgets(budgetData)
          if (response.success) {
            setBudgets(budgetData)
            setStep(step + 1)
          } else {
            toast({
              title: 'Error',
              description: response.error || 'Failed to save budgets',
              variant: 'destructive',
            })
            return false
          }
          break
        }
        case 5: {
          const goalsData = stepData as Goal[]
          const response = await onboardingService.saveGoals(goalsData)
          if (response.success) {
            setGoals(goalsData)
            setStep(step + 1)
          } else {
            toast({
              title: 'Error',
              description: response.error || 'Failed to save goals',
              variant: 'destructive',
            })
            return false
          }
          break
        }
        default:
          setStep(step + 1)
      }

      return true
    } catch (error) {
      console.error('Onboarding step error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = async () => {
    try {
      setIsLoading(true)

      // Complete onboarding
      const response = await onboardingService.completeOnboarding()

      if (response.success) {
        // Refresh user data to get updated is_onboarded status
        await refreshUser()

        // Clear onboarding store
        reset()

        toast({
          title: 'Success',
          description: response.message || 'Onboarding completed successfully!',
          variant: 'default',
        })

        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to complete onboarding',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Complete onboarding error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return {
    step,
    profile,
    financialSetup,
    budgets,
    goals,
    isLoading,
    handleStepNext,
    handleComplete,
    handleBack,
  }
}

