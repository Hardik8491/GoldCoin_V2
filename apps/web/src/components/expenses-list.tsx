"use client"

import { Card } from "@/components/ui/card"
import { Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Expense {
  id: number
  description: string
  category: string
  amount: number
  date: string
  recurring: boolean
}

interface ExpensesListProps {
  expenses: Expense[]
}

export function ExpensesList({ expenses }: ExpensesListProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Food & Drink": "bg-chart-1/10 text-chart-1",
      Transportation: "bg-chart-2/10 text-chart-2",
      Entertainment: "bg-chart-3/10 text-chart-3",
      Health: "bg-chart-4/10 text-chart-4",
      Shopping: "bg-chart-5/10 text-chart-5",
    }
    return colors[category] || "bg-primary/10 text-primary"
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Expenses</h3>
      <div className="space-y-3">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-foreground">{expense.description}</p>
              <div className="flex gap-2 mt-2">
                <span className={`text-xs px-2 py-1 rounded font-medium ${getCategoryColor(expense.category)}`}>
                  {expense.category}
                </span>
                <span className="text-xs text-muted-foreground">{expense.date}</span>
                {expense.recurring && (
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded font-medium">Recurring</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-semibold text-foreground text-lg">${expense.amount.toFixed(2)}</p>
              <Button variant="ghost" size="sm">
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
