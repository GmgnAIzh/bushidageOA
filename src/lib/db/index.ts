// 完整的数据库配置 - 动态部署模式
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'path'

// 数据库文件路径
const dbPath = path.join(process.cwd(), 'database.sqlite')

let sqlite: Database.Database | null = null
let db: any = null

if (typeof window === 'undefined') {
  // 服务器端 - 初始化数据库
  try {
    sqlite = new Database(dbPath)

    // 启用外键约束
    sqlite.pragma('foreign_keys = ON')

    // 创建 drizzle 实例
    db = drizzle(sqlite, { schema })

    console.log('✅ 数据库连接成功:', dbPath)
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
  }
} else {
  // 客户端 - 设置为null
  sqlite = null
  db = null
}

export { db, sqlite }
export * from './schema'
