/**
 * Step 5: Financial Goals (Optional)
 * User-defined financial goals
 */

'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Goal } from '@/types'

const goalsSchema = z.object({
  goals: z.array(
    z.object({
      title: z.string().min(1, 'Goal title is required'),
      targetAmount: z
        .number()
        .min(0.01, 'Target amount must be greater than 0')
        .or(z.string().transform((val) => parseFloat(val) || 0)),
      targetDate: z.string().min(1, 'Target date is required'),
    })
  ),
})

interface StepGoalsProps {
  initialData?: Goal[]
  onNext: (data: Goal[]) => void
  onBack: () => void
}

export function StepGoals({ initialData, onNext, onBack }: StepGoalsProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<{ goals: Goal[] }>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      goals: initialData || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'goals',
  })

  const onSubmit = (data: { goals: Goal[] }) => {
    const processedData: Goal[] = data.goals.map((goal) => {
      // Convert date string to ISO datetime string
      let targetDate = goal.targetDate
      if (targetDate && !targetDate.includes('T')) {
        // If it's just a date (YYYY-MM-DD), convert to ISO datetime
        targetDate = new Date(targetDate + 'T00:00:00').toISOString()
      }
      
      return {
        ...goal,
        targetAmount: typeof goal.targetAmount === 'string' ? parseFloat(goal.targetAmount) || 0 : goal.targetAmount,
        targetDate,
      }
    })
    onNext(processedData)
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Financial Goals (Optional)</CardTitle>
        <CardDescription>
          Set financial goals to track your progress and stay motivated
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Your Goals</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  title: '',
                  targetAmount: 0,
                  targetDate: today,
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>

          {fields.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <p className="text-sm text-muted-foreground">
                No goals added. You can skip this step or add goals later.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    title: '',
                    targetAmount: 0,
                    targetDate: today,
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Goal
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Goal {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`goal-title-${index}`}>Goal Title</Label>
                  <Input
                    id={`goal-title-${index}`}
                    placeholder="e.g., Save ₹50,000 in 6 months"
                    {...register(`goals.${index}.title`)}
                    aria-invalid={
                      errors.goals?.[index]?.title ? 'true' : 'false'
                    }
                  />
                  {errors.goals?.[index]?.title && (
                    <p className="text-xs text-destructive">
                      {errors.goals[index]?.title?.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor={`goal-amount-${index}`}>Target Amount</Label>
                    <Input
                      id={`goal-amount-${index}`}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register(`goals.${index}.targetAmount`, {
                        valueAsNumber: true,
                      })}
                      aria-invalid={
                        errors.goals?.[index]?.targetAmount ? 'true' : 'false'
                      }
                    />
                    {errors.goals?.[index]?.targetAmount && (
                      <p className="text-xs text-destructive">
                        {errors.goals[index]?.targetAmount?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`goal-date-${index}`}>Target Date</Label>
                    <Input
                      id={`goal-date-${index}`}
                      type="date"
                      min={today}
                      {...register(`goals.${index}.targetDate`)}
                      aria-invalid={
                        errors.goals?.[index]?.targetDate ? 'true' : 'false'
                      }
                    />
                    {errors.goals?.[index]?.targetDate && (
                      <p className="text-xs text-destructive">
                        {errors.goals[index]?.targetDate?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {fields.length === 0 ? 'Skip' : 'Next'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

