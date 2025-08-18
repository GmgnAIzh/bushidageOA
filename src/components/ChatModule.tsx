"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { dataService, Employee } from "@/lib/data-service"
import { toast } from "sonner"
import {
  Send, Search, Plus, Users, Phone, Video, MoreHorizontal, Paperclip,
  Smile, Settings, Shield, Download, Upload, Clock, Check, CheckCheck,
  Lock, Unlock, Cloud, Edit, Trash, Reply, Forward, Star, Pin, Archive,
  AlertTriangle, Mic, MicOff, Camera, CameraOff, PhoneCall, PhoneOff,
  ScreenShare, ScreenShareOff, Volume2, VolumeX, FileText, Image,
  File, Calendar, MapPin, Heart, ThumbsUp, Copy, Eye, EyeOff,
  UserPlus, UserMinus, Crown, AtSign, Hash, Bell, BellOff,
  Minimize2, Maximize2, X, ChevronDown, ChevronRight, Folder,
  MessageCircle, Monitor, Speaker, Headphones, Keyboard, Zap, CheckCircle
} from "lucide-react"

// 企业微信风格的聊天接口
interface EnterpriseChat {
  id: string
  type: 'personal' | 'group' | 'department' | 'announcement' | 'external'
  name: string
  avatar?: string
  description?: string
  participants: ChatParticipant[]
  unreadCount: number
  lastMessage?: EnterpriseMessage
  isPinned: boolean
  isMuted: boolean
  isEncrypted: boolean
  isOnline: boolean
  department?: string
  tags: string[]
  createdAt: string
  createdBy: string
  admins: string[]
  memberCount: number
  isOfficial: boolean // 官方群
  allowInvite: boolean // 允许邀请
  allowAnnouncement: boolean // 允许发公告
  maxMembers: number
  approvalRequired: boolean // 需要管理员审批
}

interface ChatParticipant {
  id: string
  name: string
  avatar?: string
  role: 'member' | 'admin' | 'owner'
  department: string
  position: string
  isOnline: boolean
  lastSeen?: string
  permissions: ParticipantPermission[]
}

interface ParticipantPermission {
  action: 'send_message' | 'send_file' | 'send_announcement' | 'manage_members' | 'delete_message'
  allowed: boolean
}

interface EnterpriseMessage {
  id: string
  chatId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  type: 'text' | 'image' | 'file' | 'voice' | 'video' | 'announcement' | 'system' | 'call' | 'location' | 'contact'
  timestamp: string
  editedAt?: string
  replyTo?: string
  mentions: string[]
  reactions: MessageReaction[]
  attachments: MessageAttachment[]
  isEncrypted: boolean
  isDeleted: boolean
  isAnnouncement: boolean
  readBy: string[]
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  priority: 'normal' | 'high' | 'urgent'
  isFromBot: boolean
  botName?: string
  threadReplies?: number
  isForwarded: boolean
  originalSender?: string
}

interface MessageReaction {
  emoji: string
  users: string[]
  count: number
}

interface MessageAttachment {
  id: string
  name: string
  size: number
  type: string
  url: string
  thumbnail?: string
  uploadProgress?: number
  isUploaded: boolean
  isScanned: boolean
  scanResult?: 'safe' | 'warning' | 'blocked'
}

interface NotificationSettings {
  enableSound: boolean
  enableDesktop: boolean
  enableMobile: boolean
  muteUntil?: string
  keywords: string[]
  mentionsOnly: boolean
}

