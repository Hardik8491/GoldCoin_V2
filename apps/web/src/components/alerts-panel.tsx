"use client"

import { useEffect, useState } from "react"
import { AlertCircle, AlertTriangle, AlertOctagon, X } from "lucide-react"
import { useStore } from "@/store/use-store"

interface Alert {
  type: "category_limit" | "total_limit" | "anomaly"
  severity: "info" | "warning" | "critical"
  message: string
  category?: string
  currentSpending: number
  limit: number
}

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState<string[]>([])
  const { expenses } = useStore()

  useEffect(() => {
    const checkAlerts = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/alerts/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expenses }),
        })
        const data = await res.json()
        setAlerts(data.alerts)
      } catch (error) {
        console.error("Failed to load alerts:", error)
      } finally {
        setLoading(false)
      }
    }

    if (expenses.length > 0) {
      checkAlerts()
    }
  }, [expenses])

  const visibleAlerts = alerts.filter((_, i) => !dismissed.includes(i.toString()))

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/10 border-destructive/20 text-destructive"
      case "warning":
        return "bg-accent/10 border-accent/20 text-accent"
      default:
        return "bg-primary/10 border-primary/20 text-primary"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertOctagon className="w-5 h-5" />
      case "warning":
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  if (visibleAlerts.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {visibleAlerts.map((alert, i) => (
        <div
          key={i}
          className={`border rounded-lg p-4 flex items-start justify-between ${getSeverityColor(alert.severity)}`}
        >
          <div className="flex items-start gap-3">
            {getSeverityIcon(alert.severity)}
            <div>
              <p className="font-medium">{alert.message}</p>
              {alert.category && (
                <p className="text-xs opacity-75 mt-1">
                  Current: ${alert.currentSpending.toFixed(2)} / Limit: ${alert.limit.toFixed(2)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setDismissed([...dismissed, i.toString()])}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
