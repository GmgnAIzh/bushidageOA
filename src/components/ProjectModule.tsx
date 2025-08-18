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
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { dataService, Employee } from "@/lib/data-service"
import { toast } from "sonner"
import {
  Plus, Calendar as CalendarIcon, Users, Target, Clock, CheckCircle, AlertCircle,
  TrendingUp, Filter, Search, Edit, Trash2, Play, Pause, MoreHorizontal, FileText,
  DollarSign, Timer, BarChart3, Download, Upload, UserCheck, Activity,
  PieChart, TrendingDown, AlertTriangle, Calendar as CalIcon, Zap
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Cell } from 'recharts'
import { MessageSquare, Users2, Hash, Send, Paperclip } from "lucide-react"

// Enhanced interfaces with new features
interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  progress: number
  startDate: string
  endDate: string
  actualEndDate?: string
  budget: number
  actualCost: number
  estimatedHours: number
  actualHours: number
  projectManager: string
  projectManagerId: string
  team: string[]
  tags: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  clientId?: string
  createdAt: string
  updatedAt: string
}

interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigneeId: string
  assigneeName: string
  startDate: string
  dueDate: string
  estimatedHours: number
  actualHours: number
  tags: string[]
  dependencies: string[]
  completionPercentage: number
  timeEntries: TimeEntry[]
  createdAt: string
  completedAt?: string
}

interface TimeEntry {
  id: string
  taskId: string
  projectId: string
  employeeId: string
  employeeName: string
  date: string
  startTime: string
  endTime: string
  hours: number
  description: string
  billable: boolean
  approved: boolean
  createdAt: string
}

interface Resource {
  id: string
  employeeId: string
  employeeName: string
  role: string
  hourlyRate: number
  allocation: number // percentage
  availableHours: number
  allocatedHours: number
  skills: string[]
  currentProjects: string[]
}

interface ProjectReport {
  projectId: string
  projectName: string
  status: string
  progress: number
  budget: number
  actualCost: number
  estimatedHours: number
  actualHours: number
  teamSize: number
  tasksTotal: number
  tasksCompleted: number
  riskLevel: string
  daysRemaining: number
  efficiency: number
  roi: number
}

