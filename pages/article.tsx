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
  BookOpen, 
  Clock, 
  Eye, 
  Star, 
  Share2, 
  MessageCircle,
  ThumbsUp,
  Bookmark,
  Calendar,
  User
} from "lucide-react"
import { useLocation } from "wouter"

interface ArticleDetail {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  authorAvatar?: string
  authorDescription: string
  date: string
  category: string
  readTime: string
  views: number
  likes: number
  bookmarks: number
  popularity: number
  tags: string[]
  relatedArticles: Array<{
    id: string
    title: string
    author: string
    readTime: string
  }>
  comments: Array<{
    id: string
    user: string
    userAvatar?: string
    content: string
    time: string
    likes: number
    replies?: Array<{
      id: string
      user: string
      content: string
      time: string
    }>
  }>
}

export default function ArticlePage() {
  const { user, isLoading } = useAuth()
  const [location, navigate] = useLocation()
  const [article, setArticle] = useState<ArticleDetail | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  
  // 从URL获取文章ID
  const articleId = location.split('/')[2] || '1'

  // 模拟文章数据
  const articlesData: Record<string, ArticleDetail> = {
    '1': {
      id: '1',
      title: '道德经第一章：道可道，非常道',
      excerpt: '探索道家经典中关于道的本质，理解不可言喻的道如何指引我们的修行之路...',
      content: `
# 道德经第一章：道可道，非常道

## 原文
> 道可道，非常道；名可名，非常名。
> 无名天地之始，有名万物之母。
> 故常无欲，以观其妙；常有欲，以观其徼。
> 此两者，同出而异名，同谓之玄。
> 玄之又玄，众妙之门。

## 深度解析

### 道的不可言说性

道德经开篇便点出了道家哲学的核心——道的不可言说性。"道可道，非常道"这句话蕴含着深刻的哲学思辨。

老子告诉我们，任何可以用语言表达的"道"，都不是永恒不变的真道。这并非是说道无法认识，而是说道超越了语言文字的局限。

### 语言与真理的关系

在道家看来，语言是有限的，而道是无限的。语言只能描述现象世界的表象，却无法直达事物的本质。这种认知上的谦逊，正是道家智慧的体现。

### 修行的两个层面

- **无欲观妙**：在无欲无求的状态下，我们能够体察到道的微妙之处
- **有欲观徼**：在有欲望的状态下，我们看到的是道的边界和形迹

这两种观照方式都是必要的，它们互补而统一，共同构成了对道的完整认识。

### 玄之又玄的境界

"玄之又玄，众妙之门"指出了修行的最高境界。玄，即深远、幽深之意。真正的道法修行，需要我们超越表面的理解，深入到更加微妙的层次。

## 修行指导

### 日常实践

1. **静心观察**：在日常生活中保持觉知，观察内心的起伏变化
2. **无为而治**：不强求，顺应自然，让事物按其本性发展
3. **虚静致远**：保持内心的虚静，远离纷扰，接近道的本质

### 进阶修行

- 定期静坐冥想，体验"无欲"状态下的清明
- 研读经典，但不拘泥于文字，要体悟其中的精神实质
- 在生活中实践道的智慧，做到知行合一

## 现代意义

在现代社会中，道德经第一章的智慧依然具有重要的指导意义：

- **认知谦逊**：承认知识的有限性，保持学习的开放态度
- **内观自省**：关注内在的精神世界，不被外物所迷
- **和谐共处**：理解事物的相对性，追求平衡与和谐

道德经的智慧是永恒的，它教导我们如何在变化的世界中找到不变的道理，如何在有限的生命中触摸无限的真理。
      `,
      author: '张教天师',
      authorDescription: '泰山宫首席教习，道学研究专家，从事道教文化传播三十余年',
      date: '2天前',
      category: '经典研习',
      readTime: '5分钟',
      views: 1205,
      likes: 89,
      bookmarks: 45,
      popularity: 95,
      tags: ['道德经', '经典研习', '哲学思辨', '修行指导'],
      relatedArticles: [
        { id: '2', title: '道德经第二章：美之为美', author: '李道长', readTime: '4分钟' },
        { id: '4', title: '老子思想的现代意义', author: '王法师', readTime: '8分钟' },
        { id: '5', title: '道家修行入门指南', author: '陈居士', readTime: '6分钟' }
      ],
      comments: [
        {
          id: '1',
          user: '悟道居士',
          content: '张教天师的解析深入浅出，让我对道德经有了更深的理解。特别是关于"玄之又玄"的阐释，非常精辟。',
          time: '1天前',
          likes: 12,
          replies: [
            {
              id: '1-1',
              user: '静心道友',
              content: '确实如此，这种解读方式很容易理解。',
              time: '1天前'
            }
          ]
        },
        {
          id: '2',
          user: '明月居士',
          content: '文章提到的修行方法很实用，我已经开始按照文中的建议进行日常实践了。',
          time: '1天前',
          likes: 8
        },
        {
          id: '3',
          user: '清风道士',
          content: '道可道，非常道。每次读到这句话都有新的体悟，感谢分享！',
          time: '2天前',
          likes: 15
        }
      ]
    },
    '2': {
      id: '2',
      title: '内丹修炼入门指导',
      excerpt: '从基础的调息开始，逐步深入内丹修炼的核心要义，为初学者提供完整的修行路径...',
      content: `
# 内丹修炼入门指导

## 什么是内丹修炼

内丹修炼是道教修行的重要法门，通过调身、调息、调心三个层面的修炼，达到性命双修、天人合一的境界。

## 基础准备

### 心理准备
- 虔诚的修行态度
- 持之以恒的决心
- 谦逊学习的心境

### 身体准备
- 身体健康，无重大疾病
- 生活规律，饮食清淡
- 适当的运动基础

## 修炼步骤

### 第一阶段：调身
1. **坐姿要求**：盘腿而坐，脊背挺直，放松自然
2. **呼吸调节**：自然呼吸，逐渐深化
3. **意念专注**：排除杂念，专注当下

### 第二阶段：调息
1. **腹式呼吸**：气沉丹田，呼吸深长
2. **气机运转**：感受气息在体内的流动
3. **经络疏通**：配合意念引导气息

### 第三阶段：调心
1. **心无旁骛**：达到真正的静心状态
2. **神气合一**：精神与气息的完美结合
3. **返朴归真**：回到自然纯真的状态

## 注意事项

- 切勿急于求成，循序渐进
- 保持正确的修炼方法
- 有疑问及时请教有经验的老师
- 注意身心的反应，适时调整

## 进阶修炼

在掌握基础后，可以逐步学习更高深的内丹功法，但必须在有资质的师父指导下进行。
      `,
      author: '迎客道人',
      authorDescription: '泰山宫修行导师，内丹修炼专家，指导学员修行二十余年',
      date: '3天前',
      category: '修行指南',
      readTime: '8分钟',
      views: 892,
      likes: 67,
      bookmarks: 38,
      popularity: 88,
      tags: ['内丹修炼', '修行指南', '调息', '入门教程'],
      relatedArticles: [
        { id: '1', title: '道德经第一章解析', author: '张教天师', readTime: '5分钟' },
        { id: '6', title: '静坐冥想的正确方法', author: '慧心法师', readTime: '7分钟' }
      ],
      comments: [
        {
          id: '1',
          user: '初学道友',
          content: '作为初学者，这篇文章对我帮助很大，按照文中的方法练习，确实有所感悟。',
          time: '2天前',
          likes: 10
        }
      ]
    },
    '3': {
      id: '3',
      title: '泰山道教文化的传承与发展',
      excerpt: '探讨泰山作为道教圣地的历史地位，以及现代道教文化的传承与创新发展...',
      content: `
# 泰山道教文化的传承与发展

## 泰山道教的历史渊源

泰山自古以来就是中华民族的精神象征，也是道教文化的重要发源地之一...

## 现代传承的挑战与机遇

在现代社会中，传统道教文化面临着前所未有的挑战，同时也迎来了新的发展机遇...

## 创新发展的路径

通过现代科技手段，我们可以更好地传播道教智慧，让古老的文化焕发新的生机...
      `,
      author: '道宫长老',
      authorDescription: '泰山宫资深长老，道教文化研究学者，著有多部道教文化专著',
      date: '5天前',
      category: '文化传承',
      readTime: '12分钟',
      views: 654,
      likes: 52,
      bookmarks: 28,
      popularity: 92,
      tags: ['泰山道教', '文化传承', '历史研究', '现代发展'],
      relatedArticles: [
        { id: '1', title: '道德经第一章解析', author: '张教天师', readTime: '5分钟' },
        { id: '2', title: '内丹修炼入门指导', author: '迎客道人', readTime: '8分钟' }
      ],
      comments: [
        {
          id: '1',
          user: '文化学者',
          content: '这篇文章从历史和现代两个维度分析了泰山道教文化，很有价值。',
          time: '4天前',
          likes: 8
        }
      ]
    }
  }

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/")
      return
    }
    
    const selectedArticle = articlesData[articleId]
    if (selectedArticle) {
      setArticle(selectedArticle)
    }
  }, [articleId, user, isLoading, navigate])

  const handleLike = () => {
    setIsLiked(!isLiked)
    // TODO: 发送点赞请求到后端
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    // TODO: 发送收藏请求到后端
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BookOpen className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-amber-600">正在加载文章...</p>
        </div>
      </div>
    )
  }

  if (!user || !article) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Header title="文章详情" />

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

          {/* 文章头部信息 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <Badge className="bg-amber-100 text-amber-700 w-fit mb-2">
                {article.category}
              </Badge>
              <CardTitle className="text-xl text-amber-900 leading-tight">
                {article.title}
              </CardTitle>
              <p className="text-sm text-amber-600 mt-2">{article.excerpt}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 作者信息 */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-amber-500 text-white">
                    {article.author[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-amber-900">{article.author}</p>
                  <p className="text-xs text-amber-600">{article.authorDescription}</p>
                </div>
              </div>

              {/* 文章统计 */}
              <div className="flex items-center justify-between text-sm text-amber-600">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{article.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{article.readTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{article.views}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span>{article.popularity}</span>
                </div>
              </div>

              {/* 标签 */}
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-amber-100 text-amber-700">
                    #{tag}
                  </Badge>
                ))}
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`${isLiked ? 'bg-red-50 text-red-600 border-red-200' : 'text-amber-700 border-amber-200'}`}
                    onClick={handleLike}
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {article.likes + (isLiked ? 1 : 0)}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`${isBookmarked ? 'bg-amber-50 text-amber-600 border-amber-200' : 'text-amber-700 border-amber-200'}`}
                    onClick={handleBookmark}
                  >
                    <Bookmark className="w-4 h-4 mr-1" />
                    {article.bookmarks + (isBookmarked ? 1 : 0)}
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="text-amber-700 border-amber-200">
                  <Share2 className="w-4 h-4 mr-1" />
                  分享
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 文章内容 */}
          <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none text-amber-900 prose-headings:text-amber-900 prose-strong:text-amber-800 prose-blockquote:border-amber-200 prose-blockquote:text-amber-700">
                <div className="whitespace-pre-line leading-relaxed">
                  {article.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 相关文章 */}
          {article.relatedArticles.length > 0 && (
            <Card className="mb-4 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-amber-900">相关文章</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {article.relatedArticles.map((relatedArticle) => (
                  <div 
                    key={relatedArticle.id}
                    className="flex items-center justify-between p-3 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors"
                    onClick={() => navigate(`/article/${relatedArticle.id}`)}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-900 text-sm mb-1">
                        {relatedArticle.title}
                      </h4>
                      <p className="text-xs text-amber-600">
                        {relatedArticle.author} · {relatedArticle.readTime}
                      </p>
                    </div>
                    <BookOpen className="w-4 h-4 text-amber-400" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 评论区 */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                评论 ({article.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {article.comments.map((comment) => (
                <div key={comment.id} className="bg-amber-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-amber-500 text-white text-xs">
                        {comment.user[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-amber-900 text-sm">{comment.user}</span>
                        <span className="text-xs text-amber-600">{comment.time}</span>
                      </div>
                      <p className="text-sm text-amber-800 mb-3">{comment.content}</p>
                      <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" className="text-amber-600 h-auto p-0">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {comment.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-amber-600 h-auto p-0">
                          回复
                        </Button>
                      </div>
                      {/* 回复 */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="bg-white rounded p-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-amber-900 text-xs">{reply.user}</span>
                                <span className="text-xs text-amber-600">{reply.time}</span>
                              </div>
                              <p className="text-xs text-amber-800">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="text-center">
                <Button variant="outline" className="text-amber-700 border-amber-200">
                  发表评论
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}