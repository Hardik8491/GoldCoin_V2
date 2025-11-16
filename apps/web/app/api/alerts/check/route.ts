import { type NextRequest, NextResponse } from "next/server"

interface Expense {
  amount: number
  category: string
  date: string
}

interface BudgetAlert {
  type: "category_limit" | "total_limit" | "anomaly"
  severity: "info" | "warning" | "critical"
  message: string
  category?: string
  currentSpending: number
  limit: number
}

export async function POST(request: NextRequest) {
  try {
    const { expenses, budgets, userSettings } = await request.json()

    const alerts: BudgetAlert[] = []
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Filter current month expenses
    const monthExpenses = expenses.filter((e: Expense) => {
      const date = new Date(e.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    // Check category budgets
    const categorySpending: { [key: string]: number } = {}
    monthExpenses.forEach((e: Expense) => {
      categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount
    })

    // Default budgets if not provided
    const defaultBudgets = {
      Groceries: 400,
      Dining: 200,
      Transportation: 300,
      Entertainment: 100,
      Utilities: 150,
      Shopping: 200,
      Healthcare: 100,
    }

    const categoryBudgets = budgets || defaultBudgets

    // Check each category
    Object.entries(categorySpending).forEach(([category, spent]) => {
      const limit = categoryBudgets[category] || 200
      const percentage = (spent / limit) * 100

      if (percentage > 100) {
        alerts.push({
          type: "category_limit",
          severity: "critical",
          message: `${category} spending exceeded by $${(spent - limit).toFixed(2)}`,
          category,
          currentSpending: spent,
          limit,
        })
      } else if (percentage > 80) {
        alerts.push({
          type: "category_limit",
          severity: "warning",
          message: `${category} at ${percentage.toFixed(0)}% of budget`,
          category,
          currentSpending: spent,
          limit,
        })
      }
    })

    // Check total monthly spending
    const totalSpent = monthExpenses.reduce((sum: number, e: Expense) => sum + e.amount, 0)
    const monthlyBudget = 1500

    if (totalSpent > monthlyBudget * 1.1) {
      alerts.push({
        type: "total_limit",
        severity: "critical",
        message: `Monthly spending is ${((totalSpent / monthlyBudget) * 100).toFixed(0)}% of budget`,
        currentSpending: totalSpent,
        limit: monthlyBudget,
      })
    }

    // Detect anomalies (unusually high single transaction)
    if (monthExpenses.length > 1) {
      const avg = totalSpent / monthExpenses.length
      const anomalies = monthExpenses.filter((e: Expense) => e.amount > avg * 3)

      anomalies.forEach((e: Expense) => {
        alerts.push({
          type: "anomaly",
          severity: "info",
          message: `Unusual transaction: $${e.amount.toFixed(2)} on ${e.category}`,
          category: e.category,
          currentSpending: e.amount,
          limit: avg,
        })
      })
    }

    return NextResponse.json({
      alerts,
      totalAlerts: alerts.length,
      criticalCount: alerts.filter((a) => a.severity === "critical").length,
      warningCount: alerts.filter((a) => a.severity === "warning").length,
    })
  } catch (error) {
    console.error("Alert check error:", error)
    return NextResponse.json({ message: "Alert check failed" }, { status: 500 })
  }
}
