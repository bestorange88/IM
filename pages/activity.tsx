"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Header from "@/components/common/Header"
import BottomNavigation from "@/components/BottomNavigation"
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  MapPin, 
  BookOpen, 
  Wind, 
  Heart,
  MessageCircle,
  Share2,
  Star
} from "lucide-react"
import { useLocation } from "wouter"

interface ActivityDetail {
  id: string
  type: string
  title: string
  description: string
  longDescription: string
  participants: number
  maxParticipants?: number
  time: string
  location: string
  organizer: string
  tags: string[]
  status: 'upcoming' | 'ongoing' | 'completed'
  participants_list: Array<{
    id: string
    name: string
    avatar?: string
    joinTime: string
  }>
  discussions: Array<{
    id: string
    user: string
    content: string
    time: string
    likes: number
  }>
}

export default function ActivityPage() {
  const { user, isLoading } = useAuth()
  const [location, navigate] = useLocation()
  const [activity, setActivity] = useState<ActivityDetail | null>(null)
  
  // 从URL获取活动类型
  const activityType = location.split('/')[2] || 'discussion'

  // 模拟活动数据
  const activityData: Record<string, ActivityDetail> = {
    discussion: {
      id: '1',
      type: 'discussion',
      title: '道德经研习讨论',
      description: '深入探讨道德经第一章的核心思想',
      longDescription: `
        本次研习将围绕道德经第一章"道可道，非常道；名可名，非常名"展开深入讨论。
        我们将从以下几个方面进行探讨：
        
        1. "道"的本质与特征
        2. 语言与真理的关系
        3. 认知局限性的哲学思考
        4. 修行实践中的体悟
        
        欢迎各位道友分享自己的理解和修行心得。
      `,
      participants: 24,
      maxParticipants: 50,
      time: '今日 19:00-21:00',
      location: '道德经研习堂',
      organizer: '张教天师',
      tags: ['经典研习', '道德经', '哲学讨论'],
      status: 'ongoing',
      participants_list: [
        { id: '1', name: '李道友', joinTime: '18:55' },
        { id: '2', name: '王修士', joinTime: '18:58' },
        { id: '3', name: '陈居士', joinTime: '19:02' },
        { id: '4', name: '张法师', joinTime: '19:05' },
      ],
      discussions: [
        {
          id: '1',
          user: '李道友',
          content: '道之为物，惟恍惟惚。这句话让我深有感触，道确实是难以用言语完全表达的。',
          time: '19:15',
          likes: 8
        },
        {
          id: '2', 
          user: '王修士',
          content: '我觉得"道可道，非常道"是在提醒我们，任何用语言描述的道都不是永恒不变的道。',
          time: '19:18',
          likes: 12
        }
      ]
    },
    meditation: {
      id: '2',
      type: 'meditation',
      title: '晨课共修',
      description: '每日晨课集体修行，静心养性',
      longDescription: `
        晨课共修是泰山宫的传统修行活动，每日清晨进行。
        
        修行内容：
        1. 静坐调息（30分钟）
        2. 诵读道德经选段（15分钟）
        3. 太极拳练习（15分钟）
        4. 修行心得分享（10分钟）
        
        通过晨课共修，道友们可以：
        - 净化心灵，开启美好一天
        - 与同修道友互相激励
        - 在集体氛围中加深修行体验
      `,
      participants: 18,
      maxParticipants: 30,
      time: '每日 06:00-07:00',
      location: '修行殿',
      organizer: '泰山真人',
      tags: ['晨课', '共修', '静坐', '太极'],
      status: 'upcoming',
      participants_list: [
        { id: '1', name: '迎客道人', joinTime: '固定参与' },
        { id: '2', name: '清风道士', joinTime: '固定参与' },
        { id: '3', name: '明月居士', joinTime: '固定参与' },
      ],
      discussions: [
        {
          id: '1',
          user: '清风道士',
          content: '晨课共修让我每天都充满正能量，建议新道友也来参加。',
          time: '昨日',
          likes: 15
        }
      ]
    },
    sharing: {
      id: '3',
      type: 'sharing',
      title: '修行心得分享',
      description: '道友们交流修行体验与感悟',
      longDescription: `
        修行心得分享是道友们互相学习、共同进步的重要平台。
        
        分享主题包括：
        1. 日常修行的体验与感悟
        2. 经典学习的心得体会
        3. 修行过程中遇到的问题与解决方法
        4. 生活中的道法实践
        
        通过真诚的分享与交流，我们可以：
        - 从他人经验中获得启发
        - 解决修行中的困惑
        - 建立深厚的道友情谊
        - 共同提升修行境界
      `,
      participants: 31,
      time: '每周三 20:00-22:00',
      location: '交流厅',
      organizer: '迎客道人',
      tags: ['心得分享', '交流讨论', '修行体验'],
      status: 'completed',
      participants_list: [
        { id: '1', name: '悟道居士', joinTime: '19:55' },
        { id: '2', name: '静心道友', joinTime: '20:01' },
        { id: '3', name: '慈悲法师', joinTime: '20:03' },
      ],
      discussions: [
        {
          id: '1',
          user: '悟道居士',
          content: '最近在修行中有了新的体悟，关于"无为而治"的理解更加深刻了。',
          time: '20:30',
          likes: 20
        },
        {
          id: '2',
          user: '静心道友', 
          content: '感谢各位道友的分享，让我对修行有了更全面的认识。',
          time: '21:45',
          likes: 18
        }
      ]
    }
  }

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/")
      return
    }
    
    const selectedActivity = activityData[activityType]
    if (selectedActivity) {
      setActivity(selectedActivity)
    }
  }, [activityType, user, isLoading, navigate])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700'
      case 'ongoing': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return '即将开始'
      case 'ongoing': return '进行中'
      case 'completed': return '已结束'
      default: return '未知状态'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'discussion': return <BookOpen className="w-5 h-5" />
      case 'meditation': return <Wind className="w-5 h-5" />
      case 'sharing': return <Heart className="w-5 h-5" />
      default: return <MessageCircle className="w-5 h-5" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BookOpen className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-amber-600">正在加载活动详情...</p>
        </div>
      </div>
    )
  }

  if (!user || !activity) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Header title={activity.title} />

      <div className="h-screen overflow-y-auto scrollbar-hide">
        <div className="max-w-sm mx-auto px-4 py-4 pt-16 pb-20">
          
          {/* 返回按钮 */}
          <Button 
            variant="ghost" 
            className="mb-4 text-amber-700 hover:bg-amber-100"
            onClick={() => navigate("/dao")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回道页面
          </Button>

          {/* 活动头部信息 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-amber-600">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg text-amber-900">{activity.title}</CardTitle>
                    <p className="text-sm text-amber-600">{activity.description}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(activity.status)}>
                  {getStatusText(activity.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-4 text-sm text-amber-700">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{activity.participants}{activity.maxParticipants ? `/${activity.maxParticipants}` : ''}人</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{activity.time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{activity.location}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {activity.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-amber-100 text-amber-700">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-amber-600">主办：{activity.organizer}</span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="text-amber-700 border-amber-200">
                    <Share2 className="w-4 h-4 mr-1" />
                    分享
                  </Button>
                  {activity.status === 'upcoming' && (
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                      报名参加
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 活动详细描述 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900">活动详情</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-amber-800 whitespace-pre-line leading-relaxed">
                {activity.longDescription}
              </div>
            </CardContent>
          </Card>

          {/* 参与者列表 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                参与道友 ({activity.participants}人)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activity.participants_list.slice(0, 6).map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-amber-500 text-white text-xs">
                        {participant.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-amber-900 text-sm">{participant.name}</p>
                      <p className="text-xs text-amber-600">加入时间：{participant.joinTime}</p>
                    </div>
                  </div>
                ))}
                {activity.participants > 6 && (
                  <div className="text-center">
                    <Button variant="ghost" size="sm" className="text-amber-600">
                      查看更多参与者
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 讨论区 */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                讨论交流
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity.discussions.map((discussion) => (
                  <div key={discussion.id} className="bg-amber-50 rounded-lg p-3">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-amber-500 text-white text-xs">
                          {discussion.user[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-amber-900 text-sm">{discussion.user}</span>
                          <span className="text-xs text-amber-600">{discussion.time}</span>
                        </div>
                        <p className="text-sm text-amber-800 mb-2">{discussion.content}</p>
                        <div className="flex items-center space-x-4">
                          <Button variant="ghost" size="sm" className="text-amber-600 h-auto p-0">
                            <Star className="w-4 h-4 mr-1" />
                            点赞 {discussion.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-amber-600 h-auto p-0">
                            回复
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="text-center">
                  <Button variant="outline" className="text-amber-700 border-amber-200">
                    发表讨论
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}