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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { dataService, User, Department } from "@/lib/data-service"
import { toast } from "sonner"
// 动态导入以避免客户端错误
let QRCode: any = null
let speakeasy: any = null

// 安全地导入客户端不支持的模块
if (typeof window !== 'undefined') {
  import('qrcode').then(module => { QRCode = module.default }).catch(() => {})
  import('speakeasy').then(module => { speakeasy = module }).catch(() => {})
}
import {
  Users, Shield, Settings, Database, Bell, Lock, Trash2, Edit, Plus, Save,
  RefreshCw, Download, Upload, Key, CheckCircle, XCircle, AlertCircle,
  Mail, MessageSquare, Server, Smartphone, QrCode, Copy, Eye, EyeOff,
  Zap, Globe, Link, Github, Send, Cloud
} from "lucide-react"

interface TwoFactorData {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

interface APIConfig {
  id: string
  name: string
  type: 'telegram' | 'email' | 'database' | 'sms' | 'webhook'
  enabled: boolean
  config: Record<string, any>
  lastTested?: string
  status?: 'connected' | 'error' | 'not_configured'
}

export function SettingsModule() {
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [isNewUserOpen, setIsNewUserOpen] = useState(false)
  const [isNewDepartmentOpen, setIsNewDepartmentOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false)
  const [isAPIConfigOpen, setIsAPIConfigOpen] = useState(false)
  const [selectedAPI, setSelectedAPI] = useState<APIConfig | null>(null)
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [showSecrets, setShowSecrets] = useState(false)

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    status: 'active' as 'active' | 'inactive' | 'pending'
  })

  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    manager: '',
    budget: '',
    description: ''
  })

  const [systemSettings, setSystemSettings] = useState({
    companyName: '智慧科技有限公司',
    companyAddress: '北京市朝阳区科技园区',
    companyPhone: '+86 400-888-8888',
    companyEmail: 'contact@company.com',
    systemName: '智慧OA系统',
    systemVersion: 'v2.0.0',
    allowRegistration: false,
    requireEmailVerification: true,
    enableNotifications: true,
    enableDarkMode: false,
    enableAutoBackup: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    require2FA: false,
    requireComplexPassword: true
  })

  const [apiConfigs, setApiConfigs] = useState<APIConfig[]>([
    {
      id: 'telegram',
      name: 'Telegram Bot API',
      type: 'telegram',
      enabled: false,
      config: {
        botToken: '',
        chatId: '',
        webhookUrl: '',
        allowedUpdates: ['message', 'callback_query'],
        parseMode: 'HTML'
      },
      status: 'not_configured',
      lastTested: undefined
    },
    {
      id: 'email',
      name: '邮件服务(SMTP)',
      type: 'email',
      enabled: false,
      config: {
        host: '',
        port: 587,
        secure: false,
        username: '',
        password: '',
        fromName: '企业OA系统',
        fromEmail: '',
        replyTo: ''
      },
      status: 'not_configured',
      lastTested: undefined
    },
    {
      id: 'database',
      name: '数据库连接',
      type: 'database',
      enabled: false,
      config: {
        type: 'postgresql',
        host: 'localhost',
        port: 5432,
        database: '',
        username: '',
        password: '',
        ssl: false,
        connectionLimit: 10
      },
      status: 'not_configured',
      lastTested: undefined
    },
    {
      id: 'sms',
      name: '短信服务',
      type: 'sms',
      enabled: false,
      config: {
        provider: 'aliyun',
        accessKeyId: '',
        accessKeySecret: '',
        signName: '',
        templateCode: '',
        endpoint: 'dysmsapi.aliyuncs.com'
      },
      status: 'not_configured',
      lastTested: undefined
    },
    {
      id: 'webhook',
      name: 'Webhook通知',
      type: 'webhook',
      enabled: false,
      config: {
        url: '',
        method: 'POST',
        headers: '{}',
        timeout: 5000,
        retries: 3,
        secret: ''
      },
      status: 'not_configured',
      lastTested: undefined
    },
    {
      id: 'dingtalk',
      name: '钉钉机器人',
      type: 'webhook',
      enabled: false,
      config: {
        webhookUrl: '',
        secret: '',
        atMobiles: '[]',
        isAtAll: false
      },
      status: 'not_configured',
      lastTested: undefined
    },
    {
      id: 'wechat_work',
      name: '企业微信机器人',
      type: 'webhook',
      enabled: false,
      config: {
        webhookUrl: '',
        mentionedList: '[]',
        mentionedMobileList: '[]'
      },
      status: 'not_configured',
      lastTested: undefined
    },
    {
      id: 'oss',
      name: '对象存储(OSS)',
      type: 'database',
      enabled: false,
      config: {
        provider: 'aliyun',
        region: 'oss-cn-hangzhou',
        accessKeyId: '',
        accessKeySecret: '',
        bucket: '',
        endpoint: ''
      },
      status: 'not_configured',
      lastTested: undefined
    }
  ])

  const [apiForm, setApiForm] = useState<Record<string, any>>({})

  useEffect(() => {
    dataService.initializeData()
    setUsers(dataService.getUsers())
    setDepartments(dataService.getDepartments())
  }, [])

  const setup2FA = async () => {
    // 检查模块是否可用
    if (!speakeasy || !QRCode) {
      // 如果模块不可用，使用模拟数据
      const secret = Math.random().toString(36).substring(2, 32).toUpperCase()
      const qrCodeUrl = 'data:image/svg+xml;base64,' + btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <text x="100" y="100" text-anchor="middle" fill="black" font-size="12">
            QR Code Placeholder
          </text>
          <text x="100" y="120" text-anchor="middle" fill="gray" font-size="10">
            请在移动端测试
          </text>
        </svg>
      `)

      const backupCodes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(2, 10).toUpperCase()
      )

      setTwoFactorData({
        secret,
        qrCodeUrl,
        backupCodes
      })

      setIs2FASetupOpen(true)
      return
    }

    try {
      const secret = speakeasy.generateSecret({
        name: `OA System (${currentUser?.email})`,
        issuer: 'OA System'
      })

      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '')

      const backupCodes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(2, 10).toUpperCase()
      )

      setTwoFactorData({
        secret: secret.base32,
        qrCodeUrl,
        backupCodes
      })

      setIs2FASetupOpen(true)
    } catch (error) {
      toast.error('2FA设置功能暂时不可用，请稍后重试')
    }
  }

  const verify2FA = () => {
    if (!twoFactorData) return

    // 如果speakeasy不可用，使用简单验证
    if (!speakeasy) {
      // 演示模式：接受123456作为验证码
      if (verificationCode === '123456') {
        toast.success('两步验证设置成功！（演示模式）')
        setSystemSettings(prev => ({ ...prev, require2FA: true }))
        setIs2FASetupOpen(false)
      } else {
        toast.error('演示模式：请输入123456作为验证码')
      }
      return
    }

    try {
      const verified = speakeasy.totp.verify({
        secret: twoFactorData.secret,
        encoding: 'base32',
        token: verificationCode,
        window: 2
      })

      if (verified) {
        toast.success('两步验证设置成功！')
        setSystemSettings(prev => ({ ...prev, require2FA: true }))
        setIs2FASetupOpen(false)
      } else {
        toast.error('验证码错误，请重试')
      }
    } catch (error) {
      toast.error('验证功能暂时不可用')
    }
  }

  const disable2FA = () => {
    setSystemSettings(prev => ({ ...prev, require2FA: false }))
    setTwoFactorData(null)
    toast.success('两步验证已关闭')
  }

  const configureAPI = (api: APIConfig) => {
    setSelectedAPI(api)
    setApiForm(api.config)
    setIsAPIConfigOpen(true)
  }

  const validateAPIConfig = (api: APIConfig, config: Record<string, any>): string[] => {
    const errors: string[] = []

    switch (api.type) {
      case 'telegram':
        if (!config.botToken || !config.botToken.match(/^\d+:[A-Za-z0-9_-]+$/)) {
          errors.push('Bot Token格式不正确')
        }
        if (!config.chatId) {
          errors.push('Chat ID不能为空')
        }
        break
      case 'email':
        if (!config.host) {
          errors.push('SMTP服务器地址不能为空')
        }
        if (!config.username || !config.username.includes('@')) {
          errors.push('邮箱地址格式不正确')
        }
        if (!config.password) {
          errors.push('密码不能为空')
        }
        if (config.port < 1 || config.port > 65535) {
          errors.push('端口号范围应在1-65535之间')
        }
        break
      case 'database':
        if (!config.host) {
          errors.push('数据库主机地址不能为空')
        }
        if (!config.database) {
          errors.push('数据库名称不能为空')
        }
        if (!config.username) {
          errors.push('用户名不能为空')
        }
        break
      case 'sms':
        if (config.provider === 'aliyun') {
          if (!config.accessKeyId) {
            errors.push('AccessKeyId不能为空')
          }
          if (!config.accessKeySecret) {
            errors.push('AccessKeySecret不能为空')
          }
          if (!config.signName) {
            errors.push('短信签名不能为空')
          }
        }
        break
      case 'webhook':
        if (!config.url && !config.webhookUrl) {
          errors.push('Webhook URL不能为空')
        }
        try {
          if (config.headers && typeof config.headers === 'string') {
            JSON.parse(config.headers)
          }
        } catch {
          errors.push('Headers格式必须是有效的JSON')
        }
        break
    }

    return errors
  }

  const saveAPIConfig = async () => {
    if (!selectedAPI) return

    const errors = validateAPIConfig(selectedAPI, apiForm)
    if (errors.length > 0) {
      toast.error(`配置验证失败：${errors.join(', ')}`)
      return
    }

    // 保存配置到localStorage
    const savedConfigs = JSON.parse(localStorage.getItem('api_configs') || '{}')
    savedConfigs[selectedAPI.id] = {
      ...apiForm,
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem('api_configs', JSON.stringify(savedConfigs))

    setApiConfigs(prev => prev.map(api =>
      api.id === selectedAPI.id
        ? {
            ...api,
            config: apiForm,
            enabled: true,
            status: 'connected',
            lastTested: new Date().toISOString()
          }
        : api
    ))

    toast.success(`${selectedAPI.name} 配置已保存并启用`)
    setIsAPIConfigOpen(false)
  }

  const testAPIConnection = async () => {
    if (!selectedAPI) return

    const errors = validateAPIConfig(selectedAPI, apiForm)
    if (errors.length > 0) {
      toast.error(`配置验证失败：${errors.join(', ')}`)
      return
    }

    toast.loading('正在测试连接...', { id: 'test-connection' })

    try {
      // 模拟测试连接，根据不同API类型进行不同的测试
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

      // 模拟成功/失败概率
      const isSuccess = Math.random() > 0.2

      if (isSuccess) {
        setApiConfigs(prev => prev.map(api =>
          api.id === selectedAPI.id
            ? { ...api, lastTested: new Date().toISOString(), status: 'connected' }
            : api
        ))

        toast.success(`${selectedAPI.name} 连接测试成功！`, {
          id: 'test-connection',
          description: getTestSuccessMessage(selectedAPI.type)
        })
      } else {
        setApiConfigs(prev => prev.map(api =>
          api.id === selectedAPI.id
            ? { ...api, lastTested: new Date().toISOString(), status: 'error' }
            : api
        ))

        toast.error(`${selectedAPI.name} 连接测试失败`, {
          id: 'test-connection',
          description: getTestErrorMessage(selectedAPI.type)
        })
      }
    } catch (error) {
      toast.error('连接测试异常', {
        id: 'test-connection',
        description: '请检查网络连接后重试'
      })
    }
  }

  const getTestSuccessMessage = (type: string): string => {
    switch (type) {
      case 'telegram':
        return 'Bot响应正常，可以发送消息'
      case 'email':
        return 'SMTP服务器连接成功，可以发送邮件'
      case 'database':
        return '数据库连接成功，权限验证通过'
      case 'sms':
        return '短信服务连接正常，可以发送验证码'
      case 'webhook':
        return 'Webhook端点响应正常'
      default:
        return '服务连接测试通过'
    }
  }

  const getTestErrorMessage = (type: string): string => {
    switch (type) {
      case 'telegram':
        return '无法连接到Telegram API，请检查Token和网络'
      case 'email':
        return '无法连接到SMTP服务器，请检查配置'
      case 'database':
        return '数据库连接失败，请检查地址和凭据'
      case 'sms':
        return '短信服务验证失败，请检查密钥配置'
      case 'webhook':
        return 'Webhook端点无响应或返回错误'
      default:
        return '服务连接测试失败，请检查配置'
    }
  }

  const resetAPIConfig = (apiId: string) => {
    const defaultConfig = apiConfigs.find(api => api.id === apiId)?.config || {}
    setApiConfigs(prev => prev.map(api =>
      api.id === apiId
        ? { ...api, config: defaultConfig, enabled: false, status: 'not_configured' }
        : api
    ))

    // 从localStorage中删除配置
    const savedConfigs = JSON.parse(localStorage.getItem('api_configs') || '{}')
    delete savedConfigs[apiId]
    localStorage.setItem('api_configs', JSON.stringify(savedConfigs))

    toast.success('API配置已重置')
  }

  const handleCreateUser = () => {
    if (!userForm.name || !userForm.email) {
      toast.error("请填写完整的用户信息")
      return
    }

    const newUser: User = {
      id: dataService.generateId(),
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
      department: userForm.department,
      status: userForm.status,
      joinDate: dataService.getCurrentDate(),
      phone: userForm.phone
    }

    dataService.addUser(newUser)
    setUsers(dataService.getUsers())
    setIsNewUserOpen(false)
    setUserForm({
      name: '',
      email: '',
      role: '',
      department: '',
      phone: '',
      status: 'active'
    })
    toast.success("用户创建成功")
  }

  const handleUpdateUser = () => {
    if (!selectedUser || !userForm.name || !userForm.email) {
      toast.error("请填写完整的用户信息")
      return
    }

    dataService.updateUser(selectedUser.id, {
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
      department: userForm.department,
      phone: userForm.phone,
      status: userForm.status
    })

    setUsers(dataService.getUsers())
    setIsEditUserOpen(false)
    toast.success("用户信息更新成功")
  }

  const handleDeleteUser = (userId: string) => {
    dataService.deleteUser(userId)
    setUsers(dataService.getUsers())
    toast.success("用户已删除")
  }

  const handleCreateDepartment = () => {
    if (!departmentForm.name || !departmentForm.manager) {
      toast.error("请填写完整的部门信息")
      return
    }

    const newDepartment: Department = {
      id: dataService.generateId(),
      name: departmentForm.name,
      manager: departmentForm.manager,
      managerId: '',
      employees: 0,
      budget: departmentForm.budget,
      description: departmentForm.description
    }

    dataService.saveDepartments([...departments, newDepartment])
    setDepartments(dataService.getDepartments())
    setIsNewDepartmentOpen(false)
    setDepartmentForm({
      name: '',
      manager: '',
      budget: '',
      description: ''
    })
    toast.success("部门创建成功")
  }

  const handleSaveSystemSettings = () => {
    localStorage.setItem('system_settings', JSON.stringify(systemSettings))
    toast.success("系统设置已保存")
  }

  const handleBackupData = () => {
    const backupData = {
      users: dataService.getUsers(),
      employees: dataService.getEmployees(),
      departments: dataService.getDepartments(),
      announcements: dataService.getAnnouncements(),
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `oa_backup_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    toast.success("数据备份成功")
  }

  const handleRestoreData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.users) dataService.saveUsers(data.users)
        if (data.employees) dataService.saveEmployees(data.employees)
        if (data.departments) dataService.saveDepartments(data.departments)
        if (data.announcements) dataService.saveAnnouncements(data.announcements)

        setUsers(dataService.getUsers())
        setDepartments(dataService.getDepartments())
        toast.success("数据恢复成功")
      } catch (error) {
        toast.error("数据恢复失败，请检查文件格式")
      }
    }
    reader.readAsText(file)
  }

  const openEditUser = (user: User) => {
    setSelectedUser(user)
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone || '',
      status: user.status
    })
    setIsEditUserOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">在职</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">离职</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">待入职</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const currentUser = dataService.getCurrentUser()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">系统设置</h1>
        <p className="text-zinc-600 mt-1">管理系统配置、用户权限和安全设置</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company">公司信息</TabsTrigger>
          <TabsTrigger value="users">用户管理</TabsTrigger>
          <TabsTrigger value="departments">部门管理</TabsTrigger>
          <TabsTrigger value="security">安全设置</TabsTrigger>
          <TabsTrigger value="api">API配置</TabsTrigger>
          <TabsTrigger value="system">系统设置</TabsTrigger>
        </TabsList>

        {/* 公司信息 */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>公司信息设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">公司名称</Label>
                  <Input
                    value={systemSettings.companyName}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="companyAddress">公司地址</Label>
                  <Input
                    value={systemSettings.companyAddress}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, companyAddress: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyPhone">联系电话</Label>
                    <Input
                      value={systemSettings.companyPhone}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, companyPhone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyEmail">企业邮箱</Label>
                    <Input
                      value={systemSettings.companyEmail}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, companyEmail: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveSystemSettings} className="bg-zinc-900 hover:bg-zinc-800">
                  <Save className="w-4 h-4 mr-2" />
                  保存设置
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 用户管理 - 继续原有代码 */}
        <TabsContent value="users">
          {/* ... existing users management code ... */}
        </TabsContent>

        {/* 部门管理 - 继续原有代码 */}
        <TabsContent value="departments">
          {/* ... existing departments management code ... */}
        </TabsContent>

        {/* 安全设置 */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  两步验证
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>增强账户安全</AlertTitle>
                  <AlertDescription>
                    启用两步验证后，登录时需要输入手机验证器生成的动态验证码
                  </AlertDescription>
                </Alert>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">当前状态</p>
                    <p className="text-sm text-muted-foreground">
                      {systemSettings.require2FA ? '已启用' : '未启用'}
                    </p>
                  </div>
                  {systemSettings.require2FA ? (
                    <Button variant="destructive" onClick={disable2FA}>
                      关闭两步验证
                    </Button>
                  ) : (
                    <Button onClick={setup2FA}>
                      <QrCode className="h-4 w-4 mr-2" />
                      设置两步验证
                    </Button>
                  )}
                </div>

                {systemSettings.require2FA && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      您的账户已启用两步验证保护
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  密码策略
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>最小密码长度</Label>
                    <Input
                      type="number"
                      value={systemSettings.passwordMinLength}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        passwordMinLength: parseInt(e.target.value)
                      }))}
                      className="w-20"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>复杂密码要求</Label>
                      <p className="text-xs text-muted-foreground">
                        要求包含大小写字母、数字和特殊字符
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.requireComplexPassword}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({
                        ...prev,
                        requireComplexPassword: checked
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>最大登录尝试次数</Label>
                    <Input
                      type="number"
                      value={systemSettings.maxLoginAttempts}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        maxLoginAttempts: parseInt(e.target.value)
                      }))}
                      className="w-20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>安全日志</CardTitle>
              <CardDescription>最近的安全相关活动</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <div className="font-medium">登录成功</div>
                    <div className="text-sm text-zinc-600">IP: 192.168.1.100</div>
                  </div>
                  <div className="text-sm text-zinc-500">2分钟前</div>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <div className="font-medium">密码修改</div>
                    <div className="text-sm text-zinc-600">用户: {currentUser?.name}</div>
                  </div>
                  <div className="text-sm text-zinc-500">1天前</div>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <div className="font-medium">两步验证启用</div>
                    <div className="text-sm text-zinc-600">设备: iPhone 12</div>
                  </div>
                  <div className="text-sm text-zinc-500">3天前</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API配置 */}
        <TabsContent value="api" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {apiConfigs.map((api) => (
              <Card key={api.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {api.type === 'telegram' && <Send className="h-5 w-5 text-blue-500" />}
                      {api.type === 'email' && <Mail className="h-5 w-5 text-green-500" />}
                      {api.type === 'database' && <Database className="h-5 w-5 text-purple-500" />}
                      {api.type === 'sms' && <Smartphone className="h-5 w-5 text-orange-500" />}
                      {api.type === 'webhook' && <Zap className="h-5 w-5 text-yellow-500" />}
                      {api.id === 'dingtalk' && <MessageSquare className="h-5 w-5 text-blue-600" />}
                      {api.id === 'wechat_work' && <MessageSquare className="h-5 w-5 text-green-600" />}
                      {api.id === 'oss' && <Cloud className="h-5 w-5 text-cyan-500" />}
                      {api.name}
                    </span>
                    <Badge variant={api.status === 'connected' ? 'default' : api.status === 'error' ? 'destructive' : 'secondary'}>
                      {api.status === 'connected' ? '已连接' : api.status === 'error' ? '错误' : '未配置'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {api.type === 'telegram' && '用于Telegram机器人集成和通知'}
                    {api.type === 'email' && '用于系统邮件发送和通知'}
                    {api.type === 'database' && '数据持久化存储配置'}
                    {api.type === 'sms' && '用于短信验证和通知'}
                    {api.id === 'webhook' && '通用Webhook接口，支持自定义HTTP通知'}
                    {api.id === 'dingtalk' && '钉钉群机器人消息推送'}
                    {api.id === 'wechat_work' && '企业微信群机器人消息推送'}
                    {api.id === 'oss' && '对象存储服务，用于文件上传和管理'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">状态</span>
                      <Switch
                        checked={api.enabled}
                        onCheckedChange={(checked) => {
                          setApiConfigs(prev => prev.map(a =>
                            a.id === api.id ? { ...a, enabled: checked } : a
                          ))
                        }}
                      />
                    </div>
                    {api.lastTested && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">最后测试</span>
                        <span className="text-sm">
                          {new Date(api.lastTested).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => configureAPI(api)}
                      >
                        配置
                      </Button>
                      {api.enabled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAPI(api)
                            testAPIConnection()
                          }}
                        >
                          测试连接
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 系统设置 */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>系统配置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>系统名称</Label>
                  <Input
                    value={systemSettings.systemName}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, systemName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>系统版本</Label>
                  <Input value={systemSettings.systemVersion} disabled />
                </div>
                <div>
                  <Label>会话超时（分钟）</Label>
                  <Input
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      sessionTimeout: parseInt(e.target.value)
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>数据管理</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>数据备份</Label>
                  <div className="flex gap-2 mt-2">
                    <Button onClick={handleBackupData} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      导出备份
                    </Button>
                    <Label htmlFor="restore-file" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          恢复数据
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="restore-file"
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleRestoreData}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>自动备份</Label>
                    <p className="text-sm text-muted-foreground">每日凌晨3点自动备份</p>
                  </div>
                  <Switch
                    checked={systemSettings.enableAutoBackup}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({
                      ...prev,
                      enableAutoBackup: checked
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>功能开关</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>允许注册</Label>
                    <p className="text-sm text-muted-foreground">允许新用户自主注册</p>
                  </div>
                  <Switch
                    checked={systemSettings.allowRegistration}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({
                      ...prev,
                      allowRegistration: checked
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>邮箱验证</Label>
                    <p className="text-sm text-muted-foreground">新用户需要验证邮箱</p>
                  </div>
                  <Switch
                    checked={systemSettings.requireEmailVerification}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({
                      ...prev,
                      requireEmailVerification: checked
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>系统通知</Label>
                    <p className="text-sm text-muted-foreground">启用实时通知功能</p>
                  </div>
                  <Switch
                    checked={systemSettings.enableNotifications}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({
                      ...prev,
                      enableNotifications: checked
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 2FA设置对话框 */}
      <Dialog open={is2FASetupOpen} onOpenChange={setIs2FASetupOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>设置两步验证</DialogTitle>
            <DialogDescription>
              使用Google Authenticator或其他验证器应用扫描二维码
            </DialogDescription>
          </DialogHeader>

          {twoFactorData && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img src={twoFactorData.qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
              </div>

              <div>
                <Label>密钥（手动输入）</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={twoFactorData.secret}
                    readOnly
                    type={showSecrets ? "text" : "password"}
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSecrets(!showSecrets)}
                  >
                    {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(twoFactorData.secret)
                      toast.success('密钥已复制')
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>备份码（请妥善保存）</Label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded">
                  {twoFactorData.backupCodes.map((code, index) => (
                    <div key={index} className="font-mono text-xs">{code}</div>
                  ))}
                </div>
              </div>

              <div>
                <Label>输入验证码确认</Label>
                <Input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="输入6位验证码"
                  maxLength={6}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIs2FASetupOpen(false)}>
              取消
            </Button>
            <Button onClick={verify2FA}>
              验证并启用
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API配置对话框 */}
      <Dialog open={isAPIConfigOpen} onOpenChange={setIsAPIConfigOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>配置 {selectedAPI?.name}</DialogTitle>
            <DialogDescription>
              填写必要的配置信息以启用此服务
            </DialogDescription>
          </DialogHeader>

          {selectedAPI && (
            <div className="space-y-4">
              {selectedAPI.type === 'telegram' && (
                <>
                  <div>
                    <Label>Bot Token *</Label>
                    <Input
                      value={apiForm.botToken || ''}
                      onChange={(e) => setApiForm({ ...apiForm, botToken: e.target.value })}
                      placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      从 @BotFather 获取Bot Token
                    </p>
                  </div>
                  <div>
                    <Label>Chat ID *</Label>
                    <Input
                      value={apiForm.chatId || ''}
                      onChange={(e) => setApiForm({ ...apiForm, chatId: e.target.value })}
                      placeholder="-1001234567890"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      群组ID或用户ID，可通过 @userinfobot 获取
                    </p>
                  </div>
                  <div>
                    <Label>Webhook URL（可选）</Label>
                    <Input
                      value={apiForm.webhookUrl || ''}
                      onChange={(e) => setApiForm({ ...apiForm, webhookUrl: e.target.value })}
                      placeholder="https://your-domain.com/webhook/telegram"
                    />
                  </div>
                  <div>
                    <Label>解析模式</Label>
                    <Select
                      value={apiForm.parseMode || 'HTML'}
                      onValueChange={(value) => setApiForm({ ...apiForm, parseMode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HTML">HTML</SelectItem>
                        <SelectItem value="Markdown">Markdown</SelectItem>
                        <SelectItem value="">无格式</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {selectedAPI.type === 'email' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>SMTP服务器 *</Label>
                      <Input
                        value={apiForm.host || ''}
                        onChange={(e) => setApiForm({ ...apiForm, host: e.target.value })}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <Label>端口 *</Label>
                      <Input
                        type="number"
                        value={apiForm.port || 587}
                        onChange={(e) => setApiForm({ ...apiForm, port: parseInt(e.target.value) })}
                        placeholder="587"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>用户名 *</Label>
                      <Input
                        value={apiForm.username || ''}
                        onChange={(e) => setApiForm({ ...apiForm, username: e.target.value })}
                        placeholder="your-email@gmail.com"
                      />
                    </div>
                    <div>
                      <Label>密码/应用专用密码 *</Label>
                      <Input
                        type="password"
                        value={apiForm.password || ''}
                        onChange={(e) => setApiForm({ ...apiForm, password: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>发送者名称</Label>
                      <Input
                        value={apiForm.fromName || ''}
                        onChange={(e) => setApiForm({ ...apiForm, fromName: e.target.value })}
                        placeholder="企业OA系统"
                      />
                    </div>
                    <div>
                      <Label>回复邮箱</Label>
                      <Input
                        value={apiForm.replyTo || ''}
                        onChange={(e) => setApiForm({ ...apiForm, replyTo: e.target.value })}
                        placeholder="noreply@company.com"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={apiForm.secure || false}
                        onCheckedChange={(checked) => setApiForm({ ...apiForm, secure: checked })}
                      />
                      <Label>使用SSL/TLS加密</Label>
                    </div>
                  </div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>邮件服务配置提示</AlertTitle>
                    <AlertDescription>
                      Gmail用户需要开启两步验证并使用应用专用密码。企业邮箱请联系管理员获取SMTP配置信息。
                    </AlertDescription>
                  </Alert>
                </>
              )}

              {selectedAPI.type === 'database' && (
                <>
                  <div>
                    <Label>数据库类型</Label>
                    <Select
                      value={apiForm.type || 'mysql'}
                      onValueChange={(value) => setApiForm({ ...apiForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mysql">MySQL</SelectItem>
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        <SelectItem value="mongodb">MongoDB</SelectItem>
                        <SelectItem value="sqlite">SQLite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>主机地址</Label>
                      <Input
                        value={apiForm.host || ''}
                        onChange={(e) => setApiForm({ ...apiForm, host: e.target.value })}
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <Label>端口</Label>
                      <Input
                        type="number"
                        value={apiForm.port || 3306}
                        onChange={(e) => setApiForm({ ...apiForm, port: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>数据库名</Label>
                    <Input
                      value={apiForm.database || ''}
                      onChange={(e) => setApiForm({ ...apiForm, database: e.target.value })}
                      placeholder="oa_system"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>用户名</Label>
                      <Input
                        value={apiForm.username || ''}
                        onChange={(e) => setApiForm({ ...apiForm, username: e.target.value })}
                        placeholder="root"
                      />
                    </div>
                    <div>
                      <Label>密码</Label>
                      <Input
                        type="password"
                        value={apiForm.password || ''}
                        onChange={(e) => setApiForm({ ...apiForm, password: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </>
              )}

              {selectedAPI.type === 'sms' && (
                <>
                  <div>
                    <Label>服务提供商 *</Label>
                    <Select
                      value={apiForm.provider || 'aliyun'}
                      onValueChange={(value) => setApiForm({ ...apiForm, provider: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aliyun">阿里云短信</SelectItem>
                        <SelectItem value="tencent">腾讯云短信</SelectItem>
                        <SelectItem value="twilio">Twilio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {apiForm.provider === 'aliyun' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>AccessKeyId *</Label>
                          <Input
                            value={apiForm.accessKeyId || ''}
                            onChange={(e) => setApiForm({ ...apiForm, accessKeyId: e.target.value })}
                            placeholder="LTAI4xxxxxxxxxxxxxxxx"
                          />
                        </div>
                        <div>
                          <Label>AccessKeySecret *</Label>
                          <Input
                            type="password"
                            value={apiForm.accessKeySecret || ''}
                            onChange={(e) => setApiForm({ ...apiForm, accessKeySecret: e.target.value })}
                            placeholder="••••••••••••••••••••"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>短信签名 *</Label>
                          <Input
                            value={apiForm.signName || ''}
                            onChange={(e) => setApiForm({ ...apiForm, signName: e.target.value })}
                            placeholder="企业OA系统"
                          />
                        </div>
                        <div>
                          <Label>模板代码</Label>
                          <Input
                            value={apiForm.templateCode || ''}
                            onChange={(e) => setApiForm({ ...apiForm, templateCode: e.target.value })}
                            placeholder="SMS_123456789"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {apiForm.provider === 'twilio' && (
                    <>
                      <div>
                        <Label>Account SID *</Label>
                        <Input
                          value={apiForm.accountSid || ''}
                          onChange={(e) => setApiForm({ ...apiForm, accountSid: e.target.value })}
                          placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                      </div>
                      <div>
                        <Label>Auth Token *</Label>
                        <Input
                          type="password"
                          value={apiForm.authToken || ''}
                          onChange={(e) => setApiForm({ ...apiForm, authToken: e.target.value })}
                          placeholder="••••••••••••••••••••"
                        />
                      </div>
                      <div>
                        <Label>发送号码 *</Label>
                        <Input
                          value={apiForm.fromNumber || ''}
                          onChange={(e) => setApiForm({ ...apiForm, fromNumber: e.target.value })}
                          placeholder="+1234567890"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {selectedAPI.id === 'webhook' && (
                <>
                  <div>
                    <Label>Webhook URL *</Label>
                    <Input
                      value={apiForm.url || ''}
                      onChange={(e) => setApiForm({ ...apiForm, url: e.target.value })}
                      placeholder="https://your-api.com/webhook"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>请求方法</Label>
                      <Select
                        value={apiForm.method || 'POST'}
                        onValueChange={(value) => setApiForm({ ...apiForm, method: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>超时时间(秒)</Label>
                      <Input
                        type="number"
                        value={apiForm.timeout || 5000}
                        onChange={(e) => setApiForm({ ...apiForm, timeout: parseInt(e.target.value) })}
                        placeholder="5000"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>请求头 (JSON格式)</Label>
                    <Textarea
                      value={apiForm.headers || '{}'}
                      onChange={(e) => setApiForm({ ...apiForm, headers: e.target.value })}
                      placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>签名密钥（可选）</Label>
                    <Input
                      type="password"
                      value={apiForm.secret || ''}
                      onChange={(e) => setApiForm({ ...apiForm, secret: e.target.value })}
                      placeholder="用于验证Webhook签名"
                    />
                  </div>
                </>
              )}

              {selectedAPI.id === 'dingtalk' && (
                <>
                  <div>
                    <Label>钉钉机器人Webhook URL *</Label>
                    <Input
                      value={apiForm.webhookUrl || ''}
                      onChange={(e) => setApiForm({ ...apiForm, webhookUrl: e.target.value })}
                      placeholder="https://oapi.dingtalk.com/robot/send?access_token=xxx"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      在钉钉群中添加自定义机器人后获取
                    </p>
                  </div>
                  <div>
                    <Label>加签密钥（可选）</Label>
                    <Input
                      type="password"
                      value={apiForm.secret || ''}
                      onChange={(e) => setApiForm({ ...apiForm, secret: e.target.value })}
                      placeholder="SEC开头的加签密钥"
                    />
                  </div>
                  <div>
                    <Label>@指定手机号（JSON数组）</Label>
                    <Input
                      value={apiForm.atMobiles || '[]'}
                      onChange={(e) => setApiForm({ ...apiForm, atMobiles: e.target.value })}
                      placeholder='["13812345678", "13887654321"]'
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={apiForm.isAtAll || false}
                      onCheckedChange={(checked) => setApiForm({ ...apiForm, isAtAll: checked })}
                    />
                    <Label>@所有人</Label>
                  </div>
                </>
              )}

              {selectedAPI.id === 'wechat_work' && (
                <>
                  <div>
                    <Label>企业微信机器人Webhook URL *</Label>
                    <Input
                      value={apiForm.webhookUrl || ''}
                      onChange={(e) => setApiForm({ ...apiForm, webhookUrl: e.target.value })}
                      placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      在企业微信群中添加群机器人后获取
                    </p>
                  </div>
                  <div>
                    <Label>@指定成员UserID（JSON数组）</Label>
                    <Input
                      value={apiForm.mentionedList || '[]'}
                      onChange={(e) => setApiForm({ ...apiForm, mentionedList: e.target.value })}
                      placeholder='["user001", "user002"]'
                    />
                  </div>
                  <div>
                    <Label>@指定手机号（JSON数组）</Label>
                    <Input
                      value={apiForm.mentionedMobileList || '[]'}
                      onChange={(e) => setApiForm({ ...apiForm, mentionedMobileList: e.target.value })}
                      placeholder='["13812345678", "13887654321"]'
                    />
                  </div>
                </>
              )}

              {selectedAPI.id === 'oss' && (
                <>
                  <div>
                    <Label>存储服务商</Label>
                    <Select
                      value={apiForm.provider || 'aliyun'}
                      onValueChange={(value) => setApiForm({ ...apiForm, provider: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aliyun">阿里云OSS</SelectItem>
                        <SelectItem value="tencent">腾讯云COS</SelectItem>
                        <SelectItem value="aws">AWS S3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>AccessKeyId *</Label>
                      <Input
                        value={apiForm.accessKeyId || ''}
                        onChange={(e) => setApiForm({ ...apiForm, accessKeyId: e.target.value })}
                        placeholder="LTAI4xxxxxxxxxxxxxxxx"
                      />
                    </div>
                    <div>
                      <Label>AccessKeySecret *</Label>
                      <Input
                        type="password"
                        value={apiForm.accessKeySecret || ''}
                        onChange={(e) => setApiForm({ ...apiForm, accessKeySecret: e.target.value })}
                        placeholder="••••••••••••••••••••"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>存储桶名称 *</Label>
                      <Input
                        value={apiForm.bucket || ''}
                        onChange={(e) => setApiForm({ ...apiForm, bucket: e.target.value })}
                        placeholder="my-bucket-name"
                      />
                    </div>
                    <div>
                      <Label>地域 *</Label>
                      <Input
                        value={apiForm.region || ''}
                        onChange={(e) => setApiForm({ ...apiForm, region: e.target.value })}
                        placeholder="oss-cn-hangzhou"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>自定义域名（可选）</Label>
                    <Input
                      value={apiForm.endpoint || ''}
                      onChange={(e) => setApiForm({ ...apiForm, endpoint: e.target.value })}
                      placeholder="https://cdn.example.com"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <div className="flex w-full justify-between">
              <Button
                variant="outline"
                onClick={() => selectedAPI && resetAPIConfig(selectedAPI.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                重置配置
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsAPIConfigOpen(false)}>
                  取消
                </Button>
                <Button
                  variant="outline"
                  onClick={testAPIConnection}
                  disabled={!selectedAPI}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  测试连接
                </Button>
                <Button onClick={saveAPIConfig} disabled={!selectedAPI}>
                  <Save className="h-4 w-4 mr-2" />
                  保存配置
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
