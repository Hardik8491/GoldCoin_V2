"use client"

import { create } from "zustand"

interface Expense {
  id: number
  description: string
  amount: number
  category: string
  date: string
  recurring: boolean
}

interface StoreState {
  expenses: Expense[]
  addExpense: (expense: Omit<Expense, "id">) => void
  removeExpense: (id: number) => void
  updateExpense: (id: number, expense: Partial<Expense>) => void
}

export const useStore = create<StoreState>((set) => ({
  expenses: [
    {
      id: 1,
      description: "Coffee at Starbucks",
      category: "Food & Drink",
      amount: 5.99,
      date: "2025-01-13",
      recurring: false,
    },
    {
      id: 2,
      description: "Monthly Gym Membership",
      category: "Health",
      amount: 49.99,
      date: "2025-01-01",
      recurring: true,
    },
    { id: 3, description: "Gas", category: "Transportation", amount: 45.0, date: "2025-01-12", recurring: false },
    { id: 4, description: "Groceries", category: "Food & Drink", amount: 120.5, date: "2025-01-11", recurring: false },
    {
      id: 5,
      description: "Netflix Subscription",
      category: "Entertainment",
      amount: 15.99,
      date: "2025-01-01",
      recurring: true,
    },
  ],

  addExpense: (expense) =>
    set((state) => ({
      expenses: [...state.expenses, { ...expense, id: Math.max(...state.expenses.map((e) => e.id), 0) + 1 }],
    })),

  removeExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    })),

  updateExpense: (id, updates) =>
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),
}))
