// WebSocket服务器配置 - 实时通信核心
import { Server as SocketIOServer } from 'socket.io'
import { Server as HttpServer } from 'http'
import jwt from 'jsonwebtoken'

// WebSocket事件类型定义
export interface ChatMessage {
  id: string
  roomId: string
  userId: string
  userName: string
  content: string
  type: 'text' | 'image' | 'file' | 'system'
  timestamp: string
  replyTo?: string
  status: 'sending' | 'sent' | 'delivered' | 'read'
}

export interface UserPresence {
  userId: string
  userName: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen: string
  currentRoom?: string
}

export interface TypingIndicator {
  userId: string
  userName: string
  roomId: string
  isTyping: boolean
}

export interface DocumentCollaboration {
  documentId: string
  userId: string
  userName: string
  action: 'edit' | 'cursor' | 'selection'
  data: any
  timestamp: string
}

// 在线用户管理
const onlineUsers = new Map<string, UserPresence>()
const userSockets = new Map<string, string>() // userId -> socketId
const roomUsers = new Map<string, Set<string>>() // roomId -> Set<userId>

export function initializeSocketServer(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? ["https://your-domain.com"]
        : ["http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  })

  // 中间件：JWT认证
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')

      if (!token) {
        return next(new Error('Authentication error: No token provided'))
      }

      const secret = process.env.JWT_SECRET || 'your-secret-key'
      const decoded = jwt.verify(token, secret) as any

      socket.userId = decoded.userId
      socket.userName = decoded.username || decoded.name || 'Unknown'
      socket.userRole = decoded.role || 'user'

      next()
    } catch (error) {
      console.error('Socket authentication failed:', error)
      next(new Error('Authentication error: Invalid token'))
    }
  })

  // 连接处理
  io.on('connection', (socket) => {
    const userId = socket.userId
    const userName = socket.userName

    console.log(`🔗 用户连接: ${userName} (${userId})`)

    // 用户上线
    handleUserOnline(socket, userId, userName)

    // 聊天消息处理
    socket.on('chat:join_room', (roomId: string) => {
      handleJoinRoom(socket, roomId, userId)
    })

    socket.on('chat:leave_room', (roomId: string) => {
      handleLeaveRoom(socket, roomId, userId)
    })

    socket.on('chat:send_message', (messageData: Partial<ChatMessage>) => {
      handleSendMessage(io, socket, messageData, userId, userName)
    })

    socket.on('chat:typing', (data: { roomId: string; isTyping: boolean }) => {
      handleTyping(socket, data, userId, userName)
    })

    socket.on('chat:mark_read', (data: { roomId: string; messageId: string }) => {
      handleMarkRead(io, socket, data, userId)
    })

    // 文档协作处理
    socket.on('doc:join', (documentId: string) => {
      handleDocumentJoin(socket, documentId, userId, userName)
    })

    socket.on('doc:edit', (data: DocumentCollaboration) => {
      handleDocumentEdit(io, socket, data)
    })

    socket.on('doc:cursor', (data: any) => {
      handleDocumentCursor(socket, data)
    })

    // 视频通话处理
    socket.on('call:initiate', (data: any) => {
      handleCallInitiate(io, socket, data)
    })

    socket.on('call:answer', (data: any) => {
      handleCallAnswer(io, socket, data)
    })

    socket.on('call:end', (data: any) => {
      handleCallEnd(io, socket, data)
    })

    // 系统通知
    socket.on('notification:send', (data: any) => {
      handleNotification(io, socket, data)
    })

    // 断开连接处理
    socket.on('disconnect', (reason) => {
      console.log(`❌ 用户断开: ${userName} (${userId}), 原因: ${reason}`)
      handleUserOffline(io, userId)
    })

    // 错误处理
    socket.on('error', (error) => {
      console.error(`🔴 Socket错误 (${userName}):`, error)
    })
  })

  return io
}

// 用户上线处理
function handleUserOnline(socket: any, userId: string, userName: string) {
  const userPresence: UserPresence = {
    userId,
    userName,
    status: 'online',
    lastSeen: new Date().toISOString()
  }

  onlineUsers.set(userId, userPresence)
  userSockets.set(userId, socket.id)

  // 通知其他用户此用户上线
  socket.broadcast.emit('user:online', userPresence)

  // 发送当前在线用户列表
  socket.emit('users:online_list', Array.from(onlineUsers.values()))
}

// 用户下线处理
function handleUserOffline(io: SocketIOServer, userId: string) {
  const userPresence = onlineUsers.get(userId)
  if (userPresence) {
    userPresence.status = 'offline'
    userPresence.lastSeen = new Date().toISOString()

    // 通知其他用户此用户下线
    io.emit('user:offline', userPresence)

    // 从在线列表移除
    onlineUsers.delete(userId)
    userSockets.delete(userId)

    // 从所有房间移除
    roomUsers.forEach((users, roomId) => {
      if (users.has(userId)) {
        users.delete(userId)
        if (users.size === 0) {
          roomUsers.delete(roomId)
        } else {
          io.to(roomId).emit('room:user_left', { userId, roomId })
        }
      }
    })
  }
}

// 加入房间
function handleJoinRoom(socket: any, roomId: string, userId: string) {
  socket.join(roomId)

  if (!roomUsers.has(roomId)) {
    roomUsers.set(roomId, new Set())
  }
  roomUsers.get(roomId)!.add(userId)

  // 更新用户状态
  const userPresence = onlineUsers.get(userId)
  if (userPresence) {
    userPresence.currentRoom = roomId
  }

  // 通知房间内其他用户
  socket.to(roomId).emit('room:user_joined', {
    userId,
    userName: socket.userName,
    roomId
  })

  console.log(`📥 用户 ${socket.userName} 加入房间 ${roomId}`)
}

