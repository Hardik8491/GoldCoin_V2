"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Zap } from "lucide-react"

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

export default function PredictionCard({ expenses }: DashboardContentProps) {
  const [prediction, setPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/ai/predict-spending", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expenses }),
        })
        const data = await res.json()
        setPrediction(data)
      } catch (error) {
        console.error("Failed to load prediction:", error)
      } finally {
        setLoading(false)
      }
    }

    if (expenses.length > 0) {
      fetchPrediction()
    }
  }, [expenses])

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Next Month Prediction</h3>
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Analyzing patterns...</span>
          </div>
        ) : prediction ? (
          <>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Predicted Spending</p>
              <p className="text-4xl font-bold text-black/75">${prediction.totalPrediction.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${prediction.trend > 1 ? "text-destructive" : "text-accent"}`} />
              <span className={`text-sm ${prediction.trend > 1 ? "text-destructive" : "text-accent"}`}>
                {prediction.trend > 1 ? "Trending up" : "Trending down"} ({Math.round((prediction.trend - 1) * 100)}%)
              </span>
            </div>
            <div className="bg-input/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-2">Confidence: {prediction.confidence}%</p>
              <p className="text-xs text-muted-foreground">
                Based on {Object.keys(prediction.byCategory).length} spending categories and historical patterns
              </p>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">Add expenses to see predictions</p>
        )}
      </div>
    </div>
  )
}
