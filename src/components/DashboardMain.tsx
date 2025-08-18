"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Wallet,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Bell,
  Send
} from "lucide-react"
import { dataService } from "@/lib/data-service"
import { toast } from "sonner"

interface DashboardMainProps {
  onTabChange?: (tab: string) => void
}

export function DashboardMain({ onTabChange }: DashboardMainProps) {
  const [stats, setStats] = useState({
    employees: 0,
    paymentRequests: 0,
    approvalRequests: 0,
    announcements: 0
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleNavigation = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab)
      toast.success(`正在跳转到${getTabName(tab)}`)
    }
  }

  const getTabName = (tab: string) => {
    const names: Record<string, string> = {
      employees: "员工管理",
      finance: "财务管理",
      approvals: "审批流程",
      projects: "项目管理",
      payments: "支付申请",
      communication: "内部聊天",
      telegram: "TG机器人",
      reports: "数据分析",
      announcements: "公告通知"
    }
    return names[tab] || tab
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // 模拟数据刷新
      await new Promise(resolve => setTimeout(resolve, 1000))

      const employees = dataService.getEmployees()
      const paymentRequests = dataService.getPaymentRequests()
      const approvalRequests = dataService.getApprovalRequests()
      const announcements = dataService.getAnnouncements()

      setStats({
        employees: employees.length,
        paymentRequests: paymentRequests.filter(r => r.status === 'pending').length,
        approvalRequests: approvalRequests.filter(r => r.status === 'pending').length,
        announcements: announcements.filter(a => a.status === 'published').length
      })

      toast.success("数据已更新到最新状态")
    } catch (error) {
      toast.error("无法获取最新数据，请稍后重试")
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // 初始化数据
    dataService.initializeData()

    const employees = dataService.getEmployees()
    const paymentRequests = dataService.getPaymentRequests()
    const approvalRequests = dataService.getApprovalRequests()
    const announcements = dataService.getAnnouncements()

    setStats({
      employees: employees.length,
      paymentRequests: paymentRequests.filter(r => r.status === 'pending').length,
      approvalRequests: approvalRequests.filter(r => r.status === 'pending').length,
      announcements: announcements.filter(a => a.status === 'published').length
    })
  }, [])

  const statsData = [
    {
      title: "员工总数",
      value: stats.employees.toString(),
      change: "+2",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      onClick: () => handleNavigation("employees")
    },
    {
      title: "待处理支付",
      value: stats.paymentRequests.toString(),
      change: "+3",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      onClick: () => handleNavigation("payments")
    },
    {
      title: "待审批事项",
      value: stats.approvalRequests.toString(),
      change: "-1",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      onClick: () => handleNavigation("approvals")
    },
    {
      title: "活跃公告",
      value: stats.announcements.toString(),
      change: "+1",
      icon: Bell,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      onClick: () => handleNavigation("announcements")
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: "payment",
      title: "USDT支付申请",
      user: "张三",
      status: "pending",
      time: "5分钟前",
      action: () => handleNavigation("payments")
    },
    {
      id: 2,
      type: "approval",
      title: "请假申请审批",
      user: "李四",
      status: "pending",
      time: "1小时前",
      action: () => handleNavigation("approvals")
    },
    {
      id: 3,
      type: "announcement",
      title: "系统更新通知",
      user: "系统管理员",
      status: "published",
      time: "2小时前",
      action: () => handleNavigation("announcements")
    }
  ]

  const quickActions = [
    {
      title: "内部聊天",
      icon: MessageSquare,
      action: () => handleNavigation("communication")
    },
    {
      title: "申请款项",
      icon: DollarSign,
      action: () => handleNavigation("payments")
    },
    {
      title: "员工管理",
      icon: Users,
      action: () => handleNavigation("employees")
    },
    {
      title: "数据分析",
      icon: TrendingUp,
      action: () => handleNavigation("reports")
    },
    {
      title: "审批中心",
      icon: AlertCircle,
      action: () => handleNavigation("approvals")
    },
    {
      title: "TG机器人",
      icon: Send,
      action: () => handleNavigation("telegram")
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "completed": return "bg-green-100 text-green-800"
      case "published": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "待处理"
      case "completed": return "已完成"
      case "published": return "已发布"
      default: return "未知"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />
      case "completed": return <CheckCircle className="w-4 h-4" />
      case "published": return <Bell className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">欢迎回来！</h1>
          <p className="text-zinc-600">这里是您的数字化办公控制台概览</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? '刷新中...' : '刷新数据'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className="hover:shadow-md transition-all cursor-pointer hover:scale-105"
              onClick={stat.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-zinc-900 mt-2">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-zinc-500 ml-1">较上期</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                最近动态
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleNavigation("announcements")}>
                <Eye className="w-4 h-4 mr-1" />
                查看全部
              </Button>
            </CardTitle>
            <CardDescription>团队最新活动和待办事项</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-zinc-50 hover:bg-zinc-100 cursor-pointer transition-colors"
                  onClick={activity.action}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-zinc-900">{activity.title}</h4>
                      <Badge className={getStatusColor(activity.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(activity.status)}
                          <span>{getStatusText(activity.status)}</span>
                        </div>
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-600 mt-1">
                      {activity.user}
                    </p>
                  </div>
                  <div className="text-sm text-zinc-500">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              快速操作
            </CardTitle>
            <CardDescription>常用功能快速访问</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-zinc-50 transition-all"
                    onClick={action.action}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{action.title}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card className="bg-gradient-to-r from-zinc-50 to-zinc-100 border-zinc-200">
        <CardHeader>
          <CardTitle className="text-zinc-900">系统信息</CardTitle>
          <CardDescription className="text-zinc-700">
            智慧OA办公系统 - 为现代企业打造的数字化办公平台
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-zinc-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-zinc-900">员工管理</h4>
                <p className="text-sm text-zinc-700">完整的人力资源管理</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-zinc-500 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-zinc-900">财务管理</h4>
                <p className="text-sm text-zinc-700">数字资产和财务分析</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-zinc-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-zinc-900">内部协作</h4>
                <p className="text-sm text-zinc-700">高效的团队沟通工具</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
