"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { dataService, User as DataServiceUser } from "@/lib/data-service"
import { toast } from "sonner"
import {
  Eye, EyeOff, Menu, Home as HomeIcon, Users, MessageSquare, FileCheck, Megaphone,
  BarChart3, Settings, User, Send, Building, DollarSign, FolderOpen, FileText,
  Moon, Sun, Monitor, ChevronDown, ChevronRight, Smartphone, Tablet,
  Zap, Bell, Shield, Cloud, Download, Upload, Languages,
  Palette, Layout, RefreshCw, LogOut, ChevronLeft, Search, Filter,
  MoreHorizontal, X, Plus, Grid3x3, List, Columns
} from "lucide-react"

// Enhanced components imports
// import { DashboardModule } from "@/components/DashboardModule"
import { EmployeeModule } from "@/components/EmployeeModule"
import { ChatModule } from "@/components/ChatModule"
import { ApprovalModule } from "@/components/ApprovalModule"
import { AnnouncementModule } from "@/components/AnnouncementModule"
import { ReportsModule } from "@/components/ReportsModule"
import { SettingsModule } from "@/components/SettingsModule"
import { ProfileModule } from "@/components/ProfileModule"
import { TelegramModule } from "@/components/TelegramModule"
import { ProjectModule } from "@/components/ProjectModule"
import { FinanceModule } from "@/components/FinanceModule"
import { PaymentModule } from "@/components/PaymentModule"
// 新增企业级功能模块
import { CalendarModule } from "@/components/CalendarModule"
import { DocumentModule } from "@/components/DocumentModule"

type ThemeMode = 'light' | 'dark' | 'system'
type LayoutMode = 'grid' | 'list' | 'columns'

interface User {
  id: string
  username: string
  password: string
  name: string
  role: 'admin' | 'user'
  avatar?: string
  department?: string
  position?: string
  email?: string
  phone?: string
}

interface UISettings {
  theme: ThemeMode
  language: string
  layout: LayoutMode
  compactMode: boolean
  animations: boolean
  fontSize: 'small' | 'medium' | 'large'
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
}

const modules = [
  { id: 'dashboard', name: '仪表板', icon: HomeIcon, component: null, color: 'bg-blue-500' },
  { id: 'employees', name: '员工管理', icon: Users, component: EmployeeModule, color: 'bg-green-500' },
  { id: 'projects', name: '项目管理', icon: FolderOpen, component: ProjectModule, color: 'bg-purple-500' },
  { id: 'finance', name: '财务管理', icon: DollarSign, component: FinanceModule, color: 'bg-emerald-500' },
  { id: 'payment', name: '钱包管理', icon: Zap, component: PaymentModule, color: 'bg-yellow-500' },
  { id: 'calendar', name: '日程管理', icon: Grid3x3, component: CalendarModule, color: 'bg-teal-500' },
  { id: 'documents', name: '文档管理', icon: FileText, component: DocumentModule, color: 'bg-violet-500' },
  { id: 'chat', name: '内部聊天', icon: MessageSquare, component: ChatModule, color: 'bg-indigo-500' },
  { id: 'approvals', name: '审批流程', icon: FileCheck, component: ApprovalModule, color: 'bg-orange-500' },
  { id: 'announcements', name: '公告通知', icon: Megaphone, component: AnnouncementModule, color: 'bg-red-500' },
  { id: 'reports', name: '数据报表', icon: BarChart3, component: ReportsModule, color: 'bg-cyan-500' },
  { id: 'settings', name: '系统设置', icon: Settings, component: SettingsModule, color: 'bg-gray-500' },
  { id: 'profile', name: '个人资料', icon: User, component: ProfileModule, color: 'bg-pink-500' },
  { id: 'telegram', name: 'Telegram集成', icon: Send, component: TelegramModule, color: 'bg-blue-400' }
]

