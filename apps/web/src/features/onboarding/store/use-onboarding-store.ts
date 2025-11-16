/**
 * Onboarding Store
 * Zustand store for managing onboarding state
 */

'use client'

import { create } from 'zustand'
import type {
  ProfileSetup,
  FinancialSetup,
  CategoryBudget,
  Goal,
} from '@/types'

interface OnboardingStore {
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

const initialState = {
  step: 1,
  profile: null,
  financialSetup: null,
  budgets: [],
  goals: [],
}

// Try to use persist if available, otherwise use regular store
let useOnboardingStoreImpl: typeof create<OnboardingStore>

try {
  // Try to import persist middleware
  const { persist } = require('zustand/middleware')
  useOnboardingStoreImpl = create<OnboardingStore>()(
    persist(
      (set) => ({
        ...initialState,
        setStep: (step) => set({ step }),
        setProfile: (data) => set({ profile: data }),
        setFinancialSetup: (data) => set({ financialSetup: data }),
        setBudgets: (data) => set({ budgets: data }),
        setGoals: (data) => set({ goals: data }),
        reset: () => set(initialState),
      }),
      {
        name: 'onboarding-storage',
      }
    )
  )
} catch {
  // Fallback to regular store if persist is not available
  useOnboardingStoreImpl = create<OnboardingStore>((set) => ({
    ...initialState,
    setStep: (step) => set({ step }),
    setProfile: (data) => set({ profile: data }),
    setFinancialSetup: (data) => set({ financialSetup: data }),
    setBudgets: (data) => set({ budgets: data }),
    setGoals: (data) => set({ goals: data }),
    reset: () => set(initialState),
  }))
}

export const useOnboardingStore = useOnboardingStoreImpl

