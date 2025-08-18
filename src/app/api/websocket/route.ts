import { NextRequest, NextResponse } from 'next/server'

// WebSocket连接管理
const connections = new Map<string, WebSocket>()
const rooms = new Map<string, Set<string>>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const room = searchParams.get('room')

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID是必需的' },
        { status: 400 }
      )
    }

    // 返回WebSocket连接信息
    return NextResponse.json({
      success: true,
      message: 'WebSocket服务已就绪',
      endpoint: process.env.WEBSOCKET_URL || 'ws://localhost:3001',
      userId,
      room,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('WebSocket服务错误:', error)
    return NextResponse.json(
      { error: 'WebSocket服务错误' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, userId, room, message } = await request.json()

    switch (action) {
      case 'send_message':
        // 广播消息到房间内的所有用户
        return broadcastToRoom(room, {
          type: 'message',
          data: {
            id: `msg_${Date.now()}`,
            userId,
            room,
            content: message.content,
            timestamp: new Date().toISOString(),
            type: message.type || 'text'
          }
        })

      case 'join_room':
        // 用户加入房间
        return joinRoom(userId, room)

      case 'leave_room':
        // 用户离开房间
        return leaveRoom(userId, room)

      case 'get_online_users':
        // 获取在线用户列表
        return getOnlineUsers(room)

      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('WebSocket操作错误:', error)
    return NextResponse.json(
      { error: 'WebSocket操作失败' },
      { status: 500 }
    )
  }
}

// 广播消息到房间
async function broadcastToRoom(roomId: string, message: any) {
  const roomUsers = rooms.get(roomId)
  if (!roomUsers) {
    return NextResponse.json({
      success: false,
      message: '房间不存在'
    })
  }

  const broadcastResult = {
    success: true,
    message: '消息已广播',
    recipients: roomUsers.size,
    timestamp: new Date().toISOString()
  }

  // 这里在实际应用中会通过WebSocket发送消息
  // 现在返回模拟的成功响应
  return NextResponse.json(broadcastResult)
}

// 用户加入房间
async function joinRoom(userId: string, roomId: string) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set())
  }

  rooms.get(roomId)!.add(userId)

  return NextResponse.json({
    success: true,
    message: `用户 ${userId} 已加入房间 ${roomId}`,
    roomUsers: Array.from(rooms.get(roomId)!),
    timestamp: new Date().toISOString()
  })
}

// 用户离开房间
async function leaveRoom(userId: string, roomId: string) {
  const room = rooms.get(roomId)
  if (room) {
    room.delete(userId)
    if (room.size === 0) {
      rooms.delete(roomId)
    }
  }

  return NextResponse.json({
    success: true,
    message: `用户 ${userId} 已离开房间 ${roomId}`,
    timestamp: new Date().toISOString()
  })
}

// 获取在线用户
async function getOnlineUsers(roomId: string) {
  const roomUsers = rooms.get(roomId)

  return NextResponse.json({
    success: true,
    room: roomId,
    onlineUsers: roomUsers ? Array.from(roomUsers) : [],
    total: roomUsers ? roomUsers.size : 0,
    timestamp: new Date().toISOString()
  })
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
