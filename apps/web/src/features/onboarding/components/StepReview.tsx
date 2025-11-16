/**
 * Step 6: Review & Complete
 * Summary of all onboarding data
 */

'use client'

import { useState } from 'react'
import { Check, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EXPENSE_CATEGORIES, CURRENCIES } from '@/config/constants'
import type { ProfileSetup, FinancialSetup, CategoryBudget, Goal } from '@/types'

interface StepReviewProps {
  profile: ProfileSetup | null
  financialSetup: FinancialSetup | null
  budgets: CategoryBudget[]
  goals: Goal[]
  onBack: () => void
  onComplete: () => Promise<void>
}

export function StepReview({
  profile,
  financialSetup,
  budgets,
  goals,
  onBack,
  onComplete,
}: StepReviewProps) {
  const [isCompleting, setIsCompleting] = useState(false)

  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      await onComplete()
    } finally {
      setIsCompleting(false)
    }
  }

  const getCurrencySymbol = (currencyCode: string) => {
    const currency = CURRENCIES.find((c) => c.value === currencyCode)
    return currency?.symbol || currencyCode
  }

  const getCategoryLabel = (categoryValue: string) => {
    const category = EXPENSE_CATEGORIES.find((c) => c.value === categoryValue)
    return category?.label || categoryValue
  }

  const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
    return `${getCurrencySymbol(currencyCode)}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const totalRecurringExpenses =
    financialSetup?.recurringExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    ) || 0

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0)

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Review Your Setup</h1>
        <p className="text-muted-foreground">
          Please review your information before completing the setup
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Section */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Profile Information</span>
                <Badge variant="outline">Step 2</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{profile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency:</span>
                <span className="font-medium">
                  {CURRENCIES.find((c) => c.value === profile.currency)?.label ||
                    profile.currency}
                </span>
              </div>
              {profile.theme && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Theme:</span>
                  <span className="font-medium capitalize">{profile.theme}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Financial Setup Section */}
        {financialSetup && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Financial Snapshot</span>
                <Badge variant="outline">Step 3</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Savings:</span>
                <span className="font-medium">
                  {formatCurrency(
                    financialSetup.currentSavings,
                    profile?.currency
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Income:</span>
                <span className="font-medium">
                  {formatCurrency(
                    financialSetup.monthlyIncome,
                    profile?.currency
                  )}
                </span>
              </div>
              {financialSetup.recurringExpenses.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>Recurring Expenses:</span>
                    <span>
                      {formatCurrency(
                        totalRecurringExpenses,
                        profile?.currency
                      )}
                    </span>
                  </div>
                  <div className="pl-4 space-y-1">
                    {financialSetup.recurringExpenses.map((exp, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm text-muted-foreground"
                      >
                        <span>{exp.name}</span>
                        <span>
                          {formatCurrency(exp.amount, profile?.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Budgets Section */}
        {budgets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Budget Categories</span>
                <Badge variant="outline">Step 4</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between font-medium mb-2">
                <span>Total Budget:</span>
                <span>
                  {formatCurrency(totalBudget, profile?.currency)}
                </span>
              </div>
              <div className="space-y-2">
                {budgets.map((budget, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between p-2 bg-muted/50 rounded"
                  >
                    <span>{getCategoryLabel(budget.category)}</span>
                    <span className="font-medium">
                      {formatCurrency(budget.limit, profile?.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals Section */}
        {goals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Financial Goals</span>
                <Badge variant="outline">Step 5</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {goals.map((goal, idx) => (
                <div
                  key={idx}
                  className="p-3 border rounded-lg space-y-1"
                >
                  <div className="font-medium">{goal.title}</div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      Target: {formatCurrency(goal.targetAmount, profile?.currency)}
                    </span>
                    <span>
                      By: {new Date(goal.targetDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleComplete}
          disabled={isCompleting}
          size="lg"
          className="min-w-[200px]"
        >
          {isCompleting ? (
            'Completing...'
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Complete Setup
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

