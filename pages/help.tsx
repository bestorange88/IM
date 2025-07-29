"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/common/Header"
import BottomNavigation from "@/components/BottomNavigation"
import { 
  ArrowLeft, 
  HelpCircle, 
  MessageCircle, 
  Book, 
  Phone,
  Mail,
  Search,
  ChevronRight,
  Send
} from "lucide-react"
import { useLocation } from "wouter"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
}

interface ContactMethod {
  type: string
  title: string
  description: string
  contact: string
  icon: any
  available: string
}

export default function HelpPage() {
  const { user, isLoading } = useAuth()
  const [, navigate] = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [feedbackText, setFeedbackText] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const faqCategories = [
    { id: "all", name: "全部" },
    { id: "account", name: "账户" },
    { id: "chat", name: "聊天" },
    { id: "practice", name: "修行" },
    { id: "technical", name: "技术" }
  ]

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: '如何修改个人资料？',
      answer: '点击个人中心页面的"编辑资料"按钮，即可修改昵称、邮箱等个人信息。',
      category: 'account',
      helpful: 25
    },
    {
      id: '2',
      question: '如何参加晨课共修？',
      answer: '每日早上6:00-7:00在修行殿进行晨课共修，您可以在道页面的活动列表中找到并报名参加。',
      category: 'practice',
      helpful: 18
    },
    {
      id: '3',
      question: '如何添加道友？',
      answer: '在联系人页面点击"添加道友"按钮，输入对方的用户名或扫描二维码即可发送好友申请。',
      category: 'chat',
      helpful: 32
    },
    {
      id: '4',
      question: '功德箱如何使用？',
      answer: '功德箱记录您的善行积分和香火捐赠，可以用于参与道观活动和获得特殊功能权限。',
      category: 'account',
      helpful: 45
    },
    {
      id: '5',
      question: '忘记密码怎么办？',
      answer: '在登录页面点击"忘记密码"，通过绑定的邮箱或手机号码重置密码。',
      category: 'account',
      helpful: 28
    },
    {
      id: '6',
      question: '如何关闭通知？',
      answer: '在个人中心-消息设置中，可以选择关闭特定类型的通知或设置勿扰时间。',
      category: 'technical',
      helpful: 15
    }
  ]

  const contactMethods: ContactMethod[] = [
    {
      type: 'online',
      title: '在线客服',
      description: '智能助手24小时为您服务',
      contact: '慧心道友',
      icon: MessageCircle,
      available: '24小时'
    },
    {
      type: 'phone',
      title: '客服热线',
      description: '人工客服电话咨询',
      contact: '400-888-8888',
      icon: Phone,
      available: '9:00-18:00'
    },
    {
      type: 'email',
      title: '邮件支持',
      description: '发送详细问题描述',
      contact: 'support@taishan.com',
      icon: Mail,
      available: '工作日回复'
    }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) return
    // TODO: 提交反馈到后端
    console.log("提交反馈:", feedbackText)
    setFeedbackText("")
    alert("感谢您的反馈，我们会尽快处理！")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <HelpCircle className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-amber-600">正在加载帮助中心...</p>
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
      <Header title="帮助支持" />

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

          {/* 搜索框 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索帮助内容..."
                  className="pl-10 border-amber-200 focus:border-amber-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* 联系我们 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900">联系我们</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contactMethods.map((method) => (
                <div
                  key={method.type}
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors"
                  onClick={() => console.log("联系", method.type)}
                >
                  <div className="flex items-center space-x-3">
                    <method.icon className="w-5 h-5 text-amber-600" />
                    <div>
                      <h4 className="font-medium text-amber-900 text-sm">{method.title}</h4>
                      <p className="text-xs text-amber-600">{method.description}</p>
                      <p className="text-xs text-amber-500">{method.contact} · {method.available}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* FAQ分类 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex space-x-2 overflow-x-auto">
                {faqCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    className={`whitespace-nowrap ${
                      selectedCategory === category.id 
                        ? "bg-amber-500 text-white" 
                        : "text-amber-700 border-amber-200"
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 常见问题 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <Book className="w-5 h-5 mr-2" />
                常见问题
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="p-4 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors"
                    onClick={() => console.log("查看FAQ", faq.id)}
                  >
                    <h4 className="font-medium text-amber-900 text-sm mb-2">{faq.question}</h4>
                    <p className="text-xs text-amber-700 mb-3">{faq.answer}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-amber-200 text-amber-800 text-xs">
                        {faqCategories.find(cat => cat.id === faq.category)?.name}
                      </Badge>
                      <span className="text-xs text-amber-500">👍 {faq.helpful}人觉得有用</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-amber-300 mx-auto mb-4" />
                  <p className="text-amber-600">未找到相关问题</p>
                  <p className="text-sm text-amber-500 mt-1">请尝试其他关键词或联系客服</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 意见反馈 */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900">意见反馈</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="请描述您遇到的问题或建议..."
                  className="border-amber-200 focus:border-amber-400 min-h-[100px]"
                  maxLength={500}
                />
                <p className="text-xs text-amber-500 mt-1 text-right">
                  {feedbackText.length}/500
                </p>
              </div>
              
              <Button 
                onClick={handleSubmitFeedback}
                disabled={!feedbackText.trim()}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                提交反馈
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}