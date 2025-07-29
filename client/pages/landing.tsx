"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Phone, Users, Shield, LogIn, UserPlus } from 'lucide-react'
import LoginForm from "@/components/auth/LoginForm"
import RegisterForm from "@/components/auth/RegisterForm"
import logoSvg from "@/imgs/logo.svg"

export default function Landing() {
  const [authView, setAuthView] = useState<"home" | "login" | "register">("home")

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("showLogin") === "true") {
      setAuthView("login")
    }

    // 自动跳转已登录用户
    const token = localStorage.getItem("auth_token")
    if (token) {
      window.location.href = "/dao"
    }
  }, [])

  const handleLogin = () => setAuthView("login")
  const handleRegister = () => setAuthView("register")
  const handleBack = () => setAuthView("home")

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 overflow-x-hidden">
      <div className="w-full max-w-full bg-transparent">
        <div className="flex flex-col items-center justify-between min-h-screen p-4 sm:p-6 py-8">

          {/* Logo 和标题 */}
          <div className={`text-center transition-all duration-500 ease-in-out ${
            authView === "home" ? "mb-4 sm:mb-6" : "mb-6 sm:mb-10"
          }`}>
            <div className="mx-auto mb-4 flex justify-center">
              <div className={`text-amber-800 flex items-center justify-center ${
                authView === "home" ? "w-32 h-16" : "w-28 h-14"
              }`}>
                <img src={logoSvg} alt="泰山宫logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <h1 className={`font-bold text-amber-800 mb-1 ${
              authView === "home" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
            }`}>
              泰山宫
            </h1>
            <p className="text-amber-600 text-base sm:text-lg">道法通天，慧心相通</p>
            <p className="text-amber-500 text-sm sm:text-base mt-1">道教文化主题即时通讯平台</p>
          </div>

          {/* 动态内容区域 */}
          <div className="w-full max-w-md">
            {authView === "login" && (
              <LoginForm onSwitchToRegister={handleRegister} onBack={handleBack} />
            )}
            {authView === "register" && (
              <RegisterForm onSwitchToLogin={handleLogin} onBack={handleBack} />
            )}
            {authView === "home" && (
              <div className="flex flex-col space-y-4 mt-4">
                <Button
                  onClick={handleLogin}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <LogIn className="mr-2 w-4 h-4" />
                  登录道观
                </Button>
                <Button
                  onClick={handleRegister}
                  variant="outline"
                  className="w-full border-amber-400 text-amber-700 hover:bg-amber-50"
                >
                  <UserPlus className="mr-2 w-4 h-4" />
                  注册入道
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}