export function ProjectModule() {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Dialog states
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [isTimeEntryOpen, setIsTimeEntryOpen] = useState(false)
  const [isResourceAllocationOpen, setIsResourceAllocationOpen] = useState(false)
  const [isProjectChatOpen, setIsProjectChatOpen] = useState(false)
  const [selectedProjectChat, setSelectedProjectChat] = useState<Project | null>(null)
  const [projectChats, setProjectChats] = useState<Record<string, any>>({})

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  // Form states
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    startDate: '',
    endDate: '',
    budget: '',
    estimatedHours: '',
    projectManager: '',
    team: [] as string[],
    tags: [] as string[],
    riskLevel: 'low' as 'low' | 'medium' | 'high' | 'critical'
  })

  const [taskForm, setTaskForm] = useState({
    projectId: '',
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignee: '',
    startDate: '',
    dueDate: '',
    estimatedHours: '',
    tags: [] as string[]
  })

  const [timeEntryForm, setTimeEntryForm] = useState({
    taskId: '',
    projectId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    description: '',
    billable: true
  })

  // Initialize data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const employeeData = dataService.getEmployees()
    setEmployees(employeeData)

    // 获取当前用户
    const user = dataService.getCurrentUser() || { id: 'user-1', name: '系统用户' }
    setCurrentUser(user)

    initializeProjects()
    initializeTasks()
    initializeTimeEntries()
    initializeResources(employeeData)
  }

  // Add missing handler functions
  const handleEditTask = (task: Task) => {
    setTaskForm({
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      priority: task.priority === 'urgent' ? 'high' : task.priority as 'low' | 'medium' | 'high',
      assignee: task.assigneeId,
      startDate: task.startDate,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours.toString(),
      tags: task.tags
    })
    setIsNewTaskOpen(true)
    toast.success('任务信息已加载到编辑表单')
  }

  const handleStartTimer = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setTimeEntryForm({
        taskId: taskId,
        projectId: task.projectId,
        date: new Date().toISOString().split('T')[0],
        startTime: new Date().toTimeString().slice(0, 5),
        endTime: '',
        description: `工作于: ${task.title}`,
        billable: true
      })
      setIsTimeEntryOpen(true)
      toast.success('开始计时')
    }
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      setTasks(prev => prev.filter(task => task.id !== taskId))
      toast.success('任务已删除')
    }
  }

  const handleOptimizeResourceAllocation = () => {
    const optimizedResources = resources.map(resource => ({
      ...resource,
      allocation: Math.min(95, Math.max(20, resource.allocation + (Math.random() - 0.5) * 20))
    }))
    setResources(optimizedResources)
    toast.success('资源分配已优化')
  }

  const handleApproveTimeEntry = (entryId: string) => {
    setTimeEntries(prev => prev.map(entry =>
      entry.id === entryId ? { ...entry, approved: true } : entry
    ))
    toast.success('工时记录已审批')
  }

  const handleEditTimeEntry = (entry: TimeEntry) => {
    setTimeEntryForm({
      taskId: entry.taskId,
      projectId: entry.projectId,
      date: entry.date,
      startTime: entry.startTime,
      endTime: entry.endTime,
      description: entry.description,
      billable: entry.billable
    })
    setIsTimeEntryOpen(true)
    toast.success('工时记录已加载到编辑表单')
  }

  const createProjectChat = async (project: Project) => {
    // 创建项目专属群聊
    const chatData = {
      id: `project-chat-${project.id}`,
      name: `${project.name} - 项目讨论`,
      type: 'project_group' as const,
      projectId: project.id,
      participants: project.team,
      participantNames: project.team.map(memberId =>
        employees.find(emp => emp.id === memberId)?.name || '未知用户'
      ),
      description: `${project.name}项目的专属讨论群`,
      createdAt: new Date().toISOString(),
      isPrivate: false,
      avatar: `/project-avatars/${project.id}.png`,
      tags: ['项目', '协作', project.priority],
      settings: {
        allowFileShare: true,
        allowTaskCreation: true,
        autoArchive: project.status === 'completed'
      }
    }

    // 模拟创建聊天群
    setProjectChats(prev => ({
      ...prev,
      [project.id]: chatData
    }))

    toast.success(`已为项目"${project.name}"创建专属讨论群`)

    // 发送欢迎消息
    const welcomeMessage = {
      id: `welcome-${Date.now()}`,
      chatId: chatData.id,
      type: 'system',
      content: `欢迎来到"${project.name}"项目讨论群！您可以在这里：\n• 讨论项目进展\n• 分享文件和资源\n• 快速创建任务\n• 跟踪项目里程碑`,
      timestamp: new Date().toISOString(),
      sender: '系统助手'
    }

    // 这里可以集成到聊天模块
    console.log('Project chat created:', chatData)
    console.log('Welcome message:', welcomeMessage)
  }

  const joinProjectDiscussion = (project: Project) => {
    setSelectedProjectChat(project)
    setIsProjectChatOpen(true)
  }

  const createTaskFromChat = (project: Project, taskDescription: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      projectId: project.id,
      title: `聊天创建：${taskDescription.substring(0, 30)}...`,
      description: taskDescription,
      status: 'todo',
      priority: 'medium',
      assigneeId: currentUser?.id || '',
      assigneeName: currentUser?.name || '',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: 8,
      actualHours: 0,
      tags: ['聊天创建'],
      dependencies: [],
      completionPercentage: 0,
      timeEntries: [],
      createdAt: new Date().toISOString()
    }

    setTasks(prev => [...prev, newTask])
    toast.success('已从聊天讨论中创建新任务')
  }

  const initializeProjects = () => {
    const sampleProjects: Project[] = [
      {
        id: 'proj-1',
        name: '企业官网重构',
        description: '重新设计和开发公司官方网站，提升用户体验和SEO效果',
        status: 'active',
        priority: 'high',
        progress: 65,
        startDate: '2024-01-15',
        endDate: '2024-03-30',
        budget: 150000,
        actualCost: 89000,
        estimatedHours: 480,
        actualHours: 312,
        projectManager: '张三',
        projectManagerId: 'emp-1',
        team: ['emp-1', 'emp-2', 'emp-3', 'emp-4'],
        tags: ['前端', '设计', 'SEO'],
        riskLevel: 'medium',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-20'
      },
      {
        id: 'proj-2',
        name: 'OA系统升级',
        description: '对现有OA系统进行全面升级，增加新功能模块',
        status: 'planning',
        priority: 'urgent',
        progress: 15,
        startDate: '2024-02-01',
        endDate: '2024-05-31',
        budget: 200000,
        actualCost: 25000,
        estimatedHours: 640,
        actualHours: 96,
        projectManager: '李四',
        projectManagerId: 'emp-2',
        team: ['emp-2', 'emp-5', 'emp-6'],
        tags: ['后端', '数据库', '安全'],
        riskLevel: 'high',
        createdAt: '2024-01-25',
        updatedAt: '2024-02-01'
      },
      {
        id: 'proj-3',
        name: '移动端APP开发',
        description: '开发iOS和Android移动应用，提供更好的移动体验',
        status: 'completed',
        priority: 'medium',
        progress: 100,
        startDate: '2023-10-01',
        endDate: '2023-12-31',
        actualEndDate: '2023-12-28',
        budget: 180000,
        actualCost: 175000,
        estimatedHours: 560,
        actualHours: 545,
        projectManager: '王五',
        projectManagerId: 'emp-3',
        team: ['emp-3', 'emp-7', 'emp-8'],
        tags: ['移动端', 'iOS', 'Android'],
        riskLevel: 'low',
        createdAt: '2023-09-20',
        updatedAt: '2023-12-28'
      }
    ]
    setProjects(sampleProjects)
  }

  const initializeTasks = () => {
    const sampleTasks: Task[] = [
      {
        id: 'task-1',
        projectId: 'proj-1',
        title: '首页设计',
        description: '设计全新的首页布局和视觉效果',
        status: 'completed',
        priority: 'high',
        assigneeId: 'emp-2',
        assigneeName: '李四',
        startDate: '2024-01-15',
        dueDate: '2024-01-25',
        estimatedHours: 40,
        actualHours: 38,
        tags: ['设计', 'UI'],
        dependencies: [],
        completionPercentage: 100,
        timeEntries: [],
        createdAt: '2024-01-15',
        completedAt: '2024-01-24'
      },
      {
        id: 'task-2',
        projectId: 'proj-1',
        title: '前端开发',
        description: '实现首页的前端代码',
        status: 'in_progress',
        priority: 'high',
        assigneeId: 'emp-3',
        assigneeName: '王五',
        startDate: '2024-01-25',
        dueDate: '2024-02-10',
        estimatedHours: 60,
        actualHours: 42,
        tags: ['前端', 'React'],
        dependencies: ['task-1'],
        completionPercentage: 70,
        timeEntries: [],
        createdAt: '2024-01-25'
      },
      {
        id: 'task-3',
        projectId: 'proj-2',
        title: '需求分析',
        description: '分析OA系统升级的具体需求',
        status: 'review',
        priority: 'urgent',
        assigneeId: 'emp-2',
        assigneeName: '李四',
        startDate: '2024-02-01',
        dueDate: '2024-02-15',
        estimatedHours: 32,
        actualHours: 30,
        tags: ['分析', '需求'],
        dependencies: [],
        completionPercentage: 95,
        timeEntries: [],
        createdAt: '2024-02-01'
      }
    ]
    setTasks(sampleTasks)
  }

  const initializeTimeEntries = () => {
    const sampleTimeEntries: TimeEntry[] = [
      {
        id: 'time-1',
        taskId: 'task-1',
        projectId: 'proj-1',
        employeeId: 'emp-2',
        employeeName: '李四',
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '17:00',
        hours: 8,
        description: '首页设计第一版',
        billable: true,
        approved: true,
        createdAt: '2024-01-15'
      },
      {
        id: 'time-2',
        taskId: 'task-2',
        projectId: 'proj-1',
        employeeId: 'emp-3',
        employeeName: '王五',
        date: '2024-01-26',
        startTime: '09:30',
        endTime: '18:00',
        hours: 8.5,
        description: '首页组件开发',
        billable: true,
        approved: false,
        createdAt: '2024-01-26'
      }
    ]
    setTimeEntries(sampleTimeEntries)
  }

  const initializeResources = (employeeData: Employee[]) => {
    const sampleResources: Resource[] = employeeData.map((emp, index) => ({
      id: `res-${emp.id}`,
      employeeId: emp.id,
      employeeName: emp.name,
      role: emp.position || '开发工程师',
      hourlyRate: 100 + index * 20,
      allocation: Math.random() * 80 + 20, // 20-100%
      availableHours: 40,
      allocatedHours: Math.random() * 35 + 5, // 5-40 hours
      skills: ['JavaScript', 'React', 'Node.js', 'Python'].slice(0, Math.floor(Math.random() * 4) + 1),
      currentProjects: ['proj-1', 'proj-2'].slice(0, Math.floor(Math.random() * 2) + 1)
    }))
    setResources(sampleResources)
  }

  // Event handlers
  const handleCreateProject = async () => {
    if (!projectForm.name || !projectForm.startDate || !projectForm.endDate) {
      toast.error('请填写完整的项目信息')
      return
    }

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: projectForm.name,
      description: projectForm.description,
      status: 'planning',
      priority: projectForm.priority,
      progress: 0,
      startDate: projectForm.startDate,
      endDate: projectForm.endDate,
      budget: parseFloat(projectForm.budget) || 0,
      actualCost: 0,
      estimatedHours: parseFloat(projectForm.estimatedHours) || 0,
      actualHours: 0,
      projectManager: employees.find(emp => emp.id === projectForm.projectManager)?.name || '',
      projectManagerId: projectForm.projectManager,
      team: projectForm.team,
      tags: projectForm.tags,
      riskLevel: projectForm.riskLevel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setProjects([...projects, newProject])
    setIsNewProjectOpen(false)
    setProjectForm({
      name: '',
      description: '',
      priority: 'medium',
      startDate: '',
      endDate: '',
      budget: '',
      estimatedHours: '',
      projectManager: '',
      team: [],
      tags: [],
      riskLevel: 'low'
    })
    toast.success('项目创建成功')
  }

  const handleCreateTask = async () => {
    if (!taskForm.title || !taskForm.projectId) {
      toast.error('请填写完整的任务信息')
      return
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      projectId: taskForm.projectId,
      title: taskForm.title,
      description: taskForm.description,
      status: 'todo',
      priority: taskForm.priority,
      assigneeId: taskForm.assignee,
      assigneeName: employees.find(emp => emp.id === taskForm.assignee)?.name || '',
      startDate: taskForm.startDate,
      dueDate: taskForm.dueDate,
      estimatedHours: parseFloat(taskForm.estimatedHours) || 0,
      actualHours: 0,
      tags: taskForm.tags,
      dependencies: [],
      completionPercentage: 0,
      timeEntries: [],
      createdAt: new Date().toISOString()
    }

    setTasks([...tasks, newTask])
    setIsNewTaskOpen(false)
    setTaskForm({
      projectId: '',
      title: '',
      description: '',
      priority: 'medium',
      assignee: '',
      startDate: '',
      dueDate: '',
      estimatedHours: '',
      tags: []
    })
    toast.success('任务创建成功')
  }

  const handleCreateTimeEntry = async () => {
    if (!timeEntryForm.taskId || !timeEntryForm.startTime || !timeEntryForm.endTime) {
      toast.error('请填写完整的工时记录')
      return
    }

    const startTime = new Date(`${timeEntryForm.date} ${timeEntryForm.startTime}`)
    const endTime = new Date(`${timeEntryForm.date} ${timeEntryForm.endTime}`)
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)

    if (hours <= 0) {
      toast.error('结束时间必须晚于开始时间')
      return
    }

    const task = tasks.find(t => t.id === timeEntryForm.taskId)
    const employee = employees.find(emp => emp.id === task?.assigneeId)

    const newTimeEntry: TimeEntry = {
      id: `time-${Date.now()}`,
      taskId: timeEntryForm.taskId,
      projectId: timeEntryForm.projectId,
      employeeId: task?.assigneeId || '',
      employeeName: employee?.name || '',
      date: timeEntryForm.date,
      startTime: timeEntryForm.startTime,
      endTime: timeEntryForm.endTime,
      hours: Math.round(hours * 100) / 100,
      description: timeEntryForm.description,
      billable: timeEntryForm.billable,
      approved: false,
      createdAt: new Date().toISOString()
    }

    setTimeEntries([...timeEntries, newTimeEntry])

    // Update task actual hours
    const updatedTasks = tasks.map(task =>
      task.id === timeEntryForm.taskId
        ? { ...task, actualHours: task.actualHours + hours }
        : task
    )
    setTasks(updatedTasks)

    setIsTimeEntryOpen(false)
    setTimeEntryForm({
      taskId: '',
      projectId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      description: '',
      billable: true
    })
    toast.success('工时记录已添加')
  }

  const generateProjectReport = (project: Project): ProjectReport => {
    const projectTasks = tasks.filter(task => task.projectId === project.id)
    const completedTasks = projectTasks.filter(task => task.status === 'completed')
    const projectTimeEntries = timeEntries.filter(entry => entry.projectId === project.id)
    const totalActualHours = projectTimeEntries.reduce((sum, entry) => sum + entry.hours, 0)

    const daysRemaining = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    const efficiency = project.estimatedHours > 0 ? (totalActualHours / project.estimatedHours) * 100 : 0
    const roi = project.budget > 0 ? ((project.budget - project.actualCost) / project.budget) * 100 : 0

    return {
      projectId: project.id,
      projectName: project.name,
      status: project.status,
      progress: project.progress,
      budget: project.budget,
      actualCost: project.actualCost,
      estimatedHours: project.estimatedHours,
      actualHours: totalActualHours,
      teamSize: project.team.length,
      tasksTotal: projectTasks.length,
      tasksCompleted: completedTasks.length,
      riskLevel: project.riskLevel,
      daysRemaining,
      efficiency: Math.round(efficiency),
      roi: Math.round(roi)
    }
  }

  const exportProjectReport = () => {
    const reports = projects.map(project => generateProjectReport(project))

    const csvContent = [
      ['项目名称', '状态', '进度(%)', '预算', '实际成本', '预估工时', '实际工时', '团队规模', '任务总数', '已完成任务', '风险等级', '剩余天数', '效率(%)', 'ROI(%)'].join(','),
      ...reports.map(report => [
        report.projectName,
        report.status,
        report.progress,
        report.budget,
        report.actualCost,
        report.estimatedHours,
        report.actualHours,
        report.teamSize,
        report.tasksTotal,
        report.tasksCompleted,
        report.riskLevel,
        report.daysRemaining,
        report.efficiency,
        report.roi
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `project_report_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('项目报告已导出')
  }

  const exportTimeReport = () => {
    const csvContent = [
      ['项目', '任务', '员工', '日期', '开始时间', '结束时间', '工时', '描述', '计费', '已审批'].join(','),
      ...timeEntries.map(entry => {
        const task = tasks.find(t => t.id === entry.taskId)
        const project = projects.find(p => p.id === entry.projectId)
        return [
          project?.name || '',
          task?.title || '',
          entry.employeeName,
          entry.date,
          entry.startTime,
          entry.endTime,
          entry.hours,
          entry.description,
          entry.billable ? '是' : '否',
          entry.approved ? '是' : '否'
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `time_report_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('工时报告已导出')
  }

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Generate charts data
  const projectStatusData = [
    { name: '计划中', value: projects.filter(p => p.status === 'planning').length, color: '#8b5cf6' },
    { name: '进行中', value: projects.filter(p => p.status === 'active').length, color: '#3b82f6' },
    { name: '已暂停', value: projects.filter(p => p.status === 'paused').length, color: '#f59e0b' },
    { name: '已完成', value: projects.filter(p => p.status === 'completed').length, color: '#22c55e' },
    { name: '已取消', value: projects.filter(p => p.status === 'cancelled').length, color: '#ef4444' }
  ]

  const resourceUtilizationData = resources.map(resource => ({
    name: resource.employeeName,
    allocation: Math.round(resource.allocation),
    available: Math.round(100 - resource.allocation)
  }))

  const projectBudgetData = projects.map(project => ({
    name: project.name.length > 10 ? project.name.substring(0, 10) + '...' : project.name,
    budget: project.budget,
    actualCost: project.actualCost,
    remaining: project.budget - project.actualCost
  }))

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">项目管理</h2>
          <p className="text-muted-foreground">全面的项目管理、时间跟踪和资源分配</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportProjectReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出项目报告
          </Button>
          <Button onClick={exportTimeReport} variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            导出工时报告
          </Button>
          <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新建项目
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>创建新项目</DialogTitle>
                <DialogDescription>填写项目的基本信息和配置</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>项目名称</Label>
                  <Input
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                    placeholder="输入项目名称"
                  />
                </div>
                <div className="col-span-2">
                  <Label>项目描述</Label>
                  <Textarea
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                    placeholder="项目详细描述..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>优先级</Label>
                  <Select value={projectForm.priority} onValueChange={(value: any) => setProjectForm({...projectForm, priority: value})}>
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
                <div>
                  <Label>风险等级</Label>
                  <Select value={projectForm.riskLevel} onValueChange={(value: any) => setProjectForm({...projectForm, riskLevel: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">低风险</SelectItem>
                      <SelectItem value="medium">中风险</SelectItem>
                      <SelectItem value="high">高风险</SelectItem>
                      <SelectItem value="critical">关键风险</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>开始日期</Label>
                  <Input
                    type="date"
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm({...projectForm, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label>结束日期</Label>
                  <Input
                    type="date"
                    value={projectForm.endDate}
                    onChange={(e) => setProjectForm({...projectForm, endDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label>预算(元)</Label>
                  <Input
                    type="number"
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm({...projectForm, budget: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>预估工时</Label>
                  <Input
                    type="number"
                    value={projectForm.estimatedHours}
                    onChange={(e) => setProjectForm({...projectForm, estimatedHours: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="col-span-2">
                  <Label>项目经理</Label>
                  <Select value={projectForm.projectManager} onValueChange={(value) => setProjectForm({...projectForm, projectManager: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择项目经理" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name} - {emp.position}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateProject}>创建项目</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="搜索项目..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="planning">计划中</SelectItem>
                <SelectItem value="active">进行中</SelectItem>
                <SelectItem value="paused">已暂停</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部优先级</SelectItem>
                <SelectItem value="low">低</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="urgent">紧急</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">项目概览</TabsTrigger>
          <TabsTrigger value="tasks">任务管理</TabsTrigger>
          <TabsTrigger value="time">时间跟踪</TabsTrigger>
          <TabsTrigger value="resources">资源分配</TabsTrigger>
          <TabsTrigger value="analytics">数据分析</TabsTrigger>
          <TabsTrigger value="reports">项目报告</TabsTrigger>
        </TabsList>

        {/* Project Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总项目数</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.length}</div>
                <p className="text-xs text-muted-foreground">
                  活跃项目: {projects.filter(p => p.status === 'active').length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总预算</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ¥{projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  已使用: ¥{projects.reduce((sum, p) => sum + p.actualCost, 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总工时</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {timeEntries.reduce((sum, entry) => sum + entry.hours, 0).toFixed(1)}h
                </div>
                <p className="text-xs text-muted-foreground">
                  本周: {timeEntries.filter(entry => {
                    const entryDate = new Date(entry.date)
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    return entryDate >= weekAgo
                  }).reduce((sum, entry) => sum + entry.hours, 0).toFixed(1)}h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">团队成员</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resources.length}</div>
                <p className="text-xs text-muted-foreground">
                  平均利用率: {Math.round(resources.reduce((sum, r) => sum + r.allocation, 0) / resources.length)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Projects List */}
          <Card>
            <CardHeader>
              <CardTitle>项目列表</CardTitle>
              <CardDescription>当前所有项目的状态和进度</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProjects.map(project => (
                  <div key={project.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{project.name}</h4>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            project.status === 'active' ? 'default' :
                            project.status === 'completed' ? 'secondary' :
                            project.status === 'paused' ? 'destructive' : 'outline'
                          }>
                            {project.status}
                          </Badge>
                          <Badge variant={
                            project.priority === 'urgent' ? 'destructive' :
                            project.priority === 'high' ? 'destructive' :
                            project.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {project.priority}
                          </Badge>
                          <Badge variant={
                            project.riskLevel === 'critical' ? 'destructive' :
                            project.riskLevel === 'high' ? 'destructive' :
                            project.riskLevel === 'medium' ? 'default' : 'secondary'
                          }>
                            {project.riskLevel}风险
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm font-medium">预算: ¥{project.budget.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          已用: ¥{project.actualCost.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {project.startDate} - {project.endDate}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>进度</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{project.projectManager[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{project.projectManager}</span>
                        <span className="text-xs text-muted-foreground">({project.team.length} 成员)</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedProject(project)}>
                          查看详情
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => joinProjectDiscussion(project)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          讨论
                        </Button>
                        {!projectChats[project.id] && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => createProjectChat(project)}
                            className="bg-green-50 hover:bg-green-100 text-green-700"
                          >
                            <Hash className="h-4 w-4 mr-1" />
                            建群
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Task Management */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">任务管理</h3>
            <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  新建任务
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>创建新任务</DialogTitle>
                  <DialogDescription>为项目添加新的任务</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>所属项目</Label>
                    <Select value={taskForm.projectId} onValueChange={(value) => setTaskForm({...taskForm, projectId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择项目" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>任务标题</Label>
                    <Input
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                      placeholder="输入任务标题"
                    />
                  </div>
                  <div>
                    <Label>任务描述</Label>
                    <Textarea
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                      placeholder="详细描述任务..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>优先级</Label>
                      <Select value={taskForm.priority} onValueChange={(value: any) => setTaskForm({...taskForm, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">低</SelectItem>
                          <SelectItem value="medium">中</SelectItem>
                          <SelectItem value="high">高</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>指派给</Label>
                      <Select value={taskForm.assignee} onValueChange={(value) => setTaskForm({...taskForm, assignee: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择负责人" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>开始日期</Label>
                      <Input
                        type="date"
                        value={taskForm.startDate}
                        onChange={(e) => setTaskForm({...taskForm, startDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>截止日期</Label>
                      <Input
                        type="date"
                        value={taskForm.dueDate}
                        onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>预估工时</Label>
                    <Input
                      type="number"
                      value={taskForm.estimatedHours}
                      onChange={(e) => setTaskForm({...taskForm, estimatedHours: e.target.value})}
                      placeholder="小时数"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateTask}>创建任务</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>任务</TableHead>
                    <TableHead>项目</TableHead>
                    <TableHead>负责人</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>优先级</TableHead>
                    <TableHead>进度</TableHead>
                    <TableHead>工时</TableHead>
                    <TableHead>截止日期</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map(task => {
                    const project = projects.find(p => p.id === task.projectId)
                    return (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-48">
                              {task.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{project?.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">{task.assigneeName[0]}</AvatarFallback>
                            </Avatar>
                            {task.assigneeName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            task.status === 'completed' ? 'default' :
                            task.status === 'in_progress' ? 'secondary' :
                            task.status === 'review' ? 'outline' : 'destructive'
                          }>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            task.priority === 'high' ? 'destructive' :
                            task.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="w-20">
                            <Progress value={task.completionPercentage} className="h-2" />
                            <div className="text-xs text-center mt-1">{task.completionPercentage}%</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{task.actualHours}h / {task.estimatedHours}h</div>
                            <div className="text-muted-foreground">
                              {task.estimatedHours > 0 ?
                                Math.round((task.actualHours / task.estimatedHours) * 100) : 0}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{task.dueDate}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEditTask(task)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleStartTimer(task.id)}>
                              <Timer className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteTask(task.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Tracking */}
        <TabsContent value="time" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">时间跟踪</h3>
            <Dialog open={isTimeEntryOpen} onOpenChange={setIsTimeEntryOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Clock className="h-4 w-4 mr-2" />
                  记录工时
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加工时记录</DialogTitle>
                  <DialogDescription>记录任务的工作时间</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>选择项目</Label>
                    <Select value={timeEntryForm.projectId} onValueChange={(value) => setTimeEntryForm({...timeEntryForm, projectId: value, taskId: ''})}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择项目" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>选择任务</Label>
                    <Select value={timeEntryForm.taskId} onValueChange={(value) => setTimeEntryForm({...timeEntryForm, taskId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择任务" />
                      </SelectTrigger>
                      <SelectContent>
                        {tasks.filter(task => task.projectId === timeEntryForm.projectId).map(task => (
                          <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>日期</Label>
                    <Input
                      type="date"
                      value={timeEntryForm.date}
                      onChange={(e) => setTimeEntryForm({...timeEntryForm, date: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>开始时间</Label>
                      <Input
                        type="time"
                        value={timeEntryForm.startTime}
                        onChange={(e) => setTimeEntryForm({...timeEntryForm, startTime: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>结束时间</Label>
                      <Input
                        type="time"
                        value={timeEntryForm.endTime}
                        onChange={(e) => setTimeEntryForm({...timeEntryForm, endTime: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>工作描述</Label>
                    <Textarea
                      value={timeEntryForm.description}
                      onChange={(e) => setTimeEntryForm({...timeEntryForm, description: e.target.value})}
                      placeholder="描述工作内容..."
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="billable"
                      checked={timeEntryForm.billable}
                      onCheckedChange={(checked) => setTimeEntryForm({...timeEntryForm, billable: checked as boolean})}
                    />
                    <Label htmlFor="billable">计费时间</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateTimeEntry}>添加记录</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>工时记录</CardTitle>
              <CardDescription>团队成员的详细工时记录</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>员工</TableHead>
                    <TableHead>项目</TableHead>
                    <TableHead>任务</TableHead>
                    <TableHead>日期</TableHead>
                    <TableHead>时间</TableHead>
                    <TableHead>工时</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries.map(entry => {
                    const task = tasks.find(t => t.id === entry.taskId)
                    const project = projects.find(p => p.id === entry.projectId)
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">{entry.employeeName[0]}</AvatarFallback>
                            </Avatar>
                            {entry.employeeName}
                          </div>
                        </TableCell>
                        <TableCell>{project?.name}</TableCell>
                        <TableCell>{task?.title}</TableCell>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {entry.startTime} - {entry.endTime}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{entry.hours}h</span>
                            {entry.billable && (
                              <Badge variant="outline" className="text-xs">计费</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-48 truncate">
                          {entry.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant={entry.approved ? "default" : "secondary"}>
                            {entry.approved ? "已审批" : "待审批"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEditTimeEntry(entry)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!entry.approved && (
                              <Button size="sm" variant="ghost" onClick={() => handleApproveTimeEntry(entry.id)}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resource Allocation */}
        <TabsContent value="resources" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">资源分配</h3>
            <Button variant="outline" onClick={handleOptimizeResourceAllocation}>
              <UserCheck className="h-4 w-4 mr-2" />
              优化分配
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>团队资源利用率</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={resourceUtilizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="allocation" stackId="a" fill="#3b82f6" name="已分配" />
                    <Bar dataKey="available" stackId="a" fill="#e5e7eb" name="可用" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>资源详情</CardTitle>
                <CardDescription>团队成员的详细资源信息</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resources.map(resource => (
                    <div key={resource.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{resource.employeeName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{resource.employeeName}</div>
                            <div className="text-sm text-muted-foreground">{resource.role}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">¥{resource.hourlyRate}/小时</div>
                          <div className="text-sm text-muted-foreground">
                            {resource.allocatedHours}h / {resource.availableHours}h
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>利用率</span>
                          <span>{Math.round(resource.allocation)}%</span>
                        </div>
                        <Progress value={resource.allocation} className="h-2" />
                      </div>
                      <div className="mt-3">
                        <div className="text-sm font-medium mb-1">技能</div>
                        <div className="flex flex-wrap gap-1">
                          {resource.skills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <h3 className="text-lg font-semibold">数据分析</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>项目状态分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <RechartsPie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPie>
                    <Tooltip />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>项目预算对比</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectBudgetData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="budget" fill="#3b82f6" name="预算" />
                    <Bar dataKey="actualCost" fill="#ef4444" name="实际成本" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>项目关键指标</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(projects.filter(p => p.status === 'completed').length / projects.length * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">项目完成率</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(timeEntries.reduce((sum, entry) => sum + entry.hours, 0) /
                      projects.reduce((sum, p) => sum + p.estimatedHours, 0) * 100) || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">工时效率</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    ¥{Math.round(projects.reduce((sum, p) => sum + (p.budget - p.actualCost), 0)).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">预算结余</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">项目报告</h3>
            <div className="flex gap-2">
              <Button onClick={exportProjectReport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                导出项目报告
              </Button>
              <Button onClick={exportTimeReport} variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                导出工时报告
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>项目综合报告</CardTitle>
              <CardDescription>所有项目的详细执行情况和关键指标</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>项目名称</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>进度</TableHead>
                    <TableHead>预算使用</TableHead>
                    <TableHead>工时效率</TableHead>
                    <TableHead>团队规模</TableHead>
                    <TableHead>任务完成</TableHead>
                    <TableHead>ROI</TableHead>
                    <TableHead>风险等级</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map(project => {
                    const report = generateProjectReport(project)
                    return (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>
                          <Badge variant={
                            project.status === 'completed' ? 'default' :
                            project.status === 'active' ? 'secondary' : 'outline'
                          }>
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress} className="w-16 h-2" />
                            <span className="text-sm">{project.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>¥{project.actualCost.toLocaleString()} / ¥{project.budget.toLocaleString()}</div>
                            <div className="text-muted-foreground">
                              {Math.round(project.actualCost / project.budget * 100)}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{report.actualHours}h / {project.estimatedHours}h</div>
                            <div className="text-muted-foreground">{report.efficiency}%</div>
                          </div>
                        </TableCell>
                        <TableCell>{report.teamSize} 人</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {report.tasksCompleted} / {report.tasksTotal}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={report.roi >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {report.roi}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            project.riskLevel === 'critical' ? 'destructive' :
                            project.riskLevel === 'high' ? 'destructive' :
                            project.riskLevel === 'medium' ? 'default' : 'secondary'
                          }>
                            {project.riskLevel}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 项目聊天对话框 */}
      <Dialog open={isProjectChatOpen} onOpenChange={setIsProjectChatOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedProjectChat?.name} - 项目讨论
            </DialogTitle>
            <DialogDescription>
              与项目团队实时交流，分享想法和文件
            </DialogDescription>
          </DialogHeader>

          {selectedProjectChat && (
            <div className="flex h-full">
              {/* 聊天区域 */}
              <div className="flex-1 flex flex-col">
                {/* 聊天消息列表 */}
                <div className="flex-1 p-4 bg-gray-50 rounded-lg overflow-y-auto">
                  <div className="space-y-4">
                    {/* 系统欢迎消息 */}
                    <div className="text-center text-sm text-gray-500 bg-white p-3 rounded-lg">
                      欢迎来到"{selectedProjectChat.name}"项目讨论群
                    </div>

                    {/* 模拟聊天消息 */}
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>PM</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{selectedProjectChat.projectManager}</span>
                          <span className="text-xs text-gray-500">刚刚</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg text-sm">
                          大家好！欢迎加入项目讨论群。让我们高效协作，确保项目顺利进行！
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{currentUser?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{currentUser?.name}</span>
                          <span className="text-xs text-gray-500">刚刚</span>
                        </div>
                        <div className="bg-blue-500 text-white p-3 rounded-lg text-sm">
                          收到！准备开始工作了 💪
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 消息输入区 */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input placeholder="输入消息..." className="flex-1" />
                    <Button size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline">
                      <Paperclip className="h-4 w-4 mr-1" />
                      文件
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const taskDesc = prompt('从讨论中创建任务，请描述任务内容：')
                        if (taskDesc) {
                          createTaskFromChat(selectedProjectChat, taskDesc)
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      创建任务
                    </Button>
                  </div>
                </div>
              </div>

              {/* 项目信息侧栏 */}
              <div className="w-80 border-l p-4 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">项目信息</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">进度</span>
                      <span>{selectedProjectChat.progress}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">预算</span>
                      <span>¥{selectedProjectChat.budget?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">截止时间</span>
                      <span>{selectedProjectChat.endDate}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">团队成员</h4>
                  <div className="space-y-2">
                    {selectedProjectChat.team?.map(memberId => {
                      const member = employees.find(emp => emp.id === memberId)
                      return member ? (
                        <div key={memberId} className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{member.name}</span>
                          <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">快速操作</h4>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      项目文档
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      查看时间线
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      进度报告
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
