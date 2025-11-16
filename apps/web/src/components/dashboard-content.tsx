"use client"

import { useMemo } from "react"
import StatCard from "./stat-card"
import SpendingChart from "./spending-chart"
import ExpensesList from "./expenses-list"
import PredictionCard from "./prediction-card"
import AlertsPanel from "./alerts-panel"
import { TrendingUp, AlertCircle, Zap } from "lucide-react"

interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
}

interface DashboardContentProps {
  expenses: Expense[]
}

export default function DashboardContent({ expenses }: DashboardContentProps) {
  const stats = useMemo(() => {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
    const thisMonth = expenses.filter((e) => {
      const date = new Date(e.date)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })
    const monthlyTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0)

    return {
      totalSpent,
      monthlyTotal,
      avgTransaction: expenses.length > 0 ? totalSpent / expenses.length : 0,
      expenseCount: expenses.length,
    }
  }, [expenses])

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-8">
        <AlertsPanel />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Total Spent"
            value={`$${stats.totalSpent.toFixed(2)}`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="bg-primary"
          />
          <StatCard
            label="This Month"
            value={`$${stats.monthlyTotal.toFixed(2)}`}
            icon={<AlertCircle className="w-5 h-5" />}
            color="bg-accent"
          />
          <StatCard
            label="Avg Transaction"
            value={`$${stats.avgTransaction.toFixed(2)}`}
            icon={<Zap className="w-5 h-5" />}
            color="bg-primary"
          />
          <StatCard
            label="Transactions"
            value={stats.expenseCount.toString()}
            icon={<TrendingUp className="w-5 h-5" />}
            color="bg-accent"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <SpendingChart expenses={expenses} />
          </div>
          <PredictionCard expenses={expenses} />
        </div>

        {/* Expenses List */}
        <ExpensesList expenses={expenses.slice(0, 10)} />
      </div>
    </div>
  )
}
