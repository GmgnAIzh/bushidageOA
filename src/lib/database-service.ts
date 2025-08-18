// 完整的数据库服务 - 动态部署模式
import { db } from './db'
import {
  users, employees, departments, paymentRequests, approvalRequests,
  announcements, chats, chatMessages, financialTransactions, wallets,
  systemSettings, notifications, userPermissions, auditLogs
} from './db/schema'
import { eq, desc, and, or, like, sql } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// 类型定义
export interface User {
  id: string
  username?: string
  name?: string
  email: string
  passwordHash: string
  role: string
  isActive: boolean
  profile?: string
  createdAt?: string
  updatedAt?: string
  // 兼容旧字段
  department?: string
  position?: string
  avatar?: string
  phone?: string
  status?: string
  joinDate?: string
  lastLogin?: string
}

export type Employee = typeof employees.$inferSelect
export type Department = typeof departments.$inferSelect
export type PaymentRequest = typeof paymentRequests.$inferSelect
export type ApprovalRequest = typeof approvalRequests.$inferSelect
export type Announcement = typeof announcements.$inferSelect
export type Chat = typeof chats.$inferSelect
export type ChatMessage = typeof chatMessages.$inferSelect
export type FinancialTransaction = typeof financialTransactions.$inferSelect
export type Wallet = typeof wallets.$inferSelect
export type SystemSetting = typeof systemSettings.$inferSelect
export type Notification = typeof notifications.$inferSelect
export type UserPermission = typeof userPermissions.$inferSelect
export type AuditLog = typeof auditLogs.$inferSelect

class DatabaseService {
  private currentUser: any = null

  // 初始化数据服务
  async initializeData(): Promise<void> {
    if (typeof window !== 'undefined') {
      // 客户端 - 使用LocalStorage作为后备
      console.log('📦 客户端模式 - 使用LocalStorage')
      this.initializeLocalStorage()
      return
    }

    if (!db) {
      console.error('❌ 数据库未初始化')
      return
    }

    try {
      console.log('🗄️ 使用SQLite数据库')
      await this.initializeDatabase()
    } catch (error) {
      console.error('❌ 数据库初始化失败:', error)
      // 降级到LocalStorage
      this.initializeLocalStorage()
    }
  }

  // 初始化数据库表和默认数据
  private async initializeDatabase(): Promise<void> {
    if (!db) return

    try {
      // 检查是否已有用户数据
      const existingUsers = await db.select().from(users).limit(1)

      if (existingUsers.length === 0) {
        console.log('🌱 初始化默认数据...')
        await this.seedDefaultData()
      }
    } catch (error) {
      console.error('数据库表可能不存在，尝试创建...')
      // 这里可以添加表创建逻辑或运行迁移
    }
  }

  // 初始化默认数据
  private async seedDefaultData(): Promise<void> {
    if (!db) return

    const hashedAdminPassword = await bcrypt.hash('123456', 10)
    const hashedUserPassword = await bcrypt.hash('123456', 10)

    // 插入默认用户
    await db.insert(users).values([
      {
        id: 'user1',
        username: 'admin',
        email: 'admin@company.com',
        passwordHash: hashedAdminPassword,
        role: 'admin',
        isActive: true,
        profile: JSON.stringify({
          name: '系统管理员',
          phone: '13800138000',
          department: '技术部'
        })
      },
      {
        id: 'user2',
        username: 'user',
        email: 'user@company.com',
        passwordHash: hashedUserPassword,
        role: 'user',
        isActive: true,
        profile: JSON.stringify({
          name: '普通用户',
          phone: '13800138001',
          department: '业务部'
        })
      }
    ])

    console.log('✅ 默认数据初始化完成')
  }

  // LocalStorage初始化（客户端后备方案）
  private initializeLocalStorage(): void {
    if (typeof window === 'undefined') return

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
          username: 'admin',
          email: 'admin@company.com',
          passwordHash: '$2b$10$example',
          role: 'admin',
          isActive: true,
          profile: {
            name: '系统管理员',
            phone: '13800138000',
            department: '技术部'
          }
        },
        {
          id: 'user2',
          username: 'user',
          email: 'user@company.com',
          passwordHash: '$2b$10$example',
          role: 'user',
          isActive: true,
          profile: {
            name: '普通用户',
            phone: '13800138001',
            department: '业务部'
          }
        }
      ],
      'oa_employees': [],
      'oa_payment_requests': [],
      'oa_approval_requests': [],
      'oa_announcements': [],
      'oa_chats': [],
      'oa_chat_messages': [],
      'oa_departments': [],
      'oa_transactions': []
    }

    if (defaultData[key]) {
      localStorage.setItem(key, JSON.stringify(defaultData[key]))
    }
  }

  // 用户认证
  async authenticateUser(username: string, password: string): Promise<User | null> {
    if (typeof window !== 'undefined') {
      // 客户端认证
      return this.authenticateUserLocal(username, password)
    }

    if (!db) {
      return this.authenticateUserLocal(username, password)
    }

    try {
      const user = await db.select().from(users)
        .where(eq(users.username, username))
        .limit(1)

      if (user.length > 0 && user[0].isActive) {
        const isValidPassword = await bcrypt.compare(password, user[0].passwordHash)
        if (isValidPassword) {
          this.currentUser = user[0]
          return user[0]
        }
      }
    } catch (error) {
      console.error('数据库认证失败，使用本地认证:', error)
      return this.authenticateUserLocal(username, password)
    }

    return null
  }

  private authenticateUserLocal(username: string, password: string): User | null {
    if (typeof window === 'undefined') return null

    const users = JSON.parse(localStorage.getItem('oa_users') || '[]')
    const user = users.find((u: any) => u.username === username && u.isActive)

    if (user && password === '123456') { // 演示模式
      this.currentUser = user
      return user
    }

    return null
  }

  // 生成JWT令牌
  generateToken(user: User): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    return jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role
      },
      secret,
      { expiresIn: '24h' }
    )
  }

  // 验证JWT令牌
  verifyToken(token: string): any {
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key'
      return jwt.verify(token, secret)
    } catch (error) {
      return null
    }
  }

  // 获取当前用户
  getCurrentUser(): User | null {
    return this.currentUser
  }

  // 用户管理
  async getUsers(): Promise<User[]> {
    if (typeof window !== 'undefined' || !db) {
      const users = JSON.parse(localStorage.getItem('oa_users') || '[]')
      return users
    }

    try {
      return await db.select().from(users)
    } catch (error) {
      console.error('获取用户失败:', error)
      return JSON.parse(localStorage.getItem('oa_users') || '[]')
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser = {
      ...userData,
      id: 'user_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (typeof window !== 'undefined' || !db) {
      const users = JSON.parse(localStorage.getItem('oa_users') || '[]')
      users.push(newUser)
      localStorage.setItem('oa_users', JSON.stringify(users))
      return newUser as User
    }

    try {
      await db.insert(users).values(newUser)
      return newUser as User
    } catch (error) {
      console.error('创建用户失败:', error)
      // 降级到LocalStorage
      const localUsers = JSON.parse(localStorage.getItem('oa_users') || '[]')
      localUsers.push(newUser)
      localStorage.setItem('oa_users', JSON.stringify(localUsers))
      return newUser as User
    }
  }

  // 其他数据操作方法...
  // 这里可以添加更多的CRUD操作方法

}

// 创建单例实例
export const databaseService = new DatabaseService()

// 默认导出便于导入
export default databaseService