export function ChatModule() {
  const [chats, setChats] = useState<EnterpriseChat[]>([])
  const [messages, setMessages] = useState<EnterpriseMessage[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedChat, setSelectedChat] = useState<EnterpriseChat | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isChatInfoOpen, setIsChatInfoOpen] = useState(false)
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ChatParticipant | null>(null)
  const [currentUser] = useState(dataService.getCurrentUser())
  const [typing, setTyping] = useState<string[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [replyingTo, setReplyingTo] = useState<EnterpriseMessage | null>(null)
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enableSound: true,
    enableDesktop: true,
    enableMobile: true,
    keywords: [],
    mentionsOnly: false
  })

  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    type: 'group' as 'group' | 'department' | 'announcement',
    participants: [] as string[],
    isOfficial: false,
    allowInvite: true,
    allowAnnouncement: false,
    maxMembers: 100,
    approvalRequired: false,
    tags: ''
  })

  // 表情包数据
  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕']

  // 快捷回复
  const quickReplies = ['收到', '好的', '知道了', '马上处理', '稍等', '谢谢', '辛苦了', '没问题']

  // 消息状态图标
  const getMessageStatusIcon = (status: string, readBy: string[]) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400" />
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      case 'failed':
        return <AlertTriangle className="h-3 w-3 text-red-500" />
      default:
        return null
    }
  }

  // 初始化数据
  useEffect(() => {
    loadEmployees()
    initializeChats()
    initializeMessages()

    // 模拟WebSocket连接
    const interval = setInterval(() => {
      // 模拟接收新消息
      simulateIncomingMessage()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // 滚动到底部
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadEmployees = () => {
    const employeeData = dataService.getEmployees()
    setEmployees(employeeData)
  }

  const initializeChats = () => {
    const employees = dataService.getEmployees()
    const sampleChats: EnterpriseChat[] = [
      {
        id: 'chat-company-all',
        type: 'announcement',
        name: '公司全员群',
        description: '重要公告发布群，请勿闲聊',
        participants: employees.map(emp => ({
          id: emp.id,
          name: emp.name,
          avatar: emp.avatar,
          role: emp.role === '系统管理员' ? 'admin' : 'member',
          department: emp.department,
          position: emp.position || emp.role,
          isOnline: Math.random() > 0.3,
          permissions: [
            { action: 'send_message', allowed: emp.role === '系统管理员' },
            { action: 'send_announcement', allowed: emp.role === '系统管理员' }
          ]
        })),
        unreadCount: 3,
        isPinned: true,
        isMuted: false,
        isEncrypted: true,
        isOnline: true,
        department: '全公司',
        tags: ['官方', '公告'],
        createdAt: '2024-01-01',
        createdBy: 'admin',
        admins: ['admin'],
        memberCount: employees.length,
        isOfficial: true,
        allowInvite: false,
        allowAnnouncement: true,
        maxMembers: 1000,
        approvalRequired: true
      },
      {
        id: 'chat-tech-team',
        type: 'department',
        name: '技术部',
        description: '技术团队内部交流',
        participants: employees.filter(emp => emp.department === '技术部').map(emp => ({
          id: emp.id,
          name: emp.name,
          avatar: emp.avatar,
          role: emp.role.includes('总监') ? 'admin' : 'member',
          department: emp.department,
          position: emp.position || emp.role,
          isOnline: Math.random() > 0.2,
          permissions: [
            { action: 'send_message', allowed: true },
            { action: 'send_file', allowed: true }
          ]
        })),
        unreadCount: 8,
        isPinned: true,
        isMuted: false,
        isEncrypted: true,
        isOnline: true,
        department: '技术部',
        tags: ['技术', '开发'],
        createdAt: '2024-01-02',
        createdBy: 'emp1',
        admins: ['emp1'],
        memberCount: employees.filter(emp => emp.department === '技术部').length,
        isOfficial: false,
        allowInvite: true,
        allowAnnouncement: false,
        maxMembers: 50,
        approvalRequired: false
      },
      {
        id: 'chat-personal-1',
        type: 'personal',
        name: '张三',
        participants: [
          {
            id: 'emp1',
            name: '张三',
            role: 'member',
            department: '技术部',
            position: '技术总监',
            isOnline: true,
            permissions: []
          }
        ],
        unreadCount: 2,
        isPinned: false,
        isMuted: false,
        isEncrypted: true,
        isOnline: true,
        tags: [],
        createdAt: '2024-01-03',
        createdBy: 'current',
        admins: [],
        memberCount: 2,
        isOfficial: false,
        allowInvite: false,
        allowAnnouncement: false,
        maxMembers: 2,
        approvalRequired: false
      }
    ]
    setChats(sampleChats)
    if (sampleChats.length > 0) {
      setSelectedChat(sampleChats[0])
    }
  }

  const initializeMessages = () => {
    const sampleMessages: EnterpriseMessage[] = [
      {
        id: 'msg-1',
        chatId: 'chat-company-all',
        senderId: 'admin',
        senderName: '系统管理员',
        content: '欢迎大家使用企业OA聊天系统！🎉',
        type: 'announcement',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        mentions: [],
        reactions: [
          { emoji: '👍', users: ['emp1', 'emp2'], count: 2 },
          { emoji: '❤️', users: ['emp3'], count: 1 }
        ],
        attachments: [],
        isEncrypted: false,
        isDeleted: false,
        isAnnouncement: true,
        readBy: ['emp1', 'emp2'],
        status: 'read',
        priority: 'high',
        isFromBot: false,
        isForwarded: false
      },
      {
        id: 'msg-2',
        chatId: 'chat-tech-team',
        senderId: 'emp1',
        senderName: '张三',
        content: '大家好，今天的代码review会议在下午3点举行',
        type: 'text',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        mentions: [],
        reactions: [],
        attachments: [],
        isEncrypted: true,
        isDeleted: false,
        isAnnouncement: false,
        readBy: ['emp2'],
        status: 'read',
        priority: 'normal',
        isFromBot: false,
        isForwarded: false
      },
      {
        id: 'msg-3',
        chatId: 'chat-personal-1',
        senderId: currentUser?.id || 'current',
        senderName: currentUser?.name || '当前用户',
        content: '你好，有时间讨论一下新项目吗？',
        type: 'text',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        mentions: [],
        reactions: [],
        attachments: [],
        isEncrypted: true,
        isDeleted: false,
        isAnnouncement: false,
        readBy: [],
        status: 'delivered',
        priority: 'normal',
        isFromBot: false,
        isForwarded: false
      }
    ]
    setMessages(sampleMessages)
  }

  const simulateIncomingMessage = () => {
    if (Math.random() > 0.7) { // 30% 概率收到新消息
      const randomMessages = [
        '大家辛苦了！',
        '会议室已预定好了',
        '文档已更新，请查看',
        '今天的任务完成了',
        '新版本已发布',
        '请大家关注一下最新的项目进展',
        '明天上午10点有技术分享会',
        '代码review已完成，可以合并',
        '服务器维护通知：今晚21点开始',
        '恭喜团队完成本季度目标！🎉'
      ]

      const randomSenders = ['emp2', 'emp3', 'emp4']
      const randomSenderNames = ['李四', '王五', '赵六']
      const randomIndex = Math.floor(Math.random() * randomSenders.length)

      const newMsg: EnterpriseMessage = {
        id: `msg-${Date.now()}`,
        chatId: selectedChat?.id || 'chat-tech-team',
        senderId: randomSenders[randomIndex],
        senderName: randomSenderNames[randomIndex],
        content: randomMessages[Math.floor(Math.random() * randomMessages.length)],
        type: 'text',
        timestamp: new Date().toISOString(),
        mentions: [],
        reactions: [],
        attachments: [],
        isEncrypted: true,
        isDeleted: false,
        isAnnouncement: false,
        readBy: [],
        status: 'delivered',
        priority: Math.random() > 0.9 ? 'high' : 'normal',
        isFromBot: false,
        isForwarded: false
      }

      setMessages(prev => [...prev, newMsg])

      // 更新聊天列表的未读计数
      setChats(prev => prev.map(chat =>
        chat.id === newMsg.chatId
          ? { ...chat, unreadCount: chat.unreadCount + 1, lastMessage: newMsg }
          : chat
      ))

      // 播放消息提示音
      if (notificationSettings.enableSound) {
        const audio = new Audio('/sounds/notification.mp3')
        audio.play().catch(() => {
          // 忽略播放失败的错误
        })
      }

      // 显示桌面通知
      if (notificationSettings.enableDesktop && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(`新消息：${newMsg.senderName}`, {
            body: newMsg.content,
            icon: '/favicon.ico',
            tag: newMsg.chatId
          })
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification(`新消息：${newMsg.senderName}`, {
                body: newMsg.content,
                icon: '/favicon.ico',
                tag: newMsg.chatId
              })
            }
          })
        }
      }

      // 应用内通知
      toast.info(`新消息：${newMsg.senderName}`, {
        description: newMsg.content,
        action: {
          label: "查看",
          onClick: () => {
            const chat = chats.find(c => c.id === newMsg.chatId)
            if (chat) setSelectedChat(chat)
          }
        }
      })
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !currentUser) return

    const messageId = `msg-${Date.now()}`
    const newMsg: EnterpriseMessage = {
      id: messageId,
      chatId: selectedChat.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: newMessage,
      type: 'text',
      timestamp: new Date().toISOString(),
      mentions: extractMentions(newMessage),
      reactions: [],
      attachments: [],
      isEncrypted: selectedChat.isEncrypted,
      isDeleted: false,
      isAnnouncement: false,
      readBy: [],
      status: 'sending',
      priority: 'normal',
      isFromBot: false,
      isForwarded: false,
      replyTo: replyingTo?.id
    }

    setMessages(prev => [...prev, newMsg])
    setNewMessage("")
    setReplyingTo(null)

    // 模拟发送状态更新
    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, status: 'sent' } : msg
      ))
    }, 500)

    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, status: 'delivered' } : msg
      ))
    }, 1000)

    // 更新聊天列表
    setChats(prev => prev.map(chat =>
      chat.id === selectedChat.id
        ? { ...chat, lastMessage: newMsg }
        : chat
    ))

    toast.success('消息已发送')
  }

  const extractMentions = (content: string): string[] => {
    const mentions = content.match(/@(\w+)/g)
    return mentions ? mentions.map(m => m.slice(1)) : []
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0 || !selectedChat || !currentUser) return

    // 检查文件大小限制（100MB）
    const maxSize = 100 * 1024 * 1024
    const oversizedFiles = files.filter(file => file.size > maxSize)
    if (oversizedFiles.length > 0) {
      toast.error(`文件大小不能超过100MB: ${oversizedFiles.map(f => f.name).join(', ')}`)
      return
    }

    // 处理每个文件
    for (const file of files) {
      const messageId = `msg-${Date.now()}-${Math.random()}`
      const attachment: MessageAttachment = {
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadProgress: 0,
        isUploaded: false,
        isScanned: false
      }

      // 根据文件类型确定消息类型
      let messageType: 'image' | 'file' | 'video' = 'file'
      let contentText = `发送了文件: ${file.name}`

      if (file.type.startsWith('image/')) {
        messageType = 'image'
        contentText = `发送了图片: ${file.name}`
      } else if (file.type.startsWith('video/')) {
        messageType = 'video'
        contentText = `发送了视频: ${file.name}`
      }

      const newMsg: EnterpriseMessage = {
        id: messageId,
        chatId: selectedChat.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        content: contentText,
        type: messageType,
        timestamp: new Date().toISOString(),
        mentions: [],
        reactions: [],
        attachments: [attachment],
        isEncrypted: selectedChat.isEncrypted,
        isDeleted: false,
        isAnnouncement: false,
        readBy: [],
        status: 'sending',
        priority: 'normal',
        isFromBot: false,
        isForwarded: false
      }

      setMessages(prev => [...prev, newMsg])

      // 模拟文件上传进度和安全扫描
      const uploadInterval = setInterval(() => {
        setMessages(prev => prev.map(msg => {
          if (msg.id === messageId && msg.attachments[0]) {
            const currentProgress = msg.attachments[0].uploadProgress || 0
            const newProgress = Math.min(currentProgress + Math.random() * 25 + 10, 100)

            if (newProgress >= 100) {
              clearInterval(uploadInterval)
              // 模拟安全扫描结果
              const scanResult = Math.random() > 0.95 ? 'warning' : 'safe'

              return {
                ...msg,
                attachments: [{
                  ...msg.attachments[0],
                  uploadProgress: 100,
                  isUploaded: true,
                  isScanned: true,
                  scanResult
                }],
                status: 'sent'
              }
            }

            return {
              ...msg,
              attachments: [{
                ...msg.attachments[0],
                uploadProgress: newProgress
              }]
            }
          }
          return msg
        }))
      }, 200 + Math.random() * 300) // 随机化上传速度
    }

    // 显示上传成功提示
    toast.success(`开始上传 ${files.length} 个文件`)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleReaction = (messageId: string, emoji: string) => {
    if (!currentUser) return

    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji)
        const userAlreadyReacted = existingReaction?.users.includes(currentUser.id)

        if (userAlreadyReacted) {
          // 移除反应
          return {
            ...msg,
            reactions: msg.reactions.map(r =>
              r.emoji === emoji
                ? { ...r, users: r.users.filter(u => u !== currentUser.id), count: r.count - 1 }
                : r
            ).filter(r => r.count > 0)
          }
        } else {
          // 添加反应
          if (existingReaction) {
            return {
              ...msg,
              reactions: msg.reactions.map(r =>
                r.emoji === emoji
                  ? { ...r, users: [...r.users, currentUser.id], count: r.count + 1 }
                  : r
              )
            }
          } else {
            return {
              ...msg,
              reactions: [...msg.reactions, { emoji, users: [currentUser.id], count: 1 }]
            }
          }
        }
      }
      return msg
    }))
  }

  const handleCreateGroup = async () => {
    if (!groupForm.name.trim() || !currentUser) {
      toast.error('请填写群组名称')
      return
    }

    const newChat: EnterpriseChat = {
      id: `chat-${Date.now()}`,
      type: groupForm.type,
      name: groupForm.name,
      description: groupForm.description,
      participants: [
        {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: 'owner',
          department: currentUser.department,
          position: currentUser.role,
          isOnline: true,
          permissions: [
            { action: 'send_message', allowed: true },
            { action: 'send_file', allowed: true },
            { action: 'manage_members', allowed: true }
          ]
        },
        ...groupForm.participants.map(empId => {
          const emp = employees.find(e => e.id === empId)!
          return {
            id: emp.id,
            name: emp.name,
            avatar: emp.avatar,
            role: 'member' as const,
            department: emp.department || '未分配',
            position: emp.position || emp.role || '员工',
            isOnline: Math.random() > 0.3,
            permissions: [
              { action: 'send_message' as const, allowed: true },
              { action: 'send_file' as const, allowed: true }
            ] as ParticipantPermission[]
          }
        })
      ],
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      isEncrypted: true,
      isOnline: true,
      tags: groupForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
      admins: [currentUser.id],
      memberCount: groupForm.participants.length + 1,
      isOfficial: groupForm.isOfficial,
      allowInvite: groupForm.allowInvite,
      allowAnnouncement: groupForm.allowAnnouncement,
      maxMembers: groupForm.maxMembers,
      approvalRequired: groupForm.approvalRequired
    }

    setChats(prev => [newChat, ...prev])
    setSelectedChat(newChat)
    setIsCreatingGroup(false)
    setGroupForm({
      name: '',
      description: '',
      type: 'group',
      participants: [],
      isOfficial: false,
      allowInvite: true,
      allowAnnouncement: false,
      maxMembers: 100,
      approvalRequired: false,
      tags: ''
    })

    toast.success('群组创建成功')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      // 模拟文件上传
      toast.success(`准备上传 ${files.length} 个文件`)
    }
  }

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const currentChatMessages = messages.filter(msg => msg.chatId === selectedChat?.id)

  return (
    <div className="h-[calc(100vh-120px)] flex bg-gray-50">
      {/* 左侧边栏 */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
        {/* 头部 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h2 className="text-lg font-semibold text-gray-900">企业聊天</h2>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              {!sidebarCollapsed && (
                <>
                  <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>创建群组</DialogTitle>
                        <DialogDescription>新建企业群组或部门群</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>群组名称</Label>
                          <Input
                            value={groupForm.name}
                            onChange={e => setGroupForm({ ...groupForm, name: e.target.value })}
                            placeholder="输入群组名称"
                          />
                        </div>
                        <div>
                          <Label>群组类型</Label>
                          <Select
                            value={groupForm.type}
                            onValueChange={v => setGroupForm({ ...groupForm, type: v as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="group">普通群组</SelectItem>
                              <SelectItem value="department">部门群</SelectItem>
                              <SelectItem value="announcement">公告群</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>群组描述</Label>
                          <Textarea
                            value={groupForm.description}
                            onChange={e => setGroupForm({ ...groupForm, description: e.target.value })}
                            placeholder="群组描述（可选）"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>添加成员</Label>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {employees.filter(emp => emp.id !== currentUser?.id).map(emp => (
                              <div key={emp.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={emp.id}
                                  checked={groupForm.participants.includes(emp.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setGroupForm({...groupForm, participants: [...groupForm.participants, emp.id]})
                                    } else {
                                      setGroupForm({...groupForm, participants: groupForm.participants.filter(id => id !== emp.id)})
                                    }
                                  }}
                                />
                                <Label htmlFor={emp.id} className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">{emp.name[0]}</AvatarFallback>
                                  </Avatar>
                                  {emp.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label>标签（逗号分隔）</Label>
                          <Input
                            value={groupForm.tags}
                            onChange={e => setGroupForm({ ...groupForm, tags: e.target.value })}
                            placeholder="如：技术,项目"
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <Checkbox
                            id="isOfficial"
                            checked={groupForm.isOfficial}
                            onCheckedChange={checked => setGroupForm({ ...groupForm, isOfficial: checked as boolean })}
                          />
                          <Label htmlFor="isOfficial">官方群</Label>
                          <Checkbox
                            id="allowInvite"
                            checked={groupForm.allowInvite}
                            onCheckedChange={checked => setGroupForm({ ...groupForm, allowInvite: checked as boolean })}
                          />
                          <Label htmlFor="allowInvite">允许邀请</Label>
                          <Checkbox
                            id="allowAnnouncement"
                            checked={groupForm.allowAnnouncement}
                            onCheckedChange={checked => setGroupForm({ ...groupForm, allowAnnouncement: checked as boolean })}
                          />
                          <Label htmlFor="allowAnnouncement">允许发公告</Label>
                        </div>
                        <div className="flex items-center gap-4">
                          <Label>最大成员数</Label>
                          <Input
                            type="number"
                            min={2}
                            max={1000}
                            value={groupForm.maxMembers}
                            onChange={e => setGroupForm({ ...groupForm, maxMembers: Number(e.target.value) })}
                            className="w-24"
                          />
                          <Checkbox
                            id="approvalRequired"
                            checked={groupForm.approvalRequired}
                            onCheckedChange={checked => setGroupForm({ ...groupForm, approvalRequired: checked as boolean })}
                          />
                          <Label htmlFor="approvalRequired">入群需审批</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleCreateGroup}>创建群组</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="sm" onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {!sidebarCollapsed && (
            <div className="mt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索聊天..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* 聊天列表 */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors border-l-2 ${
                selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-500' : 'border-transparent'
              }`}
              onClick={() => {
                setSelectedChat(chat)
                // 标记为已读
                setChats(prev => prev.map(c =>
                  c.id === chat.id ? { ...c, unreadCount: 0 } : c
                ))
              }}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className={sidebarCollapsed ? "h-8 w-8" : "h-12 w-12"}>
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback>
                      {chat.type === 'group' || chat.type === 'department' ? (
                        <Users className="h-4 w-4" />
                      ) : chat.type === 'announcement' ? (
                        <Bell className="h-4 w-4" />
                      ) : (
                        chat.name[0]
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {chat.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                  {chat.isPinned && (
                    <Pin className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                  )}
                </div>

                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
                        {chat.isOfficial && (
                          <Crown className="h-3 w-3 text-yellow-500" />
                        )}
                        {chat.isEncrypted && (
                          <Lock className="h-3 w-3 text-green-600" />
                        )}
                        {chat.isMuted && (
                          <BellOff className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {chat.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {new Date(chat.lastMessage.timestamp).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                        {chat.unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate flex-1">
                        {chat.lastMessage?.content || '暂无消息'}
                      </p>
                      <div className="flex items-center gap-1 ml-2">
                        {chat.type === 'group' && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Users className="h-3 w-3 mr-1" />
                            {chat.memberCount}
                          </div>
                        )}
                      </div>
                    </div>

                    {chat.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {chat.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧主聊天区 */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* 聊天头部 */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedChat.avatar} />
                  <AvatarFallback>
                    {selectedChat.type === 'group' || selectedChat.type === 'department' ? (
                      <Users className="h-4 w-4" />
                    ) : selectedChat.type === 'announcement' ? (
                      <Bell className="h-4 w-4" />
                    ) : (
                      selectedChat.name[0]
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    {selectedChat.name}
                    {selectedChat.isOfficial && <Crown className="h-4 w-4 text-yellow-500" />}
                    {selectedChat.isEncrypted && <Lock className="h-4 w-4 text-green-600" />}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedChat.type === 'group' || selectedChat.type === 'department'
                      ? `${selectedChat.memberCount} 名成员`
                      : selectedChat.isOnline
                        ? '在线'
                        : '离线'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.info('正在发起语音通话...', {
                      description: `呼叫 ${selectedChat.name}`,
                      action: {
                        label: "取消",
                        onClick: () => toast.dismiss()
                      }
                    })
                    // 模拟通话状态
                    setTimeout(() => {
                      toast.success('通话已连接', {
                        description: '通话质量良好'
                      })
                    }, 2000)
                  }}
                  title="语音通话"
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.info('正在发起视频通话...', {
                      description: `呼叫 ${selectedChat.name}`,
                      action: {
                        label: "取消",
                        onClick: () => toast.dismiss()
                      }
                    })
                    // 模拟视频通话
                    setTimeout(() => {
                      toast.success('视频通话已连接', {
                        description: '摄像头和麦克风正常'
                      })
                    }, 2000)
                  }}
                  title="视频通话"
                >
                  <Video className="h-4 w-4" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" title="更多选项">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48" align="end">
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setChats(prev => prev.map(chat =>
                            chat.id === selectedChat.id
                              ? { ...chat, isPinned: !chat.isPinned }
                              : chat
                          ))
                          toast.success(selectedChat.isPinned ? '已取消置顶' : '已置顶聊天')
                        }}
                      >
                        <Pin className="h-4 w-4 mr-2" />
                        {selectedChat.isPinned ? '取消置顶' : '置顶聊天'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setChats(prev => prev.map(chat =>
                            chat.id === selectedChat.id
                              ? { ...chat, isMuted: !chat.isMuted }
                              : chat
                          ))
                          toast.success(selectedChat.isMuted ? '已开启通知' : '已关闭通知')
                        }}
                      >
                        {selectedChat.isMuted ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
                        {selectedChat.isMuted ? '开启通知' : '关闭通知'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setIsChatInfoOpen(true)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        聊天信息
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => toast.info('屏幕共享功能开发中')}
                      >
                        <ScreenShare className="h-4 w-4 mr-2" />
                        屏幕共享
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => toast.info('消息搜索功能开发中')}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        搜索消息
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {/* 聊天消息区 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {currentChatMessages.map((msg) => {
                const isOwn = msg.senderId === currentUser?.id
                return (
                  <div key={msg.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    {!isOwn && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.senderAvatar} />
                        <AvatarFallback className="text-xs">{msg.senderName[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      {!isOwn && (
                        <span className="text-xs text-gray-500 mb-1">{msg.senderName}</span>
                      )}
                      <div className={`max-w-md rounded-lg p-3 relative group ${
                        isOwn
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border'
                      }`}>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleReaction(msg.id, '👍')}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            {isOwn && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => setEditingMessage(msg.id)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => toast.info('删除功能未实现')}
                                >
                                  <Trash className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => toast.info('转发功能未实现')}
                            >
                              <Forward className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {msg.isDeleted ? (
                          <p className="text-xs opacity-50 italic">{msg.content}</p>
                        ) : (
                          <>
                            {msg.type === 'text' && (
                              <div className="flex items-center gap-2">
                                <p className="text-sm">{msg.content}</p>
                                {msg.isEncrypted && (
                                  <Lock className="h-3 w-3 opacity-50" />
                                )}
                              </div>
                            )}
                            {msg.type === 'image' && msg.attachments?.[0] && (
                              <div className="space-y-2">
                                <div className="relative group">
                                  <img
                                    src={msg.attachments[0].url}
                                    alt={msg.attachments[0].name}
                                    className="max-w-full max-h-64 rounded cursor-pointer object-cover"
                                    onClick={() => msg.attachments?.[0] && window.open(msg.attachments[0].url, '_blank')}
                                  />
                                  {msg.attachments[0].uploadProgress !== undefined && msg.attachments[0].uploadProgress < 100 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                                      <div className="text-white text-center">
                                        <div className="mb-2">上传中...</div>
                                        <Progress value={msg.attachments[0].uploadProgress} className="w-32" />
                                      </div>
                                    </div>
                                  )}
                                  {msg.attachments[0].scanResult === 'warning' && (
                                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                                      安全警告
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs opacity-75">{msg.attachments[0].name}</p>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs opacity-50">
                                      {(msg.attachments[0].size / 1024 / 1024).toFixed(1)} MB
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                      onClick={() => window.open(msg.attachments[0].url, '_blank')}
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                            {msg.type === 'video' && msg.attachments?.[0] && (
                              <div className="space-y-2">
                                <div className="relative">
                                  <video
                                    src={msg.attachments[0].url}
                                    className="max-w-full max-h-64 rounded"
                                    controls
                                    preload="metadata"
                                  />
                                  {msg.attachments[0].uploadProgress !== undefined && msg.attachments[0].uploadProgress < 100 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                                      <div className="text-white text-center">
                                        <div className="mb-2">上传中...</div>
                                        <Progress value={msg.attachments[0].uploadProgress} className="w-32" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs opacity-75">{msg.attachments[0].name}</p>
                                  <span className="text-xs opacity-50">
                                    {(msg.attachments[0].size / 1024 / 1024).toFixed(1)} MB
                                  </span>
                                </div>
                              </div>
                            )}
                            {msg.type === 'file' && msg.attachments?.[0] && (
                              <div className="space-y-2">
                                <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                                  isOwn ? 'bg-white bg-opacity-20' : 'bg-gray-50'
                                }`}>
                                  <div className="flex-shrink-0">
                                    {msg.attachments[0].type.includes('pdf') ? (
                                      <FileText className="h-8 w-8 text-red-500" />
                                    ) : msg.attachments[0].type.includes('word') ? (
                                      <FileText className="h-8 w-8 text-blue-500" />
                                    ) : msg.attachments[0].type.includes('excel') ? (
                                      <FileText className="h-8 w-8 text-green-500" />
                                    ) : (
                                      <File className="h-8 w-8 text-gray-500" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{msg.attachments[0].name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs opacity-75">
                                        {msg.attachments[0].size > 1024 * 1024
                                          ? `${(msg.attachments[0].size / 1024 / 1024).toFixed(1)} MB`
                                          : `${(msg.attachments[0].size / 1024).toFixed(1)} KB`
                                        }
                                      </span>
                                      {msg.attachments[0].scanResult === 'safe' && (
                                        <Badge variant="outline" className="text-xs px-1 py-0">
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          已扫描
                                        </Badge>
                                      )}
                                      {msg.attachments[0].scanResult === 'warning' && (
                                        <Badge variant="destructive" className="text-xs px-1 py-0">
                                          <AlertTriangle className="h-3 w-3 mr-1" />
                                          风险文件
                                        </Badge>
                                      )}
                                    </div>
                                    {msg.attachments[0].uploadProgress !== undefined && msg.attachments[0].uploadProgress < 100 && (
                                      <div className="mt-2">
                                        <div className="flex items-center gap-2 text-xs opacity-75 mb-1">
                                          <span>上传中... {msg.attachments[0].uploadProgress}%</span>
                                        </div>
                                        <Progress value={msg.attachments[0].uploadProgress} className="h-1" />
                                      </div>
                                    )}
                                  </div>
                                  {msg.attachments[0].isUploaded && (
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                        onClick={() => window.open(msg.attachments[0].url, '_blank')}
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            {msg.type === 'announcement' && (
                              <div className="flex items-center gap-2">
                                <Bell className="h-4 w-4 text-yellow-500" />
                                <p className="text-sm font-bold">{msg.content}</p>
                              </div>
                            )}
                            {msg.type === 'system' && (
                              <p className="text-xs text-center opacity-75">{msg.content}</p>
                            )}
                          </>
                        )}
                      </div>
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {msg.reactions.map((reaction, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleReaction(msg.id, reaction.emoji)}
                            >
                              {reaction.emoji} {reaction.count}
                            </Button>
                          ))}
                          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => setShowEmojiPicker(true)}
                              >
                                <Smile className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 max-h-48 overflow-y-auto">
                              <div className="flex flex-wrap gap-1">
                                {emojis.map((emoji, idx) => (
                                  <button
                                    key={idx}
                                    className="text-xl hover:bg-gray-200 rounded p-1"
                                    onClick={() => {
                                      handleReaction(msg.id, emoji)
                                      setShowEmojiPicker(false)
                                    }}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                        {isOwn && (
                          <div className="flex items-center">
                            {getMessageStatusIcon(msg.status, msg.readBy)}
                          </div>
                        )}
                        {msg.editedAt && (
                          <span className="text-xs text-gray-400">(已编辑)</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            {/* 输入区 */}
            <div className="p-4 border-t bg-white">
              {/* 快捷回复栏 */}
              {quickReplies.length > 0 && (
                <div className="mb-3 flex gap-2 flex-wrap">
                  {quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-3"
                      onClick={() => setNewMessage(reply)}
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              )}

              {/* 主输入区 */}
              <div className="flex items-end gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" title="更多功能">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48" align="start">
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex flex-col items-center gap-1 h-auto py-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip className="h-4 w-4" />
                        <span className="text-xs">文件</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex flex-col items-center gap-1 h-auto py-2"
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/*'
                          input.onchange = (e) => handleFileUpload(e as any)
                          input.click()
                        }}
                      >
                        <Image className="h-4 w-4" />
                        <span className="text-xs">图片</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex flex-col items-center gap-1 h-auto py-2"
                        onClick={() => toast.info('拍照功能需要摄像头权限')}
                      >
                        <Camera className="h-4 w-4" />
                        <span className="text-xs">拍照</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex flex-col items-center gap-1 h-auto py-2"
                        onClick={() => toast.info('位置功能开发中')}
                      >
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs">位置</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex flex-col items-center gap-1 h-auto py-2"
                        onClick={() => toast.info('名片功能开发中')}
                      >
                        <Users className="h-4 w-4" />
                        <span className="text-xs">名片</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex flex-col items-center gap-1 h-auto py-2"
                        onClick={() => toast.info('语音输入功能开发中')}
                      >
                        <Mic className="h-4 w-4" />
                        <span className="text-xs">语音</span>
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="flex-1 min-h-[40px] max-h-32 relative">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={selectedChat.type === 'group' || selectedChat.type === 'department'
                      ? "输入消息，@某人可以提及他们..."
                      : "输入消息..."
                    }
                    className="w-full resize-none border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                    rows={1}
                    style={{ minHeight: '40px' }}
                  />
                  {/* @提及功能提示 */}
                  {(selectedChat.type === 'group' || selectedChat.type === 'department') && newMessage.includes('@') && (
                    <div className="absolute bottom-full left-0 mb-1 bg-white border rounded-md shadow-lg max-w-xs">
                      <div className="p-2 space-y-1">
                        {selectedChat.participants.slice(0, 5).map((participant) => (
                          <div
                            key={participant.id}
                            className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded cursor-pointer text-sm"
                            onClick={() => {
                              const atIndex = newMessage.lastIndexOf('@')
                              const newText = newMessage.substring(0, atIndex) + `@${participant.name} ` + newMessage.substring(atIndex + 1)
                              setNewMessage(newText)
                            }}
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={participant.avatar} />
                              <AvatarFallback className="text-xs">{participant.name[0]}</AvatarFallback>
                            </Avatar>
                            <span>{participant.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      title="表情"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-600 border-b pb-2">常用表情</div>
                      <div className="grid grid-cols-8 gap-1">
                        {emojis.map((emoji, idx) => (
                          <button
                            key={idx}
                            className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                            onClick={() => {
                              setNewMessage(prev => prev + emoji)
                              setShowEmojiPicker(false)
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* 底部状态栏 */}
              <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                <div className="flex items-center gap-4">
                  {selectedChat.isEncrypted && (
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-green-600" />
                      <span>端到端加密</span>
                    </div>
                  )}
                  {typing.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span>{typing.join(', ')} 正在输入...</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span>按 Enter 发送，Shift + Enter 换行</span>
                  <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => toast.info('聊天记录功能开发中')}>
                    查看历史
                  </span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-medium">选择一个聊天开始对话</h3>
              <p className="text-sm text-gray-400">选择左侧的聊天或创建新的群组</p>
            </div>
          </div>
        )}
      </div>

      {/* 设置对话框 */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>聊天设置</DialogTitle>
            <DialogDescription>配置聊天相关设置</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>桌面通知</Label>
                <p className="text-xs text-gray-500">接收新消息的桌面通知</p>
              </div>
              <Switch
                checked={notificationSettings.enableDesktop}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({
                  ...prev,
                  enableDesktop: checked
                }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>声音提醒</Label>
                <p className="text-xs text-gray-500">新消息时播放提示音</p>
              </div>
              <Switch
                checked={notificationSettings.enableSound}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({
                  ...prev,
                  enableSound: checked
                }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>仅@我的消息</Label>
                <p className="text-xs text-gray-500">只显示@提到我的消息通知</p>
              </div>
              <Switch
                checked={notificationSettings.mentionsOnly}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({
                  ...prev,
                  mentionsOnly: checked
                }))}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>关键词提醒</Label>
              <Input
                placeholder="用逗号分隔多个关键词"
                value={notificationSettings.keywords.join(', ')}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSettingsOpen(false)}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 聊天信息对话框 */}
      <Dialog open={isChatInfoOpen} onOpenChange={setIsChatInfoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>聊天信息</DialogTitle>
          </DialogHeader>
          {selectedChat && (
            <div className="space-y-4">
              <div className="text-center">
                <Avatar className="h-16 w-16 mx-auto mb-2">
                  <AvatarImage src={selectedChat.avatar} />
                  <AvatarFallback>
                    {selectedChat.type === 'group' || selectedChat.type === 'department' ? (
                      <Users className="h-8 w-8" />
                    ) : (
                      selectedChat.name[0]
                    )}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">{selectedChat.name}</h3>
                <p className="text-sm text-gray-500">{selectedChat.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">创建时间</span>
                  <span className="text-sm">{new Date(selectedChat.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">成员数量</span>
                  <span className="text-sm">{selectedChat.memberCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">群组类型</span>
                  <span className="text-sm">
                    {selectedChat.type === 'group' ? '普通群组' :
                     selectedChat.type === 'department' ? '部门群' :
                     selectedChat.type === 'announcement' ? '公告群' : '私聊'}
                  </span>
                </div>
              </div>

              {selectedChat.tags.length > 0 && (
                <div>
                  <Label className="text-sm text-gray-600">标签</Label>
                  <div className="flex gap-1 mt-1">
                    {selectedChat.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">消息加密</span>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span className="text-sm">已启用</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsChatInfoOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
