"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Header from "@/components/common/Header"
import BottomNavigation from "@/components/BottomNavigation"
import AttachmentMenu from "@/components/common/AttachmentMenu"
import EmojiPicker from "@/components/common/EmojiPicker"
import { 
  Send, 
  Plus, 
  Smile, 
  Mic, 
  Phone, 
  Video, 
  MoreHorizontal,
  ArrowLeft 
} from "lucide-react"
import { useLocation } from "wouter"
import { useQuery } from "@tanstack/react-query"

interface Message {
  id: string
  content: string
  userId: string
  username: string
  nickname: string
  timestamp: Date
  type: 'text' | 'image' | 'file'
}

export default function ChatNewPage() {
  const { user, isLoading } = useAuth()
  const [, navigate] = useLocation()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: chatRooms = [] } = useQuery({
    queryKey: ["/api/chat/rooms"],
    enabled: !!user && !isLoading,
  })

  // 默认聊天室
  const defaultRoom = chatRooms.find((room: any) => room.name === "道友大厅") || chatRooms[0]

  // 模拟聊天消息
  useEffect(() => {
    if (defaultRoom) {
      const initialMessages: Message[] = [
        {
          id: "1",
          content: "欢迎来到泰山宫传统聊天室！",
          userId: "system_yingke",
          username: "迎客道人",
          nickname: "迎客道人",
          timestamp: new Date(Date.now() - 30000),
          type: 'text'
        },
        {
          id: "2", 
          content: "这里是道友们交流修行心得的地方。",
          userId: "system_taishan",
          username: "泰山真人",
          nickname: "泰山真人",
          timestamp: new Date(Date.now() - 20000),
          type: 'text'
        }
      ]
      setMessages(initialMessages)
    }
  }, [defaultRoom])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim() || !user) return
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      userId: user.id,
      username: user.username,
      nickname: user.nickname || user.username,
      timestamp: new Date(),
      type: 'text'
    }
    
    setMessages(prev => [...prev, newMessage])
    setMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileSelect = (file: File) => {
    console.log("Selected file:", file)
    setShowAttachmentMenu(false)
    // TODO: 实现文件上传逻辑
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Mic className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-amber-600">正在加载聊天室...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    navigate("/")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-red-800 to-amber-700 text-white border-b fixed top-0 left-0 right-0 w-full z-50 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-red-700/50"
              onClick={() => navigate("/dao")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{defaultRoom?.name || "传统聊天"}</h1>
              <p className="text-sm text-red-100">{messages.length}条消息</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-red-700/50">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-red-700/50">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-red-700/50">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 pt-16 pb-20 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.userId === user.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 max-w-[80%] ${msg.userId === user.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className={`text-xs ${
                    msg.userId.startsWith('system') ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {msg.nickname[0]}
                  </AvatarFallback>
                </Avatar>
                <div className={`${msg.userId === user.id ? 'text-right' : 'text-left'}`}>
                  <div className="text-xs text-gray-500 mb-1">
                    {msg.nickname} · {msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <Card className={`${
                    msg.userId === user.id 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-white border shadow-sm'
                  } border-0`}>
                    <CardContent className="p-3">
                      <p className="text-sm">{msg.content}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="bg-white border-t fixed bottom-16 left-0 right-0 z-40">
        <div className="flex items-center space-x-2 p-3">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-500 hover:bg-gray-100"
            onClick={() => setShowAttachmentMenu(true)}
          >
            <Plus className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              className="border-0 bg-transparent focus-visible:ring-0 flex-1"
            />
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-500 hover:bg-gray-200 h-8 w-8"
              onClick={() => setShowEmojiPicker(true)}
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            size="icon"
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-full"
            onClick={handleSendMessage}
            disabled={!message.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 附件菜单 */}
      {showAttachmentMenu && (
        <AttachmentMenu
          onFileSelect={handleFileSelect}
          onClose={() => setShowAttachmentMenu(false)}
        />
      )}

      {/* 表情选择器 */}
      {showEmojiPicker && (
        <EmojiPicker
          onEmojiSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      <BottomNavigation />
    </div>
  )
}