// 离开房间
function handleLeaveRoom(socket: any, roomId: string, userId: string) {
  socket.leave(roomId)

  const roomUserSet = roomUsers.get(roomId)
  if (roomUserSet) {
    roomUserSet.delete(userId)
    if (roomUserSet.size === 0) {
      roomUsers.delete(roomId)
    }
  }

  // 通知房间内其他用户
  socket.to(roomId).emit('room:user_left', { userId, roomId })

  console.log(`📤 用户 ${socket.userName} 离开房间 ${roomId}`)
}

// 发送消息
function handleSendMessage(
  io: SocketIOServer,
  socket: any,
  messageData: Partial<ChatMessage>,
  userId: string,
  userName: string
) {
  const message: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    roomId: messageData.roomId!,
    userId,
    userName,
    content: messageData.content || '',
    type: messageData.type || 'text',
    timestamp: new Date().toISOString(),
    replyTo: messageData.replyTo,
    status: 'sent'
  }

  // 广播到房间内所有用户
  io.to(message.roomId).emit('chat:message_received', message)

  // 发送已送达确认给发送者
  socket.emit('chat:message_delivered', {
    tempId: messageData.id,
    messageId: message.id
  })

  console.log(`💬 消息发送: ${userName} -> 房间 ${message.roomId}`)
}

// 处理输入状态
function handleTyping(
  socket: any,
  data: { roomId: string; isTyping: boolean },
  userId: string,
  userName: string
) {
  const typingData: TypingIndicator = {
    userId,
    userName,
    roomId: data.roomId,
    isTyping: data.isTyping
  }

  // 通知房间内其他用户（不包括发送者）
  socket.to(data.roomId).emit('chat:user_typing', typingData)
}

// 标记已读
function handleMarkRead(
  io: SocketIOServer,
  socket: any,
  data: { roomId: string; messageId: string },
  userId: string
) {
  // 通知房间内其他用户消息已被读取
  socket.to(data.roomId).emit('chat:message_read', {
    messageId: data.messageId,
    readBy: userId,
    timestamp: new Date().toISOString()
  })
}

// 文档协作 - 加入文档
function handleDocumentJoin(socket: any, documentId: string, userId: string, userName: string) {
  const docRoom = `doc_${documentId}`
  socket.join(docRoom)

  socket.to(docRoom).emit('doc:user_joined', {
    documentId,
    userId,
    userName
  })

  console.log(`📄 用户 ${userName} 开始协作文档 ${documentId}`)
}

// 文档协作 - 编辑
function handleDocumentEdit(io: SocketIOServer, socket: any, data: DocumentCollaboration) {
  const docRoom = `doc_${data.documentId}`

  // 广播编辑操作到其他协作者
  socket.to(docRoom).emit('doc:edit_received', {
    ...data,
    timestamp: new Date().toISOString()
  })
}

// 文档协作 - 光标位置
function handleDocumentCursor(socket: any, data: any) {
  const docRoom = `doc_${data.documentId}`

  socket.to(docRoom).emit('doc:cursor_moved', data)
}

// 视频通话 - 发起
function handleCallInitiate(io: SocketIOServer, socket: any, data: any) {
  const targetSocketId = userSockets.get(data.targetUserId)
  if (targetSocketId) {
    io.to(targetSocketId).emit('call:incoming', {
      callId: data.callId,
      fromUserId: socket.userId,
      fromUserName: socket.userName,
      callType: data.callType // 'voice' | 'video'
    })
  }
}

// 视频通话 - 接听
function handleCallAnswer(io: SocketIOServer, socket: any, data: any) {
  const targetSocketId = userSockets.get(data.targetUserId)
  if (targetSocketId) {
    io.to(targetSocketId).emit('call:answered', {
      callId: data.callId,
      answer: data.answer
    })
  }
}

// 视频通话 - 结束
function handleCallEnd(io: SocketIOServer, socket: any, data: any) {
  const targetSocketId = userSockets.get(data.targetUserId)
  if (targetSocketId) {
    io.to(targetSocketId).emit('call:ended', {
      callId: data.callId,
      reason: data.reason
    })
  }
}

// 系统通知
function handleNotification(io: SocketIOServer, socket: any, data: any) {
  if (data.targetUserId) {
    // 发送给特定用户
    const targetSocketId = userSockets.get(data.targetUserId)
    if (targetSocketId) {
      io.to(targetSocketId).emit('notification:received', data)
    }
  } else if (data.targetRole) {
    // 发送给特定角色的用户
    onlineUsers.forEach((presence, userId) => {
      const socketId = userSockets.get(userId)
      if (socketId) {
        // 这里需要检查用户角色，暂时广播给所有人
        io.to(socketId).emit('notification:received', data)
      }
    })
  } else {
    // 广播给所有在线用户
    io.emit('notification:received', data)
  }
}

// 获取在线用户数量
export function getOnlineUserCount(): number {
  return onlineUsers.size
}

// 获取房间用户数量
export function getRoomUserCount(roomId: string): number {
  return roomUsers.get(roomId)?.size || 0
}

// 扩展Socket类型
declare module 'socket.io' {
  interface Socket {
    userId: string
    userName: string
    userRole: string
  }
}
