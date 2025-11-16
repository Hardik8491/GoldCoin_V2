/**
 * AI Advisor Page
 * Interactive AI financial advisor chat interface
 */

"use client"

import { useState, useRef, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/providers/auth-provider"
import { OnboardingGuard } from "@/providers/onboarding-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader, Bot, Sparkles } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { aiService } from "@/services"
import { toast } from "@/hooks/use-toast"
import type { ChatMessage } from "@/types"

export default function AdvisorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI Finance Advisor. I can help you with budgeting tips, spending analysis, investment advice, and financial planning. What would you like to know?",
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setLoading(true)

    try {
      // Include conversation history for context
      const conversationHistory = messages
        .slice(-10) // Last 10 messages for context
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))

      const response = await aiService.chat({
        message: currentInput,
        conversation_history: conversationHistory,
      })

      if (response.success && response.data) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.data.content || response.data.response || "I'm sorry, I couldn't process that request.",
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error(response.error || "Failed to get response")
      }
    } catch (error) {
      console.error("AI chat error:", error)
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      })

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const quickQuestions = [
    "How can I save more money?",
    "What's a good investment strategy?",
    "How do I create a budget?",
    "What are my spending trends?",
  ]

  const handleQuickQuestion = (question: string) => {
    setInput(question)
    // Auto-submit after a short delay
    setTimeout(() => {
      const form = document.querySelector('form')
      if (form) {
        form.requestSubmit()
      }
    }, 100)
  }

  return (
    <AuthGuard>
      <OnboardingGuard>
        <DashboardLayout>
          <div className="space-y-6 h-full flex flex-col">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Bot className="h-8 w-8 text-primary" />
                AI Finance Advisor
              </h1>
              <p className="text-muted-foreground mt-1">
                Get personalized financial advice powered by AI
              </p>
            </div>

            <div className="flex-1 flex flex-col gap-6 min-h-0">
              {/* Chat Container */}
              <Card className="flex-1 flex flex-col min-h-0">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Chat with AI Advisor
                  </CardTitle>
                  <CardDescription>
                    Ask questions about your finances, budgeting, investments, and more
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                  {/* Messages Container */}
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          {message.role === "assistant" && (
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                            <span className="text-xs opacity-70 mt-1 block">
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {message.role === "user" && (
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="bg-secondary">
                                You
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}
                      {loading && (
                        <div className="flex gap-3 justify-start">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-muted text-foreground px-4 py-2 rounded-lg flex items-center gap-2">
                            <Loader className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Thinking...</span>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input Section */}
                  <div className="border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything about your finances..."
                        disabled={loading}
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        disabled={loading || !input.trim()}
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Questions</CardTitle>
                  <CardDescription>
                    Click on a question to get instant advice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {quickQuestions.map((question) => (
                      <Button
                        key={question}
                        variant="outline"
                        onClick={() => handleQuickQuestion(question)}
                        className="justify-start text-left h-auto py-3"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DashboardLayout>
      </OnboardingGuard>
    </AuthGuard>
  )
}
