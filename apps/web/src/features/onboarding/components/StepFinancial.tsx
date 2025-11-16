/**
 * Step 3: Financial Snapshot
 * Current savings, monthly income, and recurring expenses
 */

'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { FinancialSetup, RecurringExpense } from '@/types'

const financialSchema = z.object({
  currentSavings: z
    .number()
    .min(0, 'Savings must be 0 or greater')
    .or(z.string().transform((val) => parseFloat(val) || 0)),
  monthlyIncome: z
    .number()
    .min(0.01, 'Income must be greater than 0')
    .or(z.string().transform((val) => parseFloat(val) || 0)),
  recurringExpenses: z.array(
    z.object({
      name: z.string().min(1, 'Expense name is required'),
      amount: z
        .number()
        .min(0.01, 'Amount must be greater than 0')
        .or(z.string().transform((val) => parseFloat(val) || 0)),
    })
  ),
})

interface StepFinancialProps {
  initialData?: FinancialSetup | null
  onNext: (data: FinancialSetup) => void
  onBack: () => void
}

export function StepFinancial({
  initialData,
  onNext,
  onBack,
}: StepFinancialProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FinancialSetup>({
    resolver: zodResolver(financialSchema),
    defaultValues: initialData || {
      currentSavings: 0,
      monthlyIncome: 0,
      recurringExpenses: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'recurringExpenses',
  })

  const onSubmit = (data: FinancialSetup) => {
    // Ensure amounts are numbers
    const processedData: FinancialSetup = {
      ...data,
      currentSavings: typeof data.currentSavings === 'string' ? parseFloat(data.currentSavings) || 0 : data.currentSavings,
      monthlyIncome: typeof data.monthlyIncome === 'string' ? parseFloat(data.monthlyIncome) || 0 : data.monthlyIncome,
      recurringExpenses: data.recurringExpenses.map((exp) => ({
        ...exp,
        amount: typeof exp.amount === 'string' ? parseFloat(exp.amount) || 0 : exp.amount,
      })),
    }
    onNext(processedData)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Financial Snapshot</CardTitle>
        <CardDescription>
          Provide your current financial situation to help us create accurate
          budgets and predictions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentSavings">Current Savings</Label>
            <Input
              id="currentSavings"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('currentSavings', { valueAsNumber: true })}
              aria-invalid={errors.currentSavings ? 'true' : 'false'}
            />
            {errors.currentSavings && (
              <p className="text-sm text-destructive">
                {errors.currentSavings.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyIncome">Monthly Income</Label>
            <Input
              id="monthlyIncome"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('monthlyIncome', { valueAsNumber: true })}
              aria-invalid={errors.monthlyIncome ? 'true' : 'false'}
            />
            {errors.monthlyIncome && (
              <p className="text-sm text-destructive">
                {errors.monthlyIncome.message}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Recurring Expenses</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: '', amount: 0 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recurring expenses added. Click "Add Expense" to add one.
              </p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-2 items-start p-4 border rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <Input
                        placeholder="Expense name (e.g., Rent)"
                        {...register(`recurringExpenses.${index}.name`)}
                        aria-invalid={
                          errors.recurringExpenses?.[index]?.name ? 'true' : 'false'
                        }
                      />
                      {errors.recurringExpenses?.[index]?.name && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.recurringExpenses[index]?.name?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        {...register(`recurringExpenses.${index}.amount`, {
                          valueAsNumber: true,
                        })}
                        aria-invalid={
                          errors.recurringExpenses?.[index]?.amount
                            ? 'true'
                            : 'false'
                        }
                      />
                      {errors.recurringExpenses?.[index]?.amount && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.recurringExpenses[index]?.amount?.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Next
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

