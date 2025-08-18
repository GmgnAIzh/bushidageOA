// WebSocket客户端服务 - 前端实时通信
'use client'

import { io, Socket } from 'socket.io-client'

// 客户端事件类型
export interface ClientChatMessage {
  id?: string
  roomId: string
  content: string
  type?: 'text' | 'image' | 'file' | 'system'
  replyTo?: string
}

export interface UserPresence {
  userId: string
  userName: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen: string
  currentRoom?: string
}

// Socket客户端管理类
class SocketClient {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnecting = false
  private eventListeners = new Map<string, Function[]>()

  // 连接到WebSocket服务器
  connect(token: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket)
        return
      }

      if (this.isConnecting) {
        // 如果正在连接，等待连接完成
        const checkConnection = () => {
          if (this.socket?.connected) {
            resolve(this.socket)
          } else {
            setTimeout(checkConnection, 100)
          }
        }
        checkConnection()
        return
      }

      this.isConnecting = true

      try {
        // 创建Socket连接
        this.socket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
          auth: { token },
          transports: ['websocket', 'polling'],
          timeout: 10000,
          retries: 3,
          autoConnect: true
        })

        // 连接成功
        this.socket.on('connect', () => {
          console.log('🔗 WebSocket连接成功:', this.socket?.id)
          this.isConnecting = false
          this.reconnectAttempts = 0
          resolve(this.socket!)
        })

        // 连接错误
        this.socket.on('connect_error', (error) => {
          console.error('❌ WebSocket连接失败:', error.message)
          this.isConnecting = false

          // 自动重连逻辑
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(`🔄 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

            setTimeout(() => {
              this.connect(token).then(resolve).catch(reject)
            }, this.reconnectDelay * this.reconnectAttempts)
          } else {
            reject(new Error(`连接失败: ${error.message}`))
          }
        })

        // 断开连接
        this.socket.on('disconnect', (reason) => {
          console.warn('⚠️ WebSocket断开连接:', reason)
          this.isConnecting = false

          // 自动重连（除非是客户端主动断开）
          if (reason !== 'io client disconnect' && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            setTimeout(() => {
              this.connect(token).catch(console.error)
            }, this.reconnectDelay * this.reconnectAttempts)
          }
        })

        // 认证错误
        this.socket.on('error', (error) => {
          console.error('🔴 Socket错误:', error)
          this.isConnecting = false
          reject(new Error(`认证失败: ${error}`))
        })

      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.isConnecting = false
    this.reconnectAttempts = 0
    this.eventListeners.clear()
    console.log('🔌 WebSocket已断开')
  }

  // 检查连接状态
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  // 获取Socket实例
  getSocket(): Socket | null {
    return this.socket
  }

  // === 聊天相关方法 ===

  // 加入聊天房间
  joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('chat:join_room', roomId)
      console.log(`📥 加入房间: ${roomId}`)
    }
  }

  // 离开聊天房间
  leaveRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('chat:leave_room', roomId)
      console.log(`📤 离开房间: ${roomId}`)
    }
  }

  // 发送聊天消息
  sendMessage(message: ClientChatMessage) {
    if (this.socket) {
      this.socket.emit('chat:send_message', {
        ...message,
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })
      console.log(`💬 发送消息到房间: ${message.roomId}`)
    }
  }

  // 发送输入状态
  sendTyping(roomId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('chat:typing', { roomId, isTyping })
    }
  }

  // 标记消息已读
  markMessageRead(roomId: string, messageId: string) {
    if (this.socket) {
      this.socket.emit('chat:mark_read', { roomId, messageId })
    }
  }

  // === 文档协作相关方法 ===

  // 加入文档协作
  joinDocument(documentId: string) {
    if (this.socket) {
      this.socket.emit('doc:join', documentId)
      console.log(`📄 加入文档协作: ${documentId}`)
    }
  }

  // 发送文档编辑操作
  sendDocumentEdit(documentId: string, action: string, data: any) {
    if (this.socket) {
      this.socket.emit('doc:edit', {
        documentId,
        action,
        data,
        timestamp: new Date().toISOString()
      })
    }
  }

  // 发送光标位置
  sendCursor(documentId: string, position: any) {
    if (this.socket) {
      this.socket.emit('doc:cursor', {
        documentId,
        position,
        timestamp: new Date().toISOString()
      })
    }
  }

  // === 视频通话相关方法 ===

  // 发起通话
  initiateCall(targetUserId: string, callType: 'voice' | 'video') {
    if (this.socket) {
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      this.socket.emit('call:initiate', {
        callId,
        targetUserId,
        callType
      })
      return callId
    }
    return null
  }

  // 接听通话
  answerCall(callId: string, targetUserId: string, answer: any) {
    if (this.socket) {
      this.socket.emit('call:answer', {
        callId,
        targetUserId,
        answer
      })
    }
  }

  // 结束通话
  endCall(callId: string, targetUserId: string, reason: string = 'ended') {
    if (this.socket) {
      this.socket.emit('call:end', {
        callId,
        targetUserId,
        reason
      })
    }
  }

  // === 事件监听管理 ===

  // 添加事件监听器
  on(event: string, callback: Function) {
    if (this.socket) {
      this.socket.on(event, callback as any)

      // 保存监听器引用以便后续清理
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, [])
      }
      this.eventListeners.get(event)!.push(callback)
    }
  }

  // 移除事件监听器
  off(event: string, callback?: Function) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback as any)

        // 从引用中移除
        const listeners = this.eventListeners.get(event)
        if (listeners) {
          const index = listeners.indexOf(callback)
          if (index > -1) {
            listeners.splice(index, 1)
          }
        }
      } else {
        this.socket.off(event)
        this.eventListeners.delete(event)
      }
    }
  }

  // 清理所有事件监听器
  removeAllListeners() {
    if (this.socket) {
      this.eventListeners.forEach((_, event) => {
        this.socket!.off(event)
      })
      this.eventListeners.clear()
    }
  }

  // === 便捷方法 ===

  // 监听聊天消息
  onMessage(callback: (message: any) => void) {
    this.on('chat:message_received', callback)
  }

  // 监听用户状态
  onUserPresence(callback: (presence: UserPresence) => void) {
    this.on('user:online', callback)
    this.on('user:offline', callback)
  }

  // 监听输入状态
  onTyping(callback: (data: any) => void) {
    this.on('chat:user_typing', callback)
  }

  // 监听文档协作
  onDocumentEdit(callback: (data: any) => void) {
    this.on('doc:edit_received', callback)
  }

  // 监听通话事件
  onCall(callbacks: {
    incoming?: (data: any) => void
    answered?: (data: any) => void
    ended?: (data: any) => void
  }) {
    if (callbacks.incoming) this.on('call:incoming', callbacks.incoming)
    if (callbacks.answered) this.on('call:answered', callbacks.answered)
    if (callbacks.ended) this.on('call:ended', callbacks.ended)
  }

  // 监听通知
  onNotification(callback: (data: any) => void) {
    this.on('notification:received', callback)
  }
}

// 创建全局Socket客户端实例
let socketClient: SocketClient | null = null

export function getSocketClient(): SocketClient {
  if (!socketClient) {
    socketClient = new SocketClient()
  }
  return socketClient
}

// 便捷的连接方法
export async function connectSocket(token: string): Promise<Socket> {
  const client = getSocketClient()
  return await client.connect(token)
}

// 便捷的断开方法
export function disconnectSocket() {
  if (socketClient) {
    socketClient.disconnect()
  }
}

// 导出类
export { SocketClient }
