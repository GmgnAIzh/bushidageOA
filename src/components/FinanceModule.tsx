"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { dataService, FinancialTransaction, Employee } from "@/lib/data-service"
import { toast } from "sonner"
import {
  TrendingUp, TrendingDown, Wallet, CreditCard, ArrowUpRight, ArrowDownLeft,
  Plus, Copy, Users, DollarSign, PieChart, BarChart3, RefreshCw, Download,
  Upload, FileText, Target, Calendar, AlertCircle, Shield, Smartphone,
  Mail, Lock, Key, History, CheckCircle, XCircle, Edit, QrCode, ExternalLink
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
// 动态导入QRCode以避免客户端错误
let QRCode: any = null

if (typeof window !== 'undefined') {
  import('qrcode').then(module => { QRCode = module.default }).catch(() => {})
}

interface EmployeeWallet {
  employeeId: string
  employeeName: string
  walletAddress: string
  walletType: string
  balance: string
  usdValue: string
  isVerified: boolean
  bindDate: string
  twoFactorEnabled: boolean
  lastModified?: string
  modificationHistory?: WalletModification[]
}

interface WalletModification {
  id: string
  timestamp: string
  oldAddress: string
  newAddress: string
  modifiedBy: string
  verificationMethod: string[]
  ipAddress: string
}

interface ExpenseCategory {
  id: string
  name: string
  budget: number
  spent: number
  color: string
}

interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export function FinanceModule() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeWallets, setEmployeeWallets] = useState<EmployeeWallet[]>([])
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
  const [isBindWalletOpen, setIsBindWalletOpen] = useState(false)
  const [isModifyWalletOpen, setIsModifyWalletOpen] = useState(false)
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false)
  const [isExpenseCategoryOpen, setIsExpenseCategoryOpen] = useState(false)
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<EmployeeWallet | null>(null)
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null)
  const [modificationHistory, setModificationHistory] = useState<WalletModification[]>([])

  const [walletForm, setWalletForm] = useState({
    employeeId: '',
    walletAddress: '',
    walletType: 'USDT-TRC20',
    googleAuthCode: '',
    smsCode: '',
    emailCode: '',
    password: ''
  })

  const [modifyForm, setModifyForm] = useState({
    newAddress: '',
    googleAuthCode: '',
    smsCode: '',
    emailCode: '',
    password: '',
    reason: ''
  })

  const [transactionForm, setTransactionForm] = useState({
    type: 'send' as 'send' | 'receive',
    fromAddress: '',
    toAddress: '',
    currency: 'USDT',
    amount: '',
    category: 'salary',
    description: '',
    tags: ''
  })

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    budget: '',
    color: '#3b82f6'
  })

  // 初始化数据
  useEffect(() => {
    loadData()
    initializeExpenseCategories()
    loadModificationHistory()
  }, [])

  const loadData = () => {
    setEmployees(dataService.getEmployees())
    setTransactions(dataService.getTransactions())
    loadEmployeeWallets()
  }

  const loadEmployeeWallets = () => {
    const employees = dataService.getEmployees()
    const wallets = employees.map(emp => ({
      employeeId: emp.id,
      employeeName: emp.name,
      walletAddress: generateTRC20Address(),
      walletType: 'USDT-TRC20',
      balance: (Math.random() * 10000 + 100).toFixed(2),
      usdValue: (Math.random() * 10000 + 100).toFixed(2),
      isVerified: Math.random() > 0.3,
      bindDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      twoFactorEnabled: Math.random() > 0.5,
      lastModified: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toLocaleString(),
      modificationHistory: []
    }))
    setEmployeeWallets(wallets)
  }

  const loadModificationHistory = () => {
    // 模拟修改历史记录
    const history: WalletModification[] = [
      {
        id: 'mod-1',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        oldAddress: 'TRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx1',
        newAddress: 'TRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx2',
        modifiedBy: '张三',
        verificationMethod: ['谷歌验证器', '短信验证', '密码验证'],
        ipAddress: '192.168.1.100'
      },
      {
        id: 'mod-2',
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        oldAddress: 'TRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx3',
        newAddress: 'TRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx4',
        modifiedBy: '李四',
        verificationMethod: ['谷歌验证器', '邮箱验证', '密码验证'],
        ipAddress: '192.168.1.101'
      }
    ]
    setModificationHistory(history)
  }

  const initializeExpenseCategories = () => {
    const categories: ExpenseCategory[] = [
      { id: '1', name: '工资薪酬', budget: 50000, spent: 35000, color: '#3b82f6' },
      { id: '2', name: '办公费用', budget: 10000, spent: 7500, color: '#ef4444' },
      { id: '3', name: '营销推广', budget: 20000, spent: 12000, color: '#22c55e' },
      { id: '4', name: '技术支持', budget: 15000, spent: 8000, color: '#f59e0b' },
      { id: '5', name: '差旅费用', budget: 8000, spent: 3000, color: '#8b5cf6' }
    ]
    setExpenseCategories(categories)
  }

  const generateTRC20Address = () => {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    let address = 'T'
    for (let i = 0; i < 33; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return address
  }

  const validateTRC20Address = (address: string) => {
    // TRC20地址验证：以T开头，长度为34个字符
    return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)
  }

  const setup2FA = async () => {
    // 生成2FA密钥和二维码
    const secret = generateSecret()
    const otpauth = `otpauth://totp/OA System:${walletForm.employeeId}?secret=${secret}&issuer=OA System`

    let qrCode: string

    // 检查QRCode是否可用
    if (!QRCode) {
      // 如果QRCode不可用，使用SVG占位符
      qrCode = 'data:image/svg+xml;base64,' + btoa(`
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
        qrCode = await QRCode.toDataURL(otpauth)
      } catch (error) {
        toast.error('生成二维码失败')
        return
      }
    }

    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    )

    setTwoFactorSetup({
      secret,
      qrCode,
      backupCodes
    })
    setIs2FASetupOpen(true)
  }

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let secret = ''
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return secret
  }

  const handleBindWallet = async () => {
    if (!validateTRC20Address(walletForm.walletAddress)) {
      toast.error('请输入有效的TRC20地址（以T开头，34个字符）')
      return
    }

    if (!walletForm.googleAuthCode || walletForm.googleAuthCode.length !== 6) {
      toast.error('请输入6位谷歌验证码')
      return
    }

    setIsRefreshing(true)
    // 模拟验证过程
    await new Promise(resolve => setTimeout(resolve, 1500))

    const employee = employees.find(emp => emp.id === walletForm.employeeId)
    if (employee) {
      const newWallet: EmployeeWallet = {
        employeeId: walletForm.employeeId,
        employeeName: employee.name,
        walletAddress: walletForm.walletAddress,
        walletType: walletForm.walletType,
        balance: '0.00',
        usdValue: '0.00',
        isVerified: false,
        bindDate: new Date().toLocaleDateString(),
        twoFactorEnabled: true,
        lastModified: new Date().toLocaleString()
      }
      setEmployeeWallets([...employeeWallets, newWallet])
      toast.success(`成功绑定${employee.name}的USDT-TRC20钱包`)
    }

    setIsRefreshing(false)
    setIsBindWalletOpen(false)
    setWalletForm({
      employeeId: '',
      walletAddress: '',
      walletType: 'USDT-TRC20',
      googleAuthCode: '',
      smsCode: '',
      emailCode: '',
      password: ''
    })
  }

  const handleModifyWallet = async () => {
    if (!selectedWallet) return

    if (!validateTRC20Address(modifyForm.newAddress)) {
      toast.error('请输入有效的TRC20地址')
      return
    }

    if (!modifyForm.googleAuthCode || !modifyForm.password) {
      toast.error('请完成所有安全验证')
      return
    }

    if (!modifyForm.smsCode && !modifyForm.emailCode) {
      toast.error('请至少完成短信或邮箱验证')
      return
    }

    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 记录修改历史
    const modification: WalletModification = {
      id: `mod-${Date.now()}`,
      timestamp: new Date().toISOString(),
      oldAddress: selectedWallet.walletAddress,
      newAddress: modifyForm.newAddress,
      modifiedBy: selectedWallet.employeeName,
      verificationMethod: [
        '谷歌验证器',
        modifyForm.smsCode ? '短信验证' : '',
        modifyForm.emailCode ? '邮箱验证' : '',
        '密码验证'
      ].filter(Boolean),
      ipAddress: '192.168.1.100' // 实际应获取真实IP
    }

    setModificationHistory([modification, ...modificationHistory])

    // 更新钱包地址
    setEmployeeWallets(prev => prev.map(wallet =>
      wallet.employeeId === selectedWallet.employeeId
        ? {
            ...wallet,
            walletAddress: modifyForm.newAddress,
            lastModified: new Date().toLocaleString(),
            modificationHistory: [...(wallet.modificationHistory || []), modification]
          }
        : wallet
    ))

    setIsRefreshing(false)
    setIsModifyWalletOpen(false)
    toast.success('钱包地址已更新，修改记录已保存')
    setModifyForm({
      newAddress: '',
      googleAuthCode: '',
      smsCode: '',
      emailCode: '',
      password: '',
      reason: ''
    })
  }

  const handleManageWallet = (wallet: EmployeeWallet) => {
    setSelectedWallet(wallet)
    setIsModifyWalletOpen(true)
  }

  const handleNewTransaction = async () => {
    if (!transactionForm.amount || !transactionForm.currency) {
      toast.error('请填写完整的交易信息')
      return
    }

    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 简化美元价值计算
    const amount = parseFloat(transactionForm.amount)
    let usdValue = amount

    // 简单的汇率计算
    if (transactionForm.currency === 'BTC') {
      usdValue = amount * 43250 // 固定BTC价格
    } else if (transactionForm.currency === 'ETH') {
      usdValue = amount * 2580 // 固定ETH价格
    } else if (transactionForm.currency === 'USDT') {
      usdValue = amount * 1.0 // USDT = 1美元
    } else if (transactionForm.currency === 'BNB') {
      usdValue = amount * 245 // 固定BNB价格
    }

    const newTransaction: FinancialTransaction = {
      id: dataService.generateId(),
      type: transactionForm.type,
      fromAddress: transactionForm.fromAddress || generateTRC20Address(),
      toAddress: transactionForm.toAddress || generateTRC20Address(),
      currency: transactionForm.currency,
      amount: amount,
      usdValue: usdValue,
      status: Math.random() > 0.1 ? 'completed' : 'pending',
      time: new Date().toISOString(),
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
      fee: parseFloat((Math.random() * 0.001).toFixed(6)),
      category: transactionForm.category,
      description: transactionForm.description,
      tags: transactionForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    }

    dataService.addTransaction(newTransaction)
    setTransactions([newTransaction, ...transactions])
    toast.success('交易记录已添加')

    setIsRefreshing(false)
    setIsNewTransactionOpen(false)
    setTransactionForm({
      type: 'send',
      fromAddress: '',
      toAddress: '',
      currency: 'USDT',
      amount: '',
      category: 'salary',
      description: '',
      tags: ''
    })
  }

  const handleAddCategory = () => {
    if (!categoryForm.name || !categoryForm.budget) {
      toast.error('请填写完整的类别信息')
      return
    }

    const newCategory: ExpenseCategory = {
      id: dataService.generateId(),
      name: categoryForm.name,
      budget: parseFloat(categoryForm.budget),
      spent: 0,
      color: categoryForm.color
    }

    setExpenseCategories([...expenseCategories, newCategory])
    toast.success('费用类别已添加')
    setIsExpenseCategoryOpen(false)
    setCategoryForm({ name: '', budget: '', color: '#3b82f6' })
  }

  const refreshBalances = async () => {
    setIsRefreshing(true)

    // 模拟从区块链查询余额
    await new Promise(resolve => setTimeout(resolve, 2000))

    const updatedWallets = employeeWallets.map(wallet => ({
      ...wallet,
      balance: (Math.random() * 10000 + 100).toFixed(2),
      usdValue: (Math.random() * 10000 + 100).toFixed(2)
    }))
    setEmployeeWallets(updatedWallets)

    setIsRefreshing(false)
    toast.success('余额已刷新')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板')
  }

  const handleViewTransactionDetails = (transaction: FinancialTransaction) => {
    const details = `
交易详情:
类型: ${transaction.type === 'send' ? '发送' : '接收'}
货币: ${transaction.currency}
金额: ${transaction.amount}
美元价值: $${transaction.usdValue?.toFixed(2) || '0.00'}
发送地址: ${transaction.fromAddress}
接收地址: ${transaction.toAddress}
时间: ${new Date(transaction.time).toLocaleString()}
状态: ${transaction.status === 'completed' ? '已完成' : '待确认'}
交易哈希: ${transaction.txHash}
手续费: ${transaction.fee}
${transaction.category ? `类别: ${transaction.category}` : ''}
${transaction.description ? `描述: ${transaction.description}` : ''}
${transaction.tags?.length ? `标签: ${transaction.tags.join(', ')}` : ''}
    `.trim()

    alert(details)
  }

  const exportTransactions = () => {
    const csv = [
      ['时间', '类型', '货币', '金额', '美元价值', '状态', '类别', '描述'].join(','),
      ...transactions.map(tx => [
        new Date(tx.time).toLocaleString(),
        tx.type === 'send' ? '发送' : '接收',
        tx.currency,
        tx.amount,
        tx.usdValue?.toFixed(2) || '0',
        tx.status === 'completed' ? '已完成' : '待确认',
        tx.category || '',
        tx.description || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('交易记录已导出')
  }

  const generateFinancialReport = () => {
    const report = {
      totalIncome: transactions.filter(t => t.type === 'receive').reduce((sum, t) => sum + (t.usdValue || 0), 0),
      totalExpense: transactions.filter(t => t.type === 'send').reduce((sum, t) => sum + (t.usdValue || 0), 0),
      netProfit: 0,
      date: new Date().toLocaleDateString()
    }
    report.netProfit = report.totalIncome - report.totalExpense

    const reportContent = `
财务报表
生成日期: ${report.date}
----------------------------------------
总收入: $${report.totalIncome.toLocaleString()}
总支出: $${report.totalExpense.toLocaleString()}
净利润: $${report.netProfit.toLocaleString()}
----------------------------------------
部门预算使用情况:
${expenseCategories.map(cat =>
  `${cat.name}: $${cat.spent.toLocaleString()} / $${cat.budget.toLocaleString()} (${((cat.spent/cat.budget)*100).toFixed(1)}%)`
).join('\n')}
    `.trim()

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `financial_report_${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    toast.success('财务报表已生成并下载')
  }

  const totalUsdValue = employeeWallets.reduce((sum, wallet) => sum + parseFloat(wallet.usdValue), 0)
  const totalExpenseBudget = expenseCategories.reduce((sum, cat) => sum + cat.budget, 0)
  const totalExpenseSpent = expenseCategories.reduce((sum, cat) => sum + cat.spent, 0)

  // 生成图表数据
  const chartData = transactions.slice(0, 30).map((tx, index) => ({
    date: new Date(tx.time).toLocaleDateString(),
    value: tx.usdValue || 0,
    type: tx.type
  })).reverse()

  const expenseChartData = expenseCategories.map(cat => ({
    name: cat.name,
    budget: cat.budget,
    spent: cat.spent,
    remaining: cat.budget - cat.spent
  }))

  return (
    <div className="space-y-6">
      {/* 财务概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">钱包总价值</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalUsdValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12.3% 较昨日
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本月支出</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenseSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              预算: ${totalExpenseBudget.toLocaleString()}
            </p>
            <Progress value={(totalExpenseSpent / totalExpenseBudget) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃钱包</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeWallets.filter(w => w.isVerified).length}</div>
            <p className="text-xs text-muted-foreground">
              总计 {employeeWallets.length} 个钱包
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">安全状态</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeWallets.filter(w => w.twoFactorEnabled).length}</div>
            <p className="text-xs text-muted-foreground">
              已启用2FA的钱包
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 主要功能区域 */}
      <Tabs defaultValue="wallets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="wallets">钱包管理</TabsTrigger>
          <TabsTrigger value="transactions">交易记录</TabsTrigger>
          <TabsTrigger value="expenses">费用管理</TabsTrigger>
          <TabsTrigger value="history">修改历史</TabsTrigger>
          <TabsTrigger value="reports">财务报表</TabsTrigger>
        </TabsList>

        {/* 钱包管理 */}
        <TabsContent value="wallets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">员工钱包管理</h3>
            <div className="flex space-x-2">
              <Button onClick={refreshBalances} disabled={isRefreshing} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                刷新余额
              </Button>
              <Dialog open={isBindWalletOpen} onOpenChange={setIsBindWalletOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    绑定钱包
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>绑定USDT-TRC20钱包</DialogTitle>
                    <DialogDescription>请先设置谷歌验证器，然后绑定您的TRC20钱包地址</DialogDescription>
                  </DialogHeader>

                  {!twoFactorSetup ? (
                    <div className="space-y-4">
                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertTitle>安全提示</AlertTitle>
                        <AlertDescription>
                          绑定钱包前需要先设置谷歌验证器，以确保您的资金安全
                        </AlertDescription>
                      </Alert>

                      <div>
                        <Label htmlFor="employee">选择员工</Label>
                        <Select value={walletForm.employeeId} onValueChange={(value) =>
                          setWalletForm({...walletForm, employeeId: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择员工" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map(emp => (
                              <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="walletAddress">USDT-TRC20钱包地址</Label>
                        <Input
                          value={walletForm.walletAddress}
                          onChange={(e) => setWalletForm({...walletForm, walletAddress: e.target.value})}
                          placeholder="T开头的34位TRC20地址"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          请输入您的USDT-TRC20钱包地址，格式：TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                        </p>
                      </div>

                      <Button onClick={setup2FA} className="w-full" disabled={!walletForm.employeeId || !walletForm.walletAddress}>
                        <QrCode className="h-4 w-4 mr-2" />
                        设置谷歌验证器
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>扫描二维码设置谷歌验证器</AlertTitle>
                        <AlertDescription>
                          使用Google Authenticator应用扫描下方二维码
                        </AlertDescription>
                      </Alert>

                      <div className="flex justify-center">
                        <img src={twoFactorSetup.qrCode} alt="2FA QR Code" className="w-48 h-48" />
                      </div>

                      <div>
                        <Label>密钥（手动输入）</Label>
                        <div className="flex items-center gap-2">
                          <Input value={twoFactorSetup.secret} readOnly className="font-mono text-xs" />
                          <Button size="sm" variant="outline" onClick={() => copyToClipboard(twoFactorSetup.secret)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>备份码（请妥善保存）</Label>
                        <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded">
                          {twoFactorSetup.backupCodes.map((code, index) => (
                            <div key={index} className="font-mono text-xs">{code}</div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="googleAuthCode">输入验证码确认</Label>
                        <Input
                          value={walletForm.googleAuthCode}
                          onChange={(e) => setWalletForm({...walletForm, googleAuthCode: e.target.value})}
                          placeholder="输入6位验证码"
                          maxLength={6}
                        />
                      </div>
                    </div>
                  )}

                  <DialogFooter>
                    {twoFactorSetup && (
                      <Button onClick={handleBindWallet} disabled={isRefreshing}>
                        {isRefreshing && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                        完成绑定
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>员工</TableHead>
                    <TableHead>钱包类型</TableHead>
                    <TableHead>钱包地址</TableHead>
                    <TableHead>余额</TableHead>
                    <TableHead>美元价值</TableHead>
                    <TableHead>安全状态</TableHead>
                    <TableHead>最后修改</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeWallets.map((wallet) => (
                    <TableRow key={wallet.employeeId}>
                      <TableCell className="font-medium">{wallet.employeeName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{wallet.walletType}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {wallet.walletAddress.slice(0, 6)}...{wallet.walletAddress.slice(-4)}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-2 h-6 w-6 p-0"
                          onClick={() => copyToClipboard(wallet.walletAddress)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-1 h-6 w-6 p-0"
                          onClick={() => window.open(`https://tronscan.org/#/address/${wallet.walletAddress}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </TableCell>
                      <TableCell>{wallet.balance} USDT</TableCell>
                      <TableCell>${wallet.usdValue}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {wallet.twoFactorEnabled ? (
                            <Badge variant="default" className="gap-1">
                              <Shield className="h-3 w-3" />
                              2FA启用
                            </Badge>
                          ) : (
                            <Badge variant="secondary">2FA未启用</Badge>
                          )}
                          {wallet.isVerified && (
                            <Badge variant="outline" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              已验证
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{wallet.lastModified || '-'}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleManageWallet(wallet)}>
                          <Edit className="h-4 w-4 mr-1" />
                          管理
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 修改钱包地址对话框 */}
          <Dialog open={isModifyWalletOpen} onOpenChange={setIsModifyWalletOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>修改钱包地址</DialogTitle>
                <DialogDescription>
                  修改钱包地址需要完成多重安全验证
                </DialogDescription>
              </DialogHeader>

              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>安全提醒</AlertTitle>
                <AlertDescription>
                  修改钱包地址需要：谷歌验证码 + (短信或邮箱验证码) + 密码
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label>当前地址</Label>
                  <Input value={selectedWallet?.walletAddress || ''} readOnly className="font-mono text-xs bg-muted" />
                </div>

                <div>
                  <Label>新的TRC20地址</Label>
                  <Input
                    value={modifyForm.newAddress}
                    onChange={(e) => setModifyForm({...modifyForm, newAddress: e.target.value})}
                    placeholder="T开头的34位TRC20地址"
                    className="font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>谷歌验证码 *</Label>
                    <Input
                      value={modifyForm.googleAuthCode}
                      onChange={(e) => setModifyForm({...modifyForm, googleAuthCode: e.target.value})}
                      placeholder="6位数字"
                      maxLength={6}
                    />
                  </div>

                  <div>
                    <Label>密码 *</Label>
                    <Input
                      type="password"
                      value={modifyForm.password}
                      onChange={(e) => setModifyForm({...modifyForm, password: e.target.value})}
                      placeholder="账户密码"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>短信验证码</Label>
                    <div className="flex gap-2">
                      <Input
                        value={modifyForm.smsCode}
                        onChange={(e) => setModifyForm({...modifyForm, smsCode: e.target.value})}
                        placeholder="6位数字"
                        maxLength={6}
                      />
                      <Button variant="outline" size="sm">
                        <Smartphone className="h-4 w-4 mr-1" />
                        发送
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>邮箱验证码</Label>
                    <div className="flex gap-2">
                      <Input
                        value={modifyForm.emailCode}
                        onChange={(e) => setModifyForm({...modifyForm, emailCode: e.target.value})}
                        placeholder="6位数字"
                        maxLength={6}
                      />
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-1" />
                        发送
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>修改原因</Label>
                  <Textarea
                    value={modifyForm.reason}
                    onChange={(e) => setModifyForm({...modifyForm, reason: e.target.value})}
                    placeholder="请说明修改原因..."
                    rows={2}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModifyWalletOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleModifyWallet} disabled={isRefreshing}>
                  {isRefreshing && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  确认修改
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* 交易记录 */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">交易记录管理</h3>
            <div className="flex space-x-2">
              <Button onClick={exportTransactions} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                导出记录
              </Button>
              <Dialog open={isNewTransactionOpen} onOpenChange={setIsNewTransactionOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    新增交易
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>添加交易记录</DialogTitle>
                    <DialogDescription>手动添加交易记录到系统中</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>交易类型</Label>
                      <Select value={transactionForm.type} onValueChange={(value: 'send' | 'receive') =>
                        setTransactionForm({...transactionForm, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="send">发送</SelectItem>
                          <SelectItem value="receive">接收</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>货币类型</Label>
                      <Select value={transactionForm.currency} onValueChange={(value) =>
                        setTransactionForm({...transactionForm, currency: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择货币" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                          <SelectItem value="USDT">Tether (USDT)</SelectItem>
                          <SelectItem value="BNB">Binance Coin (BNB)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>发送地址</Label>
                      <Input
                        value={transactionForm.fromAddress}
                        onChange={(e) => setTransactionForm({...transactionForm, fromAddress: e.target.value})}
                        placeholder="发送方钱包地址"
                      />
                    </div>
                    <div>
                      <Label>接收地址</Label>
                      <Input
                        value={transactionForm.toAddress}
                        onChange={(e) => setTransactionForm({...transactionForm, toAddress: e.target.value})}
                        placeholder="接收方钱包地址"
                      />
                    </div>
                    <div>
                      <Label>交易金额</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={transactionForm.amount}
                        onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                        placeholder="0.000000"
                      />
                    </div>
                    <div>
                      <Label>费用类别</Label>
                      <Select value={transactionForm.category} onValueChange={(value) =>
                        setTransactionForm({...transactionForm, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="salary">工资薪酬</SelectItem>
                          <SelectItem value="office">办公费用</SelectItem>
                          <SelectItem value="marketing">营销推广</SelectItem>
                          <SelectItem value="tech">技术支持</SelectItem>
                          <SelectItem value="travel">差旅费用</SelectItem>
                          <SelectItem value="other">其他费用</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>交易描述</Label>
                      <Textarea
                        value={transactionForm.description}
                        onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                        placeholder="交易详细描述..."
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>标签 (逗号分隔)</Label>
                      <Input
                        value={transactionForm.tags}
                        onChange={(e) => setTransactionForm({...transactionForm, tags: e.target.value})}
                        placeholder="标签1, 标签2, 标签3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleNewTransaction} disabled={isRefreshing}>
                      {isRefreshing && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                      添加交易
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>货币</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>美元价值</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>类别</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 20).map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{new Date(tx.time).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {tx.type === 'send' ? (
                            <ArrowUpRight className="h-4 w-4 text-red-500 mr-2" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4 text-green-500 mr-2" />
                          )}
                          {tx.type === 'send' ? '发送' : '接收'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.currency}</Badge>
                      </TableCell>
                      <TableCell>{tx.amount}</TableCell>
                      <TableCell>${tx.usdValue?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <Badge variant={tx.status === 'completed' ? "default" : "secondary"}>
                          {tx.status === 'completed' ? '已完成' : '待确认'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tx.category && <Badge variant="outline">{tx.category}</Badge>}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => handleViewTransactionDetails(tx)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 费用管理 */}
        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">费用预算管理</h3>
            <Dialog open={isExpenseCategoryOpen} onOpenChange={setIsExpenseCategoryOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  新增类别
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加费用类别</DialogTitle>
                  <DialogDescription>创建新的费用预算类别</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>类别名称</Label>
                    <Input
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      placeholder="例如：办公用品"
                    />
                  </div>
                  <div>
                    <Label>预算金额</Label>
                    <Input
                      type="number"
                      value={categoryForm.budget}
                      onChange={(e) => setCategoryForm({...categoryForm, budget: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>颜色标识</Label>
                    <Input
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm({...categoryForm, color: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddCategory}>添加类别</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{category.name}</CardTitle>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>已使用</span>
                      <span>${category.spent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>预算</span>
                      <span>${category.budget.toLocaleString()}</span>
                    </div>
                    <Progress
                      value={(category.spent / category.budget) * 100}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{((category.spent / category.budget) * 100).toFixed(1)}% 已使用</span>
                      <span>${(category.budget - category.spent).toLocaleString()} 剩余</span>
                    </div>
                  </div>
                  {category.spent > category.budget && (
                    <div className="flex items-center mt-2 text-red-500 text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      超出预算
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>费用分析图表</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={expenseChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="budget" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="spent" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 修改历史 */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">钱包修改历史记录</h3>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出记录
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>操作人</TableHead>
                    <TableHead>原地址</TableHead>
                    <TableHead>新地址</TableHead>
                    <TableHead>验证方式</TableHead>
                    <TableHead>IP地址</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modificationHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-xs">
                        {new Date(record.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{record.modifiedBy}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {record.oldAddress.slice(0, 8)}...{record.oldAddress.slice(-4)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {record.newAddress.slice(0, 8)}...{record.newAddress.slice(-4)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {record.verificationMethod.map((method, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{record.ipAddress}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          成功
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 财务报表 */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">财务报表生成</h3>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                选择时间段
              </Button>
              <Button onClick={generateFinancialReport}>
                <FileText className="h-4 w-4 mr-2" />
                生成报表
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">收入统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${transactions
                    .filter(tx => tx.type === 'receive')
                    .reduce((sum, tx) => sum + (tx.usdValue || 0), 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">本月总收入</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">支出统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ${transactions
                    .filter(tx => tx.type === 'send')
                    .reduce((sum, tx) => sum + (tx.usdValue || 0), 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">本月总支出</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">净收益</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(transactions
                    .filter(tx => tx.type === 'receive')
                    .reduce((sum, tx) => sum + (tx.usdValue || 0), 0) -
                    transactions
                    .filter(tx => tx.type === 'send')
                    .reduce((sum, tx) => sum + (tx.usdValue || 0), 0)
                  ).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">收入 - 支出</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>交易趋势分析</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, '交易金额']} />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
