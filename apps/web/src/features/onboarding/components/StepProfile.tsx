/**
 * Step 2: Profile Setup
 * User name, currency, and theme preferences
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { CURRENCIES } from '@/config/constants'
import type { ProfileSetup } from '@/types'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  currency: z.string().min(1, 'Please select a currency'),
  theme: z.string().optional(),
})

interface StepProfileProps {
  initialData?: ProfileSetup | null
  onNext: (data: ProfileSetup) => void
  onBack: () => void
}

export function StepProfile({ initialData, onNext, onBack }: StepProfileProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileSetup>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData || {
      name: '',
      currency: 'USD',
      theme: 'system',
    },
  })

  const currency = watch('currency')

  const onSubmit = (data: ProfileSetup) => {
    onNext(data)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Profile Setup</CardTitle>
        <CardDescription>
          Tell us a bit about yourself to personalize your experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register('name')}
              aria-invalid={errors.name ? 'true' : 'false'}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency Preference</Label>
            <Select
              value={currency}
              onValueChange={(value) => setValue('currency', value)}
            >
              <SelectTrigger id="currency" className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.currency && (
              <p className="text-sm text-destructive">{errors.currency.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Theme Preference (Optional)</Label>
            <Select
              defaultValue={watch('theme') || 'system'}
              onValueChange={(value) => setValue('theme', value)}
            >
              <SelectTrigger id="theme" className="w-full">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
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

