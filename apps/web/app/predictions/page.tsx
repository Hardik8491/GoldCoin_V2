"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { OnboardingGuard } from "@/providers/onboarding-guard"
import { predictionService } from "@/services/prediction.service"
import { analyticsService } from "@/services/analytics.service"
import { useAuth } from "@/providers/auth-provider"
import { toast } from "@/hooks/use-toast"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp } from "lucide-react"
import type { SpendingPrediction } from "@/types"

export default function PredictionsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [predictions, setPredictions] = useState<SpendingPrediction[]>([])
  const [categories, setCategories] = useState<any>(null)

  useEffect(() => {
    loadPredictions()
    loadCategoryData()
  }, [])

  const loadPredictions = async () => {
    try {
      setLoading(true)
      const response = await predictionService.getPredictions()
      if (response.success && response.data) {
        const data = response.data.items || response.data
        setPredictions(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Failed to load predictions:", error)
      toast({
        title: "Error",
        description: "Failed to load predictions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCategoryData = async () => {
    try {
      const response = await analyticsService.getCategories()
      if (response.success && response.data) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error("Failed to load category data:", error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: user?.currency || "USD",
    }).format(amount)
  }

  // Transform predictions data for charts
  const spendingPredictions = predictions.map((pred) => ({
    month: pred.month || new Date().toISOString().slice(0, 7),
    predicted: pred.predicted_amount || 0,
    confidence: pred.confidence_score ? Math.round(pred.confidence_score * 100) : 0,
  }))

  // Group predictions by category
  const categoryPredictionsMap = new Map<string, { predicted: number; confidence: number }>()
  predictions.forEach((pred) => {
    const category = pred.category || "other"
    const existing = categoryPredictionsMap.get(category) || { predicted: 0, confidence: 0 }
    categoryPredictionsMap.set(category, {
      predicted: existing.predicted + (pred.predicted_amount || 0),
      confidence: Math.max(existing.confidence, pred.confidence_score ? Math.round(pred.confidence_score * 100) : 0),
    })
  })

  // Get current category spending for comparison
  const categoryPredictions = Array.from(categoryPredictionsMap.entries()).map(([category, data]) => {
    const current = categories?.categories.find((c: any) => c.category === category)
    const currentAmount = current?.total || 0
    const predictedAmount = data.predicted
    const change = currentAmount > 0 ? ((predictedAmount - currentAmount) / currentAmount) * 100 : 0

    return {
      category,
      current: currentAmount,
      predicted: predictedAmount,
      change: Math.round(change),
      confidence: data.confidence,
    }
  })

  if (loading) {
    return (
      <OnboardingGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-64">
            <p className="text-muted-foreground">Loading predictions...</p>
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
          <h1 className="text-3xl font-bold text-foreground">Spending Predictions</h1>
          <p className="text-muted-foreground">AI-powered forecasts of your future spending patterns</p>
        </div>

        {/* Overall Spending Prediction */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Spending Trend
          </h2>
          {spendingPredictions.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No prediction data available. Add more expenses to generate predictions.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={spendingPredictions}>
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="var(--chart-2)"
                  name="Predicted Spending"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          {spendingPredictions.length > 0 && (
            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-foreground">
                📈 <strong>Prediction:</strong> Based on your spending patterns, next month's predicted spending is{" "}
                {formatCurrency(spendingPredictions[spendingPredictions.length - 1]?.predicted || 0)} with{" "}
                {spendingPredictions[spendingPredictions.length - 1]?.confidence || 0}% confidence.
              </p>
            </div>
          )}
        </Card>

        {/* Category Predictions */}
        {categoryPredictions.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Category-wise Predictions</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryPredictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="category" stroke="var(--muted-foreground)" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="current" fill="var(--primary)" name="Current Monthly" />
                <Bar dataKey="predicted" fill="var(--chart-2)" name="Predicted Monthly" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Detailed Predictions */}
        <div className="grid lg:grid-cols-2 gap-6">
          {categoryPredictions.map((pred) => (
            <Card key={pred.category} className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-foreground">{pred.category}</h3>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded ${
                    pred.change > 10 ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
                  }`}
                >
                  {pred.change > 0 ? "+" : ""}
                  {pred.change}%
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Monthly:</span>
                  <span className="font-medium text-foreground">{formatCurrency(pred.current)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Predicted Monthly:</span>
                  <span className="font-medium text-foreground">{formatCurrency(pred.predicted)}</span>
                </div>
                {pred.confidence && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="font-medium text-foreground">{pred.confidence}%</span>
                  </div>
                )}
                <div className="w-full bg-muted rounded-full h-2 mt-3">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${(pred.predicted / (pred.predicted * 1.2)) * 100}%` }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Insights */}
        {categoryPredictions.length > 0 && (
          <Card className="p-6 bg-accent/5 border border-accent/20">
            <h3 className="font-semibold text-foreground mb-3">🎯 AI Insights</h3>
            <ul className="space-y-2 text-sm text-foreground">
              {categoryPredictions
                .filter((pred) => pred.change > 10)
                .map((pred) => (
                  <li key={pred.category}>
                    • Your {pred.category} spending is predicted to increase by {pred.change}%. Consider setting alerts.
                  </li>
                ))}
              {categoryPredictions.length === 0 && (
                <li>• Add more expenses to generate AI-powered insights and predictions.</li>
              )}
            </ul>
          </Card>
        )}
        </div>
      </DashboardLayout>
    </OnboardingGuard>
  )
}
