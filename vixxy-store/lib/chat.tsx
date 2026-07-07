
import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { API_BASE } from '@/lib/env'

const API_BASE_URL = `${API_BASE}/chat`

export interface Message {
  id?: number
  conversationId: number
  senderType: 'USER' | 'AI' | 'STAFF' | 'SYSTEM'
  senderId?: number
  messageContent: string
  messageType: string
  tokenUsed?: number
  responseTime?: number
  createdAt: Date
}

export interface Conversation {
  id: number
  userId: number
  title: string
  conversationType: string
  status: string
  startedAt: Date
  endedAt?: Date
  createdAt: Date
  updatedAt: Date
}

interface ChatContextType {
  conversation: Conversation | null
  messages: Message[]
  isLoading: boolean
  createConversation: (title?: string) => Promise<void>
  sendMessage: (text: string) => Promise<void>
  fetchMessages: () => Promise<void>
}

const ChatContext = createContext<ChatContextType | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Try to get conversation from localStorage
    const savedConversation = localStorage.getItem('vixxy_conversation')
    if (savedConversation) {
      const conv = JSON.parse(savedConversation)
      setConversation(conv)
      fetchMessages(conv.id)
    } else {
      createConversation()
    }
  }, [])

  const createConversation = async (title: string = 'Cuộc trò chuyện mới') => {
    try {
      const res = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
      const data = await res.json()
      if (data.success) {
        setConversation(data.conversation)
        localStorage.setItem('vixxy_conversation', JSON.stringify(data.conversation))
        // Fetch initial messages
        await fetchMessages(data.conversation.id)
      }
    } catch (err) {
      console.error('Error creating conversation:', err)
    }
  }

  const fetchMessages = async (convId?: number) => {
    const id = convId || conversation?.id
    if (!id) return

    try {
      const res = await fetch(`${API_BASE_URL}/messages/${id}`)
      const data = await res.json()
      if (data.success) {
        setMessages(data.messages)
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  const sendMessage = async (text: string) => {
    if (!conversation || !text.trim()) return

    // Add user message temporarily
    const userMessage: Message = {
      conversationId: conversation.id,
      senderType: 'USER',
      messageContent: text,
      messageType: 'TEXT',
      createdAt: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          message: text
        })
      })
      const data = await res.json()
      if (data.success) {
        // Add AI message
        setMessages(prev => [...prev, data.message])
      }
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ChatContext.Provider value={{
      conversation,
      messages,
      isLoading,
      createConversation,
      sendMessage,
      fetchMessages
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
