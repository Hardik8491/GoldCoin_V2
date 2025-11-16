/**
 * Settings Page
 * User account and preferences management
 */

"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/providers/auth-provider"
import { OnboardingGuard } from "@/providers/onboarding-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Bell, Lock, User, LogOut, Trash2, Save, AlertTriangle } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { userService } from "@/services"
import { toast } from "@/hooks/use-toast"
import { CURRENCIES } from "@/config/constants"

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const [settings, setSettings] = useState({
    full_name: "",
    email: "",
    currency: "USD",
    theme: "system",
    notificationsEmail: true,
    notificationsPush: true,
    alertThreshold: 80,
  })

  // Load user data when available
  useEffect(() => {
    if (user) {
      setSettings({
        full_name: user.full_name || "",
        email: user.email || "",
        currency: user.currency || "USD",
        theme: user.theme || "system",
        notificationsEmail: true,
        notificationsPush: true,
        alertThreshold: 80,
      })
    }
  }, [user])

  const handleSave = async () => {
    try {
      setLoading(true)
      if (updateProfile) {
        const success = await updateProfile({
          full_name: settings.full_name,
          email: settings.email,
          currency: settings.currency,
          theme: settings.theme,
        })
        if (success) {
          // Update theme in theme provider
          if (typeof window !== 'undefined') {
            const { useTheme } = await import('@/providers/theme-provider')
            // Theme will be updated via the provider when user data refreshes
          }
          
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
          toast({
            title: "Success",
            description: "Settings saved successfully",
            variant: "default",
          })
        }
      }
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }

    try {
      setLoading(true)
      const response = await userService.deleteAccount()
      if (response.success) {
        toast({
          title: "Account Deleted",
          description: "Your account has been deleted successfully",
          variant: "default",
        })
        await logout()
      }
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <OnboardingGuard>
        <DashboardLayout>
          <div className="space-y-6 max-w-4xl">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-1">
                Manage your account and preferences
              </p>
            </div>

            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={settings.full_name}
                    onChange={(e) =>
                      setSettings({ ...settings, full_name: e.target.value })
                    }
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={settings.email}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
                    type="email"
                    placeholder="your@email.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) =>
                        setSettings({ ...settings, currency: value })
                      }
                    >
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((curr) => (
                          <SelectItem key={curr.value} value={curr.value}>
                            {curr.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value) =>
                        setSettings({ ...settings, theme: value })
                      }
                    >
                      <SelectTrigger id="theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full md:w-auto"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saved ? "✓ Saved" : "Save Changes"}
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get alerts and updates via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notificationsEmail}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, notificationsEmail: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get alerts on your device
                    </p>
                  </div>
                  <Switch
                    checked={settings.notificationsPush}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, notificationsPush: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="alertThreshold">
                    Budget Alert Threshold (%)
                  </Label>
                  <Input
                    id="alertThreshold"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.alertThreshold}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        alertThreshold: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Get alerted when spending reaches this % of your budget
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Two-Factor Authentication
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Active Sessions
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={logout}
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout All Devices
                </Button>

                <Button
                  onClick={handleDeleteAccount}
                  variant="outline"
                  disabled={loading}
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </OnboardingGuard>
    </AuthGuard>
  )
}
