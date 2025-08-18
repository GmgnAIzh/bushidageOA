import { NextRequest, NextResponse } from 'next/server'
import { databaseService } from '@/lib/database-service'

// 验证认证中间件
function verifyAuth(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return null
  }

  return databaseService.verifyToken(token)
}

export async function GET(request: NextRequest) {
  try {
    // 验证认证
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    // 初始化数据库
    await databaseService.initializeData()

    // 获取用户列表
    const users = await databaseService.getUsers()

    // 移除敏感信息
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      profile: typeof user.profile === 'string'
        ? JSON.parse(user.profile)
        : user.profile,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }))

    return NextResponse.json({
      success: true,
      users: safeUsers,
      total: safeUsers.length
    })

  } catch (error) {
    console.error('获取用户列表失败:', error)
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证认证
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    // 检查权限（只有管理员可以创建用户）
    if (auth.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    const userData = await request.json()

    // 验证必填字段
    if (!userData.username || !userData.email || !userData.password) {
      return NextResponse.json(
        { error: '用户名、邮箱和密码不能为空' },
        { status: 400 }
      )
    }

    // 初始化数据库
    await databaseService.initializeData()

    // 创建用户
    const newUser = await databaseService.createUser({
      username: userData.username,
      email: userData.email,
      passwordHash: userData.password, // 在实际应用中应该加密
      role: userData.role || 'user',
      isActive: userData.isActive !== false,
      profile: JSON.stringify(userData.profile || {})
    })

    // 返回安全的用户数据
    const safeUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.isActive,
      profile: typeof newUser.profile === 'string'
        ? JSON.parse(newUser.profile)
        : newUser.profile,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    }

    return NextResponse.json({
      success: true,
      message: '用户创建成功',
      user: safeUser
    })

  } catch (error) {
    console.error('创建用户失败:', error)
    return NextResponse.json(
      { error: '创建用户失败' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
