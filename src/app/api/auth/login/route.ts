import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // 模拟用户验证 - 在实际应用中应该连接真实的数据库
    const validUsers = [
      { username: 'admin', password: '123456', name: '系统管理员', role: 'admin' },
      { username: 'user', password: '123456', name: '普通用户', role: 'user' }
    ]

    const user = validUsers.find(u => u.username === username && u.password === password)

    if (!user) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }

    // 创建用户会话数据
    const userData = {
      id: user.username === 'admin' ? 'admin' : 'user-1',
      name: user.name,
      email: `${user.username}@company.com`,
      role: user.username === 'admin' ? '系统管理员' : '员工',
      department: user.username === 'admin' ? '信息技术部' : '业务部门',
      avatar: '/avatars/default.jpg',
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString(),
      phone: user.username === 'admin' ? '138****0001' : '138****0002'
    }

    return NextResponse.json({
      success: true,
      message: '登录成功',
      user: userData
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
