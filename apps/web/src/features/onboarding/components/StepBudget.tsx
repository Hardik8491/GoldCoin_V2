/**
 * Step 4: Budget Setup
 * Category-wise budget limits
 */

'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Trash2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EXPENSE_CATEGORIES } from '@/config/constants'
import type { CategoryBudget } from '@/types'

const budgetSchema = z.object({
  budgets: z.array(
    z.object({
      category: z.string().min(1, 'Category is required'),
      limit: z
        .number()
        .min(0.01, 'Limit must be greater than 0')
        .or(z.string().transform((val) => parseFloat(val) || 0)),
    })
  ),
})

interface StepBudgetProps {
  initialData?: CategoryBudget[]
  onNext: (data: CategoryBudget[]) => void
  onBack: () => void
}

export function StepBudget({
  initialData,
  onNext,
  onBack,
}: StepBudgetProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<{ budgets: CategoryBudget[] }>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      budgets: initialData || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'budgets',
  })

  const budgets = watch('budgets')
  const usedCategories = budgets.map((b) => b.category)

  const availableCategories = EXPENSE_CATEGORIES.filter(
    (cat) => !usedCategories.includes(cat.value)
  )

  const handleAISuggest = () => {
    // Simple AI suggestion: allocate 30% of income to each category
    // In production, this would call an AI service
    const suggestedBudgets: CategoryBudget[] = EXPENSE_CATEGORIES.slice(0, 4).map(
      (cat) => ({
        category: cat.value,
        limit: 1000, // Placeholder - would calculate based on income
      })
    )
    suggestedBudgets.forEach((budget) => {
      append(budget)
    })
  }

  const onSubmit = (data: { budgets: CategoryBudget[] }) => {
    const processedData: CategoryBudget[] = data.budgets.map((budget) => ({
      ...budget,
      limit: typeof budget.limit === 'string' ? parseFloat(budget.limit) || 0 : budget.limit,
    }))
    onNext(processedData)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Budget Setup</CardTitle>
        <CardDescription>
          Set spending limits for different categories to track your expenses
          effectively
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Budget Categories</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAISuggest}
                disabled={availableCategories.length === 0}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Suggest
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (availableCategories.length > 0) {
                    append({
                      category: availableCategories[0].value,
                      limit: 0,
                    })
                  }
                }}
                disabled={availableCategories.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>

          {fields.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <p className="text-sm text-muted-foreground">
                No budget categories added yet.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (availableCategories.length > 0) {
                    append({
                      category: availableCategories[0].value,
                      limit: 0,
                    })
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Budget
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => {
              const categoryValue = watch(`budgets.${index}.category`)
              const category = EXPENSE_CATEGORIES.find(
                (cat) => cat.value === categoryValue
              )

              return (
                <div
                  key={field.id}
                  className="flex gap-2 items-start p-4 border rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <Select
                        value={categoryValue}
                        onValueChange={(value) =>
                          setValue(`budgets.${index}.category`, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map((cat) => (
                            <SelectItem
                              key={cat.value}
                              value={cat.value}
                              disabled={usedCategories.includes(cat.value) && cat.value !== categoryValue}
                            >
                              <span className="flex items-center gap-2">
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.budgets?.[index]?.category && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.budgets[index]?.category?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Limit amount"
                        {...register(`budgets.${index}.limit`, {
                          valueAsNumber: true,
                        })}
                        aria-invalid={
                          errors.budgets?.[index]?.limit ? 'true' : 'false'
                        }
                      />
                      {errors.budgets?.[index]?.limit && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.budgets[index]?.limit?.message}
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
              )
            })}
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting || fields.length === 0}>
              Next
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

