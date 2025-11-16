/**
 * Auth Provider
 * Context provider for authentication state management
 */

'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authService, userService } from '@/services'
import type { User, LoginCredentials, RegisterData, UserUpdate } from '@/types'
import { toast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile?: (data: UserUpdate) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user && authService.isAuthenticated()

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const storedUser = authService.getUser()
          if (storedUser) {
            setUser(storedUser)
          } else {
            // Fetch user data if not in storage
            const response = await authService.getCurrentUser()
            if (response.success && response.data) {
              setUser(response.data)
            } else {
              await authService.logout()
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          await authService.logout()
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  /**
   * Login user
   */
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log(credentials)
      const response = await authService.login(credentials)

      if (response.success && response.data) {
        setUser(response.data)
        toast({
          title: 'Success',
          description: response.message || 'Logged in successfully',
          variant: 'default',
        })
        return true
      }

      toast({
        title: 'Error',
        description: response.error || 'Login failed',
        variant: 'destructive',
      })
      return false
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Register new user
   */
  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await authService.register(data)

      if (response.success && response.data) {
        setUser(response.data)
        toast({
          title: 'Success',
          description: response.message || 'Account created successfully',
          variant: 'default',
        })
        return true
      }

      toast({
        title: 'Error',
        description: response.error || 'Registration failed',
        variant: 'destructive',
      })
      return false
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true)
      await authService.logout()
      setUser(null)
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Update user profile
   */
  const updateProfile = async (data: UserUpdate): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await userService.updateProfile(data)
      if (response.success && response.data) {
        // Update both state and localStorage
        setUser(response.data)
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
          variant: 'default',
        })
        return true
      }
      toast({
        title: 'Error',
        description: response.error || 'Profile update failed',
        variant: 'destructive',
      })
      return false
    } catch (error) {
      console.error('Update profile error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Refresh user data
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const response = await userService.getCurrentUser()
      if (response.success && response.data) {
        setUser(response.data)
      }
    } catch (error) {
      console.error('Refresh user error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Auth Guard Component
 * Protects routes that require authentication
 */
interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return fallback || <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

/**
 * Guest Guard Component
 * Redirects authenticated users away from auth pages
 */
interface GuestGuardProps {
  children: ReactNode
}

export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isAuthenticated) {
    return null
  }

  return <>{children}</>
}
