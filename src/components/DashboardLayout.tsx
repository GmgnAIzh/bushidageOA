"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Home,
  Users,
  Briefcase,
  DollarSign,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Menu,
  Bell,
  Wallet,
  TrendingUp,
  UserCheck,
  Send,
  BarChart3
} from "lucide-react"
import { User } from "@/lib/data-service"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: User
  onLogout: () => void
  activeTab: string
  onTabChange: (tab: string) => void
}

const menuItems = [
  { id: "dashboard", label: "控制台", icon: Home },
  { id: "employees", label: "员工管理", icon: Users },
  { id: "projects", label: "项目管理", icon: Briefcase },
  { id: "finance", label: "财务管理", icon: Wallet },
  { id: "payments", label: "支付申请", icon: DollarSign },
  { id: "communication", label: "内部聊天", icon: MessageSquare },
  { id: "reports", label: "数据分析", icon: BarChart3 },
  { id: "approvals", label: "审批流程", icon: UserCheck },
  { id: "announcements", label: "公告通知", icon: FileText },
  { id: "telegram", label: "TG机器人", icon: Send },
  { id: "settings", label: "系统设置", icon: Settings },
]

export function DashboardLayout({ children, user, onLogout, activeTab, onTabChange }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const Sidebar = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'w-full' : 'w-64'} bg-zinc-900 text-white flex flex-col h-full`}>
      <div className="p-6 border-b border-zinc-700">
        <h1 className="text-xl font-bold text-zinc-100">数字化OA系统</h1>
        <p className="text-sm text-zinc-400 mt-1">Enterprise Office</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id)
                if (isMobile) setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-zinc-700">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-zinc-700 text-white">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-zinc-400 truncate">{user.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800"
        >
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </Button>
      </div>
    </div>
  )

  return (
    <div className="h-screen flex bg-zinc-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar isMobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-zinc-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <Sidebar isMobile />
                </SheetContent>
              </Sheet>

              <div>
                <h2 className="text-xl font-semibold text-zinc-900">
                  {menuItems.find(item => item.id === activeTab)?.label || "控制台"}
                </h2>
                <p className="text-sm text-zinc-600">
                  {new Date().toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-xs">
                  3
                </Badge>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 px-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-zinc-700 text-white">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block text-sm font-medium">
                      {user.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onTabChange('profile')}>
                    个人资料
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTabChange('settings')}>
                    系统设置
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-red-600">
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
