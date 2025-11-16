"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ExpenseForm } from "@/components/expense-form"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Edit2, Download } from "lucide-react"
import { expenseService } from "@/services/expense.service"
import type { Expense, ExpenseCreate, ExpenseUpdate, ExpenseCategory } from "@/types"

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  console.log(expenses)
  const [loading, setLoading] = useState(true)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  // Fetch expenses on component mount
  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const response = await expenseService.getExpenses()
      console.log(response)
      if (response?.success && response?.data) {
        setExpenses(response?.data || [])
      }
    } catch (error) {
      console.error("Failed to load expenses:", error)
      // You might want to show a toast notification here
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return
    
    try {
      const response = await expenseService.deleteExpense(id)
      if (response.success) {
        setExpenses(expenses.filter((e) => e.id !== id))
        // Show success toast
      }
    } catch (error) {
      console.error("Failed to delete expense:", error)
      // Show error toast
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
  }

  const handleFormSubmit = async (expenseData: ExpenseCreate | ExpenseUpdate) => {
    try {
      if (editingExpense) {
        // Update existing expense
        const response = await expenseService.updateExpense(editingExpense.id, expenseData)
        if (response.success && response.data) {
          setExpenses(expenses.map(exp => exp.id === editingExpense.id ? response.data! : exp))
          setEditingExpense(null)
        }
      } else {
        // Create new expense
        const response = await expenseService.createExpense(expenseData as ExpenseCreate)
        if (response.success && response.data) {
          setExpenses([response.data, ...expenses])
        }
      }
      // Show success toast
    } catch (error) {
      console.error("Failed to save expense:", error)
      // Show error toast
    }
  }

  const handleFormCancel = () => {
    setEditingExpense(null)
  }

  const handleExport = async () => {
    try {
      const success = await expenseService.exportExpenses('csv')
      if (success) {
        // Show success toast
      }
    } catch (error) {
      console.error("Failed to export expenses:", error)
      // Show error toast
    }
  }

  // Calculate category summaries
  const categories = Array.from(new Set(expenses.map((e) => e.category)))
  const categoryTotals = categories.map((cat) => ({
    category: cat,
    total: expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
    count: expenses.filter((e) => e.category === cat).length,
  }))

  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg text-muted-foreground">Loading expenses...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground">Manage and track all your expenses</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}

          <div className="lg:col-span-1">
            <ExpenseForm 
              expense={editingExpense || undefined}
              onSubmit={handleFormSubmit}
              onCancel={editingExpense ? handleFormCancel : undefined}
            />
          </div>

          {/* Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Summary */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Category Summary</h2>
              {categoryTotals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No expenses yet. Add your first expense to see the summary.
                </div>
              ) : (
                <div className="space-y-3">
                  {categoryTotals.map((cat) => (
                    <div key={cat.category} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{cat.category}</p>
                        <p className="text-sm text-muted-foreground">{cat.count} transaction{cat.count !== 1 ? 's' : ''}</p>
                      </div>
                      <p className="font-semibold text-foreground">${cat.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Expenses List */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Recent Expenses {expenses.length > 0 && `(${expenses.length})`}
                </h2>
                {expenses.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                )}
              </div>
              
              {sortedExpenses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No expenses recorded yet.</p>
                  <p className="text-sm">Add your first expense using the form on the left.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex justify-between items-center p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{expense.description}</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {expense.category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                          {expense.recurring && (
                            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">Recurring</span>
                          )}
                          {expense.tags && expense.tags.map((tag) => (
                            <span key={tag} className="text-xs bg-secondary/10 text-secondary-foreground px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">${expense.amount.toFixed(2)}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(expense)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}