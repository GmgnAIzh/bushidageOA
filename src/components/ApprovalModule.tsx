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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { dataService, ApprovalRequest } from "@/lib/data-service"
import { toast } from "sonner"
import { Plus, Clock, CheckCircle, XCircle, AlertCircle, FileText, DollarSign, Calendar, User, Building } from "lucide-react"

// 本地类型定义
interface ApprovalStep {
  id?: string
  step?: number
  title?: string
  assignee?: string
  approver?: string
  role?: string
  status: 'pending' | 'approved' | 'rejected' | 'waiting'
  comments?: string
  comment?: string
  completedAt?: string
  time?: string
}

export function ApprovalModule() {
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([])
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [requestForm, setRequestForm] = useState({
    title: '',
    type: 'leave' as 'leave' | 'expense' | 'purchase' | 'hiring',
    description: '',
    amount: '',
    priority: 'normal' as 'low' | 'normal' | 'high'
  })
  const currentUser = dataService.getCurrentUser()

  useEffect(() => {
    dataService.initializeData()
    setApprovalRequests(dataService.getApprovalRequests())
  }, [])

  const handleSubmitRequest = () => {
    if (!requestForm.title || !requestForm.description || !currentUser) {
      toast.error("请填写完整的申请信息")
      return
    }

    const approvalFlow: ApprovalStep[] = getApprovalFlow(requestForm.type)

    const newRequest: ApprovalRequest = {
      id: `APP${Date.now()}`,
      title: requestForm.title,
      type: requestForm.type,
      applicant: currentUser.name,
      applicantId: currentUser.id,
      applicantAvatar: currentUser.avatar,
      department: currentUser.department,
      submitTime: dataService.getCurrentDateTime(),
      currentStep: 1,
      totalSteps: approvalFlow.length,
      status: 'pending',
      priority: requestForm.priority,
      amount: requestForm.amount,
      description: requestForm.description,
      attachments: [],
      approvalFlow
    }

    // 添加到审批请求列表并保存
    const updatedRequests = [newRequest, ...approvalRequests]
    setApprovalRequests(updatedRequests)
    dataService.saveApprovalRequests(updatedRequests)
    setIsNewRequestOpen(false)
    setRequestForm({
      title: '',
      type: 'leave',
      description: '',
      amount: '',
      priority: 'normal'
    })
    toast.success("审批申请已提交")
  }

  const getApprovalFlow = (type: string): ApprovalStep[] => {
    const flows: { [key: string]: ApprovalStep[] } = {
      leave: [
        { step: 1, approver: '李四', role: '直属主管', status: 'pending' as const },
        { step: 2, approver: '王五', role: 'HR经理', status: 'waiting' as const }
      ],
      expense: [
        { step: 1, approver: '李四', role: '直属主管', status: 'pending' as const },
        { step: 2, approver: '赵六', role: '财务经理', status: 'waiting' as const },
        { step: 3, approver: '张三', role: '总经理', status: 'waiting' as const }
      ],
      purchase: [
        { step: 1, approver: '李四', role: '部门主管', status: 'pending' as const },
        { step: 2, approver: '赵六', role: '采购主管', status: 'waiting' as const },
        { step: 3, approver: '张三', role: '总经理', status: 'waiting' as const }
      ],
      hiring: [
        { step: 1, approver: '李四', role: '部门主管', status: 'pending' as const },
        { step: 2, approver: '王五', role: 'HR经理', status: 'waiting' as const },
        { step: 3, approver: '张三', role: '总经理', status: 'waiting' as const }
      ]
    }
    return flows[type] || flows.leave
  }

  const handleApproval = (requestId: string, approve: boolean, comment?: string) => {
    const request = approvalRequests.find(r => r.id === requestId)
    if (!request) return

    const updatedFlow = [...request.approvalFlow]
    const currentStepIndex = request.currentStep - 1

    if (currentStepIndex < updatedFlow.length) {
      updatedFlow[currentStepIndex] = {
        ...updatedFlow[currentStepIndex],
        status: approve ? 'approved' : 'rejected',
        time: dataService.getCurrentDateTime(),
        comment
      }

      let newStatus: 'pending' | 'approved' | 'rejected' = 'pending'
      let newCurrentStep = request.currentStep

      if (!approve) {
        newStatus = 'rejected'
      } else if (request.currentStep === request.totalSteps) {
        newStatus = 'approved'
      } else {
        newCurrentStep = request.currentStep + 1
        // 设置下一步为待处理
        if (newCurrentStep <= updatedFlow.length) {
          updatedFlow[newCurrentStep - 1] = {
            ...updatedFlow[newCurrentStep - 1],
            status: 'pending'
          }
        }
      }

      const updates = {
        approvalFlow: updatedFlow,
        currentStep: newCurrentStep,
        status: newStatus
      }

      // 更新审批请求并保存
      const updatedRequests = approvalRequests.map(req =>
        req.id === requestId
          ? { ...req, ...updates }
          : req
      )
      setApprovalRequests(updatedRequests)
      dataService.saveApprovalRequests(updatedRequests)

      toast.success(approve ? "审批通过" : "审批拒绝")
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'leave': return <Calendar className="w-4 h-4" />
      case 'expense': return <DollarSign className="w-4 h-4" />
      case 'purchase': return <Building className="w-4 h-4" />
      case 'hiring': return <User className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getTypeName = (type: string) => {
    const names: { [key: string]: string } = {
      leave: '请假申请',
      expense: '费用报销',
      purchase: '采购申请',
      hiring: '招聘申请'
    }
    return names[type] || type
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />待审批</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />已通过</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />已拒绝</Badge>
      default:
        return <Badge className="bg-zinc-100 text-zinc-800">未知</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">高优先级</Badge>
      case 'normal':
        return <Badge className="bg-blue-100 text-blue-800">普通</Badge>
      case 'low':
        return <Badge className="bg-zinc-100 text-zinc-800">低优先级</Badge>
      default:
        return <Badge className="bg-zinc-100 text-zinc-800">普通</Badge>
    }
  }

  const getProgressPercentage = (request: ApprovalRequest) => {
    if (request.status === 'approved') return 100
    if (request.status === 'rejected') return 0
    return ((request.currentStep - 1) / request.totalSteps) * 100
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">审批流程</h1>
          <p className="text-zinc-600 mt-1">管理和跟踪各类审批申请</p>
        </div>
        <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
          <DialogTrigger asChild>
            <Button className="bg-zinc-900 hover:bg-zinc-800">
              <Plus className="w-4 h-4 mr-2" />
              新建申请
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建审批申请</DialogTitle>
              <DialogDescription>填写申请信息，提交审批流程</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">申请类型</Label>
                <Select value={requestForm.type} onValueChange={(value: 'leave' | 'expense' | 'purchase' | 'hiring') =>
                  setRequestForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leave">请假申请</SelectItem>
                    <SelectItem value="expense">费用报销</SelectItem>
                    <SelectItem value="purchase">采购申请</SelectItem>
                    <SelectItem value="hiring">招聘申请</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">申请标题</Label>
                <Input
                  value={requestForm.title}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入申请标题"
                />
              </div>
              {(requestForm.type === 'expense' || requestForm.type === 'purchase') && (
                <div>
                  <Label htmlFor="amount">金额</Label>
                  <Input
                    value={requestForm.amount}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="输入金额"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="priority">优先级</Label>
                <Select value={requestForm.priority} onValueChange={(value: 'low' | 'normal' | 'high') =>
                  setRequestForm(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低优先级</SelectItem>
                    <SelectItem value="normal">普通</SelectItem>
                    <SelectItem value="high">高优先级</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">申请说明</Label>
                <Textarea
                  value={requestForm.description}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="详细说明申请原因和相关信息"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewRequestOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSubmitRequest} className="bg-zinc-900 hover:bg-zinc-800">
                提交申请
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">全部申请</TabsTrigger>
          <TabsTrigger value="pending">待审批</TabsTrigger>
          <TabsTrigger value="approved">已通过</TabsTrigger>
          <TabsTrigger value="rejected">已拒绝</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>所有审批申请</CardTitle>
              <CardDescription>查看和管理所有审批申请</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>申请信息</TableHead>
                    <TableHead>申请人</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>优先级</TableHead>
                    <TableHead>进度</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvalRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.title}</div>
                          <div className="text-sm text-zinc-600">{request.id}</div>
                          <div className="text-xs text-zinc-500">{request.submitTime}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={request.applicantAvatar} />
                            <AvatarFallback>{request.applicant[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{request.applicant}</div>
                            <div className="text-xs text-zinc-600">{request.department}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(request.type)}
                          {getTypeName(request.type)}
                        </div>
                      </TableCell>
                      <TableCell>{request.amount || '-'}</TableCell>
                      <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span>{request.currentStep}/{request.totalSteps}</span>
                          </div>
                          <Progress value={getProgressPercentage(request)} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request)
                              setIsDetailOpen(true)
                            }}
                          >
                            查看详情
                          </Button>
                          {request.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApproval(request.id, true)}
                              >
                                通过
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleApproval(request.id, false)}
                              >
                                拒绝
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>待审批申请</CardTitle>
              <CardDescription>需要您审批的申请</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvalRequests.filter(r => r.status === 'pending').map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={request.applicantAvatar} />
                          <AvatarFallback>{request.applicant[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{request.title}</div>
                          <div className="text-sm text-zinc-600">{request.applicant} · {request.department}</div>
                          <div className="text-xs text-zinc-500">{request.submitTime}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(request.priority)}
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproval(request.id, true)}
                        >
                          通过
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleApproval(request.id, false)}
                        >
                          拒绝
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>已通过申请</CardTitle>
              <CardDescription>审批通过的申请记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvalRequests.filter(r => r.status === 'approved').map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={request.applicantAvatar} />
                          <AvatarFallback>{request.applicant[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{request.title}</div>
                          <div className="text-sm text-zinc-600">{request.applicant} · {request.department}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-600">已通过</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>已拒绝申请</CardTitle>
              <CardDescription>审批拒绝的申请记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvalRequests.filter(r => r.status === 'rejected').map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={request.applicantAvatar} />
                          <AvatarFallback>{request.applicant[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{request.title}</div>
                          <div className="text-sm text-zinc-600">{request.applicant} · {request.department}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-sm text-red-600">已拒绝</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 详情对话框 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>审批详情</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>申请标题</Label>
                  <p className="font-medium">{selectedRequest.title}</p>
                </div>
                <div>
                  <Label>申请类型</Label>
                  <p className="flex items-center gap-2">
                    {getTypeIcon(selectedRequest.type)}
                    {getTypeName(selectedRequest.type)}
                  </p>
                </div>
                <div>
                  <Label>申请人</Label>
                  <p>{selectedRequest.applicant} ({selectedRequest.department})</p>
                </div>
                <div>
                  <Label>提交时间</Label>
                  <p>{selectedRequest.submitTime}</p>
                </div>
                {selectedRequest.amount && (
                  <div>
                    <Label>金额</Label>
                    <p className="font-medium">{selectedRequest.amount}</p>
                  </div>
                )}
                <div>
                  <Label>优先级</Label>
                  <div>{getPriorityBadge(selectedRequest.priority)}</div>
                </div>
              </div>

              <div>
                <Label>申请说明</Label>
                <p className="mt-1 p-3 bg-zinc-50 rounded-lg">{selectedRequest.description}</p>
              </div>

              <div>
                <Label>审批流程</Label>
                <div className="mt-2 space-y-3">
                  {selectedRequest.approvalFlow.map((step: ApprovalStep) => (
                    <div key={step.step} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        {step.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {step.status === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
                        {step.status === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
                        {step.status === 'waiting' && <AlertCircle className="w-5 h-5 text-zinc-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">第{step.step}步: {step.approver}</div>
                        <div className="text-sm text-zinc-600">{step.role}</div>
                        {step.time && <div className="text-xs text-zinc-500">{step.time}</div>}
                        {step.comment && <div className="text-sm text-zinc-700 mt-1">{step.comment}</div>}
                      </div>
                      <div>
                        {step.status === 'approved' && <Badge className="bg-green-100 text-green-800">已通过</Badge>}
                        {step.status === 'rejected' && <Badge className="bg-red-100 text-red-800">已拒绝</Badge>}
                        {step.status === 'pending' && <Badge className="bg-yellow-100 text-yellow-800">待审批</Badge>}
                        {step.status === 'waiting' && <Badge className="bg-zinc-100 text-zinc-800">等待中</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
