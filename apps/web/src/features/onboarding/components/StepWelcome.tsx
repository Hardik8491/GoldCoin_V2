/**
 * Step 1: Welcome
 * Introduction to GoldCoin features
 */

'use client'

import { ArrowRight, TrendingUp, Brain, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface StepWelcomeProps {
  onNext: () => void
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  const features = [
    {
      icon: TrendingUp,
      title: 'Smart Tracking',
      description: 'Automatically categorize and track all your expenses',
    },
    {
      icon: Brain,
      title: 'AI Insights',
      description: 'Get intelligent recommendations based on your spending',
    },
    {
      icon: Shield,
      title: 'Budget Alerts',
      description: 'Receive notifications when you exceed budget limits',
    },
    {
      icon: Zap,
      title: 'Predictions',
      description: 'Forecast future spending with machine learning',
    },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          Welcome to GoldCoin
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Let's set up your financial profile to get personalized insights and
          recommendations tailored to your needs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="border-border">
            <CardHeader>
              <feature.icon className="h-8 w-8 text-primary mb-2" />
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Button onClick={onNext} size="lg" className="min-w-[200px]">
          Start Setup
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

