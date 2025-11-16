import { type NextRequest, NextResponse } from "next/server"

interface Expense {
  amount: number
  category: string
  date: string
}

function calculateMovingAverage(expenses: Expense[], windowSize = 7): number {
  if (expenses.length === 0) return 0
  const recent = expenses.slice(-windowSize)
  const sum = recent.reduce((acc, e) => acc + e.amount, 0)
  return sum / recent.length
}

function calculateTrend(expenses: Expense[]): number {
  if (expenses.length < 2) return 1

  const mid = Math.floor(expenses.length / 2)
  const firstHalf = expenses.slice(0, mid).reduce((sum, e) => sum + e.amount, 0) / mid
  const secondHalf = expenses.slice(mid).reduce((sum, e) => sum + e.amount, 0) / (expenses.length - mid)

  return secondHalf / (firstHalf || 1)
}

function predictByCategory(expenses: Expense[], category: string, daysAhead = 30): number {
  const categoryExpenses = expenses.filter((e) => e.category === category)
  if (categoryExpenses.length === 0) return 0

  const movingAvg = calculateMovingAverage(categoryExpenses)
  const trend = calculateTrend(categoryExpenses)

  // Simple linear prediction with trend factor
  const prediction = movingAvg * trend * (daysAhead / 7)
  return Math.max(0, prediction)
}

export async function POST(request: NextRequest) {
  try {
    const { expenses, daysAhead = 30 } = await request.json()

    if (!Array.isArray(expenses) || expenses.length === 0) {
      return NextResponse.json({
        totalPrediction: 0,
        byCategory: {},
        confidence: 0,
      })
    }

    // Calculate overall metrics
    const movingAvg = calculateMovingAverage(expenses)
    const trend = calculateTrend(expenses)
    const totalPrediction = movingAvg * trend * (daysAhead / 7)

    // Predict by category
    const categories = [...new Set(expenses.map((e) => e.category))]
    const byCategory: { [key: string]: number } = {}

    categories.forEach((category) => {
      byCategory[category] = predictByCategory(expenses, category, daysAhead)
    })

    // Calculate confidence (0-100) based on data volume and consistency
    const confidence = Math.min(100, 40 + (expenses.length / 10) * 60)

    return NextResponse.json({
      totalPrediction: Math.round(totalPrediction * 100) / 100,
      byCategory,
      trend: Math.round(trend * 10000) / 10000,
      confidence: Math.round(confidence),
      daysAhead,
    })
  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json({ message: "Prediction failed" }, { status: 500 })
  }
}
