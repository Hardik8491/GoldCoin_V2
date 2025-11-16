import { type NextRequest, NextResponse } from "next/server"

// Mock Plaid-like transaction import
interface PlaidTransaction {
  id: string
  name: string
  amount: number
  date: string
  merchant_name?: string
}

function mapPlaidToExpense(transaction: PlaidTransaction) {
  const description = transaction.merchant_name || transaction.name

  // Simple categorization based on merchant
  const categories: { [key: string]: string } = {
    grocery: "Groceries",
    restaurant: "Dining",
    gas: "Transportation",
    fuel: "Transportation",
    uber: "Transportation",
    lyft: "Transportation",
    netflix: "Entertainment",
    spotify: "Entertainment",
    amazon: "Shopping",
    walmart: "Shopping",
    "whole foods": "Groceries",
    "trader joe": "Groceries",
  }

  let category = "Other"
  const lower = description.toLowerCase()

  for (const [keyword, cat] of Object.entries(categories)) {
    if (lower.includes(keyword)) {
      category = cat
      break
    }
  }

  return {
    id: transaction.id,
    amount: Math.abs(transaction.amount),
    category,
    description,
    date: transaction.date,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { transactions, source } = await request.json()

    if (!Array.isArray(transactions)) {
      return NextResponse.json({ message: "Invalid transactions format" }, { status: 400 })
    }

    // Map and filter out positive amounts (deposits)
    const expenses = transactions.filter((t) => t.amount > 0).map(mapPlaidToExpense)

    return NextResponse.json({
      imported: expenses.length,
      expenses,
    })
  } catch (error) {
    return NextResponse.json({ message: "Import failed" }, { status: 500 })
  }
}
