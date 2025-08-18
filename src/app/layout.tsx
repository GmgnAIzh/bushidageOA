import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "BushidageOA - 企业智慧办公自动化系统",
  description: "全功能企业办公自动化平台，包含员工管理、项目管理、财务管理、实时聊天、日程安排、文档协作等功能",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BushidageOA",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "msapplication-TileColor": "#000000",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BushidageOA" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23000'/><text x='50' y='50' text-anchor='middle' dominant-baseline='central' fill='white' font-size='30'>OA</text></svg>" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
        <Toaster position="top-right" />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('✅ Service Worker registered successfully:', registration.scope);

                      // 检查更新
                      registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', function() {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              // 新的 Service Worker 已安装，提示用户刷新
                              if (confirm('发现新版本，是否立即更新？')) {
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                                window.location.reload();
                              }
                            }
                          });
                        }
                      });
                    })
                    .catch(function(error) {
                      console.log('❌ Service Worker registration failed:', error);
                    });
                });

                // 监听 Service Worker 控制器变化
                navigator.serviceWorker.addEventListener('controllerchange', function() {
                  window.location.reload();
                });
              }

              // PWA 安装提示
              let deferredPrompt;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                deferredPrompt = e;

                // 显示安装提示（可以自定义UI）
                setTimeout(function() {
                  if (confirm('是否将 BushidageOA 添加到主屏幕？')) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then(function(choiceResult) {
                      if (choiceResult.outcome === 'accepted') {
                        console.log('✅ 用户接受了安装提示');
                      } else {
                        console.log('❌ 用户拒绝了安装提示');
                      }
                      deferredPrompt = null;
                    });
                  }
                }, 3000);
              });

              // 监听网络状态
              window.addEventListener('online', function() {
                console.log('🌐 网络已连接');
                document.body.classList.remove('offline');
              });

              window.addEventListener('offline', function() {
                console.log('📡 网络已断开');
                document.body.classList.add('offline');
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
