// BushidageOA Service Worker - 离线支持和缓存管理
const CACHE_NAME = 'bushidageoa-v1.0.0'
const OFFLINE_URL = '/offline.html'

// 需要缓存的静态资源
const STATIC_CACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// 运行时缓存的资源模式
const RUNTIME_CACHE_PATTERNS = [
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/,
  /^https:\/\/cdn\./,
  /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/
]

// 安装事件 - 预缓存静态资源
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...')

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Caching static resources')
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('❌ Service Worker: Installation failed:', error)
      })
  )
})

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activating...')

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete')
        return self.clients.claim()
      })
  )
})

// 获取事件 - 网络请求拦截和缓存策略
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // 跳过非GET请求
  if (request.method !== 'GET') {
    return
  }

  // 跳过浏览器扩展请求
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return
  }

  // API请求 - 网络优先，失败时返回离线提示
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // 缓存成功的API响应
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseClone))
          }
          return response
        })
        .catch(() => {
          // API离线时返回缓存的响应或错误信息
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse
            }
            return new Response(JSON.stringify({
              error: 'offline',
              message: '网络连接不可用，请检查网络设置'
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            })
          })
        })
    )
    return
  }

  // HTML页面 - 网络优先，失败时返回离线页面
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // 缓存成功的页面响应
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseClone))
          }
          return response
        })
        .catch(() => {
          // 页面离线时返回缓存的页面或离线页面
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse
            }
            return caches.match(OFFLINE_URL)
          })
        })
    )
    return
  }

  // 静态资源 - 缓存优先，失败时网络请求
  const shouldCache = RUNTIME_CACHE_PATTERNS.some(pattern =>
    pattern.test(request.url)
  )

  if (shouldCache) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // 后台更新缓存
            fetch(request)
              .then(response => {
                if (response.ok) {
                  caches.open(CACHE_NAME)
                    .then(cache => cache.put(request, response.clone()))
                }
              })
              .catch(() => {}) // 静默失败

            return cachedResponse
          }

          // 缓存中没有，尝试网络请求
          return fetch(request)
            .then(response => {
              if (response.ok) {
                const responseClone = response.clone()
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(request, responseClone))
              }
              return response
            })
        })
    )
    return
  }

  // 其他请求直接通过网络
  event.respondWith(fetch(request))
})

// 后台同步事件
self.addEventListener('sync', event => {
  console.log('🔄 Service Worker: Background sync triggered:', event.tag)

  if (event.tag === 'background-sync-chat') {
    event.waitUntil(syncChatMessages())
  }

  if (event.tag === 'background-sync-notifications') {
    event.waitUntil(syncNotifications())
  }
})

// 推送通知事件
self.addEventListener('push', event => {
  console.log('📢 Service Worker: Push notification received')

  let notificationData = {
    title: 'BushidageOA',
    body: '您有新的通知',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'default',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: '查看',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: '忽略',
        icon: '/icons/dismiss.png'
      }
    ]
  }

  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = { ...notificationData, ...data }
    } catch (e) {
      notificationData.body = event.data.text()
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  )
})

// 通知点击事件
self.addEventListener('notificationclick', event => {
  console.log('👆 Service Worker: Notification clicked:', event.action)

  event.notification.close()

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// 消息事件 - 与主线程通信
self.addEventListener('message', event => {
  console.log('💬 Service Worker: Message received:', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

// 辅助函数：同步聊天消息
async function syncChatMessages() {
  try {
    // 获取离线期间的聊天消息
    const offlineMessages = await getOfflineMessages()

    if (offlineMessages.length > 0) {
      // 发送到服务器
      const response = await fetch('/api/chat/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: offlineMessages })
      })

      if (response.ok) {
        await clearOfflineMessages()
        console.log('✅ Chat messages synced successfully')
      }
    }
  } catch (error) {
    console.error('❌ Failed to sync chat messages:', error)
  }
}

// 辅助函数：同步通知
async function syncNotifications() {
  try {
    const response = await fetch('/api/notifications/unread')

    if (response.ok) {
      const notifications = await response.json()

      // 显示未读通知
      for (const notification of notifications) {
        await self.registration.showNotification(notification.title, {
          body: notification.body,
          icon: '/icons/icon-192x192.png',
          tag: notification.id,
          data: notification
        })
      }
    }
  } catch (error) {
    console.error('❌ Failed to sync notifications:', error)
  }
}

// 辅助函数：获取离线消息
async function getOfflineMessages() {
  // 从IndexedDB或localStorage获取离线消息
  return []
}

// 辅助函数：清除离线消息
async function clearOfflineMessages() {
  // 清除已同步的离线消息
}
