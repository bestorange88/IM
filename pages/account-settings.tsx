"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import Header from "@/components/common/Header"
import BottomNavigation from "@/components/BottomNavigation"
import { 
  ArrowLeft, 
  User, 
  Lock, 
  Smartphone, 
  Mail, 
  Shield,
  Key,
  Trash2,
  AlertTriangle
} from "lucide-react"
import { useLocation } from "wouter"

export default function AccountSettingsPage() {
  const { user, isLoading } = useAuth()
  const [, navigate] = useLocation()
  
  const [settings, setSettings] = useState({
    twoFactor: false,
    loginNotifications: true,
    accountRecovery: true
  })

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  })

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      alert("新密码和确认密码不匹配")
      return
    }
    // TODO: 实现密码修改逻辑
    console.log("修改密码", passwords)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-amber-600">正在加载账户设置...</p>
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
      <Header title="账户设置" />

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

          {/* 账户信息 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                账户信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-amber-800">用户名</Label>
                <div className="mt-1 p-3 bg-gray-100 rounded-lg text-gray-600">
                  {user.username}
                </div>
                <p className="text-xs text-amber-600 mt-1">用户名不可修改</p>
              </div>
              
              <div>
                <Label className="text-amber-800">昵称</Label>
                <Input
                  value={user.nickname || ""}
                  className="mt-1 border-amber-200 focus:border-amber-400"
                  placeholder="请输入昵称"
                />
              </div>

              <div>
                <Label className="text-amber-800">邮箱</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    value={user.email || ""}
                    className="flex-1 border-amber-200 focus:border-amber-400"
                    placeholder="请输入邮箱地址"
                  />
                  <Button variant="outline" size="sm" className="border-amber-200 text-amber-700">
                    验证
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-amber-800">手机号</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    placeholder="请输入手机号"
                    className="flex-1 border-amber-200 focus:border-amber-400"
                  />
                  <Button variant="outline" size="sm" className="border-amber-200 text-amber-700">
                    绑定
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 密码安全 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                密码安全
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-amber-800">当前密码</Label>
                <Input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords(prev => ({...prev, current: e.target.value}))}
                  className="mt-1 border-amber-200 focus:border-amber-400"
                  placeholder="请输入当前密码"
                />
              </div>

              <div>
                <Label className="text-amber-800">新密码</Label>
                <Input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords(prev => ({...prev, new: e.target.value}))}
                  className="mt-1 border-amber-200 focus:border-amber-400"
                  placeholder="请输入新密码"
                />
              </div>

              <div>
                <Label className="text-amber-800">确认新密码</Label>
                <Input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(prev => ({...prev, confirm: e.target.value}))}
                  className="mt-1 border-amber-200 focus:border-amber-400"
                  placeholder="请再次输入新密码"
                />
              </div>

              <Button 
                onClick={handlePasswordChange}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                修改密码
              </Button>
            </CardContent>
          </Card>

          {/* 安全设置 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                安全设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">两步验证</Label>
                  <p className="text-sm text-amber-600">为账户添加额外安全保护</p>
                </div>
                <Switch
                  checked={settings.twoFactor}
                  onCheckedChange={(checked) => setSettings(prev => ({...prev, twoFactor: checked}))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">登录通知</Label>
                  <p className="text-sm text-amber-600">新设备登录时发送通知</p>
                </div>
                <Switch
                  checked={settings.loginNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({...prev, loginNotifications: checked}))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-amber-800">账户恢复</Label>
                  <p className="text-sm text-amber-600">允许通过邮箱恢复账户</p>
                </div>
                <Switch
                  checked={settings.accountRecovery}
                  onCheckedChange={(checked) => setSettings(prev => ({...prev, accountRecovery: checked}))}
                />
              </div>
            </CardContent>
          </Card>

          {/* 危险操作 */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm border-red-200">
            <CardHeader>
              <CardTitle className="text-lg text-red-700 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                危险操作
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => console.log("注销账户")}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                注销账户
              </Button>
              <p className="text-xs text-red-600">
                注销后将无法恢复账户数据，请谨慎操作
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}