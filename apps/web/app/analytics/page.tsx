"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { OnboardingGuard } from "@/providers/onboarding-guard"
import { analyticsService } from "@/services/analytics.service"
import { useAuth } from "@/providers/auth-provider"
import { toast } from "@/hooks/use-toast"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { AnalyticsOverview, AnalyticsTrends, AnalyticsCategories, AnalyticsMonthly } from "@/services/analytics.service"

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
]

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [trends, setTrends] = useState<AnalyticsTrends | null>(null)
  const [categories, setCategories] = useState<AnalyticsCategories | null>(null)
  const [monthly, setMonthly] = useState<AnalyticsMonthly | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const [overviewRes, trendsRes, categoriesRes, monthlyRes] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getTrends(6),
        analyticsService.getCategories(),
        analyticsService.getMonthly(),
      ])

      if (overviewRes.success && overviewRes.data) {
        setOverview(overviewRes.data)
      }
      if (trendsRes.success && trendsRes.data) {
        setTrends(trendsRes.data)
      }
      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data)
      }
      if (monthlyRes.success && monthlyRes.data) {
        setMonthly(monthlyRes.data)
      }
    } catch (error) {
      console.error("Failed to load analytics:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: user?.currency || "USD",
    }).format(amount)
  }

  // Transform data for charts
  const expensesByCategory = categories?.categories.map((cat, idx) => ({
    name: cat.category,
    value: cat.total,
    color: CHART_COLORS[idx % CHART_COLORS.length],
    percentage: cat.percentage,
  })) || []

  const monthlyTrend = trends?.trends.map((trend) => ({
    month: trend.month,
    spending: trend.total,
  })) || []

  const monthlyData = monthly?.months.map((m) => ({
    month: new Date(2024, m.month - 1).toLocaleString("default", { month: "short" }),
    spending: m.total,
  })) || []

  // Calculate stats from real data
  const stats = overview ? [
    {
      label: "Total Expenses",
      value: formatCurrency(overview.expenses.total),
      change: null,
    },
    {
      label: "Average Daily",
      value: formatCurrency(overview.expenses.average),
      change: null,
    },
    {
      label: "Budget Used",
      value: `${overview.budget.percentage_used.toFixed(1)}%`,
      change: overview.budget.percentage_used > 100 ? "Over budget" : "On track",
    },
    {
      label: "Remaining Budget",
      value: formatCurrency(overview.budget.remaining),
      change: overview.budget.remaining < 0 ? "Exceeded" : "Available",
    },
  ] : []

  // Get top category
  const topCategory = categories?.categories[0]
  const highestCategory = topCategory
    ? { label: "Highest Category", value: topCategory.category, amount: formatCurrency(topCategory.total) }
    : null

  const lowestCategory = categories?.categories[categories.categories.length - 1]
  const lowestCat = lowestCategory
    ? { label: "Lowest Category", value: lowestCategory.category, amount: formatCurrency(lowestCategory.total) }
    : null

  if (loading) {
    return (
      <OnboardingGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-64">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </DashboardLayout>
      </OnboardingGuard>
    )
  }

  return (
    <OnboardingGuard>
      <DashboardLayout>
        <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your spending patterns</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="p-4">
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              {stat.change && (
                <p className={`text-xs mt-1 ${stat.change.includes("Over") || stat.change.includes("Exceeded") ? "text-destructive" : "text-green-600"}`}>
                  {stat.change}
                </p>
              )}
            </Card>
          ))}
          {highestCategory && (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">{highestCategory.label}</p>
              <p className="text-2xl font-bold text-foreground">{highestCategory.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{highestCategory.amount}</p>
            </Card>
          )}
          {lowestCat && (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">{lowestCat.label}</p>
              <p className="text-2xl font-bold text-foreground">{lowestCat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{lowestCat.amount}</p>
            </Card>
          )}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Expenses by Category</h2>
            {expensesByCategory.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No category data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Monthly Trend */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Monthly Spending Trend</h2>
            {monthlyTrend.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No trend data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="spending" fill="var(--primary)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Yearly Monthly Breakdown */}
        {monthlyData.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Yearly Monthly Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Line type="monotone" dataKey="spending" stroke="var(--primary)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Insights */}
        {overview && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">📊 Key Insights</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="font-medium text-foreground mb-1">Total Expenses</p>
                <p className="text-sm text-foreground">
                  You've spent {formatCurrency(overview.expenses.total)} with an average of {formatCurrency(overview.expenses.average)} per transaction.
                </p>
              </div>
              {topCategory && (
                <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <p className="font-medium text-foreground mb-1">Top Category</p>
                  <p className="text-sm text-foreground">
                    {topCategory.category} accounts for {topCategory.percentage.toFixed(1)}% of your expenses ({formatCurrency(topCategory.total)}).
                  </p>
                </div>
              )}
              <div className={`p-4 border rounded-lg ${
                overview.budget.percentage_used > 100
                  ? "bg-destructive/10 border-destructive/20"
                  : overview.budget.percentage_used > 80
                  ? "bg-yellow-500/10 border-yellow-500/20"
                  : "bg-green-500/10 border-green-500/20"
              }`}>
                <p className="font-medium text-foreground mb-1">Budget Health</p>
                <p className="text-sm text-foreground">
                  {overview.budget.percentage_used > 100
                    ? `You've exceeded your budget by ${formatCurrency(Math.abs(overview.budget.remaining))}.`
                    : overview.budget.percentage_used > 80
                    ? `You've used ${overview.budget.percentage_used.toFixed(1)}% of your budget. ${formatCurrency(overview.budget.remaining)} remaining.`
                    : `You're on track! ${formatCurrency(overview.budget.remaining)} remaining (${(100 - overview.budget.percentage_used).toFixed(1)}% of budget left).`}
                </p>
              </div>
              {overview.budget.remaining > 0 && (
                <div className="p-4 bg-chart-4/10 border border-chart-4/20 rounded-lg">
                  <p className="font-medium text-foreground mb-1">Savings Opportunity</p>
                  <p className="text-sm text-foreground">
                    You have {formatCurrency(overview.budget.remaining)} remaining in your budget this month.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
        </div>
      </DashboardLayout>
    </OnboardingGuard>
  )
}
