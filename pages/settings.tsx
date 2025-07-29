"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import Header from "@/components/common/Header"
import BottomNavigation from "@/components/BottomNavigation"
import { 
  ArrowLeft, 
  User, 
  Camera, 
  Save,
  Bell,
  Lock,
  Palette,
  Globe
} from "lucide-react"
import { useLocation } from "wouter"

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const [, navigate] = useLocation()
  
  // 表单状态
  const [formData, setFormData] = useState({
    nickname: user?.nickname || "",
    email: user?.email || "",
    bio: "修行路上，与道同行",
    location: "泰山宫",
    website: ""
  })

  // 设置状态
  const [settings, setSettings] = useState({
    notifications: {
      messages: true,
      activities: true,
      mentions: true,
      emails: false
    },
    privacy: {
      profileVisible: true,
      onlineStatus: true,
      readReceipts: true
    },
    appearance: {
      darkMode: false,
      fontSize: "medium",
      language: "zh-CN"
    }
  })

  const handleSave = () => {
    // TODO: 保存用户信息到后端
    console.log("保存用户信息:", formData)
    console.log("保存设置:", settings)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSettingChange = (category: string, field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value
      }
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-amber-600">正在加载设置...</p>
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
      <Header title="编辑资料" />

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

          {/* 头像编辑 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900">头像设置</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-amber-500 text-white text-2xl">
                    {user.nickname?.[0] || user.username[0]}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full bg-white border-amber-200"
                >
                  <Camera className="w-4 h-4 text-amber-600" />
                </Button>
              </div>
              <p className="text-sm text-amber-600 text-center">点击更换头像</p>
            </CardContent>
          </Card>

          {/* 基本信息 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900">基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nickname" className="text-amber-800">昵称</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange("nickname", e.target.value)}
                  className="mt-1 border-amber-200 focus:border-amber-400"
                  placeholder="请输入昵称"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-amber-800">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="mt-1 border-amber-200 focus:border-amber-400"
                  placeholder="请输入邮箱"
                />
              </div>

              <div>
                <Label htmlFor="bio" className="text-amber-800">个人简介</Label>
                <Input
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="mt-1 border-amber-200 focus:border-amber-400"
                  placeholder="介绍一下自己..."
                />
              </div>

              <div>
                <Label htmlFor="location" className="text-amber-800">所在地</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="mt-1 border-amber-200 focus:border-amber-400"
                  placeholder="请输入所在地"
                />
              </div>
            </CardContent>
          </Card>

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
                  <Label className="text-amber-800">消息通知</Label>
                  <p className="text-sm text-amber-600">接收新消息时的通知</p>
                </div>
                <Switch
                  checked={settings.notifications.messages}
                  onCheckedChange={(checked) => handleSettingChange("notifications", "messages", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">活动通知</Label>
                  <p className="text-sm text-amber-600">接收活动相关的通知</p>
                </div>
                <Switch
                  checked={settings.notifications.activities}
                  onCheckedChange={(checked) => handleSettingChange("notifications", "activities", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">提及通知</Label>
                  <p className="text-sm text-amber-600">被@时的通知</p>
                </div>
                <Switch
                  checked={settings.notifications.mentions}
                  onCheckedChange={(checked) => handleSettingChange("notifications", "mentions", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 隐私设置 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                隐私设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">个人资料可见</Label>
                  <p className="text-sm text-amber-600">允许其他道友查看资料</p>
                </div>
                <Switch
                  checked={settings.privacy.profileVisible}
                  onCheckedChange={(checked) => handleSettingChange("privacy", "profileVisible", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">在线状态</Label>
                  <p className="text-sm text-amber-600">显示在线状态</p>
                </div>
                <Switch
                  checked={settings.privacy.onlineStatus}
                  onCheckedChange={(checked) => handleSettingChange("privacy", "onlineStatus", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">已读回执</Label>
                  <p className="text-sm text-amber-600">发送消息已读状态</p>
                </div>
                <Switch
                  checked={settings.privacy.readReceipts}
                  onCheckedChange={(checked) => handleSettingChange("privacy", "readReceipts", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 外观设置 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                外观设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">深色模式</Label>
                  <p className="text-sm text-amber-600">启用深色主题</p>
                </div>
                <Switch
                  checked={settings.appearance.darkMode}
                  onCheckedChange={(checked) => handleSettingChange("appearance", "darkMode", checked)}
                />
              </div>

              <div>
                <Label className="text-amber-800">字体大小</Label>
                <div className="flex space-x-2 mt-2">
                  {["small", "medium", "large"].map((size) => (
                    <Button
                      key={size}
                      variant={settings.appearance.fontSize === size ? "default" : "outline"}
                      size="sm"
                      className={settings.appearance.fontSize === size ? "bg-amber-500 text-white" : "text-amber-700 border-amber-200"}
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        appearance: { ...prev.appearance, fontSize: size }
                      }))}
                    >
                      {size === "small" ? "小" : size === "medium" ? "中" : "大"}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 保存按钮 */}
          <div className="sticky bottom-20 pt-4">
            <Button 
              onClick={handleSave}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              保存设置
            </Button>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}