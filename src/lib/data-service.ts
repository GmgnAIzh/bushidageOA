// 简化的数据管理服务 - 仅使用LocalStorage

// 简化的类型定义
export type User = any
export type Employee = any
export type Department = any
export type PaymentRequest = any
export type ApprovalRequest = any
export type Announcement = any
export type ChatRoom = any
export type ChatMessage = any
export type FinancialTransaction = any

class DataService {
  private currentUser: any = null

  // 初始化数据服务
  async initializeData(): Promise<void> {
    console.log('📦 使用LocalStorage作为数据存储')
    this.initializeLocalStorage()
  }

  private initializeLocalStorage(): void {
    if (typeof window === 'undefined') return

    // 检查并初始化LocalStorage数据
    const storageKeys = [
      'oa_users',
      'oa_employees',
      'oa_payment_requests',
      'oa_approval_requests',
      'oa_announcements',
      'oa_chats',
      'oa_chat_messages',
      'oa_departments',
      'oa_transactions'
    ]

    storageKeys.forEach(key => {
      if (!localStorage.getItem(key)) {
        this.initializeDefaultData(key)
      }
    })
  }

  private initializeDefaultData(key: string): void {
    const defaultData: Record<string, any[]> = {
      'oa_users': [
        {
          id: 'user1',
          name: '张三',
          email: 'zhangsan@company.com',
          role: '技术总监',
          department: '技术部',
          status: 'active',
          joinDate: '2023-01-15',
          phone: '138****1234'
        }
      ],
      'oa_employees': [
        {
          id: 'emp1',
          employeeId: 'EMP001',
          name: '张三',
          position: '技术总监',
          department: '技术部',
          email: 'zhangsan@company.com',
          status: 'active',
          joinDate: '2023-01-15',
          salary: '₮ 8,000',
          performance: 95,
          attendance: 98,
          projects: 12
        }
      ],
      'oa_departments': [
        {
          id: 'dept1',
          name: '技术部',
          manager: '张三',
          managerId: 'user1',
          employees: 8,
          budget: '₮ 65,000',
          description: '负责产品技术开发和维护'
        }
      ],
      'oa_announcements': [
        {
          id: 'ann1',
          title: '欢迎使用企业OA系统',
          content: '各位同事，欢迎使用企业OA办公系统！',
          author: '系统管理员',
          authorId: 'admin',
          authorRole: '系统管理员',
          publishTime: this.getCurrentDateTime(),
          category: 'general',
          priority: 'high',
          status: 'published',
          isPinned: true,
          readCount: 0,
          likeCount: 0,
          commentCount: 0,
          departments: ['全公司'],
          attachments: []
        }
      ]
    }

    if (defaultData[key]) {
      localStorage.setItem(key, JSON.stringify(defaultData[key]))
    } else {
      localStorage.setItem(key, JSON.stringify([]))
    }
  }

  // 当前用户管理
  getCurrentUser(): any {
    if (typeof window === 'undefined') return null
    const user = localStorage.getItem('oa_current_user')
    return user ? JSON.parse(user) : null
  }

  setCurrentUser(user: any): void {
    this.currentUser = user

    if (typeof window !== 'undefined') {
      if (user === null) {
        localStorage.removeItem('oa_current_user')
      } else {
        localStorage.setItem('oa_current_user', JSON.stringify(user))
      }
    }
  }

  // 用户管理
  getUsers(): any[] {
    if (typeof window === 'undefined') return []
    const users = localStorage.getItem('oa_users')
    return users ? JSON.parse(users) : []
  }

  addUser(user: any): any {
    const newUser = {
      id: this.generateId(),
      ...user,
      createdAt: this.getCurrentDateTime()
    }

    const users = this.getUsers()
    users.push(newUser)

    if (typeof window !== 'undefined') {
      localStorage.setItem('oa_users', JSON.stringify(users))
    }

    return newUser
  }

  updateUser(userId: string, updates: any): any {
    const users = this.getUsers()
    const index = users.findIndex(u => u.id === userId)
    if (index !== -1) {
      users[index] = { ...users[index], ...updates }
      if (typeof window !== 'undefined') {
        localStorage.setItem('oa_users', JSON.stringify(users))
      }
      return users[index]
    }
    return null
  }

  deleteUser(userId: string): boolean {
    const users = this.getUsers()
    const filteredUsers = users.filter(u => u.id !== userId)

    if (typeof window !== 'undefined') {
      localStorage.setItem('oa_users', JSON.stringify(filteredUsers))
    }

    return true
  }

  // 员工管理
  getEmployees(): any[] {
    if (typeof window === 'undefined') return []
    const employees = localStorage.getItem('oa_employees')
    return employees ? JSON.parse(employees) : []
  }

