/**
 * Sidebar Component
 * Professional navigation sidebar with responsive design
 */

"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Bot,
  Settings,
  LogOut,
  X,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const menuItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/expenses", icon: TrendingDown, label: "Expenses" },
    { href: "/budgets", icon: CreditCard, label: "Budgets" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/predictions", icon: TrendingUp, label: "Predictions" },
    { href: "/advisor", icon: Bot, label: "AI Advisor" },
  ]

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  // Don't show sidebar on auth pages or onboarding
  if (pathname?.startsWith('/auth') || pathname?.startsWith('/onboarding')) {
    return null
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">GoldCoin</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={onClose}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border space-y-1">
          <Link href="/settings" onClick={onClose}>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
              <Settings className="h-5 w-5 shrink-0" />
              <span className="font-medium">Settings</span>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
