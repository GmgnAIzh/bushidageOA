"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { dataService, Employee, Department } from "@/lib/data-service"
import { toast } from "sonner"
import { Users, Plus, Search, Edit, Trash2, Download, CheckCircle, Building } from "lucide-react"

export function EmployeeModule() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [isNewEmployeeOpen, setIsNewEmployeeOpen] = useState(false)
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    status: 'active' as 'active' | 'inactive' | 'pending',
    location: '',
    employeeId: ''
  })

  useEffect(() => {
    dataService.initializeData()
    loadEmployees()
    loadDepartments()
  }, [])

  const loadEmployees = () => {
    const employeeData = dataService.getEmployees()
    setEmployees(employeeData)
  }

  const loadDepartments = () => {
    const deptData = dataService.getDepartments()
    setDepartments(deptData)
  }

  const handleCreateEmployee = () => {
    if (!employeeForm.name || !employeeForm.email || !employeeForm.position || !employeeForm.department) {
      toast.error("请填写完整的员工信息")
      return
    }

    // 检查邮箱是否已存在
    const existingEmployee = employees.find(emp => emp.email === employeeForm.email)
    if (existingEmployee) {
      toast.error("该邮箱已被使用")
      return
    }

    const newEmployee: Employee = {
      id: dataService.generateId(),
      employeeId: employeeForm.employeeId || `EMP${Date.now().toString().slice(-6)}`,
      name: employeeForm.name,
      email: employeeForm.email,
      phone: employeeForm.phone,
      position: employeeForm.position,
      department: employeeForm.department,
      salary: employeeForm.salary,
      status: employeeForm.status,
      joinDate: dataService.getCurrentDate(),
      location: employeeForm.location,
      role: employeeForm.position,
      performance: Math.floor(Math.random() * 20) + 80, // 80-100
      attendance: Math.floor(Math.random() * 10) + 90, // 90-100
      projects: Math.floor(Math.random() * 15) + 1 // 1-15
    }

    dataService.addEmployee(newEmployee)
    loadEmployees()
    setIsNewEmployeeOpen(false)
    resetForm()
    toast.success("员工添加成功")
  }

  const handleEditEmployee = () => {
    if (!selectedEmployee || !employeeForm.name || !employeeForm.email) {
      toast.error("请填写完整的员工信息")
      return
    }

    // 检查邮箱是否与其他员工冲突
    const existingEmployee = employees.find(emp => emp.email === employeeForm.email && emp.id !== selectedEmployee.id)
    if (existingEmployee) {
      toast.error("该邮箱已被其他员工使用")
      return
    }

    const updatedEmployee: Employee = {
      ...selectedEmployee,
      name: employeeForm.name,
      email: employeeForm.email,
      phone: employeeForm.phone,
      position: employeeForm.position,
      department: employeeForm.department,
      salary: employeeForm.salary,
      status: employeeForm.status,
      location: employeeForm.location,
      role: employeeForm.position
    }

    dataService.updateEmployee(selectedEmployee.id, updatedEmployee)
    loadEmployees()
    setIsEditEmployeeOpen(false)
    setSelectedEmployee(null)
    resetForm()
    toast.success("员工信息已更新")
  }

  const handleDeleteEmployee = (employeeId: string) => {
    dataService.deleteEmployee(employeeId)
    loadEmployees()
    toast.success("员工已删除")
  }

  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee)
    setEmployeeForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      position: employee.position,
      department: employee.department,
      salary: employee.salary || '',
      status: employee.status,
      location: employee.location || '',
      employeeId: employee.employeeId
    })
    setIsEditEmployeeOpen(true)
  }

  const resetForm = () => {
    setEmployeeForm({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      salary: '',
      status: 'active',
      location: '',
      employeeId: ''
    })
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = filterDepartment === "all" || employee.department === filterDepartment
    const matchesStatus = filterStatus === "all" || employee.status === filterStatus
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "inactive": return "bg-red-100 text-red-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      default: return "bg-zinc-100 text-zinc-800"
    }
  }

  const stats = [
    {
      title: "总员工数",
      value: employees.length.toString(),
      change: "+2",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "在职员工",
      value: employees.filter(e => e.status === 'active').length.toString(),
      change: "+1",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "部门数量",
      value: departments.length.toString(),
      change: "0",
      icon: Building,
      color: "text-purple-600"
    },
    {
      title: "平均绩效",
      value: employees.length > 0 ? Math.round(employees.reduce((sum, e) => sum + (e.performance || 0), 0) / employees.length).toString() + "%" : "0%",
      change: "+3.2",
      icon: CheckCircle,
      color: "text-orange-600"
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">员工管理</h1>
          <p className="text-zinc-600 mt-1">全面的人力资源管理系统</p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </Button>
          <Dialog open={isNewEmployeeOpen} onOpenChange={setIsNewEmployeeOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-zinc-900 hover:bg-zinc-800">
                <Plus className="w-4 h-4 mr-2" />
                添加员工
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>添加新员工</DialogTitle>
                <DialogDescription>填写员工基本信息</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">姓名 *</Label>
                    <Input
                      id="name"
                      placeholder="员工姓名"
                      value={employeeForm.name}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeeId">员工编号</Label>
                    <Input
                      id="employeeId"
                      placeholder="自动生成或手动输入"
                      value={employeeForm.employeeId}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, employeeId: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">职位 *</Label>
                    <Input
                      id="position"
                      placeholder="职位名称"
                      value={employeeForm.position}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, position: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">部门 *</Label>
                    <Select value={employeeForm.department} onValueChange={(value) => setEmployeeForm(prev => ({ ...prev, department: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择部门" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">邮箱 *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@company.com"
                      value={employeeForm.email}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">电话</Label>
                    <Input
                      id="phone"
                      placeholder="138****1234"
                      value={employeeForm.phone}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salary">薪资</Label>
                    <Input
                      id="salary"
                      placeholder="₮ 8,000"
                      value={employeeForm.salary}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, salary: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">工作地点</Label>
                    <Input
                      id="location"
                      placeholder="北京"
                      value={employeeForm.location}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">状态</Label>
                  <Select value={employeeForm.status} onValueChange={(value: 'active' | 'inactive' | 'pending') =>
                    setEmployeeForm(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">在职</SelectItem>
                      <SelectItem value="pending">待入职</SelectItem>
                      <SelectItem value="inactive">离职</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewEmployeeOpen(false)}>取消</Button>
                <Button onClick={handleCreateEmployee} className="bg-zinc-900 hover:bg-zinc-800">添加员工</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
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
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-zinc-500 ml-1">较上月</span>
                    </div>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employees">员工档案</TabsTrigger>
          <TabsTrigger value="analytics">数据分析</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <Input
                  placeholder="搜索员工..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="选择部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部部门</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">在职</SelectItem>
                  <SelectItem value="inactive">离职</SelectItem>
                  <SelectItem value="pending">待入职</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-zinc-600">
              共 {filteredEmployees.length} 名员工
            </div>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>员工信息</TableHead>
                    <TableHead>职位部门</TableHead>
                    <TableHead>联系方式</TableHead>
                    <TableHead>薪资</TableHead>
                    <TableHead>绩效</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={employee.avatar} />
                            <AvatarFallback>{employee.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-zinc-600">{employee.employeeId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee.position}</div>
                          <div className="text-sm text-zinc-600">{employee.department}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{employee.email}</div>
                          <div className="text-sm text-zinc-600">{employee.phone || '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.salary || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{employee.performance}%</span>
                          <div className="w-16 bg-zinc-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${employee.performance}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(employee.status)}>
                          {employee.status === 'active' ? '在职' :
                           employee.status === 'inactive' ? '离职' : '待入职'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(employee)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            编辑
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4 mr-1" />
                                删除
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除员工 "{employee.name}" 吗？此操作无法撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteEmployee(employee.id)}>
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>部门人员分布</CardTitle>
              </CardHeader>
              <CardContent>
                {departments.map((dept) => {
                  const deptEmployees = employees.filter(e => e.department === dept.name)
                  return (
                    <div key={dept.id} className="flex justify-between items-center py-2">
                      <span>{dept.name}</span>
                      <Badge variant="outline">{deptEmployees.length} 人</Badge>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>员工状态统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>在职员工</span>
                    <span className="font-medium text-green-600">
                      {employees.filter(e => e.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>待入职</span>
                    <span className="font-medium text-yellow-600">
                      {employees.filter(e => e.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>离职员工</span>
                    <span className="font-medium text-red-600">
                      {employees.filter(e => e.status === 'inactive').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>平均绩效</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {employees.length > 0
                      ? Math.round(employees.reduce((sum, e) => sum + (e.performance || 0), 0) / employees.length)
                      : 0}%
                  </div>
                  <p className="text-sm text-zinc-600 mt-1">团队平均绩效</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 编辑员工对话框 */}
      <Dialog open={isEditEmployeeOpen} onOpenChange={setIsEditEmployeeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑员工信息</DialogTitle>
            <DialogDescription>修改员工的基本信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">姓名 *</Label>
                <Input
                  id="edit-name"
                  value={employeeForm.name}
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">邮箱 *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-position">职位 *</Label>
                <Input
                  id="edit-position"
                  value={employeeForm.position}
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, position: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-department">部门 *</Label>
                <Select value={employeeForm.department} onValueChange={(value) => setEmployeeForm(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择部门" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">电话</Label>
                <Input
                  id="edit-phone"
                  value={employeeForm.phone}
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-salary">薪资</Label>
                <Input
                  id="edit-salary"
                  value={employeeForm.salary}
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, salary: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-location">所在地</Label>
                <Input
                  id="edit-location"
                  value={employeeForm.location}
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">状态</Label>
                <Select value={employeeForm.status} onValueChange={(value: 'active' | 'inactive' | 'pending') =>
                  setEmployeeForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">在职</SelectItem>
                    <SelectItem value="pending">待入职</SelectItem>
                    <SelectItem value="inactive">离职</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditEmployeeOpen(false)}>取消</Button>
            <Button onClick={handleEditEmployee} className="bg-zinc-900 hover:bg-zinc-800">保存更改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
