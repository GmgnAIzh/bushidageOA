// 自定义Next.js服务器 - 支持Socket.io实时通信
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = process.env.PORT || 3000

// 初始化Next.js应用
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // 创建HTTP服务器
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // 初始化Socket.io（仅在生产环境或当需要时）
  if (process.env.ENABLE_SOCKET === 'true') {
    try {
      // 动态导入Socket.io
      const { Server: SocketIOServer } = require('socket.io')
      const io = new SocketIOServer(httpServer, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        }
      })

      // 基础Socket.io事件处理
      io.on('connection', (socket) => {
        console.log('👤 用户已连接:', socket.id)

        socket.on('join-room', (roomId) => {
          socket.join(roomId)
          console.log(`📍 用户 ${socket.id} 加入房间: ${roomId}`)
        })

        socket.on('leave-room', (roomId) => {
          socket.leave(roomId)
          console.log(`🚪 用户 ${socket.id} 离开房间: ${roomId}`)
        })

        socket.on('chat-message', (data) => {
          socket.to(data.roomId).emit('chat-message', data)
        })

        socket.on('typing', (data) => {
          socket.to(data.roomId).emit('typing', data)
        })

        socket.on('disconnect', () => {
          console.log('👋 用户已断开连接:', socket.id)
        })
      })

      console.log('🚀 Socket.io服务器已启动')

      // 优雅关闭处理
      process.on('SIGTERM', () => {
        console.log('📴 正在关闭Socket.io服务器...')
        io.close(() => {
          console.log('✅ Socket.io服务器已关闭')
          httpServer.close(() => {
            console.log('✅ HTTP服务器已关闭')
            process.exit(0)
          })
        })
      })
    } catch (error) {
      console.warn('⚠️ Socket.io初始化失败，继续使用标准模式:', error.message)
    }
  }

  // 启动服务器
  httpServer
    .once('error', (err) => {
      console.error('❌ 服务器启动失败:', err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`🌟 服务器运行在 http://${hostname}:${port}`)
      if (dev) {
        console.log('🔧 开发模式 - 热重载已启用')
      }
      console.log('📡 WebSocket支持:', process.env.ENABLE_SOCKET === 'true' || !dev ? '✅ 已启用' : '❌ 已禁用')
    })
})

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔴 未处理的Promise拒绝:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('🔴 未捕获的异常:', error)
  process.exit(1)
})
