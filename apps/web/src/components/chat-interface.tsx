"use client"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { useStore } from "@/store/use-store"

interface Message {
  id: string
  text: string
  sender: "user" | "assistant"
  timestamp: Date
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI Finance Advisor. I can help you analyze spending patterns, predict future expenses, and give personalized recommendations. What would you like to know?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { expenses } = useStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Math.random().toString(36),
      text: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.sender,
              content: m.text,
            })),
            { role: "user", content: input },
          ],
          expenses,
        }),
      })

      const data = await res.json()

      const assistantMessage: Message = {
        id: Math.random().toString(36),
        text: data.content,
        sender: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: Math.random().toString(36),
        text: "Sorry, I encountered an error. Please try again.",
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col p-8">
      <div className="flex-1 bg-card rounded-lg border border-border p-6 mb-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs rounded-lg p-4 ${
                msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-input text-foreground"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs mt-2 opacity-70">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-input text-foreground rounded-lg p-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask me anything about your finances..."
          className="flex-1 bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-medium rounded-lg px-6 py-3 flex items-center gap-2 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
