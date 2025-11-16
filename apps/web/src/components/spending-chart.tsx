"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function SpendingChart() {
  const data = [
    { month: "Jan", spent: 450, budget: 500 },
    { month: "Feb", spent: 520, budget: 500 },
    { month: "Mar", spent: 480, budget: 500 },
    { month: "Apr", spent: 420, budget: 500 },
    { month: "May", spent: 490, budget: 500 },
    { month: "Jun", spent: 440, budget: 500 },
  ]

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Monthly Spending vs Budget</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            formatter={(value) => `$${value}`}
          />
          <Legend />
          <Bar dataKey="spent" fill="var(--primary)" name="Spent" />
          <Bar dataKey="budget" fill="var(--muted)" name="Budget" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
