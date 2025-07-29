"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/common/Header"
import BottomNavigation from "@/components/BottomNavigation"
import { 
  ArrowLeft, 
  Bell, 
  MessageCircle, 
  Users, 
  Calendar,
  Volume2,
  VolumeX,
  Smartphone,
  Moon,
  Clock
} from "lucide-react"
import { useLocation } from "wouter"

interface NotificationItem {
  id: string
  type: 'message' | 'activity' | 'system' | 'friend'
  title: string
  content: string
  time: string
  read: boolean
  avatar?: string
}

export default function NotificationsPage() {
  const { user, isLoading } = useAuth()
  const [, navigate] = useLocation()
  
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
    doNotDisturb: false,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00"
    },
    categories: {
      messages: true,
      activities: true,
      friendRequests: true,
      systemUpdates: false,
      marketing: false
    }
  })

  const [notifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'message',
      title: '悟道居士',
      content: '在道德经研习中提到了您',
      time: '5分钟前',
      read: false,
      avatar: '🧙‍♂️'
    },
    {
      id: '2',
      type: 'activity',
      title: '晨课共修',
      content: '明日晨课共修即将开始，请准时参加',
      time: '1小时前',
      read: false,
      avatar: '🌅'
    },
    {
      id: '3',
      type: 'friend',
      title: '新道友请求',
      content: '静心道友想要添加您为道友',
      time: '2小时前',
      read: true,
      avatar: '👤'
    },
    {
      id: '4',
      type: 'system',
      title: '系统通知',
      content: '您的功德积分已达到1000分，恭喜晋级！',
      time: '昨天',
      read: true,
      avatar: '⭐'
    }
  ])

  const handleSettingChange = (key: string, value: any) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleCategoryChange = (category: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: value
      }
    }))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageCircle className="w-4 h-4" />
      case 'activity': return <Calendar className="w-4 h-4" />
      case 'friend': return <Users className="w-4 h-4" />
      case 'system': return <Bell className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message': return 'text-blue-600'
      case 'activity': return 'text-green-600'
      case 'friend': return 'text-purple-600'
      case 'system': return 'text-amber-600'
      default: return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Bell className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-amber-600">正在加载消息通知...</p>
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
      <Header title="消息通知" />

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

          {/* 通知设置 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                通知设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">推送通知</Label>
                  <p className="text-sm text-amber-600">接收应用推送通知</p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {notificationSettings.soundEnabled ? 
                    <Volume2 className="w-4 h-4 text-amber-600" /> : 
                    <VolumeX className="w-4 h-4 text-amber-600" />
                  }
                  <div>
                    <Label className="text-amber-800">声音提醒</Label>
                    <p className="text-sm text-amber-600">播放通知声音</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.soundEnabled}
                  onCheckedChange={(checked) => handleSettingChange("soundEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  <div>
                    <Label className="text-amber-800">震动提醒</Label>
                    <p className="text-sm text-amber-600">设备震动提醒</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.vibrationEnabled}
                  onCheckedChange={(checked) => handleSettingChange("vibrationEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Moon className="w-4 h-4 text-amber-600" />
                  <div>
                    <Label className="text-amber-800">勿扰模式</Label>
                    <p className="text-sm text-amber-600">暂停所有通知</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.doNotDisturb}
                  onCheckedChange={(checked) => handleSettingChange("doNotDisturb", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 安静时间 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                安静时间
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">启用安静时间</Label>
                  <p className="text-sm text-amber-600">在指定时间段内静音通知</p>
                </div>
                <Switch
                  checked={notificationSettings.quietHours.enabled}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, enabled: checked }
                    }))
                  }
                />
              </div>

              {notificationSettings.quietHours.enabled && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Label className="text-amber-800 min-w-[60px]">开始时间</Label>
                    <input
                      type="time"
                      value={notificationSettings.quietHours.start}
                      onChange={(e) => 
                        setNotificationSettings(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, start: e.target.value }
                        }))
                      }
                      className="px-3 py-2 border border-amber-200 rounded-lg text-amber-900"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <Label className="text-amber-800 min-w-[60px]">结束时间</Label>
                    <input
                      type="time"
                      value={notificationSettings.quietHours.end}
                      onChange={(e) => 
                        setNotificationSettings(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, end: e.target.value }
                        }))
                      }
                      className="px-3 py-2 border border-amber-200 rounded-lg text-amber-900"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 通知类别 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900">通知类别</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">消息通知</Label>
                  <p className="text-sm text-amber-600">新消息和@提醒</p>
                </div>
                <Switch
                  checked={notificationSettings.categories.messages}
                  onCheckedChange={(checked) => handleCategoryChange("messages", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">活动通知</Label>
                  <p className="text-sm text-amber-600">修行活动和共修提醒</p>
                </div>
                <Switch
                  checked={notificationSettings.categories.activities}
                  onCheckedChange={(checked) => handleCategoryChange("activities", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">好友请求</Label>
                  <p className="text-sm text-amber-600">新的道友申请</p>
                </div>
                <Switch
                  checked={notificationSettings.categories.friendRequests}
                  onCheckedChange={(checked) => handleCategoryChange("friendRequests", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">系统更新</Label>
                  <p className="text-sm text-amber-600">应用更新和维护通知</p>
                </div>
                <Switch
                  checked={notificationSettings.categories.systemUpdates}
                  onCheckedChange={(checked) => handleCategoryChange("systemUpdates", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 最近通知 */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900">最近通知</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer hover:bg-amber-50 ${
                    !notification.read ? 'bg-amber-25 border-l-4 border-amber-400' : ''
                  }`}
                  onClick={() => console.log("查看通知", notification.id)}
                >
                  <div className="text-xl">{notification.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-amber-900 text-sm">{notification.title}</span>
                      <div className={getNotificationColor(notification.type)}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      {!notification.read && (
                        <Badge className="bg-red-500 text-white text-xs px-1 py-0 h-4">新</Badge>
                      )}
                    </div>
                    <p className="text-sm text-amber-700 mb-1">{notification.content}</p>
                    <p className="text-xs text-amber-500">{notification.time}</p>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="ghost" 
                className="w-full text-amber-600"
                onClick={() => console.log("查看全部通知")}
              >
                查看全部通知
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}