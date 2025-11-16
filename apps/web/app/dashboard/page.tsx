"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { SpendingChart } from "@/components/spending-chart"
import { ExpensesList } from "@/components/expenses-list"
import { Card } from "@/components/ui/card"
import { TrendingDown, TrendingUp } from "lucide-react"
import AlertsPanel from "@/components/chat-interface"
import PredictionCard from "@/components/prediction-card"
import { AuthGuard } from "@/providers/auth-provider"
import { OnboardingGuard } from "@/providers/onboarding-guard"
import { useAuth } from "@/providers/auth-provider"
import { expenseService, budgetService } from "@/services"
import type { Expense, Budget, BudgetStatus } from "@/types"

export default function DashboardPage() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: user?.currency || "USD",
    }).format(amount)
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [expensesResult, budgetsResult, statusResult] = await Promise.all([
          expenseService.getExpenses(),
          budgetService.getBudgets(),
          budgetService.getBudgetStatus(),
        ]);
        
        const expensesData = expensesResult?.data
        setExpenses(
          Array.isArray(expensesData?.items) 
            ? expensesData.items 
            : Array.isArray(expensesData) 
            ? expensesData 
            : []
        );
        
        const budgetsData = budgetsResult?.data
        setBudgets(
          Array.isArray(budgetsData?.items)
            ? budgetsData.items
            : Array.isArray(budgetsData)
            ? budgetsData
            : []
        );
        
        setBudgetStatus(Array.isArray(statusResult?.data) ? statusResult.data : []);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <p className="text-center p-6">Loading...</p>;
  }

  const totalSpent = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  
  // Calculate budget from budget status or budgets
  const totalBudget = budgetStatus.length > 0
    ? budgetStatus.reduce((sum, status) => sum + (status.limit || 0), 0)
    : budgets.length > 0
    ? budgets.reduce((sum, budget) => sum + (budget.limit_amount || 0), 0)
    : 0;
  
  const remaining = totalBudget - totalSpent;
  const budgetPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <AuthGuard>
      <OnboardingGuard>
      <DashboardLayout>
        <div className="space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your financial overview.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard 
              title="Total Spent" 
              value={formatCurrency(totalSpent)} 
              trend={budgetPercentage > 100 ? -5.2 : 5.2} 
              icon={TrendingUp} 
            />
            <StatCard 
              title="Budget Remaining" 
              value={formatCurrency(Math.max(0, remaining))} 
              trend={remaining < 0 ? -2.1 : 2.1} 
              icon={TrendingDown} 
            />
            <StatCard 
              title="Monthly Budget" 
              value={formatCurrency(totalBudget)} 
              percentage={budgetPercentage} 
            />
            <StatCard
              title="Recurring Expenses"
              value={formatCurrency(
                expenses
                  .filter((e) => e.recurring)
                  .reduce((sum, e) => sum + (e.amount || 0), 0)
              )}
              trend={0}
            />
          </div>

          {/* Budget Alerts */}
          {budgetPercentage > 100 && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive font-semibold">
                ⚠️ Warning: You have exceeded your budget by {formatCurrency(Math.abs(remaining))}!
              </p>
            </div>
          )}

          {/* Budget Tracker by Category */}
          {budgetStatus.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Budget Tracker</h3>
              <div className="space-y-4">
                {budgetStatus.map((status, idx) => {
                  const percentage = status.percentage_used || 0;
                  const isExceeded = percentage > 100;
                  
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{status.category || 'Unknown'}</span>
                        <span className={isExceeded ? 'text-destructive' : 'text-muted-foreground'}>
                          {percentage.toFixed(0)}% used
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isExceeded
                              ? 'bg-destructive'
                              : percentage > 80
                              ? 'bg-yellow-500'
                              : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          Spent: {formatCurrency(status.spent || 0)} / {formatCurrency(status.limit || 0)}
                        </span>
                        <span>
                          Remaining: {formatCurrency(status.remaining || 0)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Alerts */}
          <AlertsPanel />

          {/* Charts and Predictions */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SpendingChart />
            </div>
            <PredictionCard expenses={expenses.map(e => ({ ...e, id: String(e.id) }))} />
          </div>

          {/* Recent Expenses */}
          <div className="grid lg:grid-cols-2 gap-6">
            <ExpensesList expenses={expenses.map(e => ({ 
              id: typeof e.id === 'number' ? e.id : Number(e.id),
              description: e.description,
              category: typeof e.category === 'string' ? e.category : e.category,
              amount: e.amount,
              date: e.date,
              recurring: e.recurring || false,
            }))} />

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">AI Insights</h3>
              <div className="space-y-4">
                {budgetPercentage > 100 ? (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-foreground">
                      ⚠️ <strong>Alert:</strong> You have exceeded your budget by {formatCurrency(Math.abs(remaining))}. Consider reviewing your spending.
                    </p>
                  </div>
                ) : budgetPercentage > 80 ? (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-foreground">
                      💡 <strong>Warning:</strong> You've used {budgetPercentage}% of your budget. {formatCurrency(remaining)} remaining.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-foreground">
                      ✅ <strong>Good News:</strong> You're on track! {formatCurrency(remaining)} remaining in your budget.
                    </p>
                  </div>
                )}
                {expenses.length > 0 && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm text-foreground">
                      📊 <strong>Summary:</strong> You have {expenses.length} expense{expenses.length !== 1 ? 's' : ''} totaling {formatCurrency(totalSpent)}.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </DashboardLayout>
      </OnboardingGuard>
    </AuthGuard>
    // <div>
    //   {totalSpent > budgetLimit ? (
    //     <p className="text-red-600 font-semibold p-4 bg-red-100 border border-red-200 rounded-md text-center">
    //       Warning: You have exceeded your budget limit of ${budgetLimit}!
    //     </p>
    //   ) : (
    //     <p className="text-green-600 font-semibold p-4 bg-green-100 border border-green-200 rounded-md text-center">
    //       You are within your budget. Keep up the good work!
    //     </p>
    //   )}
    // </div>
  );
}