export default function Home() {
  // 调试用状态
  const [debugCount, setDebugCount] = useState(0)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<DataServiceUser | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [uiSettings, setUISettings] = useState<UISettings>({
    theme: 'light',
    language: 'zh-CN',
    layout: 'grid',
    compactMode: false,
    animations: true,
    fontSize: 'medium',
    sidebarCollapsed: false,
    mobileMenuOpen: false
  })
  const [isMobile, setIsMobile] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  })

  // Initialize and check authentication
  useEffect(() => {
    // Check screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setUISettings(prev => ({ ...prev, sidebarCollapsed: true }))
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Load saved settings
    const savedSettings = localStorage.getItem('oa_ui_settings')
    if (savedSettings) {
      setUISettings(JSON.parse(savedSettings))
    }

    // Apply theme
    applyTheme(uiSettings.theme)

    // Check if user is already logged in
    const savedUser = localStorage.getItem('oa_current_user')
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
      setIsLoggedIn(true)
    }

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Apply theme changes
  useEffect(() => {
    applyTheme(uiSettings.theme)
    localStorage.setItem('oa_ui_settings', JSON.stringify(uiSettings))
  }, [uiSettings])

  const applyTheme = (theme: ThemeMode) => {
    const root = document.documentElement

    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', systemDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }

  const updateUISettings = (updates: Partial<UISettings>) => {
    setUISettings(prev => ({ ...prev, ...updates }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // 添加调试日志
    console.log('🔍 登录按钮被点击！')
    console.log('📝 表单数据:', loginForm)

    if (!loginForm.username || !loginForm.password) {
      toast.error("请输入完整的登录信息")
      return
    }

    console.log('✅ 表单验证通过，开始登录流程...')

    try {
      // 先尝试API authentication
      console.log('🌐 尝试API认证...')
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password
        })
      })

      console.log('📡 API响应状态:', response.status)
      const data = await response.json()
      console.log('📦 API响应数据:', data)

      if (response.ok && data.success) {
        const user: DataServiceUser = data.user

        console.log('✅ API认证成功，设置用户状态...')
        setCurrentUser(user)
        dataService.setCurrentUser(user)

        if (rememberMe) {
          localStorage.setItem('oa_current_user', JSON.stringify(user))
        }

        setIsLoggedIn(true)
        toast.success(`欢迎回来，${user.name}！`)
        return
      }
    } catch (error) {
      console.error('❌ API Login error:', error)
      // 如果API失败，使用客户端验证作为fallback
    }

    console.log('🔄 API认证失败，使用客户端验证...')
    // Fallback: 客户端验证
    if ((loginForm.username === 'admin' && loginForm.password === '123456') ||
        (loginForm.username === 'user' && loginForm.password === '123456')) {

      console.log('✅ 客户端验证成功')
      const user: DataServiceUser = {
        id: loginForm.username === 'admin' ? 'admin' : 'user-1',
        name: loginForm.username === 'admin' ? '系统管理员' : '普通用户',
        email: `${loginForm.username}@company.com`,
        role: loginForm.username === 'admin' ? '系统管理员' : '员工',
        department: loginForm.username === 'admin' ? '信息技术部' : '业务部门',
        avatar: '/avatars/default.jpg',
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString(),
        phone: loginForm.username === 'admin' ? '138****0001' : '138****0002'
      }

      setCurrentUser(user)
      dataService.setCurrentUser(user)

      if (rememberMe) {
        localStorage.setItem('oa_current_user', JSON.stringify(user))
      }

      setIsLoggedIn(true)
      toast.success(`欢迎回来，${user.name}！`)
    } else {
      console.log('❌ 客户端验证失败')
      toast.error("用户名或密码错误")
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    setActiveTab("dashboard")
    setLoginForm({ username: '', password: '' })
    localStorage.removeItem('oa_current_user')
    dataService.setCurrentUser(null)
    toast.success("已安全退出系统")
  }

  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderModuleCard = (module: any) => {
    const IconComponent = module.icon

    return (
      <Card
        key={module.id}
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 ${
          activeTab === module.id
            ? 'border-primary shadow-lg ring-2 ring-primary/20'
            : 'border-border hover:border-primary/50'
        } ${uiSettings.compactMode ? 'p-2' : 'p-4'}`}
        onClick={() => setActiveTab(module.id)}
      >
        <CardContent className={`p-${uiSettings.compactMode ? '3' : '6'} text-center`}>
          <div className={`${module.color} w-${uiSettings.compactMode ? '12' : '16'} h-${uiSettings.compactMode ? '12' : '16'} rounded-full flex items-center justify-center mx-auto mb-${uiSettings.compactMode ? '2' : '4'}`}>
            <IconComponent className={`h-${uiSettings.compactMode ? '6' : '8'} w-${uiSettings.compactMode ? '6' : '8'} text-white`} />
          </div>
          <h3 className={`font-semibold text-${uiSettings.fontSize === 'small' ? 'sm' : uiSettings.fontSize === 'large' ? 'lg' : 'base'} mb-2`}>
            {module.name}
          </h3>
          <p className={`text-muted-foreground text-${uiSettings.fontSize === 'small' ? 'xs' : 'sm'}`}>
            {getModuleDescription(module.id)}
          </p>
        </CardContent>
      </Card>
    )
  }

  const getModuleDescription = (moduleId: string) => {
    const descriptions: Record<string, string> = {
      dashboard: '系统概览和关键指标',
      employees: '员工信息和组织架构',
      projects: '项目进度和任务管理',
      finance: '财务数据和资金流向',
      chat: '团队沟通和协作',
      approvals: '工作流程和审批',
      announcements: '信息发布和通知',
      reports: '数据统计和分析',
      settings: '系统配置和管理',
      profile: '个人信息和偏好',
      telegram: '外部集成和自动化'
    }
    return descriptions[moduleId] || '功能模块'
  }

  const ActiveComponent = modules.find(m => m.id === activeTab)?.component

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateUISettings({ theme: uiSettings.theme === 'light' ? 'dark' : 'light' })}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                >
                  {uiSettings.theme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>切换主题</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="w-full max-w-md space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-black dark:bg-white rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-white dark:text-black">OA</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">智慧OA系统</h1>
            <p className="text-gray-600 dark:text-gray-300">欢迎使用企业办公自动化系统</p>
          </div>

          {/* Login Form */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              {/* Debug Info */}
              <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                <div>🔧 调试计数: {debugCount}</div>
                <div>📝 用户名: {loginForm.username}</div>
                <div>🔑 密码: {loginForm.password ? '***' : '(空)'}</div>
                <div>✅ 登录状态: {isLoggedIn ? '已登录' : '未登录'}</div>
                <button
                  type="button"
                  onClick={() => setDebugCount(c => c + 1)}
                  className="mt-1 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                >
                  测试计数器 +1
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">用户名</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="请输入用户名"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">密码</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="请输入密码"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                    记住登录状态
                  </Label>
                </div>

                <Button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                  登录
                </Button>

                {/* 临时测试按钮 */}
                <Button
                  type="button"
                  onClick={() => {
                    console.log('🧪 测试按钮被点击！')
                    setLoginForm({ username: 'admin', password: '123456' })
                    setTimeout(() => {
                      const event = new Event('submit')
                      const form = document.querySelector('form')
                      if (form) {
                        form.dispatchEvent(event)
                      }
                    }, 100)
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  🧪 测试登录 (admin/123456)
                </Button>

              </form>

              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <Button variant="ghost" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    管理员登录
                  </Button>
                  <span className="mx-2 text-gray-400">|</span>
                  <Button variant="ghost" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    普通用户登录
                  </Button>
                </div>

                <div className="text-center">
                  <Button variant="ghost" className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                    忘记密码？
                  </Button>
                </div>

                {/* Demo Credentials */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-xs text-gray-600 dark:text-gray-400">
                  <div className="font-medium mb-2">演示账号：</div>
                  <div>管理员: admin / 123456</div>
                  <div>普通用户: user / 123456</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={`min-h-screen bg-background transition-colors duration-300 ${uiSettings.fontSize}`}>
        {/* Mobile Header */}
        {isMobile && (
          <div className="lg:hidden border-b bg-card px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sheet open={uiSettings.mobileMenuOpen} onOpenChange={(open) => updateUISettings({ mobileMenuOpen: open })}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-foreground">OA</span>
                      </div>
                      <div>
                        <h2 className="font-semibold">智慧OA系统</h2>
                        <p className="text-xs text-muted-foreground">企业办公自动化</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="space-y-2">
                      {modules.map((module) => {
                        const IconComponent = module.icon
                        return (
                          <Button
                            key={module.id}
                            variant={activeTab === module.id ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => {
                              setActiveTab(module.id)
                              updateUISettings({ mobileMenuOpen: false })
                            }}
                          >
                            <IconComponent className="h-4 w-4 mr-2" />
                            {module.name}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <h1 className="font-semibold">
                {modules.find(m => m.id === activeTab)?.name || '智慧OA系统'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateUISettings({ theme: uiSettings.theme === 'light' ? 'dark' : 'light' })}
              >
                {uiSettings.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={currentUser?.avatar} />
                    <AvatarFallback className="text-xs">{currentUser?.name?.[0]}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{currentUser?.name}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}

        <div className="flex h-screen">
          {/* Desktop Sidebar */}
          {!isMobile && (
            <div className={`bg-card border-r transition-all duration-300 ${
              uiSettings.sidebarCollapsed ? 'w-16' : 'w-64'
            }`}>
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className={`font-bold text-primary-foreground ${uiSettings.sidebarCollapsed ? 'text-sm' : 'text-base'}`}>
                      OA
                    </span>
                  </div>
                  {!uiSettings.sidebarCollapsed && (
                    <div className="min-w-0">
                      <h2 className="font-semibold truncate">智慧OA系统</h2>
                      <p className="text-xs text-muted-foreground truncate">企业办公自动化</p>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateUISettings({ sidebarCollapsed: !uiSettings.sidebarCollapsed })}
                    className="ml-auto flex-shrink-0"
                  >
                    {uiSettings.sidebarCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-2 space-y-1 overflow-y-auto">
                {modules.map((module) => {
                  const IconComponent = module.icon
                  return (
                    <Tooltip key={module.id} delayDuration={uiSettings.sidebarCollapsed ? 0 : 1000}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={activeTab === module.id ? "default" : "ghost"}
                          className={`w-full ${uiSettings.sidebarCollapsed ? 'px-2' : 'justify-start'}`}
                          onClick={() => setActiveTab(module.id)}
                        >
                          <IconComponent className="h-4 w-4 flex-shrink-0" />
                          {!uiSettings.sidebarCollapsed && (
                            <span className="ml-2 truncate">{module.name}</span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      {uiSettings.sidebarCollapsed && (
                        <TooltipContent side="right">
                          <p>{module.name}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  )
                })}
              </div>

              {/* User Profile in Sidebar */}
              {!uiSettings.sidebarCollapsed && (
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-card">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser?.avatar} />
                      <AvatarFallback className="text-xs">{currentUser?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{currentUser?.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{currentUser?.role}</div>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                          <LogOut className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>退出登录</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Desktop Header */}
            {!isMobile && (
              <div className="border-b bg-card px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">
                      {modules.find(m => m.id === activeTab)?.name || '智慧OA系统'}
                    </h1>
                    <p className="text-muted-foreground">
                      {getModuleDescription(activeTab)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="搜索功能..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>

                    {/* Layout Toggle */}
                    <div className="flex border rounded-md">
                      <Button
                        variant={uiSettings.layout === 'grid' ? "default" : "ghost"}
                        size="sm"
                        onClick={() => updateUISettings({ layout: 'grid' })}
                      >
                        <Grid3x3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={uiSettings.layout === 'list' ? "default" : "ghost"}
                        size="sm"
                        onClick={() => updateUISettings({ layout: 'list' })}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={uiSettings.layout === 'columns' ? "default" : "ghost"}
                        size="sm"
                        onClick={() => updateUISettings({ layout: 'columns' })}
                      >
                        <Columns className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Theme Toggle */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateUISettings({
                        theme: uiSettings.theme === 'light' ? 'dark' : uiSettings.theme === 'dark' ? 'system' : 'light'
                      })}
                    >
                      {uiSettings.theme === 'light' && <Sun className="h-4 w-4" />}
                      {uiSettings.theme === 'dark' && <Moon className="h-4 w-4" />}
                      {uiSettings.theme === 'system' && <Monitor className="h-4 w-4" />}
                    </Button>

                    {/* Compact Mode */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={uiSettings.compactMode ? "default" : "outline"}
                          size="icon"
                          onClick={() => updateUISettings({ compactMode: !uiSettings.compactMode })}
                        >
                          <Zap className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>紧凑模式</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* User Menu */}
                    <div className="flex items-center gap-3 pl-4 border-l">
                      <div className="text-right">
                        <div className="font-medium text-sm">{currentUser?.name}</div>
                        <div className="text-xs text-muted-foreground">{currentUser?.role}</div>
                      </div>
                      <Avatar className="h-8 w-8 cursor-pointer" onClick={() => setActiveTab('profile')}>
                        <AvatarImage src={currentUser?.avatar} />
                        <AvatarFallback className="text-xs">{currentUser?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <Button variant="ghost" size="icon" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'dashboard' ? (
                <div className="p-6 space-y-6 overflow-y-auto h-full">
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      新建项目
                    </Button>
                    <Button size="sm" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      添加员工
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      发起聊天
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileCheck className="h-4 w-4 mr-2" />
                      新建审批
                    </Button>
                  </div>

                  {/* Module Grid */}
                  <div className={`grid gap-${uiSettings.compactMode ? '4' : '6'} ${
                    uiSettings.layout === 'grid'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                      : uiSettings.layout === 'list'
                      ? 'grid-cols-1'
                      : 'grid-cols-1 lg:grid-cols-2'
                  }`}>
                    {filteredModules.map(renderModuleCard)}
                  </div>

                  {/* Quick Stats */}
                  {activeTab === 'dashboard' && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">系统概览</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">在线用户</p>
                                <p className="text-2xl font-bold">24</p>
                              </div>
                              <Users className="h-8 w-8 text-green-500" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">活跃项目</p>
                                <p className="text-2xl font-bold">12</p>
                              </div>
                              <FolderOpen className="h-8 w-8 text-blue-500" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">待处理审批</p>
                                <p className="text-2xl font-bold">8</p>
                              </div>
                              <FileCheck className="h-8 w-8 text-orange-500" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">本月收入</p>
                                <p className="text-2xl font-bold">¥286K</p>
                              </div>
                              <DollarSign className="h-8 w-8 text-emerald-500" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full">
                  {ActiveComponent && <ActiveComponent />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
