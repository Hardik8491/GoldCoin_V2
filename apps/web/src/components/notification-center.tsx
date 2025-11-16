/**
 * Notification Center Component
 * Real-time notification display with WebSocket support
 */

"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bell, X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/providers/auth-provider"
import { budgetService } from "@/services"

export interface Notification {
  id: string
  type: "success" | "warning" | "error" | "info"
  title: string
  message: string
  timestamp: Date
  read: boolean
  category?: string
  actionUrl?: string
}

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch real-time notifications
  const fetchNotifications = async () => {
    if (!user) return

    try {
      // Check budget status for alerts
      const statusRes = await budgetService.getBudgetStatus()
      if (statusRes.success && statusRes.data) {
        const budgetAlerts: Notification[] = statusRes.data
          .filter((status: any) => status.percentage_used >= 80)
          .map((status: any) => ({
            id: `budget-${status.category}-${status.month}`,
            type: status.percentage_used >= 100 ? "error" : "warning" as const,
            title: status.percentage_used >= 100 
              ? "Budget Exceeded!" 
              : "Budget Warning",
            message: `You've used ${status.percentage_used.toFixed(0)}% of your ${status.category} budget (${status.month})`,
            timestamp: new Date(),
            read: false,
            category: status.category,
            actionUrl: "/budgets",
          }))

        // Merge with existing notifications, avoiding duplicates
        setNotifications((prev) => {
          const existingIds = new Set(prev.map(n => n.id))
          const newAlerts = budgetAlerts.filter(n => !existingIds.has(n.id))
          return [...prev, ...newAlerts].sort((a, b) => 
            b.timestamp.getTime() - a.timestamp.getTime()
          )
        })
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  // Poll for notifications every 30 seconds
  useEffect(() => {
    if (!user) return

    fetchNotifications() // Initial fetch
    intervalRef.current = setInterval(fetchNotifications, 30000) // Poll every 30s

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [user])

  // Update unread count
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length
    setUnreadCount(unread)
  }, [notifications])

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "border-green-500/20 bg-green-500/10"
      case "warning":
        return "border-yellow-500/20 bg-yellow-500/10"
      case "error":
        return "border-red-500/20 bg-red-500/10"
      case "info":
        return "border-blue-500/20 bg-blue-500/10"
    }
  }

  return (
    <div className={cn("relative", className)}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 top-12 z-50 w-96 max-h-[600px] shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                          !notification.read && "bg-muted/30"
                        )}
                        onClick={() => {
                          markAsRead(notification.id)
                          if (notification.actionUrl) {
                            window.location.href = notification.actionUrl
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn(
                                "text-sm font-medium",
                                !notification.read && "font-semibold"
                              )}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

