/**
 * Budgets Page
 * Manage and track budgets
 */

'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { OnboardingGuard } from '@/providers/onboarding-guard'
import { DashboardLayout } from '@/components/dashboard-layout'
import { budgetService } from '@/services/budget.service'
import { toast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Progress } from '@/components/ui/progress'
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown } from 'lucide-react'
import { EXPENSE_CATEGORIES } from '@/config/constants'
import type { Budget, BudgetCreate, BudgetStatus } from '@/types'

export default function BudgetsPage() {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [formData, setFormData] = useState<BudgetCreate>({
    category: 'food',
    limit_amount: 0,
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
  })

  useEffect(() => {
    loadBudgets()
    loadBudgetStatus()
  }, [])

  const loadBudgets = async () => {
    try {
      setIsLoading(true)
      const response = await budgetService.getBudgets()
      if (response.success && response.data) {
        setBudgets(response.data.items || response.data as any)
      }
    } catch (error) {
      console.error('Error loading budgets:', error)
      toast({
        title: 'Error',
        description: 'Failed to load budgets',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadBudgetStatus = async () => {
    try {
      const response = await budgetService.getBudgetStatus()
      if (response.success && response.data) {
        setBudgetStatus(response.data)
      }
    } catch (error) {
      console.error('Error loading budget status:', error)
    }
  }

  const handleCreate = async () => {
    try {
      setIsCreating(true)
      const response = await budgetService.createBudget(formData)
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Budget created successfully',
        })
        setShowCreateForm(false)
        setFormData({
          category: 'food',
          limit_amount: 0,
          month: new Date().toISOString().slice(0, 7),
        })
        loadBudgets()
        loadBudgetStatus()
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to create budget',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error creating budget:', error)
      toast({
        title: 'Error',
        description: 'Failed to create budget',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdate = async (id: number) => {
    try {
      setIsCreating(true)
      const response = await budgetService.updateBudget(id, {
        limit_amount: formData.limit_amount,
      })
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Budget updated successfully',
        })
        setEditingId(null)
        setFormData({
          category: 'food',
          limit_amount: 0,
          month: new Date().toISOString().slice(0, 7),
        })
        loadBudgets()
        loadBudgetStatus()
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update budget',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating budget:', error)
      toast({
        title: 'Error',
        description: 'Failed to update budget',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this budget?')) return

    try {
      const response = await budgetService.deleteBudget(id)
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Budget deleted successfully',
        })
        loadBudgets()
        loadBudgetStatus()
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete budget',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting budget:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete budget',
        variant: 'destructive',
      })
    }
  }

  const startEdit = (budget: Budget) => {
    setEditingId(budget.id)
    setFormData({
      category: budget.category,
      limit_amount: budget.limit_amount,
      month: budget.month,
    })
    setShowCreateForm(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(amount)
  }

  const getCategoryLabel = (category: string) => {
    const cat = EXPENSE_CATEGORIES.find((c) => c.value === category)
    return cat?.label || category
  }

  const getStatusForBudget = (budget: Budget) => {
    return budgetStatus.find(
      (status) => status.category === budget.category && status.month === budget.month
    )
  }

  if (isLoading) {
    return (
      <OnboardingGuard>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading budgets...</p>
            </div>
          </div>
        </DashboardLayout>
      </OnboardingGuard>
    )
  }

  return (
    <OnboardingGuard>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Budgets</h1>
            <p className="text-muted-foreground mt-1">
              Manage your spending limits by category
            </p>
          </div>
          <Button
            onClick={() => {
              setShowCreateForm(!showCreateForm)
              setEditingId(null)
              setFormData({
                category: 'food',
                limit_amount: 0,
                month: new Date().toISOString().slice(0, 7),
              })
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showCreateForm ? 'Cancel' : 'Add Budget'}
          </Button>
        </div>

        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Budget' : 'Create New Budget'}</CardTitle>
              <CardDescription>
                Set a spending limit for a category in a specific month
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                    disabled={!!editingId}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <span className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Input
                    id="month"
                    type="month"
                    value={formData.month}
                    onChange={(e) =>
                      setFormData({ ...formData, month: e.target.value })
                    }
                    disabled={!!editingId}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limit">Limit Amount</Label>
                  <Input
                    id="limit"
                    type="number"
                    step="0.01"
                    value={formData.limit_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        limit_amount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingId(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => (editingId ? handleUpdate(editingId) : handleCreate())}
                  disabled={isCreating}
                >
                  {editingId ? 'Update' : 'Create'} Budget
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {budgets.length === 0 && !showCreateForm ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No budgets created yet</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((budget) => {
              const status = getStatusForBudget(budget)
              const spent = status?.spent || 0
              const percentage = (spent / budget.limit_amount) * 100
              const isOverBudget = spent > budget.limit_amount

              return (
                <Card key={budget.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {getCategoryLabel(budget.category)}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(budget)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(budget.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{budget.month}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Spent</span>
                        <span className={isOverBudget ? 'text-destructive font-semibold' : ''}>
                          {formatCurrency(spent)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Limit</span>
                        <span>{formatCurrency(budget.limit_amount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Remaining</span>
                        <span
                          className={
                            budget.limit_amount - spent < 0
                              ? 'text-destructive font-semibold'
                              : 'text-green-600 font-semibold'
                          }
                        >
                          {formatCurrency(budget.limit_amount - spent)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{percentage.toFixed(1)}%</span>
                      </div>
                      <Progress
                        value={Math.min(percentage, 100)}
                        className={isOverBudget ? 'bg-destructive' : ''}
                      />
                    </div>

                    {isOverBudget && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <TrendingUp className="h-4 w-4" />
                        <span>Over budget by {formatCurrency(spent - budget.limit_amount)}</span>
                      </div>
                    )}

                    {!isOverBudget && percentage > 80 && (
                      <div className="flex items-center gap-2 text-sm text-yellow-600">
                        <TrendingDown className="h-4 w-4" />
                        <span>Approaching budget limit</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        </div>
      </DashboardLayout>
    </OnboardingGuard>
  )
}

