import { NextRequest, NextResponse } from 'next/server'
import { databaseService } from '@/lib/database-service'

export async function POST(request: NextRequest) {
  try {
    console.log('开始初始化数据库...')

    // 初始化数据库
    await databaseService.initializeData()

    return NextResponse.json({
      success: true,
      message: '数据库初始化成功',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('数据库初始化失败:', error)
    return NextResponse.json(
      {
        error: '数据库初始化失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // 检查数据库状态
    const users = await databaseService.getUsers()

    return NextResponse.json({
      success: true,
      message: '数据库状态正常',
      userCount: users.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('数据库状态检查失败:', error)
    return NextResponse.json(
      {
        error: '数据库状态检查失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
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
