import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core'

// 简单的ID生成函数
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 用户表
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  username: text('username').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull(),
  department: text('department').notNull(),
  position: text('position'),
  avatar: text('avatar'),
  phone: text('phone'),
  status: text('status').notNull().default('active'), // active, inactive, pending
  joinDate: text('join_date').notNull(),
  lastLogin: text('last_login'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
})

// 员工表
export const employees = sqliteTable('employees', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  employeeId: text('employee_id').notNull().unique(),
  name: text('name').notNull(),
  position: text('position').notNull(),
  department: text('department').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  status: text('status').notNull().default('active'),
  joinDate: text('join_date').notNull(),
  salary: text('salary'),
  performance: integer('performance'),
  attendance: integer('attendance'),
  projects: integer('projects'),
  location: text('location'),
  avatar: text('avatar'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// 部门表
export const departments = sqliteTable('departments', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  name: text('name').notNull().unique(),
  manager: text('manager').notNull(),
  managerId: text('manager_id').notNull(),
  employees: integer('employees').notNull().default(0),
  budget: text('budget'),
  description: text('description'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// 支付申请表
export const paymentRequests = sqliteTable('payment_requests', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  title: text('title').notNull(),
  amount: text('amount').notNull(),
  currency: text('currency').notNull(),
  requestor: text('requestor').notNull(),
  requestorId: text('requestor_id').notNull(),
  department: text('department').notNull(),
  status: text('status').notNull().default('pending'), // pending, approved, rejected, completed
  date: text('date').notNull(),
  description: text('description'),
  urgency: text('urgency').notNull().default('normal'), // low, normal, high
  recipient: text('recipient'),
  txHash: text('tx_hash'),
  approver: text('approver'),
  approvalDate: text('approval_date'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// 审批流程表
export const approvalRequests = sqliteTable('approval_requests', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  title: text('title').notNull(),
  type: text('type').notNull(), // leave, expense, purchase, hiring
  applicant: text('applicant').notNull(),
  applicantId: text('applicant_id').notNull(),
  applicantAvatar: text('applicant_avatar'),
  department: text('department').notNull(),
  submitTime: text('submit_time').notNull(),
  currentStep: integer('current_step').notNull().default(1),
  totalSteps: integer('total_steps').notNull(),
  status: text('status').notNull().default('pending'), // pending, approved, rejected
  priority: text('priority').notNull().default('normal'), // low, normal, high
  amount: text('amount'),
  description: text('description').notNull(),
  attachments: text('attachments'), // JSON string array
  approvalFlow: text('approval_flow'), // JSON string
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// 公告表
export const announcements = sqliteTable('announcements', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  title: text('title').notNull(),
  content: text('content').notNull(),
  author: text('author').notNull(),
  authorId: text('author_id').notNull(),
  authorRole: text('author_role').notNull(),
  authorAvatar: text('author_avatar'),
  publishTime: text('publish_time').notNull(),
  category: text('category').notNull(),
  priority: text('priority').notNull().default('normal'), // low, normal, high
  status: text('status').notNull().default('draft'), // draft, published, expired
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  readCount: integer('read_count').notNull().default(0),
  likeCount: integer('like_count').notNull().default(0),
  commentCount: integer('comment_count').notNull().default(0),
  departments: text('departments'), // JSON string array
  attachments: text('attachments'), // JSON string array
  expiryDate: text('expiry_date'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// 聊天室表
export const chats = sqliteTable('chats', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  name: text('name').notNull(),
  type: text('type').notNull(), // personal, group, department, announcement, external
  description: text('description'),
  avatar: text('avatar'),
  participants: text('participants'), // JSON string array
  admins: text('admins'), // JSON string array
  memberCount: integer('member_count').notNull().default(0),
  tags: text('tags'), // JSON string array
  department: text('department'),
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  isMuted: integer('is_muted', { mode: 'boolean' }).notNull().default(false),
  isEncrypted: integer('is_encrypted', { mode: 'boolean' }).notNull().default(true),
  isOnline: integer('is_online', { mode: 'boolean' }).notNull().default(true),
  isOfficial: integer('is_official', { mode: 'boolean' }).notNull().default(false),
  allowInvite: integer('allow_invite', { mode: 'boolean' }).notNull().default(true),
  allowAnnouncement: integer('allow_announcement', { mode: 'boolean' }).notNull().default(false),
  maxMembers: integer('max_members').notNull().default(100),
  approvalRequired: integer('approval_required', { mode: 'boolean' }).notNull().default(false),
  createdBy: text('created_by').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// 聊天消息表
export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  chatId: text('chat_id').notNull(),
  senderId: text('sender_id').notNull(),
  senderName: text('sender_name').notNull(),
  senderAvatar: text('sender_avatar'),
  content: text('content').notNull(),
  type: text('type').notNull().default('text'), // text, image, file, voice, video, announcement, system, call, location, contact
  timestamp: text('timestamp').notNull().$defaultFn(() => new Date().toISOString()),
  editedAt: text('edited_at'),
  replyTo: text('reply_to'),
  mentions: text('mentions'), // JSON string array
  reactions: text('reactions'), // JSON string
  attachments: text('attachments'), // JSON string
  isEncrypted: integer('is_encrypted', { mode: 'boolean' }).notNull().default(true),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
  isAnnouncement: integer('is_announcement', { mode: 'boolean' }).notNull().default(false),
  readBy: text('read_by'), // JSON string array
  status: text('status').notNull().default('sent'), // sending, sent, delivered, read, failed
  priority: text('priority').notNull().default('normal'), // normal, high, urgent
  isFromBot: integer('is_from_bot', { mode: 'boolean' }).notNull().default(false),
  botName: text('bot_name'),
  threadReplies: integer('thread_replies').default(0),
  isForwarded: integer('is_forwarded', { mode: 'boolean' }).notNull().default(false),
  originalSender: text('original_sender'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// 财务交易表
export const financialTransactions = sqliteTable('financial_transactions', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  type: text('type').notNull(), // receive, send
  currency: text('currency').notNull(),
  amount: real('amount').notNull(),
  usdValue: real('usd_value').notNull(),
  fromAddress: text('from_address').notNull(),
  toAddress: text('to_address').notNull(),
  time: text('time').notNull(),
  status: text('status').notNull().default('pending'), // pending, completed, failed
  txHash: text('tx_hash').notNull(),
  fee: real('fee').notNull().default(0),
  category: text('category'),
  description: text('description'),
  tags: text('tags'), // JSON string array
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// 钱包管理表
export const wallets = sqliteTable('wallets', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  employeeId: text('employee_id').notNull(),
  employeeName: text('employee_name').notNull(),
  walletAddress: text('wallet_address').notNull(),
  addressType: text('address_type').notNull().default('TRC20'), // TRC20, ERC20, BTC
  currency: text('currency').notNull().default('USDT'),
  balance: text('balance').notNull().default('0.00'),
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),
  is2FAEnabled: integer('is_2fa_enabled', { mode: 'boolean' }).notNull().default(false),
  qrSecret: text('qr_secret'),
  backupCodes: text('backup_codes'), // JSON string array
  lastModified: text('last_modified'),
  modificationHistory: text('modification_history'), // JSON string
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// 系统设置表
export const systemSettings = sqliteTable('system_settings', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  type: text('type').notNull().default('string'), // string, number, boolean, json
  description: text('description'),
  category: text('category').notNull().default('general'),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// 通知表
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull(), // system, chat, approval, payment, announcement
  priority: text('priority').notNull().default('normal'), // low, normal, high, urgent
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  readAt: text('read_at'),
  data: text('data'), // JSON string for additional data
  expiresAt: text('expires_at'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// 用户权限表
export const userPermissions = sqliteTable('user_permissions', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').notNull(),
  permission: text('permission').notNull(),
  resource: text('resource'), // 可选的资源标识符
  granted: integer('granted', { mode: 'boolean' }).notNull().default(true),
  grantedBy: text('granted_by').notNull(),
  expiresAt: text('expires_at'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// 操作日志表
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  action: text('action').notNull(),
  resource: text('resource').notNull(),
  resourceId: text('resource_id'),
  oldValues: text('old_values'), // JSON string
  newValues: text('new_values'), // JSON string
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  timestamp: text('timestamp').notNull().$defaultFn(() => new Date().toISOString()),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// 导出所有表的类型
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Employee = typeof employees.$inferSelect
export type NewEmployee = typeof employees.$inferInsert

export type Department = typeof departments.$inferSelect
export type NewDepartment = typeof departments.$inferInsert

export type PaymentRequest = typeof paymentRequests.$inferSelect
export type NewPaymentRequest = typeof paymentRequests.$inferInsert

export type ApprovalRequest = typeof approvalRequests.$inferSelect
export type NewApprovalRequest = typeof approvalRequests.$inferInsert

export type Announcement = typeof announcements.$inferSelect
export type NewAnnouncement = typeof announcements.$inferInsert

export type Chat = typeof chats.$inferSelect
export type NewChat = typeof chats.$inferInsert

export type ChatMessage = typeof chatMessages.$inferSelect
export type NewChatMessage = typeof chatMessages.$inferInsert

export type FinancialTransaction = typeof financialTransactions.$inferSelect
export type NewFinancialTransaction = typeof financialTransactions.$inferInsert

export type Wallet = typeof wallets.$inferSelect
export type NewWallet = typeof wallets.$inferInsert

export type SystemSetting = typeof systemSettings.$inferSelect
export type NewSystemSetting = typeof systemSettings.$inferInsert

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert

export type UserPermission = typeof userPermissions.$inferSelect
export type NewUserPermission = typeof userPermissions.$inferInsert

export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert
