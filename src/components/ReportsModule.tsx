"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { dataService } from "@/lib/data-service"
import { toast } from "sonner"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts'
import { TrendingUp, TrendingDown, Users, DollarSign, FileText, Calendar as CalendarIcon, Download, Filter, RefreshCw, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon } from "lucide-react"

export function ReportsModule() {
  const [dateRange, setDateRange] = useState({
    from: new Date(2024, 0, 1),
    to: new Date()
  })
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [reportType, setReportType] = useState("overview")
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  useEffect(() => {
    dataService.initializeData()
  }, [])

  // 获取数据统计
  const getEmployeeStats = () => {
    const employees = dataService.getEmployees()
    const departments = dataService.getDepartments()

    return {
      total: employees.length,
      active: employees.filter(e => e.status === 'active').length,
      byDepartment: departments.map(dept => ({
        name: dept.name,
        count: employees.filter(e => e.department === dept.name).length,
        budget: dept.budget
      }))
    }
  }

  const getFinancialStats = () => {
    const transactions = dataService.getTransactions()
    // 删除加密货币资产调用
    // const cryptoAssets = dataService.getCryptoAssets()

    const totalReceive = transactions
      .filter(t => t.type === 'receive')
      .reduce((sum, t) => sum + (typeof t.usdValue === 'number' ? t.usdValue : parseFloat(String(t.usdValue).replace(/[$,]/g, ''))), 0)

    const totalSend = transactions
      .filter(t => t.type === 'send')
      .reduce((sum, t) => sum + (typeof t.usdValue === 'number' ? t.usdValue : parseFloat(String(t.usdValue).replace(/[$,]/g, ''))), 0)

    // 计算钱包总价值（基于交易记录）
    const totalAssets = totalReceive - totalSend

    return {
      totalReceive,
      totalSend,
      netIncome: totalReceive - totalSend,
      totalAssets,
      monthlyData: [
        { month: '1月', income: 125000, expense: 89000, profit: 36000 },
        { month: '2月', income: 145000, expense: 95000, profit: 50000 },
        { month: '3月', income: 165000, expense: 110000, profit: 55000 },
        { month: '4月', income: 185000, expense: 125000, profit: 60000 },
        { month: '5月', income: 205000, expense: 140000, profit: 65000 },
        { month: '6月', income: 225000, expense: 155000, profit: 70000 }
      ]
    }
  }

  const getApprovalStats = () => {
    const approvals = dataService.getApprovalRequests()

    return {
      total: approvals.length,
      pending: approvals.filter(a => a.status === 'pending').length,
      approved: approvals.filter(a => a.status === 'approved').length,
      rejected: approvals.filter(a => a.status === 'rejected').length,
      byType: [
        { name: '请假申请', value: approvals.filter(a => a.type === 'leave').length, fill: '#8884d8' },
        { name: '费用报销', value: approvals.filter(a => a.type === 'expense').length, fill: '#82ca9d' },
        { name: '采购申请', value: approvals.filter(a => a.type === 'purchase').length, fill: '#ffc658' },
        { name: '招聘申请', value: approvals.filter(a => a.type === 'hiring').length, fill: '#ff7300' }
      ]
    }
  }

  const getPaymentStats = () => {
    const payments = dataService.getPaymentRequests()

    const totalAmount = payments.reduce((sum, p) => {
      const amount = parseFloat(p.amount.replace(/,/g, ''))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)

    return {
      total: payments.length,
      totalAmount,
      pending: payments.filter(p => p.status === 'pending').length,
      completed: payments.filter(p => p.status === 'completed').length,
      byCurrency: [
        { name: 'USDT', value: payments.filter(p => p.currency === 'USDT').length, fill: '#00d4aa' },
        { name: 'BTC', value: payments.filter(p => p.currency === 'BTC').length, fill: '#f7931a' },
        { name: 'ETH', value: payments.filter(p => p.currency === 'ETH').length, fill: '#627eea' }
      ]
    }
  }

  const getCommunicationStats = () => {
    const chats = dataService.getChats()
    const announcements = dataService.getAnnouncements()

    return {
      totalChats: chats.length,
      totalAnnouncements: announcements.length,
      totalReads: announcements.reduce((sum, a) => sum + a.readCount, 0),
      totalLikes: announcements.reduce((sum, a) => sum + a.likeCount, 0),
      weeklyActivity: [
        { day: '周一', messages: 45, announcements: 2 },
        { day: '周二', messages: 52, announcements: 1 },
        { day: '周三', messages: 61, announcements: 3 },
        { day: '周四', messages: 58, announcements: 2 },
        { day: '周五', messages: 69, announcements: 4 },
        { day: '周六', messages: 31, announcements: 1 },
        { day: '周日', messages: 25, announcements: 0 }
      ]
    }
  }

  const handleExportReport = () => {
    // 模拟导出功能
    toast.success("报表导出成功！文件已保存到下载文件夹")
  }

  const handleRefreshData = () => {
    // 模拟刷新数据
    toast.success("数据已刷新")
  }

  const employeeStats = getEmployeeStats()
  const financialStats = getFinancialStats()
  const approvalStats = getApprovalStats()
  const paymentStats = getPaymentStats()
  const communicationStats = getCommunicationStats()

  const overviewCards = [
    {
      title: "总员工数",
      value: employeeStats.total.toString(),
      change: "+12%",
      changeType: "up" as const,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "净收益",
      value: `$${financialStats.netIncome.toLocaleString()}`,
      change: "+8.2%",
      changeType: "up" as const,
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "待审批",
      value: approvalStats.pending.toString(),
      change: "-5.1%",
      changeType: "down" as const,
      icon: FileText,
      color: "text-yellow-600"
    },
    {
      title: "总资产价值",
      value: `$${financialStats.totalAssets.toLocaleString()}`,
      change: "+15.3%",
      changeType: "up" as const,
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ]

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00d4aa', '#ff8042']

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">数据报表</h1>
          <p className="text-zinc-600 mt-1">业务数据分析与可视化</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="选择部门" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部部门</SelectItem>
              <SelectItem value="技术部">技术部</SelectItem>
              <SelectItem value="市场部">市场部</SelectItem>
              <SelectItem value="财务部">财务部</SelectItem>
              <SelectItem value="人事部">人事部</SelectItem>
            </SelectContent>
          </Select>
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="w-4 h-4 mr-2" />
                时间范围
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from) {
                    setDateRange({ from: range.from, to: range.to || range.from })
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button onClick={handleExportReport} className="bg-zinc-900 hover:bg-zinc-800">
            <Download className="w-4 h-4 mr-2" />
            导出报表
          </Button>
        </div>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {card.changeType === "up" ? (
                    <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                  )}
                  <span className={card.changeType === "up" ? "text-green-600" : "text-red-600"}>
                    {card.change}
                  </span>
                  <span className="ml-1">相比上月</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="financial">财务分析</TabsTrigger>
          <TabsTrigger value="hr">人事报表</TabsTrigger>
          <TabsTrigger value="workflow">流程统计</TabsTrigger>
          <TabsTrigger value="communication">沟通分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  收支趋势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={financialStats.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    <Area type="monotone" dataKey="income" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="expense" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.8} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  审批类型分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={approvalStats.byType}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {approvalStats.byType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="w-5 h-5" />
                周活跃度分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={communicationStats.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="messages" stroke="#8884d8" strokeWidth={2} name="消息数量" />
                  <Line type="monotone" dataKey="announcements" stroke="#82ca9d" strokeWidth={2} name="公告数量" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>总收入</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${financialStats.totalReceive.toLocaleString()}
                </div>
                <p className="text-sm text-zinc-600">本期累计收入</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>总支出</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ${financialStats.totalSend.toLocaleString()}
                </div>
                <p className="text-sm text-zinc-600">本期累计支出</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>净利润</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ${financialStats.netIncome.toLocaleString()}
                </div>
                <p className="text-sm text-zinc-600">收入减去支出</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>月度收支对比</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={financialStats.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    <Bar dataKey="income" fill="#8884d8" name="收入" />
                    <Bar dataKey="expense" fill="#82ca9d" name="支出" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>支付货币分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentStats.byCurrency}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {paymentStats.byCurrency.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hr" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>部门人员分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={employeeStats.byDepartment}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="人数" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>部门预算分配</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employeeStats.byDepartment.map((dept, index) => (
                    <div key={dept.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{dept.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{dept.budget}</div>
                        <div className="text-sm text-zinc-600">{dept.count} 人</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>人员状态统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{employeeStats.active}</div>
                  <div className="text-sm text-zinc-600">在职员工</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">0</div>
                  <div className="text-sm text-zinc-600">待入职</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">0</div>
                  <div className="text-sm text-zinc-600">已离职</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>审批总数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvalStats.total}</div>
                <p className="text-sm text-zinc-600">累计审批申请</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>待处理</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{approvalStats.pending}</div>
                <p className="text-sm text-zinc-600">等待审批</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>已通过</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{approvalStats.approved}</div>
                <p className="text-sm text-zinc-600">审批通过</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>已拒绝</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{approvalStats.rejected}</div>
                <p className="text-sm text-zinc-600">审批拒绝</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>审批流程效率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>平均审批时长</span>
                  <Badge>2.5 天</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>通过率</span>
                  <Badge className="bg-green-100 text-green-800">
                    {approvalStats.total > 0 ? ((approvalStats.approved / approvalStats.total) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>拒绝率</span>
                  <Badge className="bg-red-100 text-red-800">
                    {approvalStats.total > 0 ? ((approvalStats.rejected / approvalStats.total) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>聊天群组</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{communicationStats.totalChats}</div>
                <p className="text-sm text-zinc-600">活跃聊天群组</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>公告总数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{communicationStats.totalAnnouncements}</div>
                <p className="text-sm text-zinc-600">已发布公告</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>总阅读量</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{communicationStats.totalReads}</div>
                <p className="text-sm text-zinc-600">公告阅读次数</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>沟通活跃度趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={communicationStats.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="messages" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.8} name="消息数量" />
                  <Area type="monotone" dataKey="announcements" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.8} name="公告数量" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
