"use client"

import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  trend?: number
  icon?: LucideIcon
  percentage?: number
}

export function StatCard({ title, value, trend, icon: Icon, percentage }: StatCardProps) {
  const isPositive = (trend ?? 0) >= 0

  return (
    <Card className="p-6 ">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend !== undefined && (
            <p className={`text-xs mt-2 font-medium ${isPositive ? "text-black/45" : "text-destructive"}`}>
              {isPositive ? "↑" : "↓"} {Math.abs(trend)}% vs last month
            </p>
          )}
          {percentage !== undefined && (
            <div className="mt-2 w-full bg-muted rounded-full h-2">
              <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${percentage}%` }} />
            </div>
          )}
        </div>
        {Icon && <Icon className="h-8 w-8 text-primary" />}
      </div>
    </Card>
  )
}
