"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, TrendingUp, Brain, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-foreground">GoldCoin</div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Your Personal Finance Management Solution
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            Track expenses, get AI-powered insights, predict spending patterns, and receive personalized financial
            advice—all in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="h-12 px-8 text-lg bg-transparent">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">Powerful Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Smart Tracking",
                description: "Automatically categorize and track all your expenses in real-time",
              },
              {
                icon: Brain,
                title: "AI Insights",
                description: "Get intelligent recommendations based on your spending patterns",
              },
              {
                icon: Shield,
                title: "Budget Alerts",
                description: "Receive notifications when you exceed budget limits",
              },
              {
                icon: Zap,
                title: "Predictions",
                description: "Forecast future spending with machine learning accuracy",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-background border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: "50K+", label: "Active Users" },
              { value: "$2.5B", label: "Tracked Expenses" },
              { value: "98%", label: "Accuracy Rate" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Take Control?</h2>
          <p className="text-lg text-muted-foreground mb-8">Start your free trial today. No credit card required.</p>
          <Link href="/auth/signup">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 GoldCoin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
