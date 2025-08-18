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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Plus, DollarSign, Clock, CheckCircle, XCircle, Eye, Download, Search, Edit, Trash2, Wallet, Shield, QrCode, Copy, RefreshCw, AlertTriangle, Lock } from "lucide-react"
import { dataService, PaymentRequest } from "@/lib/data-service"
import { toast } from "sonner"
// 动态导入以避免客户端错误
let QRCode: any = null
let speakeasy: any = null

if (typeof window !== 'undefined') {
  import('qrcode').then(module => { QRCode = module.default }).catch(() => {})
  import('speakeasy').then(module => { speakeasy = module }).catch(() => {})
}

interface EmployeeWallet {
  id: string
  employeeId: string
  employeeName: string
  walletAddress: string
  addressType: 'TRC20' | 'ERC20' | 'BTC'
  currency: string
  balance: string
  isVerified: boolean
  is2FAEnabled: boolean
  qrSecret?: string
  backupCodes?: string[]
  lastModified: string
  modificationHistory: WalletModificationRecord[]
}

interface WalletModificationRecord {
  id: string
  timestamp: string
  action: 'created' | 'modified' | 'verified'
  oldAddress?: string
  newAddress: string
  verificationMethod: string[]
  operatorId: string
  operatorName: string
  reason: string
}

