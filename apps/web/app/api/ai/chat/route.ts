import { type NextRequest, NextResponse } from "next/server"

interface Message {
  role: "user" | "assistant"
  content: string
}

function generateFinancialAdvice(userMessage: string, expenses: any[] = []): string {
  const lower = userMessage.toLowerCase()

  // Budget advice
  if (lower.includes("budget") || lower.includes("save") || lower.includes("spending")) {
    if (expenses.length > 0) {
      const avgSpending = expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length
      return `Based on your spending patterns, your average transaction is $${avgSpending.toFixed(2)}. I recommend the 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings. Try to identify discretionary spending to cut back on.`
    }
    return "A good budgeting strategy is the 50/30/20 rule: allocate 50% of your income to needs, 30% to wants, and 20% to savings. Start tracking where your money goes."
  }

  // Category-specific advice
  if (lower.includes("dining") || lower.includes("restaurant") || lower.includes("food")) {
    return "I notice you might be spending on dining. Try meal prepping to save money. Even reducing restaurant visits by 2-3 per week can save hundreds monthly."
  }

  if (lower.includes("entertainment") || lower.includes("subscription")) {
    return "Review your subscriptions regularly. Cancel unused services like streaming platforms or gym memberships. This can free up $50-100+ monthly."
  }

  if (lower.includes("transportation") || lower.includes("gas") || lower.includes("car")) {
    return "Consider carpooling or public transit to reduce transportation costs. If you drive frequently, track maintenance costs to plan ahead."
  }

  // General recommendations
  if (lower.includes("recommend") || lower.includes("advice") || lower.includes("help")) {
    return "Here are my top recommendations: 1) Track every expense for at least a month, 2) Set category-wise budgets, 3) Review spending weekly, 4) Automate savings, 5) Identify and reduce unnecessary subscriptions."
  }

  // Default response
  return "I'm your AI Finance Advisor. I can help you analyze spending patterns, set budgets, and provide personalized recommendations. Ask me about your spending categories, budget tips, or financial goals!"
}

export async function POST(request: NextRequest) {
  try {
    const { messages, expenses } = await request.json()

    if (!messages || messages.length === 0) {
      return NextResponse.json({ message: "No messages provided" }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    const advisorResponse = generateFinancialAdvice(lastMessage.content, expenses)

    return NextResponse.json({
      role: "assistant",
      content: advisorResponse,
    })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ message: "Chat failed" }, { status: 500 })
  }
}
