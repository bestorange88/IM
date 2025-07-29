"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Header from "@/components/common/Header"
import BottomNavigation from "@/components/BottomNavigation"
import { 
  ArrowLeft, 
  Shield, 
  Eye, 
  EyeOff, 
  Users, 
  MessageSquare,
  UserCheck,
  Lock,
  Globe,
  Search
} from "lucide-react"
import { useLocation } from "wouter"

export default function PrivacyPage() {
  const { user, isLoading } = useAuth()
  const [, navigate] = useLocation()
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public", // public, friends, private
    onlineStatus: true,
    lastSeen: true,
    readReceipts: true,
    typingIndicator: true,
    profilePhoto: "everyone", // everyone, contacts, nobody
    phoneNumber: "contacts", // everyone, contacts, nobody
    email: "nobody",
    allowFriendRequests: true,
    allowGroupInvites: "contacts",
    allowSearchByUsername: true,
    allowSearchByPhone: false,
    blockList: [],
    dataCollection: {
      analytics: true,
      personalization: true,
      advertising: false
    }
  })

  const handleSettingChange = (key: string, value: any) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleDataSettingChange = (key: string, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      dataCollection: {
        ...prev.dataCollection,
        [key]: value
      }
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-amber-600">正在加载隐私设置...</p>
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
      <Header title="隐私设置" />

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

          {/* 资料可见性 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                资料可见性
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-amber-800">个人资料</Label>
                <div className="flex space-x-2 mt-2">
                  {[
                    { value: "public", label: "所有人" },
                    { value: "friends", label: "道友" },
                    { value: "private", label: "仅自己" }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={privacySettings.profileVisibility === option.value ? "default" : "outline"}
                      size="sm"
                      className={privacySettings.profileVisibility === option.value ? "bg-amber-500 text-white" : "text-amber-700 border-amber-200"}
                      onClick={() => handleSettingChange("profileVisibility", option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-amber-800">头像可见性</Label>
                <div className="flex space-x-2 mt-2">
                  {[
                    { value: "everyone", label: "所有人" },
                    { value: "contacts", label: "联系人" },
                    { value: "nobody", label: "无人" }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={privacySettings.profilePhoto === option.value ? "default" : "outline"}
                      size="sm"
                      className={privacySettings.profilePhoto === option.value ? "bg-amber-500 text-white" : "text-amber-700 border-amber-200"}
                      onClick={() => handleSettingChange("profilePhoto", option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 在线状态 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <UserCheck className="w-5 h-5 mr-2" />
                在线状态
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">显示在线状态</Label>
                  <p className="text-sm text-amber-600">让道友看到您是否在线</p>
                </div>
                <Switch
                  checked={privacySettings.onlineStatus}
                  onCheckedChange={(checked) => handleSettingChange("onlineStatus", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">最后在线时间</Label>
                  <p className="text-sm text-amber-600">显示最后活跃时间</p>
                </div>
                <Switch
                  checked={privacySettings.lastSeen}
                  onCheckedChange={(checked) => handleSettingChange("lastSeen", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 消息隐私 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                消息隐私
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">已读回执</Label>
                  <p className="text-sm text-amber-600">让发送者知道您已读消息</p>
                </div>
                <Switch
                  checked={privacySettings.readReceipts}
                  onCheckedChange={(checked) => handleSettingChange("readReceipts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">输入提示</Label>
                  <p className="text-sm text-amber-600">显示正在输入状态</p>
                </div>
                <Switch
                  checked={privacySettings.typingIndicator}
                  onCheckedChange={(checked) => handleSettingChange("typingIndicator", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 联系方式隐私 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                联系方式隐私
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-amber-800">手机号可见性</Label>
                <div className="flex space-x-2 mt-2">
                  {[
                    { value: "everyone", label: "所有人" },
                    { value: "contacts", label: "联系人" },
                    { value: "nobody", label: "无人" }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={privacySettings.phoneNumber === option.value ? "default" : "outline"}
                      size="sm"
                      className={privacySettings.phoneNumber === option.value ? "bg-amber-500 text-white" : "text-amber-700 border-amber-200"}
                      onClick={() => handleSettingChange("phoneNumber", option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-amber-800">邮箱可见性</Label>
                <div className="flex space-x-2 mt-2">
                  {[
                    { value: "everyone", label: "所有人" },
                    { value: "contacts", label: "联系人" },
                    { value: "nobody", label: "无人" }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={privacySettings.email === option.value ? "default" : "outline"}
                      size="sm"
                      className={privacySettings.email === option.value ? "bg-amber-500 text-white" : "text-amber-700 border-amber-200"}
                      onClick={() => handleSettingChange("email", option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 社交互动 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                社交互动
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">允许好友请求</Label>
                  <p className="text-sm text-amber-600">其他用户可以添加您为道友</p>
                </div>
                <Switch
                  checked={privacySettings.allowFriendRequests}
                  onCheckedChange={(checked) => handleSettingChange("allowFriendRequests", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">用户名搜索</Label>
                  <p className="text-sm text-amber-600">允许通过用户名找到您</p>
                </div>
                <Switch
                  checked={privacySettings.allowSearchByUsername}
                  onCheckedChange={(checked) => handleSettingChange("allowSearchByUsername", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">手机号搜索</Label>
                  <p className="text-sm text-amber-600">允许通过手机号找到您</p>
                </div>
                <Switch
                  checked={privacySettings.allowSearchByPhone}
                  onCheckedChange={(checked) => handleSettingChange("allowSearchByPhone", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 数据使用 */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                数据使用
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">数据分析</Label>
                  <p className="text-sm text-amber-600">帮助改善应用体验</p>
                </div>
                <Switch
                  checked={privacySettings.dataCollection.analytics}
                  onCheckedChange={(checked) => handleDataSettingChange("analytics", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">个性化推荐</Label>
                  <p className="text-sm text-amber-600">基于使用习惯推荐内容</p>
                </div>
                <Switch
                  checked={privacySettings.dataCollection.personalization}
                  onCheckedChange={(checked) => handleDataSettingChange("personalization", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">广告个性化</Label>
                  <p className="text-sm text-amber-600">根据兴趣显示相关广告</p>
                </div>
                <Switch
                  checked={privacySettings.dataCollection.advertising}
                  onCheckedChange={(checked) => handleDataSettingChange("advertising", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}