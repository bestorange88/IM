"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import Header from "@/components/common/Header"
import BottomNavigation from "@/components/BottomNavigation"
import { 
  ArrowLeft, 
  Search, 
  MessageCircle, 
  Users,
  Clock,
  Pin
} from "lucide-react"
import { useLocation } from "wouter"

interface ChatRecord {
  id: string
  type: 'private' | 'group' | 'ai'
  name: string
  avatar?: string
  lastMessage: string
  lastTime: string
  unreadCount: number
  isPinned: boolean
  participants?: number
}

export default function ChatHistoryPage() {
  const { user } = useAuth()
  const [, navigate] = useLocation()
  const [searchTerm, setSearchTerm] = useState("")

  const chatRecords: ChatRecord[] = [
    {
      id: 'ai-assistant',
      type: 'ai',
      name: '慧心AI助手',
      avatar: '🤖',
      lastMessage: '道友好！有什么可以帮助您的吗？',
      lastTime: '2分钟前',
      unreadCount: 0,
      isPinned: true
    },
    {
      id: 'yingkedaoren',
      type: 'private',
      name: '迎客道人',
      avatar: '🚪',
      lastMessage: '好说好说！泰山宫有许多修行法门...',
      lastTime: '1小时前',
      unreadCount: 0,
      isPinned: true
    },
    {
      id: 'taishanzhenren',
      type: 'private',
      name: '泰山真人',
      avatar: '⛰️',
      lastMessage: '修行之始，在于正心诚意...',
      lastTime: '2小时前',
      unreadCount: 1,
      isPinned: false
    },
    {
      id: 'daodejing',
      type: 'group',
      name: '道德经研习群',
      avatar: '📚',
      lastMessage: '今日我们来研读第八章...',
      lastTime: '3小时前',
      unreadCount: 5,
      isPinned: false,
      participants: 15
    },
    {
      id: 'chenke',
      type: 'group',
      name: '晨课共修群',
      avatar: '🌅',
      lastMessage: '明日晨课时间为6:00，请大家准时参与',
      lastTime: '昨天',
      unreadCount: 2,
      isPinned: false,
      participants: 23
    },
    {
      id: 'newbie',
      type: 'group',
      name: '新道友交流群',
      avatar: '🌱',
      lastMessage: '欢迎新加入的道友们！',
      lastTime: '2天前',
      unreadCount: 0,
      isPinned: false,
      participants: 8
    }
  ]

  const filteredRecords = chatRecords.filter(record =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pinnedRecords = filteredRecords.filter(record => record.isPinned)
  const regularRecords = filteredRecords.filter(record => !record.isPinned)

  const handleSelectChat = (record: ChatRecord) => {
    if (record.type === 'private' || record.type === 'ai') {
      navigate(`/chat?contact=${record.id}`)
    } else if (record.type === 'group') {
      navigate(`/chat?group=${record.id}`)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'private':
      case 'ai':
        return <MessageCircle className="w-4 h-4" />
      case 'group':
        return <Users className="w-4 h-4" />
      default:
        return <MessageCircle className="w-4 h-4" />
    }
  }

  const getTypeName = (type: string, participants?: number) => {
    switch (type) {
      case 'private':
        return '私聊'
      case 'ai':
        return 'AI助手'
      case 'group':
        return `群聊 (${participants}人)`
      default:
        return '对话'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Header title="聊天记录" />

      <div className="h-screen overflow-y-auto scrollbar-hide">
        <div className="max-w-sm mx-auto px-4 py-4 pt-16 pb-20">
          
          {/* 返回按钮 */}
          <Button 
            variant="ghost" 
            className="mb-4 text-amber-700 hover:bg-amber-100"
            onClick={() => navigate("/dao")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>

          {/* 搜索框 */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-4 h-4" />
            <Input
              placeholder="搜索聊天记录..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-amber-300 focus:border-amber-500 focus:ring-amber-200"
            />
          </div>

          {/* 置顶对话 */}
          {pinnedRecords.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Pin className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-semibold text-amber-900">置顶对话</h2>
              </div>
              <div className="space-y-2">
                {pinnedRecords.map((record) => (
                  <Card
                    key={record.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-amber-200 bg-amber-50/50"
                    onClick={() => handleSelectChat(record)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={record.avatar} />
                            <AvatarFallback className="bg-amber-100 text-amber-700">
                              {record.avatar || record.name[0]?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          {record.unreadCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-red-500 text-white text-xs">
                              {record.unreadCount > 99 ? '99+' : record.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-amber-900 truncate">{record.name}</h3>
                            <span className="text-xs text-amber-500 flex-shrink-0">{record.lastTime}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-amber-600 truncate flex-1 mr-2">
                              {record.lastMessage}
                            </p>
                            <div className="flex items-center space-x-1 text-amber-500">
                              {getTypeIcon(record.type)}
                              <span className="text-xs">{getTypeName(record.type, record.participants)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 所有对话 */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-semibold text-amber-900">最近对话</h2>
            </div>
            <div className="space-y-2">
              {regularRecords.length > 0 ? (
                regularRecords.map((record) => (
                  <Card
                    key={record.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-amber-200 bg-white/80"
                    onClick={() => handleSelectChat(record)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={record.avatar} />
                            <AvatarFallback className="bg-amber-100 text-amber-700">
                              {record.avatar || record.name[0]?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          {record.unreadCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-red-500 text-white text-xs">
                              {record.unreadCount > 99 ? '99+' : record.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-amber-900 truncate">{record.name}</h3>
                            <span className="text-xs text-amber-500 flex-shrink-0">{record.lastTime}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-amber-600 truncate flex-1 mr-2">
                              {record.lastMessage}
                            </p>
                            <div className="flex items-center space-x-1 text-amber-500">
                              {getTypeIcon(record.type)}
                              <span className="text-xs">{getTypeName(record.type, record.participants)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-amber-200 bg-white/80">
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-amber-300 mx-auto mb-4" />
                    <p className="text-amber-600">没有找到相关聊天记录</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}