export function PaymentModule() {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([])
  const [employeeWallets, setEmployeeWallets] = useState<EmployeeWallet[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isWalletManagementOpen, setIsWalletManagementOpen] = useState(false)
  const [isWalletEditOpen, setIsWalletEditOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null)
  const [selectedWallet, setSelectedWallet] = useState<EmployeeWallet | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [walletSearchTerm, setWalletSearchTerm] = useState("")
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [emailCode, setEmailCode] = useState("")
  const [smsCode, setSmsCode] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [twoFactorData, setTwoFactorData] = useState<any>(null)

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    currency: "",
    description: "",
    priority: "normal",
    recipient: ""
  })

  const [walletForm, setWalletForm] = useState({
    walletAddress: "",
    addressType: "TRC20" as 'TRC20' | 'ERC20' | 'BTC',
    currency: "USDT",
    reason: ""
  })

  useEffect(() => {
    loadPaymentRequests()
    loadEmployeeWallets()
  }, [])

  const loadPaymentRequests = () => {
    const requests = dataService.getPaymentRequests()
    setPaymentRequests(requests)
  }

  const loadEmployeeWallets = () => {
    const wallets: EmployeeWallet[] = [
      {
        id: 'wallet-1',
        employeeId: 'emp1',
        employeeName: '张三',
        walletAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        addressType: 'TRC20',
        currency: 'USDT',
        balance: '8,500.00',
        isVerified: true,
        is2FAEnabled: true,
        lastModified: '2024-01-15 10:30:00',
        modificationHistory: [
          {
            id: 'mod-1',
            timestamp: '2024-01-15 10:30:00',
            action: 'created',
            newAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
            verificationMethod: ['2FA', 'Email', 'SMS'],
            operatorId: 'emp1',
            operatorName: '张三',
            reason: '初始钱包设置'
          }
        ]
      }
    ]
    setEmployeeWallets(wallets)
  }

  const validateTRC20Address = (address: string): boolean => {
    if (!address) return false
    const trc20Regex = /^T[0-9A-Za-z]{33}$/
    return trc20Regex.test(address)
  }

  const setup2FA = async () => {
    let secret: string
    let qrCodeUrl: string

    // 检查模块是否可用
    if (!speakeasy || !QRCode) {
      // 模拟数据
      secret = Math.random().toString(36).substring(2, 32).toUpperCase()
      qrCodeUrl = 'data:image/svg+xml;base64,' + btoa(`
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
    } else {
      try {
        const secretObj = speakeasy.generateSecret({
          name: `OA Wallet (${selectedWallet?.employeeName})`,
          issuer: 'BushidageOA'
        })

        secret = secretObj.base32
        qrCodeUrl = await QRCode.toDataURL(secretObj.otpauth_url || '')
      } catch (error) {
        toast.error('生成2FA设置失败')
        return
      }
    }

    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    )

    setTwoFactorData({
      secret,
      qrCodeUrl,
      backupCodes
    })

    setIs2FASetupOpen(true)
  }

  const verify2FA = () => {
    if (!twoFactorData) return

    let verified = false

    // 检查speakeasy是否可用
    if (!speakeasy) {
      // 演示模式：接受123456作为验证码
      verified = verificationCode === '123456'
    } else {
      try {
        verified = speakeasy.totp.verify({
          secret: twoFactorData.secret,
          encoding: 'base32',
          token: verificationCode,
          window: 2
        })
      } catch (error) {
        toast.error('验证功能暂时不可用')
        return
      }
    }

    if (verified) {
      toast.success('谷歌验证器设置成功！' + (!speakeasy ? '（演示模式）' : ''))
      if (selectedWallet) {
        const updatedWallets = employeeWallets.map(w =>
          w.id === selectedWallet.id
            ? { ...w, is2FAEnabled: true, qrSecret: twoFactorData.secret, backupCodes: twoFactorData.backupCodes }
            : w
        )
        setEmployeeWallets(updatedWallets)
      }
      setIs2FASetupOpen(false)
      setVerificationCode("")
    } else {
      toast.error('验证码错误，请重试')
    }
  }

  const handleWalletAddressChange = async () => {
    if (!selectedWallet) return

    if (walletForm.addressType === 'TRC20' && !validateTRC20Address(walletForm.walletAddress)) {
      toast.error('请输入有效的TRC20地址格式')
      return
    }

    if (!verificationCode && selectedWallet.is2FAEnabled) {
      toast.error('请输入谷歌验证器验证码')
      return
    }

    if (!emailCode) {
      toast.error('请输入邮箱验证码')
      return
    }

    if (!smsCode) {
      toast.error('请输入短信验证码')
      return
    }

    if (!currentPassword) {
      toast.error('请输入当前密码')
      return
    }

    if (!walletForm.reason.trim()) {
      toast.error('请填写修改原因')
      return
    }

    let verificationMethods: string[] = []

    if (selectedWallet.is2FAEnabled && verificationCode) {
      const verified = speakeasy.totp.verify({
        secret: selectedWallet.qrSecret || '',
        encoding: 'base32',
        token: verificationCode,
        window: 2
      })

      if (!verified) {
        toast.error('谷歌验证器验证码错误')
        return
      }
      verificationMethods.push('Google Authenticator')
    }

    if (emailCode === '123456') {
      verificationMethods.push('Email')
    } else {
      toast.error('邮箱验证码错误')
      return
    }

    if (smsCode === '888888') {
      verificationMethods.push('SMS')
    } else {
      toast.error('短信验证码错误')
      return
    }

    if (currentPassword === 'password123') {
      verificationMethods.push('Password')
    } else {
      toast.error('密码错误')
      return
    }

    const modificationRecord: WalletModificationRecord = {
      id: `mod-${Date.now()}`,
      timestamp: new Date().toLocaleString('zh-CN'),
      action: 'modified',
      oldAddress: selectedWallet.walletAddress,
      newAddress: walletForm.walletAddress,
      verificationMethod: verificationMethods,
      operatorId: dataService.getCurrentUser()?.id || 'unknown',
      operatorName: dataService.getCurrentUser()?.name || 'Unknown',
      reason: walletForm.reason
    }

    const updatedWallets = employeeWallets.map(w =>
      w.id === selectedWallet.id
        ? {
            ...w,
            walletAddress: walletForm.walletAddress,
            addressType: walletForm.addressType,
            lastModified: new Date().toLocaleString('zh-CN'),
            modificationHistory: [...w.modificationHistory, modificationRecord]
          }
        : w
    )

    setEmployeeWallets(updatedWallets)
    setIsWalletEditOpen(false)

    setWalletForm({ walletAddress: "", addressType: "TRC20", currency: "USDT", reason: "" })
    setVerificationCode("")
    setEmailCode("")
    setSmsCode("")
    setCurrentPassword("")

    toast.success('钱包地址修改成功，已记录修改历史')
  }

  const sendEmailCode = () => {
    toast.success('邮箱验证码已发送到您的邮箱，验证码为：123456')
  }

  const sendSMSCode = () => {
    toast.success('短信验证码已发送到您的手机，验证码为：888888')
  }

  const checkWalletBalance = async (wallet: EmployeeWallet) => {
    toast.loading('正在查询钱包余额...')

    setTimeout(() => {
      const randomBalance = (Math.random() * 10000 + 1000).toFixed(2)
      const updatedWallets = employeeWallets.map(w =>
        w.id === wallet.id ? { ...w, balance: randomBalance } : w
      )
      setEmployeeWallets(updatedWallets)
      toast.success(`余额更新成功：${randomBalance} ${wallet.currency}`)
    }, 2000)
  }

  const handleCreatePayment = () => {
    if (!formData.title || !formData.amount || !formData.currency) {
      toast.error("请填写必要信息：标题、金额和币种")
      return
    }

    const currentUser = dataService.getCurrentUser()
    const newPayment: PaymentRequest = {
      id: `PAY${dataService.generateId()}`,
      title: formData.title,
      amount: formData.amount,
      currency: formData.currency,
      requestor: currentUser?.name || "当前用户",
      requestorId: currentUser?.id || "unknown",
      department: currentUser?.department || "未知部门",
      status: "pending",
      date: dataService.getCurrentDateTime(),
      description: formData.description,
      urgency: formData.priority as 'low' | 'normal' | 'high',
      recipient: formData.recipient || "待分配"
    }

    dataService.addPaymentRequest(newPayment)
    loadPaymentRequests()

    setFormData({
      title: "",
      amount: "",
      currency: "",
      description: "",
      priority: "normal",
      recipient: ""
    })
    setIsCreateDialogOpen(false)

    toast.success(`支付申请 ${newPayment.id} 已提交成功`)
  }

  const handleApprovePayment = (paymentId: string) => {
    const currentUser = dataService.getCurrentUser()
    dataService.updatePaymentRequest(paymentId, {
      status: "approved",
      approver: currentUser?.name || "当前用户",
      approvalDate: dataService.getCurrentDateTime()
    })
    loadPaymentRequests()
    toast.success("支付申请已批准")
  }

  const handleRejectPayment = (paymentId: string) => {
    const currentUser = dataService.getCurrentUser()
    dataService.updatePaymentRequest(paymentId, {
      status: "rejected",
      approver: currentUser?.name || "当前用户",
      approvalDate: dataService.getCurrentDateTime()
    })
    loadPaymentRequests()
    toast.success("支付申请已拒绝")
  }

  const handleCompletePayment = (paymentId: string) => {
    const txHash = `0x${Math.random().toString(16).substr(2, 8)}...`
    dataService.updatePaymentRequest(paymentId, {
      status: "completed",
      txHash
    })
    loadPaymentRequests()
    toast.success("支付已完成")
  }

  const handleDeletePayment = (paymentId: string) => {
    const requests = dataService.getPaymentRequests().filter(r => r.id !== paymentId)
    dataService.savePaymentRequests(requests)
    loadPaymentRequests()
    toast.success("支付申请已删除")
  }

  const handleViewPayment = (payment: PaymentRequest) => {
    setSelectedPayment(payment)
    setIsViewDialogOpen(true)
  }

  const openWalletEdit = (wallet: EmployeeWallet) => {
    setSelectedWallet(wallet)
    setWalletForm({
      walletAddress: wallet.walletAddress,
      addressType: wallet.addressType,
      currency: wallet.currency,
      reason: ""
    })
    setIsWalletEditOpen(true)
  }

  const filteredRequests = paymentRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || request.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const filteredWallets = employeeWallets.filter(wallet =>
    wallet.employeeName.toLowerCase().includes(walletSearchTerm.toLowerCase()) ||
    wallet.walletAddress.toLowerCase().includes(walletSearchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "approved": return "bg-blue-100 text-blue-800"
      case "completed": return "bg-green-100 text-green-800"
      case "rejected": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "待审批"
      case "approved": return "已批准"
      case "completed": return "已完成"
      case "rejected": return "已拒绝"
      default: return "未知"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />
      case "approved": return <CheckCircle className="w-4 h-4" />
      case "completed": return <CheckCircle className="w-4 h-4" />
      case "rejected": return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const stats = [
    {
      title: "本月申请",
      value: paymentRequests.length.toString(),
      icon: DollarSign,
      color: "text-blue-600"
    },
    {
      title: "待审批",
      value: paymentRequests.filter(p => p.status === "pending").length.toString(),
      icon: Clock,
      color: "text-yellow-600"
    },
    {
      title: "已完成",
      value: paymentRequests.filter(p => p.status === "completed").length.toString(),
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "钱包总数",
      value: employeeWallets.length.toString(),
      icon: Wallet,
      color: "text-purple-600"
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">支付申请与钱包管理</h1>
          <p className="text-zinc-600 mt-1">管理数字货币支付申请和员工钱包地址</p>
        </div>

        <div className="flex space-x-2">
          <Dialog open={isWalletManagementOpen} onOpenChange={setIsWalletManagementOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Wallet className="w-4 h-4 mr-2" />
                钱包管理
              </Button>
            </DialogTrigger>
          </Dialog>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </Button>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>新建申请</span>
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-zinc-900 mt-2">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={isWalletManagementOpen} onOpenChange={setIsWalletManagementOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              员工钱包管理
            </DialogTitle>
            <DialogDescription>
              管理员工USDT TRC20钱包地址，支持谷歌验证器保护
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索员工姓名或钱包地址..."
                  value={walletSearchTerm}
                  onChange={(e) => setWalletSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>员工</TableHead>
                    <TableHead>钱包地址</TableHead>
                    <TableHead>币种</TableHead>
                    <TableHead>余额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>最后修改</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWallets.map((wallet) => (
                    <TableRow key={wallet.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                            {wallet.employeeName[0]}
                          </div>
                          <div>
                            <p className="font-medium">{wallet.employeeName}</p>
                            <p className="text-xs text-muted-foreground">ID: {wallet.employeeId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {wallet.walletAddress.slice(0, 8)}...{wallet.walletAddress.slice(-6)}
                          </code>
                          <Badge variant="outline" className="text-xs">
                            {wallet.addressType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{wallet.currency}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{wallet.balance}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => checkWalletBalance(wallet)}
                            className="h-6 w-6 p-0"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {wallet.isVerified ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              已验证
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              未验证
                            </Badge>
                          )}
                          {wallet.is2FAEnabled && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              2FA
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {wallet.lastModified}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWalletEdit(wallet)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!wallet.is2FAEnabled && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedWallet(wallet)
                                setup2FA()
                              }}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const history = wallet.modificationHistory
                              const historyText = history.map(h =>
                                `${h.timestamp}: ${h.action} - ${h.reason} (验证方式: ${h.verificationMethod.join(', ')})`
                              ).join('\n')
                              alert(`修改历史:\n\n${historyText}`)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWalletManagementOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isWalletEditOpen} onOpenChange={setIsWalletEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              修改钱包地址
            </DialogTitle>
            <DialogDescription>
              修改 {selectedWallet?.employeeName} 的钱包地址需要多重安全验证
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">当前地址:</span>
                    <code className="bg-background px-2 py-1 rounded text-xs">
                      {selectedWallet?.walletAddress}
                    </code>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">地址类型:</span>
                    <Badge variant="outline">{selectedWallet?.addressType}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <Label>新钱包地址 *</Label>
                <Input
                  value={walletForm.walletAddress}
                  onChange={(e) => setWalletForm(prev => ({ ...prev, walletAddress: e.target.value }))}
                  placeholder="输入新的TRC20地址"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  TRC20地址格式：以T开头，34位字符
                </p>
              </div>

              <div>
                <Label>地址类型</Label>
                <Select
                  value={walletForm.addressType}
                  onValueChange={(value: 'TRC20' | 'ERC20' | 'BTC') =>
                    setWalletForm(prev => ({ ...prev, addressType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRC20">TRC20 (推荐)</SelectItem>
                    <SelectItem value="ERC20">ERC20</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>修改原因 *</Label>
                <Textarea
                  value={walletForm.reason}
                  onChange={(e) => setWalletForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="请详细说明修改钱包地址的原因..."
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-red-600" />
                <h4 className="font-medium">安全验证（必须全部通过）</h4>
              </div>

              {selectedWallet?.is2FAEnabled && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    谷歌验证器验证码
                  </Label>
                  <Input
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="输入6位验证码"
                    maxLength={6}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  📧 邮箱验证码
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder="输入邮箱验证码"
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={sendEmailCode}>
                    发送验证码
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  📱 短信验证码
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    placeholder="输入短信验证码"
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={sendSMSCode}>
                    发送验证码
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  🔑 当前密码
                </Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="输入当前登录密码"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWalletEditOpen(false)}>
              取消
            </Button>
            <Button onClick={handleWalletAddressChange}>
              确认修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={is2FASetupOpen} onOpenChange={setIs2FASetupOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              设置谷歌验证器
            </DialogTitle>
            <DialogDescription>
              为 {selectedWallet?.employeeName} 设置谷歌验证器保护
            </DialogDescription>
          </DialogHeader>

          {twoFactorData && (
            <div className="space-y-4">
              <div className="text-center">
                <img src={twoFactorData.qrCodeUrl} alt="2FA QR Code" className="mx-auto w-48 h-48" />
                <p className="text-sm text-muted-foreground mt-2">
                  使用Google Authenticator等应用扫描二维码
                </p>
              </div>

              <div>
                <Label>手动输入密钥</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={twoFactorData.secret}
                    readOnly
                    className="font-mono text-xs"
                  />
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
                <Label>备份码（请保存）</Label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded text-xs font-mono">
                  {twoFactorData.backupCodes.map((code: string, index: number) => (
                    <div key={index}>{code}</div>
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

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>创建支付申请</DialogTitle>
            <DialogDescription>
              填写支付申请信息，系统将自动提交审批流程
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">申请标题 *</Label>
              <Input
                id="title"
                placeholder="请输入申请标题"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">申请金额 *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">币种 *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择币种" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDT">USDT (TRC20)</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="TRX">TRX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">收款地址 (TRC20)</Label>
              <Input
                id="recipient"
                placeholder="输入TRC20地址（可选）"
                value={formData.recipient}
                onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">紧急程度</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低</SelectItem>
                  <SelectItem value="normal">普通</SelectItem>
                  <SelectItem value="high">紧急</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">申请说明</Label>
              <Textarea
                id="description"
                placeholder="请详细说明支付用途和原因..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreatePayment}>
              提交申请
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <Input
                  className="pl-10"
                  placeholder="搜索申请标题或申请人..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待审批</SelectItem>
                <SelectItem value="approved">已批准</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>支付申请列表</CardTitle>
          <CardDescription>查看和管理所有支付申请记录</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-zinc-500">
                {paymentRequests.length === 0 ? "还没有支付申请，点击上方按钮创建第一个申请" : "没有找到匹配的申请记录"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>申请编号</TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>申请人</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>紧急程度</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>申请时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.title}</p>
                        <p className="text-sm text-zinc-500">{request.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>{request.requestor}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{request.amount}</span>
                        <Badge variant="outline" className="text-xs">
                          {request.currency}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {request.urgency === "high" ? "紧急" :
                         request.urgency === "normal" ? "普通" : "低"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(request.status)}
                          <span>{getStatusText(request.status)}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-600">
                      {request.date}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPayment(request)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {request.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprovePayment(request.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRejectPayment(request.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {request.status === "approved" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCompletePayment(request.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePayment(request.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>支付申请详情</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-zinc-600">申请编号</Label>
                  <p className="font-medium">{selectedPayment.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-zinc-600">状态</Label>
                  <Badge className={getStatusColor(selectedPayment.status)}>
                    {getStatusText(selectedPayment.status)}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-zinc-600">申请标题</Label>
                <p className="font-medium">{selectedPayment.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-zinc-600">金额</Label>
                  <p className="font-medium">{selectedPayment.amount} {selectedPayment.currency}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-zinc-600">申请人</Label>
                  <p className="font-medium">{selectedPayment.requestor}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-zinc-600">收款地址</Label>
                <p className="font-mono text-sm bg-zinc-100 p-2 rounded">
                  {selectedPayment.recipient}
                </p>
              </div>

              {selectedPayment.txHash && (
                <div>
                  <Label className="text-sm font-medium text-zinc-600">交易哈希</Label>
                  <p className="font-mono text-sm bg-zinc-100 p-2 rounded">
                    {selectedPayment.txHash}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-zinc-600">申请说明</Label>
                <p className="text-sm bg-zinc-50 p-3 rounded">{selectedPayment.description}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
