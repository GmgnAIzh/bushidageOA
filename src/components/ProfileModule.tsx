"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { dataService, User } from "@/lib/data-service"
import { toast } from "sonner"
import { User as UserIcon, Settings, Bell, Lock, Save, Upload, Camera, Eye, EyeOff, Shield, Smartphone, Mail, Phone, MapPin, Calendar, Briefcase } from "lucide-react"

export function ProfileModule() {
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    location: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [preferences, setPreferences] = useState({
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    dateFormat: 'YYYY-MM-DD',
    theme: 'light',
    emailNotifications: true,
    pushNotifications: true,
    soundNotifications: false,
    weeklyReport: true,
    marketingEmails: false
  })

  useEffect(() => {
    const currentUser = dataService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setProfileForm({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        role: currentUser.role,
        department: currentUser.department,
        location: currentUser.location || ''
      })
    }
  }, [])

  const handleSaveProfile = () => {
    if (!user) return

    const updatedUser = {
      ...user,
      ...profileForm
    }

    dataService.updateUser(user.id, updatedUser)
    dataService.setCurrentUser(updatedUser)
    setUser(updatedUser)
    setIsEditing(false)
    toast.success("个人信息已更新")
  }

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("请填写完整的密码信息")
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("新密码和确认密码不匹配")
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("新密码长度至少6位")
      return
    }

    // 这里应该验证当前密码，暂时跳过
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    toast.success("密码修改成功")
  }

  const handleSavePreferences = () => {
    localStorage.setItem('user_preferences', JSON.stringify(preferences))
    toast.success("偏好设置已保存")
  }

  const handleAvatarUpload = () => {
    // 模拟头像上传
    toast.success("头像上传成功")
  }

  const getAccountType = () => {
    if (!user) return "普通用户"
    if (user.role.includes("管理") || user.role.includes("总监")) return "管理员"
    if (user.role.includes("主管") || user.role.includes("经理")) return "主管"
    return "员工"
  }

  const getAccountBadge = () => {
    const type = getAccountType()
    switch (type) {
      case "管理员":
        return <Badge className="bg-red-100 text-red-800">管理员</Badge>
      case "主管":
        return <Badge className="bg-blue-100 text-blue-800">主管</Badge>
      default:
        return <Badge className="bg-green-100 text-green-800">员工</Badge>
    }
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-zinc-600">加载用户信息中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">个人资料</h1>
          <p className="text-zinc-600 mt-1">管理您的个人信息和偏好设置</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 用户信息卡片 */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar className="w-20 h-20 mx-auto">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-lg">{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
                    onClick={handleAvatarUpload}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="text-lg font-semibold mt-4">{user.name}</h3>
                <p className="text-zinc-600 text-sm">{user.role}</p>
                <div className="flex justify-center mt-2">
                  {getAccountBadge()}
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-600">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-600">{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-600">{user.department}</span>
                </div>
                {user.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-600">{user.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-600">加入于 {user.joinDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">基本信息</TabsTrigger>
              <TabsTrigger value="security">安全设置</TabsTrigger>
              <TabsTrigger value="preferences">偏好设置</TabsTrigger>
              <TabsTrigger value="activity">活动记录</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5" />
                        个人信息
                      </CardTitle>
                      <CardDescription>编辑您的基本信息</CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "outline" : "default"}
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? "取消" : "编辑"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">姓名</Label>
                      <Input
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">邮箱</Label>
                      <Input
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">电话</Label>
                      <Input
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="输入电话号码"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">所在地</Label>
                      <Input
                        value={profileForm.location}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="输入所在城市"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">职位</Label>
                      <Input
                        value={profileForm.role}
                        disabled={true}
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">部门</Label>
                      <Input
                        value={profileForm.department}
                        disabled={true}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        取消
                      </Button>
                      <Button onClick={handleSaveProfile} className="bg-zinc-900 hover:bg-zinc-800">
                        <Save className="w-4 h-4 mr-2" />
                        保存更改
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>账户统计</CardTitle>
                  <CardDescription>您的账户使用情况</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-sm text-zinc-600">已提交申请</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">8</div>
                      <div className="text-sm text-zinc-600">已通过审批</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">3</div>
                      <div className="text-sm text-zinc-600">待处理</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">156</div>
                      <div className="text-sm text-zinc-600">消息数量</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    修改密码
                  </CardTitle>
                  <CardDescription>定期更换密码以保护账户安全</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">当前密码</Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="输入当前密码"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword">新密码</Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="输入新密码"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">确认新密码</Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="再次输入新密码"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleChangePassword} className="bg-zinc-900 hover:bg-zinc-800">
                    <Save className="w-4 h-4 mr-2" />
                    更新密码
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    安全设置
                  </CardTitle>
                  <CardDescription>管理您的账户安全选项</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>两步验证</Label>
                      <p className="text-sm text-zinc-600">启用后需要验证码才能登录</p>
                    </div>
                    <Switch checked={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>登录提醒</Label>
                      <p className="text-sm text-zinc-600">新设备登录时发送邮件提醒</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>会话管理</Label>
                      <p className="text-sm text-zinc-600">自动登出其他设备</p>
                    </div>
                    <Button variant="outline" size="sm">管理会话</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>最近登录记录</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <div>
                        <div className="font-medium">当前会话</div>
                        <div className="text-sm text-zinc-600">Chrome on Windows • 192.168.1.100</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">活跃</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <div>
                        <div className="font-medium">移动设备</div>
                        <div className="text-sm text-zinc-600">Safari on iOS • 192.168.1.101</div>
                      </div>
                      <div className="text-sm text-zinc-500">2小时前</div>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <div className="font-medium">办公电脑</div>
                        <div className="text-sm text-zinc-600">Edge on Windows • 192.168.1.102</div>
                      </div>
                      <div className="text-sm text-zinc-500">1天前</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    偏好设置
                  </CardTitle>
                  <CardDescription>自定义您的使用体验</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="language">语言</Label>
                      <Select value={preferences.language} onValueChange={(value) =>
                        setPreferences(prev => ({ ...prev, language: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zh-CN">简体中文</SelectItem>
                          <SelectItem value="en-US">English</SelectItem>
                          <SelectItem value="ja-JP">日本語</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timezone">时区</Label>
                      <Select value={preferences.timezone} onValueChange={(value) =>
                        setPreferences(prev => ({ ...prev, timezone: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Shanghai">上海 (UTC+8)</SelectItem>
                          <SelectItem value="Asia/Tokyo">东京 (UTC+9)</SelectItem>
                          <SelectItem value="America/New_York">纽约 (UTC-5)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dateFormat">日期格式</Label>
                      <Select value={preferences.dateFormat} onValueChange={(value) =>
                        setPreferences(prev => ({ ...prev, dateFormat: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YYYY-MM-DD">2024-01-01</SelectItem>
                          <SelectItem value="MM/DD/YYYY">01/01/2024</SelectItem>
                          <SelectItem value="DD/MM/YYYY">01/01/2024</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="theme">主题</Label>
                      <Select value={preferences.theme} onValueChange={(value) =>
                        setPreferences(prev => ({ ...prev, theme: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">浅色</SelectItem>
                          <SelectItem value="dark">深色</SelectItem>
                          <SelectItem value="auto">跟随系统</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleSavePreferences} className="bg-zinc-900 hover:bg-zinc-800">
                    <Save className="w-4 h-4 mr-2" />
                    保存偏好设置
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    通知设置
                  </CardTitle>
                  <CardDescription>管理您接收通知的方式</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>邮件通知</Label>
                      <p className="text-sm text-zinc-600">接收重要事件的邮件通知</p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>推送通知</Label>
                      <p className="text-sm text-zinc-600">接收浏览器推送通知</p>
                    </div>
                    <Switch
                      checked={preferences.pushNotifications}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, pushNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>声音提醒</Label>
                      <p className="text-sm text-zinc-600">新消息时播放提示音</p>
                    </div>
                    <Switch
                      checked={preferences.soundNotifications}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, soundNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>周报邮件</Label>
                      <p className="text-sm text-zinc-600">每周接收工作总结邮件</p>
                    </div>
                    <Switch
                      checked={preferences.weeklyReport}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, weeklyReport: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>营销邮件</Label>
                      <p className="text-sm text-zinc-600">接收产品更新和促销信息</p>
                    </div>
                    <Switch
                      checked={preferences.marketingEmails}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, marketingEmails: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>最近活动</CardTitle>
                  <CardDescription>您在系统中的操作记录</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="font-medium">提交了费用报销申请</div>
                        <div className="text-sm text-zinc-600">申请ID: EXP001 - 报销差旅费用 ¥1,200</div>
                        <div className="text-xs text-zinc-500 mt-1">2小时前</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="font-medium">更新了个人资料</div>
                        <div className="text-sm text-zinc-600">修改了联系电话和所在地信息</div>
                        <div className="text-xs text-zinc-500 mt-1">1天前</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="font-medium">参与了群组讨论</div>
                        <div className="text-sm text-zinc-600">在"开发团队"群组中发送了15条消息</div>
                        <div className="text-xs text-zinc-500 mt-1">1天前</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="font-medium">查看了公司公告</div>
                        <div className="text-sm text-zinc-600">阅读了"2024年度工作计划"公告</div>
                        <div className="text-xs text-zinc-500 mt-1">2天前</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-zinc-400 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="font-medium">登录系统</div>
                        <div className="text-sm text-zinc-600">从Chrome浏览器登录，IP: 192.168.1.100</div>
                        <div className="text-xs text-zinc-500 mt-1">3天前</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
