"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Header from "@/components/common/Header"
import BottomNavigation from "@/components/BottomNavigation"
import { 
  ArrowLeft, 
  Award, 
  Star, 
  Crown, 
  Shield, 
  Heart,
  Flame,
  BookOpen,
  Users,
  Calendar,
  Trophy,
  Lock
} from "lucide-react"
import { useLocation } from "wouter"

interface BadgeItem {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: string
  earned: boolean
  earnedDate?: string
  progress?: number
  maxProgress?: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export default function BadgesPage() {
  const { user, isLoading } = useAuth()
  const [, navigate] = useLocation()
  const [selectedCategory, setSelectedCategory] = useState("all")

  const badgeCategories = [
    { id: "all", name: "全部", icon: Award },
    { id: "practice", name: "修行", icon: BookOpen },
    { id: "social", name: "社交", icon: Users },
    { id: "achievement", name: "成就", icon: Trophy },
    { id: "special", name: "特殊", icon: Crown }
  ]

  const badges: BadgeItem[] = [
    {
      id: '1',
      name: '初入道门',
      description: '完成注册并首次登录泰山宫',
      icon: '🚪',
      color: 'bg-green-500',
      category: 'achievement',
      earned: true,
      earnedDate: '2025-01-15',
      rarity: 'common'
    },
    {
      id: '2',
      name: '晨课达人',
      description: '连续参与晨课共修7天',
      icon: '🌅',
      color: 'bg-amber-500',
      category: 'practice',
      earned: true,
      earnedDate: '2025-01-20',
      rarity: 'rare'
    },
    {
      id: '3',
      name: '道友满堂',
      description: '添加10位道友',
      icon: '👥',
      color: 'bg-blue-500',
      category: 'social',
      earned: true,
      earnedDate: '2025-01-22',
      progress: 10,
      maxProgress: 10,
      rarity: 'common'
    },
    {
      id: '4',
      name: '学者之心',
      description: '阅读完成20篇道教文章',
      icon: '📚',
      color: 'bg-purple-500',
      category: 'practice',
      earned: false,
      progress: 15,
      maxProgress: 20,
      rarity: 'rare'
    },
    {
      id: '5',
      name: '功德圆满',
      description: '功德积分达到5000分',
      icon: '⭐',
      color: 'bg-yellow-500',
      category: 'achievement',
      earned: false,
      progress: 1250,
      maxProgress: 5000,
      rarity: 'epic'
    },
    {
      id: '6',
      name: '传道授业',
      description: '帮助5位新道友完成入门指导',
      icon: '🎓',
      color: 'bg-indigo-500',
      category: 'social',
      earned: false,
      progress: 2,
      maxProgress: 5,
      rarity: 'epic'
    },
    {
      id: '7',
      name: '道行深远',
      description: '修行天数达到100天',
      icon: '🏔️',
      color: 'bg-gray-600',
      category: 'practice',
      earned: false,
      progress: 87,
      maxProgress: 100,
      rarity: 'epic'
    },
    {
      id: '8',
      name: '泰山真人',
      description: '获得泰山宫最高荣誉称号',
      icon: '👑',
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      category: 'special',
      earned: false,
      progress: 0,
      maxProgress: 1,
      rarity: 'legendary'
    }
  ]

  const filteredBadges = badges.filter(badge => 
    selectedCategory === 'all' || badge.category === selectedCategory
  )

  const earnedBadges = badges.filter(badge => badge.earned)
  const totalBadges = badges.length

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100'
      case 'rare': return 'text-blue-600 bg-blue-100'
      case 'epic': return 'text-purple-600 bg-purple-100'
      case 'legendary': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'common': return '普通'
      case 'rare': return '稀有'
      case 'epic': return '史诗'
      case 'legendary': return '传说'
      default: return '普通'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Award className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-amber-600">正在加载成就徽章...</p>
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
      <Header title="成就徽章" />

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

          {/* 徽章统计 */}
          <Card className="mb-4 border-0 shadow-sm bg-gradient-to-r from-amber-400 to-orange-400 text-white">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <h2 className="text-2xl font-bold mb-2">
                  {earnedBadges.length}/{totalBadges}
                </h2>
                <p className="text-amber-100">已获得徽章</p>
              </div>
              
              <div className="mt-4">
                <Progress 
                  value={(earnedBadges.length / totalBadges) * 100} 
                  className="h-2 bg-amber-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* 分类选择 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-5 gap-2">
                {badgeCategories.map((category) => (
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

          {/* 徽章列表 */}
          <div className="space-y-3">
            {filteredBadges.map((badge) => (
              <Card 
                key={badge.id} 
                className={`border-0 shadow-sm backdrop-blur-sm transition-all duration-200 ${
                  badge.earned 
                    ? 'bg-white/90 ring-2 ring-amber-200' 
                    : 'bg-white/60 opacity-75'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* 徽章图标 */}
                    <div className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                      badge.earned ? badge.color : 'bg-gray-200'
                    }`}>
                      {badge.earned ? badge.icon : <Lock className="w-6 h-6 text-gray-400" />}
                      {badge.earned && (
                        <div className="absolute -top-1 -right-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        </div>
                      )}
                    </div>

                    {/* 徽章信息 */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-semibold ${badge.earned ? 'text-amber-900' : 'text-gray-500'}`}>
                          {badge.name}
                        </h3>
                        <Badge className={`text-xs ${getRarityColor(badge.rarity)}`}>
                          {getRarityName(badge.rarity)}
                        </Badge>
                      </div>
                      
                      <p className={`text-sm mb-3 ${badge.earned ? 'text-amber-700' : 'text-gray-500'}`}>
                        {badge.description}
                      </p>

                      {/* 进度条 */}
                      {badge.maxProgress && !badge.earned && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-amber-600 mb-1">
                            <span>进度</span>
                            <span>{badge.progress}/{badge.maxProgress}</span>
                          </div>
                          <Progress 
                            value={(badge.progress! / badge.maxProgress) * 100} 
                            className="h-2"
                          />
                        </div>
                      )}

                      {/* 获得时间 */}
                      {badge.earned && badge.earnedDate && (
                        <div className="flex items-center space-x-1 text-xs text-amber-500">
                          <Calendar className="w-3 h-3" />
                          <span>获得于 {badge.earnedDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBadges.length === 0 && (
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Award className="w-12 h-12 text-amber-300 mx-auto mb-4" />
                <p className="text-amber-600">该分类下暂无徽章</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}