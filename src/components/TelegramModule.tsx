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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { dataService } from "@/lib/data-service"
import { toast } from "sonner"
import { Bot, Send, Settings, Users, MessageCircle, Bell, Zap, Plus, Copy, Trash2, Eye, EyeOff, Play, Pause, RefreshCw, ExternalLink } from "lucide-react"

interface TelegramBot {
  id: string
  name: string
  token: string
  username: string
  status: 'active' | 'inactive' | 'pending'
  webhookUrl: string
  description: string
  createdAt: string
  messageCount: number
  userCount: number
  lastActivity: string
}

interface AutomationRule {
  id: string
  name: string
  trigger: string
  action: string
  targetChat: string
  message: string
  enabled: boolean
  conditions: string[]
  createdAt: string
}

interface TelegramMessage {
  id: string
  botId: string
  chatId: string
  messageType: 'text' | 'photo' | 'document' | 'sticker'
  content: string
  fromUser: string
  timestamp: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
}

export function TelegramModule() {
  const [bots, setBots] = useState<TelegramBot[]>([])
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [messages, setMessages] = useState<TelegramMessage[]>([])
  const [isNewBotOpen, setIsNewBotOpen] = useState(false)
  const [isNewRuleOpen, setIsNewRuleOpen] = useState(false)
  const [isSendMessageOpen, setIsSendMessageOpen] = useState(false)
  const [showToken, setShowToken] = useState<{ [key: string]: boolean }>({})
  const [botForm, setBotForm] = useState({
    name: '',
    token: '',
    description: ''
  })
  const [ruleForm, setRuleForm] = useState({
    name: '',
    trigger: 'approval_submitted',
    action: 'send_notification',
    targetChat: '',
    message: '',
    conditions: [] as string[]
  })
  const [messageForm, setMessageForm] = useState({
    botId: '',
    chatId: '',
    message: '',
    messageType: 'text' as 'text' | 'photo' | 'document'
  })

  useEffect(() => {
    // 初始化模拟数据
    const mockBots: TelegramBot[] = [
      {
        id: 'bot1',
        name: 'OA通知机器人',
        token: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
        username: '@oa_notification_bot',
        status: 'active',
        webhookUrl: 'https://api.company.com/telegram/webhook',
        description: '自动发送系统通知和审批提醒',
        createdAt: '2024-01-15',
        messageCount: 1247,
        userCount: 156,
        lastActivity: '2分钟前'
      }
    ]

    const mockRules: AutomationRule[] = [
      {
        id: 'rule1',
        name: '审批提交通知',
        trigger: 'approval_submitted',
        action: 'send_notification',
        targetChat: '@managers_group',
        message: '🔔 新的审批申请已提交：{{title}}\n申请人：{{applicant}}\n部门：{{department}}\n请及时处理！',
        enabled: true,
        conditions: ['priority:high', 'amount:>1000'],
        createdAt: '2024-01-10'
      },
      {
        id: 'rule2',
        name: '支付完成通知',
        trigger: 'payment_completed',
        action: 'send_notification',
        targetChat: '@finance_group',
        message: '💰 支付已完成\n金额：{{amount}} {{currency}}\n交易哈希：{{txHash}}',
        enabled: true,
        conditions: [],
        createdAt: '2024-01-12'
      }
    ]

    const mockMessages: TelegramMessage[] = [
      {
        id: 'msg1',
        botId: 'bot1',
        chatId: '@managers_group',
        messageType: 'text',
        content: '🔔 新的审批申请已提交：项目开发费用申请',
        fromUser: 'OA通知机器人',
        timestamp: '2024-01-20 14:30:25',
        status: 'delivered'
      },
      {
        id: 'msg2',
        botId: 'bot1',
        chatId: '@finance_group',
        messageType: 'text',
        content: '💰 支付已完成\n金额：2,500 USDT\n交易哈希：0x7b5c...e8f2',
        fromUser: 'OA通知机器人',
        timestamp: '2024-01-20 13:45:12',
        status: 'delivered'
      }
    ]

    setBots(mockBots)
    setAutomationRules(mockRules)
    setMessages(mockMessages)
  }, [])

  const handleCreateBot = async () => {
    if (!botForm.name || !botForm.token) {
      toast.error("请填写机器人名称和Token")
      return
    }

    try {
      // 模拟验证Token
      const newBot: TelegramBot = {
        id: `bot${Date.now()}`,
        name: botForm.name,
        token: botForm.token,
        username: `@${botForm.name.toLowerCase().replace(/\s+/g, '_')}_bot`,
        status: 'active',
        webhookUrl: `https://api.company.com/telegram/webhook/${Date.now()}`,
        description: botForm.description,
        createdAt: new Date().toISOString().split('T')[0],
        messageCount: 0,
        userCount: 0,
        lastActivity: '刚刚'
      }

      setBots(prev => [...prev, newBot])
      setIsNewBotOpen(false)
      setBotForm({ name: '', token: '', description: '' })
      toast.success("Telegram机器人创建成功")
    } catch (error) {
      toast.error("创建机器人失败，请检查Token是否正确")
    }
  }

  const handleDeleteBot = (botId: string) => {
    setBots(prev => prev.filter(bot => bot.id !== botId))
    toast.success("机器人已删除")
  }

  const handleToggleBotStatus = (botId: string) => {
    setBots(prev => prev.map(bot =>
      bot.id === botId
        ? { ...bot, status: bot.status === 'active' ? 'inactive' : 'active' }
        : bot
    ))
    toast.success("机器人状态已更新")
  }

  const handleCreateRule = () => {
    if (!ruleForm.name || !ruleForm.targetChat || !ruleForm.message) {
      toast.error("请填写完整的自动化规则信息")
      return
    }

    const newRule: AutomationRule = {
      id: `rule${Date.now()}`,
      name: ruleForm.name,
      trigger: ruleForm.trigger,
      action: ruleForm.action,
      targetChat: ruleForm.targetChat,
      message: ruleForm.message,
      enabled: true,
      conditions: ruleForm.conditions,
      createdAt: new Date().toISOString().split('T')[0]
    }

    setAutomationRules(prev => [...prev, newRule])
    setIsNewRuleOpen(false)
    setRuleForm({
      name: '',
      trigger: 'approval_submitted',
      action: 'send_notification',
      targetChat: '',
      message: '',
      conditions: []
    })
    toast.success("自动化规则创建成功")
  }

  const handleToggleRule = (ruleId: string) => {
    setAutomationRules(prev => prev.map(rule =>
      rule.id === ruleId
        ? { ...rule, enabled: !rule.enabled }
        : rule
    ))
    toast.success("规则状态已更新")
  }

  const handleSendMessage = () => {
    if (!messageForm.botId || !messageForm.chatId || !messageForm.message) {
      toast.error("请填写完整的消息信息")
      return
    }

    const newMessage: TelegramMessage = {
      id: `msg${Date.now()}`,
      botId: messageForm.botId,
      chatId: messageForm.chatId,
      messageType: messageForm.messageType,
      content: messageForm.message,
      fromUser: bots.find(b => b.id === messageForm.botId)?.name || 'Unknown Bot',
      timestamp: new Date().toLocaleString('zh-CN'),
      status: 'sent'
    }

    setMessages(prev => [newMessage, ...prev])
    setIsSendMessageOpen(false)
    setMessageForm({
      botId: '',
      chatId: '',
      message: '',
      messageType: 'text'
    })
    toast.success("消息发送成功")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("已复制到剪贴板")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">运行中</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">已停止</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">配置中</Badge>
      default:
        return <Badge className="bg-zinc-100 text-zinc-800">未知</Badge>
    }
  }

  const getMessageStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800">已发送</Badge>
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">已送达</Badge>
      case 'read':
        return <Badge className="bg-purple-100 text-purple-800">已读</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">发送失败</Badge>
      default:
        return <Badge className="bg-zinc-100 text-zinc-800">未知</Badge>
    }
  }

  const getTriggerName = (trigger: string) => {
    const triggers: { [key: string]: string } = {
      approval_submitted: '审批提交',
      approval_approved: '审批通过',
      approval_rejected: '审批拒绝',
      payment_completed: '支付完成',
      payment_failed: '支付失败',
      announcement_published: '公告发布',
      user_login: '用户登录',
      system_alert: '系统警告'
    }
    return triggers[trigger] || trigger
  }

  const getActionName = (action: string) => {
    const actions: { [key: string]: string } = {
      send_notification: '发送通知',
      send_file: '发送文件',
      create_poll: '创建投票',
      pin_message: '置顶消息'
    }
    return actions[action] || action
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Telegram机器人</h1>
          <p className="text-zinc-600 mt-1">配置和管理Telegram自动化通知</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isSendMessageOpen} onOpenChange={setIsSendMessageOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="w-4 h-4 mr-2" />
                发送消息
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>发送Telegram消息</DialogTitle>
                <DialogDescription>通过机器人发送消息到指定群组或用户</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="botId">选择机器人</Label>
                  <Select value={messageForm.botId} onValueChange={(value) =>
                    setMessageForm(prev => ({ ...prev, botId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择要使用的机器人" />
                    </SelectTrigger>
                    <SelectContent>
                      {bots.filter(bot => bot.status === 'active').map((bot) => (
                        <SelectItem key={bot.id} value={bot.id}>{bot.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="chatId">目标聊天</Label>
                  <Input
                    value={messageForm.chatId}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, chatId: e.target.value }))}
                    placeholder="输入群组ID或用户名，如: @group_name"
                  />
                </div>
                <div>
                  <Label htmlFor="messageType">消息类型</Label>
                  <Select value={messageForm.messageType} onValueChange={(value: 'text' | 'photo' | 'document') =>
                    setMessageForm(prev => ({ ...prev, messageType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">文本消息</SelectItem>
                      <SelectItem value="photo">图片消息</SelectItem>
                      <SelectItem value="document">文档消息</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message">消息内容</Label>
                  <Textarea
                    value={messageForm.message}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="输入要发送的消息内容..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSendMessageOpen(false)}>取消</Button>
                <Button onClick={handleSendMessage} className="bg-zinc-900 hover:bg-zinc-800">
                  <Send className="w-4 h-4 mr-2" />
                  发送消息
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isNewBotOpen} onOpenChange={setIsNewBotOpen}>
            <DialogTrigger asChild>
              <Button className="bg-zinc-900 hover:bg-zinc-800">
                <Plus className="w-4 h-4 mr-2" />
                添加机器人
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加Telegram机器人</DialogTitle>
                <DialogDescription>配置新的Telegram机器人用于自动化通知</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">机器人名称</Label>
                  <Input
                    value={botForm.name}
                    onChange={(e) => setBotForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="输入机器人名称"
                  />
                </div>
                <div>
                  <Label htmlFor="token">Bot Token</Label>
                  <Input
                    type="password"
                    value={botForm.token}
                    onChange={(e) => setBotForm(prev => ({ ...prev, token: e.target.value }))}
                    placeholder="输入从@BotFather获取的Token"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    通过@BotFather创建机器人并获取Token
                  </p>
                </div>
                <div>
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    value={botForm.description}
                    onChange={(e) => setBotForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="描述机器人的用途..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewBotOpen(false)}>取消</Button>
                <Button onClick={handleCreateBot} className="bg-zinc-900 hover:bg-zinc-800">创建机器人</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="bots" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bots">机器人管理</TabsTrigger>
          <TabsTrigger value="automation">自动化规则</TabsTrigger>
          <TabsTrigger value="messages">消息记录</TabsTrigger>
          <TabsTrigger value="analytics">数据统计</TabsTrigger>
        </TabsList>

        <TabsContent value="bots" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bots.map((bot) => (
              <Card key={bot.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{bot.name}</CardTitle>
                        <p className="text-sm text-zinc-600">{bot.username}</p>
                      </div>
                    </div>
                    {getStatusBadge(bot.status)}
                  </div>
                  <CardDescription>{bot.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-600">消息数量:</span>
                      <span className="font-medium ml-2">{bot.messageCount}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600">用户数量:</span>
                      <span className="font-medium ml-2">{bot.userCount}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600">最后活动:</span>
                      <span className="font-medium ml-2">{bot.lastActivity}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600">创建时间:</span>
                      <span className="font-medium ml-2">{bot.createdAt}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Bot Token</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowToken(prev => ({ ...prev, [bot.id]: !prev[bot.id] }))}
                      >
                        {showToken[bot.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type={showToken[bot.id] ? "text" : "password"}
                        value={bot.token}
                        readOnly
                        className="text-xs"
                      />
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(bot.token)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Webhook URL</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={bot.webhookUrl}
                        readOnly
                        className="text-xs"
                      />
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(bot.webhookUrl)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleBotStatus(bot.id)}
                    >
                      {bot.status === 'active' ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                      {bot.status === 'active' ? '停止' : '启动'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-1" />
                      配置
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      测试
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteBot(bot.id)}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      删除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">自动化规则</h2>
            <Dialog open={isNewRuleOpen} onOpenChange={setIsNewRuleOpen}>
              <DialogTrigger asChild>
                <Button className="bg-zinc-900 hover:bg-zinc-800">
                  <Plus className="w-4 h-4 mr-2" />
                  新建规则
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>创建自动化规则</DialogTitle>
                  <DialogDescription>设置触发条件和自动执行的操作</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">规则名称</Label>
                    <Input
                      value={ruleForm.name}
                      onChange={(e) => setRuleForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="输入规则名称"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="trigger">触发事件</Label>
                      <Select value={ruleForm.trigger} onValueChange={(value) =>
                        setRuleForm(prev => ({ ...prev, trigger: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approval_submitted">审批提交</SelectItem>
                          <SelectItem value="approval_approved">审批通过</SelectItem>
                          <SelectItem value="approval_rejected">审批拒绝</SelectItem>
                          <SelectItem value="payment_completed">支付完成</SelectItem>
                          <SelectItem value="payment_failed">支付失败</SelectItem>
                          <SelectItem value="announcement_published">公告发布</SelectItem>
                          <SelectItem value="user_login">用户登录</SelectItem>
                          <SelectItem value="system_alert">系统警告</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="action">执行动作</Label>
                      <Select value={ruleForm.action} onValueChange={(value) =>
                        setRuleForm(prev => ({ ...prev, action: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="send_notification">发送通知</SelectItem>
                          <SelectItem value="send_file">发送文件</SelectItem>
                          <SelectItem value="create_poll">创建投票</SelectItem>
                          <SelectItem value="pin_message">置顶消息</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="targetChat">目标聊天</Label>
                    <Input
                      value={ruleForm.targetChat}
                      onChange={(e) => setRuleForm(prev => ({ ...prev, targetChat: e.target.value }))}
                      placeholder="输入群组ID或用户名，如: @managers_group"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">消息模板</Label>
                    <Textarea
                      value={ruleForm.message}
                      onChange={(e) => setRuleForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="输入消息模板，支持变量: {{title}}, {{applicant}}, {{amount}} 等"
                      rows={4}
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      支持变量: {`{{title}}, {{applicant}}, {{department}}, {{amount}}, {{currency}}, {{status}}`}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewRuleOpen(false)}>取消</Button>
                  <Button onClick={handleCreateRule} className="bg-zinc-900 hover:bg-zinc-800">创建规则</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>规则名称</TableHead>
                    <TableHead>触发事件</TableHead>
                    <TableHead>执行动作</TableHead>
                    <TableHead>目标聊天</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {automationRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>{getTriggerName(rule.trigger)}</TableCell>
                      <TableCell>{getActionName(rule.action)}</TableCell>
                      <TableCell>
                        <code className="bg-zinc-100 px-2 py-1 rounded text-sm">{rule.targetChat}</code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={() => handleToggleRule(rule.id)}
                          />
                          <span className="text-sm">
                            {rule.enabled ? '启用' : '禁用'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{rule.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                消息记录
              </CardTitle>
              <CardDescription>查看所有通过机器人发送的消息</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>机器人</TableHead>
                    <TableHead>目标聊天</TableHead>
                    <TableHead>消息类型</TableHead>
                    <TableHead>消息内容</TableHead>
                    <TableHead>发送时间</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-blue-600" />
                          {bots.find(bot => bot.id === message.botId)?.name || 'Unknown Bot'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-zinc-100 px-2 py-1 rounded text-sm">{message.chatId}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{message.messageType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={message.content}>
                          {message.content}
                        </div>
                      </TableCell>
                      <TableCell>{message.timestamp}</TableCell>
                      <TableCell>{getMessageStatusBadge(message.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">活跃机器人</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bots.filter(bot => bot.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">
                  共 {bots.length} 个机器人
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">今日消息</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">247</div>
                <p className="text-xs text-muted-foreground">
                  +15% 相比昨天
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">自动化规则</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{automationRules.filter(rule => rule.enabled).length}</div>
                <p className="text-xs text-muted-foreground">
                  共 {automationRules.length} 条规则
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">覆盖用户</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">
                  活跃Telegram用户
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>消息发送统计</CardTitle>
              <CardDescription>过去7天的消息发送量</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { day: '今天', count: 47, percentage: 85 },
                  { day: '昨天', count: 52, percentage: 95 },
                  { day: '前天', count: 38, percentage: 70 },
                  { day: '3天前', count: 61, percentage: 100 },
                  { day: '4天前', count: 29, percentage: 55 },
                  { day: '5天前', count: 44, percentage: 80 },
                  { day: '6天前', count: 35, percentage: 65 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-zinc-600">{item.day}</div>
                    <div className="flex-1 bg-zinc-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm font-medium">{item.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