  addEmployee(employee: any): any {
    const newEmployee = {
      id: this.generateId(),
      ...employee,
      createdAt: this.getCurrentDateTime()
    }

    const employees = this.getEmployees()
    employees.push(newEmployee)

    if (typeof window !== 'undefined') {
      localStorage.setItem('oa_employees', JSON.stringify(employees))
    }

    return newEmployee
  }

  updateEmployee(employeeId: string, updates: any): any {
    const employees = this.getEmployees()
    const index = employees.findIndex(e => e.id === employeeId)
    if (index !== -1) {
      employees[index] = { ...employees[index], ...updates, updatedAt: this.getCurrentDateTime() }
      if (typeof window !== 'undefined') {
        localStorage.setItem('oa_employees', JSON.stringify(employees))
      }
      return employees[index]
    }
    return null
  }

  deleteEmployee(employeeId: string): boolean {
    const employees = this.getEmployees()
    const index = employees.findIndex(e => e.id === employeeId)
    if (index !== -1) {
      employees.splice(index, 1)
      if (typeof window !== 'undefined') {
        localStorage.setItem('oa_employees', JSON.stringify(employees))
      }
      return true
    }
    return false
  }

  saveEmployees(employees: any[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('oa_employees', JSON.stringify(employees))
    }
  }

  saveUsers(users: any[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('oa_users', JSON.stringify(users))
    }
  }

  saveDepartments(departments: any[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('oa_departments', JSON.stringify(departments))
    }
  }

  // 部门管理
  getDepartments(): any[] {
    if (typeof window === 'undefined') return []
    const departments = localStorage.getItem('oa_departments')
    return departments ? JSON.parse(departments) : []
  }

  // 支付申请管理
  getPaymentRequests(): any[] {
    if (typeof window === 'undefined') return []
    const requests = localStorage.getItem('oa_payment_requests')
    return requests ? JSON.parse(requests) : []
  }

  addPaymentRequest(request: any): any {
    const newRequest = {
      id: this.generateId(),
      ...request,
      createdAt: this.getCurrentDateTime()
    }

    const requests = this.getPaymentRequests()
    requests.unshift(newRequest)

    if (typeof window !== 'undefined') {
      localStorage.setItem('oa_payment_requests', JSON.stringify(requests))
    }

    return newRequest
  }

  updatePaymentRequest(requestId: string, updates: any): any {
    const requests = this.getPaymentRequests()
    const index = requests.findIndex(r => r.id === requestId)
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates }
      if (typeof window !== 'undefined') {
        localStorage.setItem('oa_payment_requests', JSON.stringify(requests))
      }
      return requests[index]
    }
    return null
  }

  savePaymentRequests(requests: any[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('oa_payment_requests', JSON.stringify(requests))
    }
  }

  // 审批流程管理
  getApprovalRequests(): any[] {
    if (typeof window === 'undefined') return []
    const requests = localStorage.getItem('oa_approval_requests')
    return requests ? JSON.parse(requests) : []
  }

  saveApprovalRequests(requests: any[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('oa_approval_requests', JSON.stringify(requests))
    }
  }

  // 公告管理
  getAnnouncements(): any[] {
    if (typeof window === 'undefined') return []
    const announcements = localStorage.getItem('oa_announcements')
    return announcements ? JSON.parse(announcements) : []
  }

  saveAnnouncements(announcements: any[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('oa_announcements', JSON.stringify(announcements))
    }
  }

  // 聊天管理
  getChats(): any[] {
    if (typeof window === 'undefined') return []
    const chats = localStorage.getItem('oa_chats')
    return chats ? JSON.parse(chats) : []
  }

  saveChats(chats: any[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('oa_chats', JSON.stringify(chats))
    }
  }

  getChatMessages(chatId: string): any[] {
    if (typeof window === 'undefined') return []
    const allMessages = localStorage.getItem('oa_chat_messages')
    const messages = allMessages ? JSON.parse(allMessages) : []
    return messages.filter((m: any) => m.chatId === chatId)
  }

  addChatMessage(message: any): void {
    if (typeof window === 'undefined') return
    const allMessages = localStorage.getItem('oa_chat_messages')
    const messages = allMessages ? JSON.parse(allMessages) : []
    messages.push(message)
    localStorage.setItem('oa_chat_messages', JSON.stringify(messages))
  }

  // 财务交易管理
  getTransactions(): any[] {
    if (typeof window === 'undefined') return []
    const transactions = localStorage.getItem('oa_transactions')
    return transactions ? JSON.parse(transactions) : []
  }

  saveTransactions(transactions: any[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('oa_transactions', JSON.stringify(transactions))
    }
  }

  addTransaction(transaction: any): void {
    const transactions = this.getTransactions()
    transactions.unshift(transaction)
    this.saveTransactions(transactions)
  }

  // 工具方法
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  getCurrentDateTime(): string {
    return new Date().toLocaleString('zh-CN')
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0]
  }

  logout(): void {
    this.setCurrentUser(null)
  }
}

export const dataService = new DataService()
