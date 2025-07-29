"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/common/Header"
import BottomNavigation from "@/components/BottomNavigation"
import { 
  ArrowLeft, 
  Activity, 
  Calendar, 
  BookOpen, 
  MessageCircle,
  Users,
  Award,
  TrendingUp,
  Clock,
  Eye,
  Heart,
  Star
} from "lucide-react"
import { useLocation } from "wouter"

interface Record {
  id: string
  type: 'practice' | 'social' | 'study' | 'achievement'
  title: string
  description: string
  date: string
  points?: number
  duration?: string
  participants?: number
}

interface Stats {
  totalDays: number
  practiceHours: number
  articlesRead: number
  friendsAdded: number
  achievementsEarned: number
  meritPoints: number
}

export default function RecordsPage() {
  const { user, isLoading } = useAuth()
  const [, navigate] = useLocation()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  const recordCategories = [
    { id: "all", name: "全部", icon: Activity },
    { id: "practice", name: "修行", icon: BookOpen },
    { id: "social", name: "社交", icon: Users },
    { id: "study", name: "学习", icon: Eye },
    { id: "achievement", name: "成就", icon: Award }
  ]

  const timePeriods = [
    { id: "week", name: "本周" },
    { id: "month", name: "本月" },
    { id: "year", name: "本年" },
    { id: "all", name: "全部" }
  ]

  const stats: Stats = {
    totalDays: 87,
    practiceHours: 156,
    articlesRead: 45,
    friendsAdded: 23,
    achievementsEarned: 8,
    meritPoints: 2568
  }

  const records: Record[] = [
    {
      id: '1',
      type: 'practice',
      title: '完成晨课共修',
      description: '参与今日晨课共修，进行静坐和经典诵读',
      date: '今天 06:30',
      points: 50,
      duration: '60分钟'
    },
    {
      id: '2',
      type: 'study',
      title: '阅读道德经文章',
      description: '深度研读《道德经第一章：道可道，非常道》',
      date: '今天 14:20',
      points: 30,
      duration: '15分钟'
    },
    {
      id: '3',
      type: 'social',
      title: '参与讨论活动',
      description: '在道德经研习讨论中发表见解',
      date: '昨天 19:45',
      points: 40,
      participants: 24
    },
    {
      id: '4',
      type: 'achievement',
      title: '获得新徽章',
      description: '达成"晨课达人"成就，连续参与晨课7天',
      date: '昨天 06:30',
      points: 200
    },
    {
      id: '5',
      type: 'social',
      title: '添加新道友',
      description: '与静心道友建立联系',
      date: '2天前 16:15',
      points: 20
    },
    {
      id: '6',
      type: 'practice',
      title: '修行心得分享',
      description: '在修行心得分享会中发表感悟',
      date: '3天前 20:30',
      points: 60,
      duration: '120分钟',
      participants: 31
    },
    {
      id: '7',
      type: 'study',
      title: '完成文章评论',
      description: '对《内丹修炼入门指导》发表深度评论',
      date: '4天前 11:20',
      points: 25
    },
    {
      id: '8',
      type: 'practice',
      title: '太极拳练习',
      description: '完成太极拳晨练',
      date: '5天前 07:00',
      points: 35,
      duration: '45分钟'
    }
  ]

  const filteredRecords = records.filter(record => 
    selectedCategory === 'all' || record.type === selectedCategory
  )

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'practice': return <BookOpen className="w-4 h-4" />
      case 'social': return <Users className="w-4 h-4" />
      case 'study': return <Eye className="w-4 h-4" />
      case 'achievement': return <Award className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getRecordColor = (type: string) => {
    switch (type) {
      case 'practice': return 'text-green-600 bg-green-100'
      case 'social': return 'text-blue-600 bg-blue-100'
      case 'study': return 'text-purple-600 bg-purple-100'
      case 'achievement': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'practice': return '修行'
      case 'social': return '社交'
      case 'study': return '学习'
      case 'achievement': return '成就'
      default: return '其他'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Activity className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-amber-600">正在加载修行记录...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    navigate("/")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Header title="修行记录" />

      <div className="h-screen overflow-y-auto scrollbar-hide">
        <div className="max-w-sm mx-auto px-4 py-4 pt-16 pb-20">
          
          {/* 返回按钮 */}
          <Button 
            variant="ghost" 
            className="mb-4 text-amber-700 hover:bg-amber-100"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回个人中心
          </Button>

          {/* 统计概览 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                修行统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{stats.totalDays}</div>
                  <div className="text-sm text-amber-800">修行天数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.practiceHours}</div>
                  <div className="text-sm text-amber-800">修行小时</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.articlesRead}</div>
                  <div className="text-sm text-amber-800">文章阅读</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.friendsAdded}</div>
                  <div className="text-sm text-amber-800">道友数量</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 时间筛选 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex space-x-2">
                {timePeriods.map((period) => (
                  <Button
                    key={period.id}
                    variant={selectedPeriod === period.id ? "default" : "outline"}
                    size="sm"
                    className={selectedPeriod === period.id ? "bg-amber-500 text-white" : "text-amber-700 border-amber-200"}
                    onClick={() => setSelectedPeriod(period.id)}
                  >
                    {period.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 类别筛选 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-5 gap-2">
                {recordCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    className={`flex flex-col h-auto py-3 ${
                      selectedCategory === category.id 
                        ? "bg-amber-500 text-white" 
                        : "text-amber-700 border-amber-200"
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <category.icon className="w-4 h-4 mb-1" />
                    <span className="text-xs">{category.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 记录列表 */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                修行记录
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <div 
                    key={record.id} 
                    className="p-4 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getRecordColor(record.type)}`}>
                        {getRecordIcon(record.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-amber-900 text-sm">{record.title}</h4>
                          <Badge className={`text-xs ${getRecordColor(record.type)}`}>
                            {getTypeName(record.type)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-amber-700 mb-2">{record.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-amber-600">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{record.date}</span>
                            </div>
                            {record.duration && (
                              <div className="flex items-center space-x-1">
                                <Activity className="w-3 h-3" />
                                <span>{record.duration}</span>
                              </div>
                            )}
                            {record.participants && (
                              <div className="flex items-center space-x-1">
                                <Users className="w-3 h-3" />
                                <span>{record.participants}人</span>
                              </div>
                            )}
                          </div>
                          
                          {record.points && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-amber-500" />
                              <span className="font-medium">+{record.points}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-amber-300 mx-auto mb-4" />
                  <p className="text-amber-600">该分类下暂无记录</p>
                  <p className="text-sm text-amber-500 mt-1">开始您的修行之旅吧</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}