"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import EmojiPicker from "@/components/common/EmojiPicker"
import AttachmentMenu from "@/components/common/AttachmentMenu"
import { 
  ArrowLeft, 
  Send, 
  Smile, 
  Paperclip, 
  Phone, 
  Video,
  MoreVertical,
  Clock,
  Check,
  CheckCheck
} from "lucide-react"
import { useLocation } from "wouter"

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  timestamp: string
  type: 'text' | 'image' | 'file' | 'emoji'
  status: 'sending' | 'sent' | 'delivered' | 'read'
  fileName?: string
  fileSize?: number
}

interface Contact {
  id: string
  username: string
  nickname?: string
  avatar?: string
  isOnline: boolean
  lastSeen?: string
  status?: string
}

export default function ConversationPage() {
  const { user } = useAuth()
  const [, navigate] = useLocation()
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // 从URL参数获取联系人ID或群组ID
  const urlParams = new URLSearchParams(window.location.search)
  const contactId = urlParams.get('contact')
  const groupId = urlParams.get('group')
  const isGroupChat = !!groupId
  
  // 联系人和群组数据映射
  const getContactInfo = (id: string, isGroup: boolean = false): Contact => {
    if (isGroup) {
      const groupMap: { [key: string]: Contact } = {
        'daodejing': {
          id: 'daodejing',
          username: '道德经研习群',
          nickname: '道德经研习群',
          isOnline: true,
          status: '15位成员',
          avatar: '📚'
        },
        'chenke': {
          id: 'chenke',
          username: '晨课共修群',
          nickname: '晨课共修群',
          isOnline: true,
          status: '23位成员',
          avatar: '🌅'
        },
        'newbie': {
          id: 'newbie',
          username: '新道友交流群',
          nickname: '新道友交流群',
          isOnline: true,
          status: '8位成员',
          avatar: '🌱'
        }
      }
      
      return groupMap[id] || {
        id: id || 'unknown',
        username: '未知群组',
        nickname: '未知群组',
        isOnline: false,
        status: '群组'
      }
    } else {
      const contactMap: { [key: string]: Contact } = {
        'yingkedaoren': {
          id: 'yingkedaoren',
          username: '迎客道人',
          nickname: '迎客道人',
          isOnline: true,
          status: '欢迎新道友',
          avatar: '🚪'
        },
        'taishanzhenren': {
          id: 'taishanzhenren',
          username: '泰山真人',
          nickname: '泰山真人',
          isOnline: true,
          status: '指导修行',
          avatar: '⛰️'
        }
      }
      
      return contactMap[id] || {
        id: id || 'unknown',
        username: '道友',
        nickname: '未知道友',
        isOnline: false,
        status: '离线'
      }
    }
  }

  const [contact] = useState<Contact>(getContactInfo(isGroupChat ? groupId || '' : contactId || '', isGroupChat))

  // 根据联系人或群组生成初始消息
  const getInitialMessages = (id: string, isGroup: boolean = false): Message[] => {
    if (isGroup) {
      const groupMessageMap: { [key: string]: Message[] } = {
        'daodejing': [
          {
            id: '1',
            content: '今日我们来研读道德经第八章："上善若水，水善利万物而不争..."',
            senderId: 'teacher1',
            receiverId: 'group',
            timestamp: '今天 14:20',
            type: 'text',
            status: 'read'
          },
          {
            id: '2',
            content: '这一章讲述了道的至善品质，如水一般包容万物。各位道友有何感悟？',
            senderId: 'teacher1', 
            receiverId: 'group',
            timestamp: '今天 14:22',
            type: 'text',
            status: 'read'
          },
          {
            id: '3',
            content: '弟子认为，水的品德在于谦逊和包容，正是我们修行者应该学习的品质。🙏',
            senderId: user?.id || '',
            receiverId: 'group',
            timestamp: '今天 14:25',
            type: 'text',
            status: 'read'
          }
        ],
        'chenke': [
          {
            id: '1',
            content: '明日晨课时间为6:00，请大家准时参与。今日主题是"清心养性"。',
            senderId: 'admin',
            receiverId: 'group',
            timestamp: '今天 18:00',
            type: 'text',
            status: 'read'
          },
          {
            id: '2',
            content: '收到！会准时参加的。🌅',
            senderId: 'member1',
            receiverId: 'group',
            timestamp: '今天 18:05',
            type: 'text',
            status: 'read'
          }
        ],
        'newbie': [
          {
            id: '1',
            content: '欢迎新加入的道友们！这里是新道友交流群，大家可以自由讨论修行心得。',
            senderId: 'admin',
            receiverId: 'group',
            timestamp: '2天前',
            type: 'text',
            status: 'read'
          }
        ]
      }
      
      return groupMessageMap[id] || [
        {
          id: '1',
          content: '欢迎加入群组！',
          senderId: 'system',
          receiverId: 'group',
          timestamp: '今天 12:00',
          type: 'text',
          status: 'read'
        }
      ]
    }
    // 个人聊天消息
    const messageMap: { [key: string]: Message[] } = {
      'yingkedaoren': [
        {
          id: '1',
          content: '道友好！欢迎来到泰山宫！🏮\n\n愿您在此修行路上有所收获，若有任何疑问，随时可以向贫道请教。',
          senderId: 'yingkedaoren',
          receiverId: user?.id || '',
          timestamp: '今天 09:30',
          type: 'text',
          status: 'read'
        },
        {
          id: '2',
          content: '感谢迎客道人指导！弟子初来乍到，还请多多关照。🙏',
          senderId: user?.id || '',
          receiverId: 'yingkedaoren',
          timestamp: '今天 09:35',
          type: 'text',
          status: 'read'
        },
        {
          id: '3',
          content: '好说好说！泰山宫有许多修行法门，建议您先从基础的静坐和诵经开始。每日晨课共修也很重要哦～',
          senderId: 'yingkedaoren',
          receiverId: user?.id || '',
          timestamp: '今天 09:40',
          type: 'text',
          status: 'read'
        }
      ],
      'taishanzhenren': [
        {
          id: '1',
          content: '善哉善哉！道友既然来到泰山宫，必是有缘之人。⛰️\n\n道法自然，顺其自然。修行之路虽漫长，但只要持之以恒，必有所成。',
          senderId: 'taishanzhenren',
          receiverId: user?.id || '',
          timestamp: '今天 10:15',
          type: 'text',
          status: 'read'
        },
        {
          id: '2',
          content: '弟子感谢真人教导！请问真人，初学者应该如何开始修行？',
          senderId: user?.id || '',
          receiverId: 'taishanzhenren',
          timestamp: '今天 10:18',
          type: 'text',
          status: 'read'
        },
        {
          id: '3',
          content: '修行之始，在于正心诚意。先从调节呼吸、静心凝神开始。\n\n每日可诵读《道德经》，参悟其中奥义。贫道在道观中会定期开讲，道友可多参与。',
          senderId: 'taishanzhenren',
          receiverId: user?.id || '',
          timestamp: '今天 10:22',
          type: 'text',
          status: 'read'
        }
      ]
    }
    
    return messageMap[id] || [
      {
        id: '1',
        content: '您好！很高兴认识您。',
        senderId: id,
        receiverId: user?.id || '',
        timestamp: '今天 12:00',
        type: 'text',
        status: 'read'
      }
    ]
  }

  const [messages, setMessages] = useState<Message[]>(getInitialMessages(isGroupChat ? groupId || '' : contactId || '', isGroupChat))

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      senderId: user?.id || '',
      receiverId: contact.id,
      timestamp: new Date().toLocaleString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: 'text',
      status: 'sending'
    }

    setMessages(prev => [...prev, newMessage])
    setMessage("")

    // 模拟发送状态变化
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      ))
    }, 1000)

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
      ))
    }, 2000)
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const handleFileSelect = (file: File) => {
    // 处理文件发送逻辑
    console.log("选择的文件:", file)
    setShowAttachmentMenu(false)
  }

  const getMessageStatus = (status: string) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      default:
        return null
    }
  }

  const displayName = contact.nickname || contact.username

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col">
      {/* 顶部导航 */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-amber-200 px-4 py-3 flex items-center space-x-3 sticky top-0 z-10">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/contacts")}
          className="text-amber-700 hover:bg-amber-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <Avatar className="w-10 h-10">
          <AvatarImage src={contact.avatar} />
          <AvatarFallback className="bg-amber-100 text-amber-700 text-lg">
            {contact.avatar || displayName[0]?.toUpperCase() || '道'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h3 className="font-semibold text-amber-900">{displayName}</h3>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={contact.isOnline ? "default" : "secondary"}
              className={`text-xs ${contact.isOnline ? "bg-green-500" : "bg-gray-400"}`}
            >
              {contact.isOnline ? '在线' : '离线'}
            </Badge>
            {contact.status && (
              <span className="text-xs text-amber-600">{contact.status}</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-amber-700 hover:bg-amber-100"
            onClick={() => console.log("语音通话")}
          >
            <Phone className="w-5 h-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-amber-700 hover:bg-amber-100"
            onClick={() => console.log("视频通话")}
          >
            <Video className="w-5 h-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-amber-700 hover:bg-amber-100"
            onClick={() => console.log("更多选项")}
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* 消息区域 */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-4 pb-4">
          {messages.map((msg) => {
            const isOwn = msg.senderId === user?.id
            return (
              <div
                key={msg.id}
                className={`flex items-end space-x-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!isOwn && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback className="bg-amber-100 text-amber-700 text-sm">
                      {contact.avatar || displayName[0]?.toUpperCase() || '道'}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[280px] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                  <Card className={`p-3 ${
                    isOwn 
                      ? 'bg-amber-500 text-white border-amber-500' 
                      : 'bg-white border-amber-200'
                  }`}>
                    <p className={`text-sm whitespace-pre-wrap ${isOwn ? 'text-white' : 'text-amber-900'}`}>
                      {msg.content}
                    </p>
                  </Card>
                  
                  <div className={`flex items-center space-x-1 mt-1 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <span className="text-xs text-amber-500">{msg.timestamp}</span>
                    {isOwn && getMessageStatus(msg.status)}
                  </div>
                </div>

                {isOwn && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                      {user?.nickname?.[0] || user?.username?.[0] || '我'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            )
          })}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* 表情选择器 */}
      {showEmojiPicker && (
        <div className="px-4 pb-2">
          <EmojiPicker 
            onEmojiSelect={handleEmojiSelect} 
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      {/* 附件菜单 */}
      {showAttachmentMenu && (
        <div className="px-4 pb-2">
          <AttachmentMenu 
            onFileSelect={handleFileSelect}
            onClose={() => setShowAttachmentMenu(false)}
          />
        </div>
      )}

      {/* 输入区域 */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-amber-200 p-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowAttachmentMenu(!showAttachmentMenu)
              setShowEmojiPicker(false)
            }}
            className="text-amber-600 hover:bg-amber-100"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入消息..."
              className="pr-12 border-amber-200 focus:border-amber-400"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker)
                setShowAttachmentMenu(false)
              }}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-amber-600 hover:bg-amber-100"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}