"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/common/Header"
import BottomNavigation from "@/components/BottomNavigation"

import {
  MessageCircle,
  Phone,
  Users,
  BookOpen,
  Heart,
  Star,
  Calendar,
  ChevronRight,
  Sparkles,
  Crown,
  Flame,
  Wind,
  Triangle,
  Hash,
} from "lucide-react"
import { useLocation } from "wouter"
import { useQuery } from "@tanstack/react-query"

export default function DaoPage() {
  const { user, isLoading } = useAuth()
  const [, navigate] = useLocation()

  // 轮播图状态
  const [currentSlide, setCurrentSlide] = useState(0)

  // 轮播图数据 - 使用实际的1.jpg到5.jpg图片路径
  const carouselImages = [
    {
      id: 1,
      image: "1.jpg",
      title: "泰山日出",
      description: "登泰山而小天下",
    },
    {
      id: 2,
      image: "2.jpg",
      title: "道宫殿堂",
      description: "庄严肃穆的道教圣地",
    },
    {
      id: 3,
      image: "3.jpg",
      title: "静心修行",
      description: "道法自然，清心寡欲",
    },
    {
      id: 4,
      image: "4.jpg",
      title: "经典传承",
      description: "千年智慧，薪火相传",
    },
    {
      id: 5,
      image: "5.jpg",
      title: "天人合一",
      description: "与自然和谐共处",
    },
  ]

  // 自动轮播效果
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
    }, 3000)

    return () => clearInterval(timer)
  }, [carouselImages.length])

  // 获取聊天室列表
  const { data: chatRooms = [] } = useQuery({
    queryKey: ["/api/chat/rooms"],
    enabled: !!user && !isLoading,
  })

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/")
    }
  }, [user, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Triangle className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-amber-600">正在加载泰山宫...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const featuredArticles = [
    {
      id: 1,
      title: "道德经第一章：道可道，非常道",
      excerpt: "探索道家经典中关于道的本质，理解不可言喻的道如何指引我们的修行之路...",
      author: "张教天师",
      date: "2天前",
      category: "经典研习",
      readTime: "5分钟",
      image: "🏔️",
      popularity: 95,
    },
    {
      id: 2,
      title: "内丹修炼入门指导",
      excerpt: "从基础的调息开始，逐步深入内丹修炼的核心要义，为初学者提供完整的修行路径...",
      author: "迎客道人",
      date: "3天前",
      category: "修行指南",
      readTime: "8分钟",
      image: "⚡",
      popularity: 88,
    },
    {
      id: 3,
      title: "泰山道教文化的传承与发展",
      excerpt: "探讨泰山作为道教圣地的历史地位，以及现代道教文化的传承与创新发展...",
      author: "道宫长老",
      date: "5天前",
      category: "文化传承",
      readTime: "12分钟",
      image: "🏯",
      popularity: 92,
    },
  ]

  const quickActions = [
    {
      icon: <MessageCircle className="w-4 h-4" />,
      title: "聊天记录",
      description: "查看对话记录",
      color: "bg-blue-500",
      action: () => navigate("/chat-history"),
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      title: "现代聊天室",
      description: "现代化聊天体验",
      color: "bg-green-500",
      action: () => navigate("/chat-enhanced"),
    },
    {
      icon: <Users className="w-4 h-4" />,
      title: "道友互动",
      description: "管理道友关系",
      color: "bg-purple-500",
      action: () => navigate("/contacts"),
    },
    {
      icon: <Phone className="w-4 h-4" />,
      title: "道友通话",
      description: "语音视频通话",
      color: "bg-orange-500",
      action: () => navigate("/calls"),
    },
  ]

  const recentActivities = [
    {
      type: "discussion",
      title: "道德经研习讨论",
      participants: 24,
      time: "2小时前",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      type: "meditation",
      title: "晨课共修",
      participants: 18,
      time: "今天上午",
      icon: <Wind className="w-4 h-4" />,
    },
    {
      type: "sharing",
      title: "修行心得分享",
      participants: 31,
      time: "昨天",
      icon: <Heart className="w-4 h-4" />,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Header title="泰山宫" showSearch={true} />

      <div className="h-screen overflow-y-auto scrollbar-hide">
        <div className="max-w-sm mx-auto px-3 xs:px-4 py-4 pt-16 xs:pt-20 pb-20 xs:pb-24">
          
          {/* 欢迎横幅 */}
          <Card className="mb-4 border-0 shadow-sm bg-gradient-to-r from-amber-100 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🏮</div>
                <div>
                  <h2 className="font-semibold text-amber-900">
                    欢迎回到泰山宫，{user.nickname || user.username}道友
                  </h2>
                  <p className="text-sm text-amber-600">愿您今日修行有所得</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 轮播图 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="relative h-40">
              <img
                src={`/imgs/${carouselImages[currentSlide].image}`}
                alt={carouselImages[currentSlide].title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // 如果图片加载失败，显示占位符（避免中文字符导致btoa编码错误）
                  const svgContent = `
                    <svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
                      <rect width="300" height="200" fill="#f3f4f6"/>
                      <text x="150" y="100" text-anchor="middle" fill="#6b7280" font-size="16">
                        Image Loading...
                      </text>
                    </svg>
                  `;
                  e.currentTarget.src = `data:image/svg+xml;base64,${btoa(svgContent)}`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <h3 className="font-semibold text-white">{carouselImages[currentSlide].title}</h3>
                <p className="text-sm text-white/90">{carouselImages[currentSlide].description}</p>
              </div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {carouselImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentSlide ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </Card>

          {/* 快捷操作 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="border-0 shadow-sm bg-white/80 backdrop-blur-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={action.action}
              >
                <CardContent className="p-3">
                  <div className={`${action.color} text-white rounded-lg p-2 mb-2 w-fit`}>
                    {action.icon}
                  </div>
                  <h3 className="font-medium text-amber-900 text-sm">{action.title}</h3>
                  <p className="text-xs text-amber-600">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 聊天室列表 */}
          {Array.isArray(chatRooms) && chatRooms.length > 0 && (
            <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-amber-900 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-amber-600" />
                  聊天室
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {chatRooms.slice(0, 3).map((room: any) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-50 cursor-pointer"
                    onClick={() => navigate(`/chat-enhanced?room=${room.id}`)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <Hash className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-amber-900 text-sm">{room.name}</h4>
                        <p className="text-xs text-amber-600">{room.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 最近活动 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-amber-600" />
                最近活动
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-50 cursor-pointer"
                  onClick={() => navigate(`/activity/${activity.type}`)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-amber-600">{activity.icon}</div>
                    <div>
                      <h4 className="font-medium text-amber-900 text-sm">{activity.title}</h4>
                      <p className="text-xs text-amber-600">{activity.participants}人参与 · {activity.time}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 精选文章 */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-amber-600" />
                精选文章
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {featuredArticles.map((article) => (
                <div
                  key={article.id}
                  className="cursor-pointer hover:bg-amber-50 p-2 rounded-lg"
                  onClick={() => navigate(`/article/${article.id}`)}
                >
                  <div className="flex space-x-3">
                    <div className="text-2xl">{article.image}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-amber-900 text-sm mb-1">{article.title}</h3>
                      <p className="text-xs text-amber-600 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                            {article.category}
                          </Badge>
                          <span className="text-xs text-amber-500">{article.readTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-amber-400 fill-current" />
                          <span className="text-xs text-amber-600">{article.popularity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}