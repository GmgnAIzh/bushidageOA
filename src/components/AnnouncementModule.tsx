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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { dataService, Announcement } from "@/lib/data-service"
import { toast } from "sonner"
import { Plus, Pin, Eye, Heart, MessageCircle, Edit, Trash2, Send, Calendar, AlertTriangle, Bell, PinIcon, Settings, Users, Target, Zap, Clock } from "lucide-react"

export function AnnouncementModule() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [isNewAnnouncementOpen, setIsNewAnnouncementOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal' as 'low' | 'normal' | 'high',
    departments: [] as string[],
    isPinned: false,
    expiryDate: ''
  })
  const currentUser = dataService.getCurrentUser()
  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotification: true,
    pushNotification: true,
    smsNotification: false,
    digestMode: 'immediate', // immediate, daily, weekly
    priorityFilter: 'all', // all, high, urgent
    departmentFilter: 'all'
  })
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false)

  useEffect(() => {
    dataService.initializeData()
    setAnnouncements(dataService.getAnnouncements())
    // 初始化员工数据
    const fetchEmployees = async () => {
      const employeeData = await dataService.getEmployees()
      setEmployees(employeeData)
    }
    fetchEmployees()
  }, [])

  const sendNotificationToUsers = async (announcement: Announcement) => {
    // 根据公告的部门范围确定通知对象
    const targetUsers = employees.filter(emp =>
      announcement.departments.includes('全公司') ||
      announcement.departments.includes(emp.department)
    )

    // 创建通知记录
    const notificationData = {
      id: `notif-${Date.now()}`,
      type: 'announcement',
      title: `新公告：${announcement.title}`,
      content: announcement.content.substring(0, 100) + '...',
      priority: announcement.priority,
      category: announcement.category,
      recipients: targetUsers.map(user => ({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        status: 'sent', // sent, delivered, read
        sentAt: new Date().toISOString()
      })),
      createdAt: new Date().toISOString(),
      createdBy: announcement.author,
      announcementId: announcement.id,
      deliveryMethods: getDeliveryMethods(announcement.priority),
      statistics: {
        totalSent: targetUsers.length,
        delivered: 0,
        read: 0,
        failed: 0
      }
    }

    // 模拟发送通知
    setNotifications(prev => [notificationData, ...prev])

    // 根据设置发送不同类型的通知
    if (notificationSettings.emailNotification) {
      await simulateEmailNotification(targetUsers, announcement)
    }

    if (notificationSettings.pushNotification) {
      await simulatePushNotification(targetUsers, announcement)
    }

    if (notificationSettings.smsNotification && announcement.priority === 'high') {
      await simulateSMSNotification(targetUsers, announcement)
    }

    toast.success(`已向 ${targetUsers.length} 名员工发送通知`)
  }

  const getDeliveryMethods = (priority: string) => {
    const methods = ['system']

    if (notificationSettings.emailNotification) methods.push('email')
    if (notificationSettings.pushNotification) methods.push('push')
    if (notificationSettings.smsNotification && priority === 'high') methods.push('sms')

    return methods
  }

  const simulateEmailNotification = async (users: any[], announcement: Announcement) => {
    // 模拟邮件发送延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log(`📧 邮件通知已发送给 ${users.length} 名用户`)
    console.log('邮件内容:', {
      subject: `[公司公告] ${announcement.title}`,
      body: announcement.content,
      priority: announcement.priority
    })
  }

  const simulatePushNotification = async (users: any[], announcement: Announcement) => {
    // 模拟推送通知
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`新公告：${announcement.title}`, {
        body: announcement.content.substring(0, 100),
        icon: '/icon-192x192.png',
        tag: announcement.id
      })
    }

    console.log(`🔔 推送通知已发送给 ${users.length} 名用户`)
  }

  const simulateSMSNotification = async (users: any[], announcement: Announcement) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    console.log(`📱 短信通知已发送给 ${users.length} 名用户`)
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        toast.success('已开启浏览器通知权限')
      } else {
        toast.error('通知权限被拒绝')
      }
    }
  }

  const handlePublishAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.content || !currentUser) {
      toast.error("请填写完整的公告信息")
      return
    }

    const newAnnouncement: Announcement = {
      id: `ANN${Date.now()}`,
      title: announcementForm.title,
      content: announcementForm.content,
      author: currentUser.name,
      authorId: currentUser.id,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      publishTime: dataService.getCurrentDateTime(),
      category: announcementForm.category,
      priority: announcementForm.priority,
      status: 'published',
      isPinned: announcementForm.isPinned,
      readCount: 0,
      likeCount: 0,
      commentCount: 0,
      departments: announcementForm.departments.length > 0 ? announcementForm.departments : ['全公司'],
      attachments: [],
      expiryDate: announcementForm.expiryDate
    }

    // 添加到公告列表并保存
    const updatedAnnouncements = [newAnnouncement, ...announcements]
    setAnnouncements(updatedAnnouncements)
    dataService.saveAnnouncements(updatedAnnouncements)

    // 发送通知
    await sendNotificationToUsers(newAnnouncement)

    setIsNewAnnouncementOpen(false)
    setAnnouncementForm({
      title: '',
      content: '',
      category: 'general',
      priority: 'normal',
      departments: [],
      isPinned: false,
      expiryDate: ''
    })
    toast.success("公告发布成功并已通知相关人员")
  }

  const togglePinAnnouncement = (announcementId: string) => {
    const announcement = announcements.find(a => a.id === announcementId)
    if (announcement) {
      const updatedAnnouncements = announcements.map(a =>
        a.id === announcementId
          ? { ...a, isPinned: !a.isPinned }
          : a
      )
      setAnnouncements(updatedAnnouncements)
      dataService.saveAnnouncements(updatedAnnouncements)
      toast.success(announcement.isPinned ? "取消置顶" : "置顶成功")
    }
  }

  const likeAnnouncement = (announcementId: string) => {
    const announcement = announcements.find(a => a.id === announcementId)
    if (announcement) {
      const updatedAnnouncements = announcements.map(a =>
        a.id === announcementId
          ? { ...a, likeCount: a.likeCount + 1 }
          : a
      )
      setAnnouncements(updatedAnnouncements)
      dataService.saveAnnouncements(updatedAnnouncements)
    }
  }

  const viewAnnouncement = (announcement: Announcement) => {
    const updatedAnnouncements = announcements.map(a =>
      a.id === announcement.id
        ? { ...a, readCount: a.readCount + 1 }
        : a
    )
    setAnnouncements(updatedAnnouncements)
    dataService.saveAnnouncements(updatedAnnouncements)
    setSelectedAnnouncement(announcement)
    setIsDetailOpen(true)
  }

  const deleteAnnouncement = (announcementId: string) => {
    const updatedAnnouncements = announcements.filter(a => a.id !== announcementId)
    setAnnouncements(updatedAnnouncements)
    dataService.saveAnnouncements(updatedAnnouncements)
    toast.success("公告已删除")
  }

  const handleTogglePin = (announcementId: string) => {
    togglePinAnnouncement(announcementId)
  }

  const handleToggleLike = (announcementId: string) => {
    likeAnnouncement(announcementId)
  }

  const handleReadAnnouncement = (announcement: Announcement) => {
    viewAnnouncement(announcement)
  }

  const handleDeleteAnnouncement = (announcementId: string) => {
    deleteAnnouncement(announcementId)
  }

  const handleEditAnnouncement = (announcement: Announcement) => {
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      priority: announcement.priority,
      departments: announcement.departments,
      isPinned: announcement.isPinned,
      expiryDate: announcement.expiryDate || ''
    })
    setSelectedAnnouncement(announcement)
    setIsNewAnnouncementOpen(true)
    toast.success('公告信息已加载到编辑表单')
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />重要</Badge>
      case 'normal':
        return <Badge className="bg-blue-100 text-blue-800"><Bell className="w-3 h-3 mr-1" />普通</Badge>
      case 'low':
        return <Badge className="bg-zinc-100 text-zinc-800">一般</Badge>
      default:
        return <Badge className="bg-zinc-100 text-zinc-800">普通</Badge>
    }
  }

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      general: '综合通知',
      policy: '政策制度',
      event: '活动公告',
      urgent: '紧急通知',
      hr: '人事公告',
      finance: '财务通知'
    }
    return categories[category] || category
  }

  const formatPublishTime = (time: string) => {
    const now = new Date()
    const publishTime = new Date(time)
    const diffTime = now.getTime() - publishTime.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return '今天'
    } else if (diffDays === 1) {
      return '昨天'
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      return publishTime.toLocaleDateString('zh-CN')
    }
  }

  const departmentOptions = [
    '技术部', '市场部', '财务部', '人事部', '运营部', '产品部'
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">公告通知</h1>
          <p className="text-zinc-600 mt-1">发布和管理公司公告通知</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isNotificationSettingsOpen} onOpenChange={setIsNotificationSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                通知设置
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>通知设置</DialogTitle>
                <DialogDescription>配置公告通知的发送方式和频率</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>邮件通知</Label>
                      <p className="text-xs text-muted-foreground">通过邮件接收公告</p>
                    </div>
                    <Checkbox
                      checked={notificationSettings.emailNotification}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, emailNotification: !!checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>推送通知</Label>
                      <p className="text-xs text-muted-foreground">浏览器桌面通知</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={notificationSettings.pushNotification}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, pushNotification: !!checked }))
                        }
                      />
                      <Button size="sm" variant="ghost" onClick={requestNotificationPermission}>
                        <Bell className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>短信通知</Label>
                      <p className="text-xs text-muted-foreground">重要公告短信提醒</p>
                    </div>
                    <Checkbox
                      checked={notificationSettings.smsNotification}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, smsNotification: !!checked }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <Label>通知频率</Label>
                    <Select
                      value={notificationSettings.digestMode}
                      onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, digestMode: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">立即通知</SelectItem>
                        <SelectItem value="daily">每日汇总</SelectItem>
                        <SelectItem value="weekly">每周汇总</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>优先级过滤</Label>
                    <Select
                      value={notificationSettings.priorityFilter}
                      onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, priorityFilter: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部优先级</SelectItem>
                        <SelectItem value="high">仅重要</SelectItem>
                        <SelectItem value="urgent">仅紧急</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => {
                  localStorage.setItem('announcement_notification_settings', JSON.stringify(notificationSettings))
                  toast.success('通知设置已保存')
                  setIsNotificationSettingsOpen(false)
                }}>
                  保存设置
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isNewAnnouncementOpen} onOpenChange={setIsNewAnnouncementOpen}>
            <DialogTrigger asChild>
              <Button className="bg-zinc-900 hover:bg-zinc-800">
                <Plus className="w-4 h-4 mr-2" />
                发布公告
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>发布新公告</DialogTitle>
                <DialogDescription>创建并发布公司公告通知</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">公告标题</Label>
                  <Input
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="输入公告标题"
                  />
                </div>
                <div>
                  <Label htmlFor="content">公告内容</Label>
                  <Textarea
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="输入公告详细内容"
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">公告类别</Label>
                    <Select value={announcementForm.category} onValueChange={(value) =>
                      setAnnouncementForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">综合通知</SelectItem>
                        <SelectItem value="policy">政策制度</SelectItem>
                        <SelectItem value="event">活动公告</SelectItem>
                        <SelectItem value="urgent">紧急通知</SelectItem>
                        <SelectItem value="hr">人事公告</SelectItem>
                        <SelectItem value="finance">财务通知</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">优先级</Label>
                    <Select value={announcementForm.priority} onValueChange={(value: 'low' | 'normal' | 'high') =>
                      setAnnouncementForm(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">一般</SelectItem>
                        <SelectItem value="normal">普通</SelectItem>
                        <SelectItem value="high">重要</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="departments">发布范围</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {departmentOptions.map((dept) => (
                      <div key={dept} className="flex items-center space-x-2">
                        <Checkbox
                          id={dept}
                          checked={announcementForm.departments.includes(dept)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAnnouncementForm(prev => ({
                                ...prev,
                                departments: [...prev.departments, dept]
                              }))
                            } else {
                              setAnnouncementForm(prev => ({
                                ...prev,
                                departments: prev.departments.filter(d => d !== dept)
                              }))
                            }
                          }}
                        />
                        <Label htmlFor={dept} className="text-sm">{dept}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPinned"
                      checked={announcementForm.isPinned}
                      onCheckedChange={(checked) =>
                        setAnnouncementForm(prev => ({ ...prev, isPinned: !!checked }))
                      }
                    />
                    <Label htmlFor="isPinned">置顶公告</Label>
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">过期时间（可选）</Label>
                    <Input
                      type="date"
                      value={announcementForm.expiryDate}
                      onChange={(e) => setAnnouncementForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewAnnouncementOpen(false)}>
                  取消
                </Button>
                <Button onClick={handlePublishAnnouncement} className="bg-zinc-900 hover:bg-zinc-800">
                  <Send className="w-4 h-4 mr-2" />
                  发布公告
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">全部公告</TabsTrigger>
          <TabsTrigger value="pinned">置顶公告</TabsTrigger>
          <TabsTrigger value="mine">我发布的</TabsTrigger>
          <TabsTrigger value="notifications">通知记录</TabsTrigger>
          <TabsTrigger value="drafts">草稿箱</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {announcements
            .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
            .map((announcement) => (
            <Card key={announcement.id} className={announcement.isPinned ? 'border-yellow-200 bg-yellow-50' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {announcement.isPinned && <Pin className="w-4 h-4 text-yellow-600" />}
                      <h3 className="text-lg font-semibold text-zinc-900">{announcement.title}</h3>
                      {getPriorityBadge(announcement.priority)}
                      <Badge variant="outline">{getCategoryName(announcement.category)}</Badge>
                    </div>
                    <p className="text-zinc-600 mb-4 line-clamp-2">{announcement.content}</p>
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={announcement.authorAvatar} />
                          <AvatarFallback>{announcement.author[0]}</AvatarFallback>
                        </Avatar>
                        <span>{announcement.author}</span>
                        <span>·</span>
                        <span>{announcement.authorRole}</span>
                      </div>
                      <span>·</span>
                      <span>{formatPublishTime(announcement.publishTime)}</span>
                      <span>·</span>
                      <span>面向: {announcement.departments.join(', ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReadAnnouncement(announcement)}
                    >
                      查看详情
                    </Button>
                    {currentUser?.id === announcement.authorId && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePin(announcement.id)}
                        >
                          <PinIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                  <button
                    className="flex items-center gap-1 text-sm text-zinc-500 hover:text-red-600"
                    onClick={() => handleToggleLike(announcement.id)}
                  >
                    <Heart className="w-4 h-4" />
                    <span>{announcement.likeCount}</span>
                  </button>
                  <div className="flex items-center gap-1 text-sm text-zinc-500">
                    <Eye className="w-4 h-4" />
                    <span>{announcement.readCount}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-zinc-500">
                    <MessageCircle className="w-4 h-4" />
                    <span>{announcement.commentCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pinned" className="space-y-4">
          {announcements.filter(a => a.isPinned).map((announcement) => (
            <Card key={announcement.id} className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Pin className="w-4 h-4 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-zinc-900">{announcement.title}</h3>
                  {getPriorityBadge(announcement.priority)}
                </div>
                <p className="text-zinc-600 mb-4">{announcement.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={announcement.authorAvatar} />
                      <AvatarFallback>{announcement.author[0]}</AvatarFallback>
                    </Avatar>
                    <span>{announcement.author}</span>
                    <span>·</span>
                    <span>{formatPublishTime(announcement.publishTime)}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReadAnnouncement(announcement)}
                  >
                    查看详情
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="mine" className="space-y-4">
          {announcements.filter(a => a.authorId === currentUser?.id).map((announcement) => (
            <Card key={announcement.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-zinc-900">{announcement.title}</h3>
                      {getPriorityBadge(announcement.priority)}
                      <Badge variant="outline">{getCategoryName(announcement.category)}</Badge>
                    </div>
                    <p className="text-zinc-600 mb-4">{announcement.content}</p>
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      <span>发布时间: {announcement.publishTime}</span>
                      <span>阅读量: {announcement.readCount}</span>
                      <span>点赞数: {announcement.likeCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditAnnouncement(announcement)}>
                      <Edit className="w-4 h-4 mr-1" />
                      编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      删除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                通知发送记录
              </CardTitle>
              <CardDescription>查看公告通知的发送状态和统计信息</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                        </div>
                        <Badge variant={notification.priority === 'high' ? 'destructive' : 'default'}>
                          {notification.priority === 'high' ? '重要' : '普通'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-3">
                        <div className="text-center">
                          <div className="font-bold text-blue-600">{notification.statistics.totalSent}</div>
                          <div className="text-xs text-gray-500">总发送</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-green-600">{notification.statistics.delivered}</div>
                          <div className="text-xs text-gray-500">已送达</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-orange-600">{notification.statistics.read}</div>
                          <div className="text-xs text-gray-500">已阅读</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-red-600">{notification.statistics.failed}</div>
                          <div className="text-xs text-gray-500">发送失败</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>发送方式: {notification.deliveryMethods.join(', ')}</span>
                          <span>发送人: {notification.createdBy}</span>
                        </div>
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无通知记录</h3>
                  <p className="text-gray-600">发布公告后，通知记录将显示在这里</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900 mb-2">暂无草稿</h3>
              <p className="text-zinc-600">您还没有保存任何草稿公告</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 公告详情对话框 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {selectedAnnouncement?.isPinned && <Pin className="w-4 h-4 text-yellow-600" />}
              <DialogTitle className="text-xl">{selectedAnnouncement?.title}</DialogTitle>
              {selectedAnnouncement && getPriorityBadge(selectedAnnouncement.priority)}
            </div>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedAnnouncement.authorAvatar} />
                    <AvatarFallback>{selectedAnnouncement.author[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedAnnouncement.author}</div>
                    <div className="text-sm text-zinc-600">{selectedAnnouncement.authorRole}</div>
                  </div>
                </div>
                <div className="text-sm text-zinc-500">
                  <div>发布时间: {selectedAnnouncement.publishTime}</div>
                  <div>面向部门: {selectedAnnouncement.departments.join(', ')}</div>
                </div>
              </div>

              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap bg-zinc-50 p-4 rounded-lg">
                  {selectedAnnouncement.content}
                </div>
              </div>

              <div className="flex items-center gap-6 pt-4 border-t">
                <button
                  className="flex items-center gap-2 text-sm text-zinc-600 hover:text-red-600"
                  onClick={() => handleToggleLike(selectedAnnouncement.id)}
                >
                  <Heart className="w-4 h-4" />
                  <span>点赞 ({selectedAnnouncement.likeCount})</span>
                </button>
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Eye className="w-4 h-4" />
                  <span>阅读量 ({selectedAnnouncement.readCount})</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <MessageCircle className="w-4 h-4" />
                  <span>评论 ({selectedAnnouncement.commentCount})</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
