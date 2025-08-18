"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import {
  CalendarDays, Clock, Users, MapPin, Bell, Video, Plus, Edit, Trash2,
  Search, Filter, ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw,
  AlertCircle, CheckCircle, XCircle,
  Globe, Lock, Eye, EyeOff, UserPlus, Send, Download
} from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  date: string
  type: 'meeting' | 'task' | 'reminder' | 'holiday' | 'training'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  attendees: string[]
  location?: string
  isOnline: boolean
  meetingLink?: string
  reminder: number // 提前提醒时间（分钟）
  isRecurring: boolean
  recurrenceRule?: string
  createdBy: string
  visibility: 'public' | 'private' | 'internal'
  tags: string[]
  attachments?: string[]
}

interface CalendarView {
  mode: 'month' | 'week' | 'day' | 'agenda'
  currentDate: Date
  selectedDate: Date | null
}

export function CalendarModule() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [view, setView] = useState<CalendarView>({
    mode: 'month',
    currentDate: new Date(),
    selectedDate: null
  })
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "10:00",
    type: "meeting",
    priority: "medium",
    status: "scheduled",
    attendees: [],
    isOnline: false,
    reminder: 15,
    isRecurring: false,
    visibility: "internal",
    tags: []
  })

  // 模拟数据初始化
  useEffect(() => {
    initializeCalendarData()
  }, [])

  const initializeCalendarData = () => {
    const mockEvents: CalendarEvent[] = [
      {
        id: "event1",
        title: "团队周会",
        description: "讨论本周工作进展和下周计划",
        startTime: "09:00",
        endTime: "10:00",
        date: new Date().toISOString().split('T')[0],
        type: "meeting",
        priority: "medium",
        status: "scheduled",
        attendees: ["张三", "李四", "王五"],
        location: "会议室A",
        isOnline: false,
        reminder: 15,
        isRecurring: true,
        recurrenceRule: "weekly",
        createdBy: "系统管理员",
        visibility: "internal",
        tags: ["团队", "例会"]
      },
      {
        id: "event2",
        title: "产品演示",
        description: "向客户展示新产品功能",
        startTime: "14:00",
        endTime: "15:30",
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        type: "meeting",
        priority: "high",
        status: "scheduled",
        attendees: ["产品经理", "技术总监", "销售经理"],
        location: "线上会议",
        isOnline: true,
        meetingLink: "https://zoom.us/meeting/123",
        reminder: 30,
        isRecurring: false,
        createdBy: "产品经理",
        visibility: "internal",
        tags: ["产品", "演示", "客户"]
      },
      {
        id: "event3",
        title: "月度总结报告",
        description: "准备并提交月度工作总结",
        startTime: "16:00",
        endTime: "17:00",
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        type: "task",
        priority: "high",
        status: "scheduled",
        attendees: [],
        isOnline: false,
        reminder: 60,
        isRecurring: false,
        createdBy: "系统管理员",
        visibility: "private",
        tags: ["报告", "总结"]
      }
    ]
    setEvents(mockEvents)
  }

  // 创建事件
  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.endTime) {
      toast.error("请填写完整的事件信息")
      return
    }

    const event: CalendarEvent = {
      id: `event_${Date.now()}`,
      title: newEvent.title!,
      description: newEvent.description || "",
      startTime: newEvent.startTime!,
      endTime: newEvent.endTime!,
      date: newEvent.date!,
      type: newEvent.type as CalendarEvent['type'] || "meeting",
      priority: newEvent.priority as CalendarEvent['priority'] || "medium",
      status: "scheduled",
      attendees: newEvent.attendees || [],
      location: newEvent.location,
      isOnline: newEvent.isOnline || false,
      meetingLink: newEvent.meetingLink,
      reminder: newEvent.reminder || 15,
      isRecurring: newEvent.isRecurring || false,
      recurrenceRule: newEvent.recurrenceRule,
      createdBy: "当前用户",
      visibility: newEvent.visibility as CalendarEvent['visibility'] || "internal",
      tags: newEvent.tags || [],
      attachments: []
    }

    setEvents(prev => [event, ...prev])
    setIsCreateModalOpen(false)
    setNewEvent({
      title: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      startTime: "09:00",
      endTime: "10:00",
      type: "meeting",
      priority: "medium",
      attendees: [],
      isOnline: false,
      reminder: 15,
      isRecurring: false,
      visibility: "internal",
      tags: []
    })
    toast.success("事件创建成功")
  }

  // 更新事件状态
  const updateEventStatus = (eventId: string, status: CalendarEvent['status']) => {
    setEvents(prev => prev.map(event =>
      event.id === eventId ? { ...event, status } : event
    ))
    toast.success("事件状态已更新")
  }

  // 删除事件
  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId))
    toast.success("事件已删除")
  }

  // 过滤事件
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || event.type === filterType
    return matchesSearch && matchesType
  })

  // 获取当天事件
  const getTodayEvents = () => {
    const today = new Date().toISOString().split('T')[0]
    return filteredEvents.filter(event => event.date === today)
  }

  // 获取即将到来的事件
  const getUpcomingEvents = () => {
    const today = new Date()
    return filteredEvents
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
  }

  // 获取事件类型颜色
  const getEventTypeColor = (type: CalendarEvent['type']) => {
    const colors = {
      meeting: "bg-blue-100 text-blue-800 border-blue-200",
      task: "bg-green-100 text-green-800 border-green-200",
      reminder: "bg-yellow-100 text-yellow-800 border-yellow-200",
      holiday: "bg-red-100 text-red-800 border-red-200",
      training: "bg-purple-100 text-purple-800 border-purple-200"
    }
    return colors[type]
  }

  // 获取优先级颜色
  const getPriorityColor = (priority: CalendarEvent['priority']) => {
    const colors = {
      low: "bg-gray-100 text-gray-600",
      medium: "bg-blue-100 text-blue-600",
      high: "bg-orange-100 text-orange-600",
      urgent: "bg-red-100 text-red-600"
    }
    return colors[priority]
  }

  return (
    <div className="space-y-6">
      {/* 头部操作区 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">日程管理</h2>
          <p className="text-sm text-gray-600">管理您的会议、任务和重要事件</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                新建事件
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>创建新事件</DialogTitle>
                <DialogDescription>
                  填写事件详细信息，系统将自动发送提醒通知
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">事件标题 *</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="输入事件标题"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">事件类型</Label>
                    <Select value={newEvent.type} onValueChange={(value) => setNewEvent(prev => ({ ...prev, type: value as CalendarEvent['type'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meeting">会议</SelectItem>
                        <SelectItem value="task">任务</SelectItem>
                        <SelectItem value="reminder">提醒</SelectItem>
                        <SelectItem value="training">培训</SelectItem>
                        <SelectItem value="holiday">假期</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">事件描述</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="描述事件详情、议程等信息"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">日期 *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">开始时间 *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">结束时间 *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">优先级</Label>
                    <Select value={newEvent.priority} onValueChange={(value) => setNewEvent(prev => ({ ...prev, priority: value as CalendarEvent['priority'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">低</SelectItem>
                        <SelectItem value="medium">中</SelectItem>
                        <SelectItem value="high">高</SelectItem>
                        <SelectItem value="urgent">紧急</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reminder">提前提醒</Label>
                    <Select value={newEvent.reminder?.toString()} onValueChange={(value) => setNewEvent(prev => ({ ...prev, reminder: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5分钟前</SelectItem>
                        <SelectItem value="15">15分钟前</SelectItem>
                        <SelectItem value="30">30分钟前</SelectItem>
                        <SelectItem value="60">1小时前</SelectItem>
                        <SelectItem value="1440">1天前</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isOnline"
                      checked={newEvent.isOnline}
                      onCheckedChange={(checked) => setNewEvent(prev => ({ ...prev, isOnline: checked }))}
                    />
                    <Label htmlFor="isOnline">线上会议</Label>
                  </div>

                  {newEvent.isOnline ? (
                    <div className="space-y-2">
                      <Label htmlFor="meetingLink">会议链接</Label>
                      <Input
                        id="meetingLink"
                        value={newEvent.meetingLink}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, meetingLink: e.target.value }))}
                        placeholder="https://zoom.us/meeting/123"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="location">会议地点</Label>
                      <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="会议室A / 客户办公室"
                      />
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateEvent} className="bg-blue-600 hover:bg-blue-700">
                  创建事件
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出日程
          </Button>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="搜索事件..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="筛选类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="meeting">会议</SelectItem>
            <SelectItem value="task">任务</SelectItem>
            <SelectItem value="reminder">提醒</SelectItem>
            <SelectItem value="training">培训</SelectItem>
            <SelectItem value="holiday">假期</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 日历视图 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  日历视图
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    今天
                  </Button>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={view.selectedDate || undefined}
                onSelect={(date) => setView(prev => ({ ...prev, selectedDate: date || null }))}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* 事件列表 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>事件列表</CardTitle>
              <CardDescription>
                共 {filteredEvents.length} 个事件
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.type === 'meeting' ? '会议' :
                           event.type === 'task' ? '任务' :
                           event.type === 'reminder' ? '提醒' :
                           event.type === 'training' ? '培训' : '假期'}
                        </Badge>
                        <Badge className={getPriorityColor(event.priority)}>
                          {event.priority === 'low' ? '低' :
                           event.priority === 'medium' ? '中' :
                           event.priority === 'high' ? '高' : '紧急'}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600">{event.description}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <CalendarDays className="h-3 w-3 mr-1" />
                          {event.date}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {event.startTime} - {event.endTime}
                        </span>
                        {event.location && (
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.location}
                          </span>
                        )}
                        {event.attendees.length > 0 && (
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {event.attendees.length} 人
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {event.status === 'scheduled' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateEventStatus(event.id, 'completed')}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredEvents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无事件</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 今日事件 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">今日事件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getTodayEvents().map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-600">{event.startTime} - {event.endTime}</p>
                    </div>
                  </div>
                ))}

                {getTodayEvents().length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">今日无事件</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 即将到来的事件 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">即将到来</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getUpcomingEvents().map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-600">{event.date} {event.startTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 快速统计 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">统计概览</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">总事件数</span>
                  <Badge variant="secondary">{events.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">今日事件</span>
                  <Badge variant="secondary">{getTodayEvents().length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">待完成</span>
                  <Badge variant="secondary">
                    {events.filter(e => e.status === 'scheduled').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">已完成</span>
                  <Badge variant="secondary">
                    {events.filter(e => e.status === 'completed').length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 事件详情模态框 */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedEvent.title}
                <Badge className={getEventTypeColor(selectedEvent.type)}>
                  {selectedEvent.type === 'meeting' ? '会议' :
                   selectedEvent.type === 'task' ? '任务' :
                   selectedEvent.type === 'reminder' ? '提醒' :
                   selectedEvent.type === 'training' ? '培训' : '假期'}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">描述</h4>
                <p className="text-gray-600">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">时间信息</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>日期: {selectedEvent.date}</p>
                    <p>时间: {selectedEvent.startTime} - {selectedEvent.endTime}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">地点信息</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    {selectedEvent.isOnline ? (
                      <div>
                        <p>线上会议</p>
                        {selectedEvent.meetingLink && (
                          <a href={selectedEvent.meetingLink} className="text-blue-600 hover:underline">
                            会议链接
                          </a>
                        )}
                      </div>
                    ) : (
                      <p>{selectedEvent.location || '未指定'}</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedEvent.attendees.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">参会人员</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.attendees.map((attendee, index) => (
                      <Badge key={index} variant="outline">
                        {attendee}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                关闭
              </Button>
              <Button onClick={() => updateEventStatus(selectedEvent.id, 'completed')}>
                标记完成
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
