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
  Wallet, 
  TrendingUp, 
  Gift, 
  History, 
  Plus,
  Minus,
  Star,
  Heart,
  Flower,
  Crown
} from "lucide-react"
import { useLocation } from "wouter"

interface Transaction {
  id: string
  type: 'donation' | 'receive' | 'merit' | 'blessing'
  amount: number
  description: string
  date: string
  from?: string
  to?: string
}

interface Merit {
  id: string
  title: string
  description: string
  points: number
  date: string
  icon: string
}

export default function WalletPage() {
  const { user, isLoading } = useAuth()
  const [, navigate] = useLocation()
  
  // 钱包数据
  const [walletData] = useState({
    balance: 888.88,
    meritPoints: 2568,
    blessings: 156,
    todayEarning: 68.8
  })

  // 交易记录
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'donation',
      amount: 100,
      description: '向泰山宫香火基金捐赠',
      date: '今天 14:30',
      to: '泰山宫'
    },
    {
      id: '2', 
      type: 'receive',
      amount: 50,
      description: '收到道友赠与的香火钱',
      date: '今天 10:15',
      from: '悟道居士'
    },
    {
      id: '3',
      type: 'merit',
      amount: 200,
      description: '完成每日修行获得功德',
      date: '昨天 19:00'
    },
    {
      id: '4',
      type: 'blessing',
      amount: 88,
      description: '参与共修活动获得福报',
      date: '昨天 06:30'
    }
  ])

  // 功德记录
  const [merits] = useState<Merit[]>([
    {
      id: '1',
      title: '坚持早课修行',
      description: '连续7天参与晨课共修',
      points: 350,
      date: '今天',
      icon: '🌅'
    },
    {
      id: '2',
      title: '经典研习贡献',
      description: '在道德经讨论中获得高度认可',
      points: 200,
      date: '2天前',
      icon: '📖'
    },
    {
      id: '3',
      title: '帮助新道友',
      description: '为初学者提供修行指导',
      points: 150,
      date: '3天前',
      icon: '🤝'
    },
    {
      id: '4',
      title: '文章分享',
      description: '分享修行心得获得广泛传播',
      points: 300,
      date: '5天前',
      icon: '✍️'
    }
  ])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'donation': return <Minus className="w-4 h-4 text-red-500" />
      case 'receive': return <Plus className="w-4 h-4 text-green-500" />
      case 'merit': return <Star className="w-4 h-4 text-amber-500" />
      case 'blessing': return <Heart className="w-4 h-4 text-pink-500" />
      default: return <Wallet className="w-4 h-4" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'donation': return 'text-red-600'
      case 'receive': return 'text-green-600'  
      case 'merit': return 'text-amber-600'
      case 'blessing': return 'text-pink-600'
      default: return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Wallet className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-amber-600">正在加载功德箱...</p>
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
      <Header title="功德箱" />

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

          {/* 余额卡片 */}
          <Card className="mb-4 border-0 shadow-lg bg-gradient-to-r from-amber-400 to-orange-400 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-amber-100 text-sm">功德箱余额</p>
                  <h2 className="text-3xl font-bold">¥{walletData.balance.toFixed(2)}</h2>
                </div>
                <div className="text-4xl">🏮</div>
              </div>
              
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">今日收入 +¥{walletData.todayEarning}</span>
              </div>
            </CardContent>
          </Card>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">⭐</div>
                <p className="text-2xl font-bold text-amber-600">{walletData.meritPoints}</p>
                <p className="text-sm text-amber-800">功德积分</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">🙏</div>
                <p className="text-2xl font-bold text-pink-600">{walletData.blessings}</p>
                <p className="text-sm text-pink-800">祈福次数</p>
              </CardContent>
            </Card>
          </div>

          {/* 快捷操作 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900">快捷操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="flex flex-col h-auto py-4 text-amber-700 border-amber-200"
                  onClick={() => console.log("捐赠香火")}
                >
                  <Gift className="w-6 h-6 mb-2" />
                  <span>捐赠香火</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex flex-col h-auto py-4 text-green-700 border-green-200"
                  onClick={() => console.log("收取功德")}
                >
                  <Star className="w-6 h-6 mb-2" />
                  <span>收取功德</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex flex-col h-auto py-4 text-pink-700 border-pink-200"
                  onClick={() => console.log("祈福许愿")}
                >
                  <Heart className="w-6 h-6 mb-2" />
                  <span>祈福许愿</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex flex-col h-auto py-4 text-purple-700 border-purple-200"
                  onClick={() => console.log("查看排行")}
                >
                  <Crown className="w-6 h-6 mb-2" />
                  <span>功德排行</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 最近功德记录 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900">最近功德</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {merits.slice(0, 3).map((merit) => (
                <div key={merit.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">{merit.icon}</div>
                    <div>
                      <h4 className="font-medium text-amber-900 text-sm">{merit.title}</h4>
                      <p className="text-xs text-amber-600">{merit.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-amber-500 text-white">+{merit.points}</Badge>
                    <p className="text-xs text-amber-600 mt-1">{merit.date}</p>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="ghost" 
                className="w-full text-amber-600"
                onClick={() => console.log("查看全部功德记录")}
              >
                查看全部功德记录
              </Button>
            </CardContent>
          </Card>

          {/* 交易记录 */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <History className="w-5 h-5 mr-2" />
                交易记录
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-amber-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <h4 className="font-medium text-amber-900 text-sm">{transaction.description}</h4>
                      <p className="text-xs text-amber-600">
                        {transaction.from && `来自: ${transaction.from}`}
                        {transaction.to && `捐赠给: ${transaction.to}`}
                        {!transaction.from && !transaction.to && '系统奖励'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium text-sm ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'donation' ? '-' : '+'}¥{transaction.amount}
                    </p>
                    <p className="text-xs text-amber-600">{transaction.date}</p>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="ghost" 
                className="w-full text-amber-600"
                onClick={() => console.log("查看全部交易记录")}
              >
                查看全部交易记录
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}