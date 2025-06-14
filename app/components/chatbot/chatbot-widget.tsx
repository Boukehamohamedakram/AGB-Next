"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Bot, User } from "lucide-react"
import { apiClient } from "@/lib/api"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "text" | "image" | "document"
}

interface ChatbotWidgetProps {
  context?: any
  className?: string
}

export function ChatbotWidget({ context, className }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Load chat history
      loadChatHistory()
      // Send welcome message
      addBotMessage("Bonjour ! Je suis votre assistant AGB. Comment puis-je vous aider aujourd'hui ?")
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadChatHistory = async () => {
    try {
      const response = await apiClient.getChatHistory()
      if (response.success && response.data) {
        const historyMessages = response.data.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: new Date(msg.timestamp),
        }))
        setMessages(historyMessages)
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
    }
  }

  const addBotMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      content,
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, message])
  }

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, message])
  }

  const sendMessage = async (messageContent?: string) => {
    if (!(inputMessage.trim() || messageContent) || isLoading) return

    const userMessage = messageContent || inputMessage.trim()
    setInputMessage("")
    addUserMessage(userMessage)
    setIsLoading(true)

    try {
      const response = await apiClient.chatWithBot(userMessage, context)
      if (response.success && response.data?.response) {
        addBotMessage(response.data.response)
      } else {
        addBotMessage("Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      addBotMessage("Une erreur est survenue. Veuillez réessayer plus tard.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getQuickActions = () => {
    const actions = []

    if (context?.page === "document_upload") {
      actions.push(
        { text: "Mon document est-il valide ?", action: "check_document" },
        { text: "Comment améliorer la qualité ?", action: "improve_quality" },
      )
    } else if (context?.page === "selfie_verification") {
      actions.push(
        { text: "Conseils pour un bon selfie", action: "selfie_tips" },
        { text: "Problème avec la caméra", action: "camera_help" },
      )
    } else {
      actions.push(
        { text: "Où en est ma demande ?", action: "check_status" },
        { text: "Que dois-je faire maintenant ?", action: "next_steps" },
      )
    }

    return actions
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
          "bg-[#1E3A8A] hover:bg-[#1E40AF] text-white",
          className,
        )}
        aria-label="Ouvrir le chat assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className={cn("fixed bottom-6 right-6 w-80 h-96 shadow-xl z-50 flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between p-4 bg-[#1E3A8A] text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="font-medium">Assistant AGB</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-2", message.sender === "user" ? "justify-end" : "justify-start")}
              >
                {message.sender === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-[#1E3A8A] flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[70%] p-3 rounded-lg text-sm",
                    message.sender === "user"
                      ? "bg-[#1E3A8A] text-white rounded-br-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none",
                  )}
                >
                  {message.content}
                </div>
                {message.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-[#1E3A8A] flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            {messages.length === 1 && ( // Afficher seulement au début
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-500 mb-2">Actions rapides :</p>
                <div className="flex flex-wrap gap-1">
                  {getQuickActions().map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        addUserMessage(action.text)
                        sendMessage(action.text)
                      }}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors"
                    >
                      {action.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
                className="bg-[#1E3A8A] hover:bg-[#1E40AF]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
