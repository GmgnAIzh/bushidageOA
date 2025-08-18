# 🏢 BushidageOA - 企业智慧办公自动化系统

<div align="center">

![BushidageOA Logo](https://img.shields.io/badge/BushidageOA-企业办公自动化-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**现代化的企业办公自动化平台，集成员工管理、项目协作、财务管理、实时通信等核心功能**

[🚀 在线演示](#演示) · [📖 功能介绍](#功能特性) · [🛠️ 安装部署](#安装部署) · [📋 使用说明](#使用说明)

</div>

## 📋 目录

- [功能特性](#功能特性)
- [技术架构](#技术架构)
- [安装部署](#安装部署)
- [使用说明](#使用说明)
- [演示账号](#演示账号)
- [项目结构](#项目结构)
- [开发指南](#开发指南)
- [部署方案](#部署方案)
- [常见问题](#常见问题)
- [更新日志](#更新日志)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

## ✨ 功能特性

### 💼 核心业务模块

#### 👥 员工管理系统
- ✅ **完整的HR功能** - 员工档案、部门组织架构
- ✅ **权限角色管理** - 多级权限控制、角色分配
- ✅ **考勤管理** - 上下班打卡、请假审批
- ✅ **绩效评估** - 员工评价、KPI管理

#### 💰 TRC20钱包管理
- ✅ **多重安全验证** - Google Authenticator + SMS + Email
- ✅ **TRC20地址验证** - 智能地址格式检测
- ✅ **交易记录追踪** - 完整的资金流水记录
- ✅ **余额实时查询** - 支持多种数字货币

#### 📊 项目管理平台
- ✅ **敏捷项目管理** - 看板、甘特图、里程碑
- ✅ **任务分配追踪** - 任务状态、进度监控
- ✅ **团队协作** - 成员分配、权限管理
- ✅ **时间管理** - 工时统计、效率分析

#### 💹 财务管理系统
- ✅ **财务报表生成** - 收支统计、利润分析
- ✅ **预算管理** - 预算制定、执行监控
- ✅ **发票管理** - 电子发票、税务管理
- ✅ **资金流向分析** - 可视化图表展示

### 💬 实时通信系统

#### 🚀 企业级聊天
- ✅ **类企业微信体验** - 现代化聊天界面
- ✅ **群组管理** - 部门群、项目群、临时群
- ✅ **文件传输** - 支持图片、文档、视频分享
- ✅ **消息状态** - 已读、未读、消息回执
- ✅ **@提醒功能** - 成员提醒、关键词通知
- ✅ **表情回应** - 丰富的表情包支持

#### 📡 WebSocket实时通信
- ✅ **消息实时推送** - 毫秒级消息传递
- ✅ **在线状态显示** - 实时在线、离线状态
- ✅ **输入状态提示** - "正在输入..."提示
- ✅ **断线重连** - 自动重连机制

### 📅 智能日程管理

#### 🗓️ 会议管理
- ✅ **会议室预订** - 会议室状态管理
- ✅ **邀请协作** - 成员邀请、日程同步
- ✅ **提醒通知** - 多种提醒方式
- ✅ **视频会议集成** - 支持在线会议

#### ⏰ 任务提醒
- ✅ **智能提醒** - 基于优先级的提醒策略
- ✅ **循环任务** - 支持重复任务设置
- ✅ **时间分析** - 工作时间统计分析

### 📄 文档协作平台

#### 📝 协作编辑
- ✅ **实时协作** - 多人同时编辑
- ✅ **版本控制** - 文档版本历史管理
- ✅ **权限管理** - 查看、编辑、管理权限
- ✅ **评论系统** - 文档评论、讨论功能

#### 📁 文件管理
- ✅ **文件分类** - 智能文件夹管理
- ✅ **搜索功能** - 全文搜索、标签搜索
- ✅ **分享链接** - 安全的文件分享

### 🔐 安全认证体系

#### 🛡️ 多重安全保障
- ✅ **JWT身份认证** - 安全的token机制
- ✅ **bcrypt密码加密** - 高强度密码保护
- ✅ **Google Authenticator** - 两步验证
- ✅ **IP白名单** - 访问IP限制
- ✅ **操作日志** - 完整的操作追踪

### 📱 PWA移动端支持

#### 📲 移动优先设计
- ✅ **响应式设计** - 适配各种屏幕尺寸
- ✅ **PWA支持** - 可安装到手机主屏幕
- ✅ **离线功能** - 基本功能离线可用
- ✅ **推送通知** - 消息推送提醒
- ✅ **触摸优化** - 友好的触摸交互

## 🔧 技术架构

### 前端技术栈
- **框架**: Next.js 15 + React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS + CSS Modules
- **组件库**: Radix UI + shadcn/ui
- **状态管理**: React Hooks + Context
- **路由**: Next.js App Router
- **构建工具**: Bun + Turbopack

### 后端技术栈
- **运行时**: Node.js + Bun
- **数据库**: SQLite + Drizzle ORM
- **身份认证**: JWT + bcrypt
- **实时通信**: Socket.io
- **邮件服务**: Nodemailer
- **二维码生成**: QRCode.js
- **两步验证**: Speakeasy

### 部署与运维
- **容器化**: Docker支持
- **CI/CD**: GitHub Actions
- **部署平台**: Netlify / Vercel / 自部署
- **监控**: 内置性能监控
- **备份**: 自动数据备份

## 🚀 安装部署

### 环境要求
- Node.js 18+ 或 Bun 1.0+
- SQLite 3.0+
- Git

### 快速开始

```bash
# 克隆项目
git clone https://github.com/GmgnAIzh/bushidageOA.git
cd bushidageOA

# 安装依赖
bun install
# 或者使用 npm
npm install

# 初始化数据库
bun run db:generate
bun run db:push

# 启动开发服务器
bun run dev

# 启动生产服务器
bun run build
bun run start
```

### 环境变量配置

创建 `.env.local` 文件：

```bash
# 数据库配置
DATABASE_URL="file:./database.sqlite"

# JWT密钥
JWT_SECRET="your-super-secret-jwt-key"

# 邮件配置
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# WebSocket配置
ENABLE_SOCKET="true"
```

## 📖 使用说明

### 演示账号

| 角色 | 用户名 | 密码 | 权限 |
|------|--------|------|------|
| 系统管理员 | `admin` | `123456` | 全部功能 |
| 普通用户 | `user` | `123456` | 基础功能 |

### 功能使用指南

#### 1. 登录系统
1. 访问系统首页
2. 输入用户名和密码
3. 可选择"记住登录状态"
4. 点击登录按钮

#### 2. 员工管理
1. 进入"员工管理"模块
2. 点击"添加员工"新增员工
3. 编辑员工信息、设置权限
4. 查看员工详细档案

#### 3. 项目协作
1. 创建新项目或加入现有项目
2. 分配任务给团队成员
3. 跟踪项目进度和里程碑
4. 使用甘特图查看项目时间线

#### 4. 钱包管理
1. 绑定TRC20钱包地址
2. 设置Google Authenticator
3. 进行多重安全验证
4. 查看交易记录和余额

#### 5. 实时聊天
1. 加入部门群组或创建新群
2. 发送文字、图片、文件消息
3. 使用@功能提醒成员
4. 设置消息提醒和勿扰模式

## 📁 项目结构

```
bushidageOA/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API路由
│   │   │   ├── auth/       # 认证相关
│   │   │   ├── users/      # 用户管理
│   │   │   └── services/   # 服务接口
│   │   ├── globals.css     # 全局样式
│   │   ├── layout.tsx      # 根布局
│   │   └── page.tsx        # 首页
│   ├── components/         # 组件目录
│   │   ├── ui/            # UI基础组件
│   │   ├── modules/       # 业务模块组件
│   │   └── common/        # 通用组件
│   └── lib/               # 工具库
│       ├── db/            # 数据库相关
│       ├── auth/          # 认证工具
│       └── utils/         # 通用工具
├── public/                # 静态资源
│   ├── icons/            # PWA图标
│   ├── manifest.json     # PWA配置
│   └── sw.js            # Service Worker
├── docs/                 # 文档目录
├── tests/               # 测试文件
├── docker/              # Docker配置
├── .github/             # GitHub配置
│   └── workflows/       # CI/CD配置
├── package.json         # 项目配置
├── tailwind.config.ts   # Tailwind配置
├── tsconfig.json       # TypeScript配置
├── drizzle.config.ts   # 数据库配置
└── README.md           # 项目说明
```

## 🛠️ 开发指南

### 本地开发

```bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev

# 启动WebSocket服务器
bun run dev-socket

# 数据库操作
bun run db:generate    # 生成迁移文件
bun run db:push        # 推送到数据库
bun run db:studio      # 打开数据库管理界面

# 代码检查
bun run lint           # ESLint检查
bun run type-check     # TypeScript检查
```

### 添加新功能模块

1. 在 `src/components/` 下创建模块组件
2. 在 `src/app/page.tsx` 中注册模块
3. 添加对应的API路由（如需要）
4. 更新数据库Schema（如需要）
5. 编写测试用例

### 数据库Schema更新

```bash
# 修改 src/lib/db/schema.ts
# 生成迁移文件
bun run db:generate

# 应用迁移
bun run db:push
```

## 🌐 部署方案

### Netlify部署（推荐）

1. Fork本项目到您的GitHub
2. 在Netlify中导入项目
3. 设置构建命令：`bun run build`
4. 设置发布目录：`.next`
5. 添加环境变量
6. 部署完成

### Vercel部署

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署到Vercel
vercel --prod
```

### Docker部署

```bash
# 构建镜像
docker build -t bushidageoa .

# 运行容器
docker run -p 3000:3000 bushidageoa
```

### 自部署（服务器）

```bash
# 安装依赖并构建
bun install
bun run build

# 使用PM2守护进程
pm2 start ecosystem.config.js

# 配置Nginx反向代理
sudo nginx -s reload
```

## ❓ 常见问题

### Q: 如何重置管理员密码？
A: 删除数据库文件 `database.sqlite`，重启服务会自动创建默认管理员账号。

### Q: WebSocket连接失败怎么办？
A: 确保环境变量 `ENABLE_SOCKET=true`，并检查防火墙设置。

### Q: 如何备份数据？
A: 定期备份 `database.sqlite` 文件即可。

### Q: 支持哪些浏览器？
A: 支持所有现代浏览器，建议使用Chrome、Firefox、Safari、Edge最新版本。

### Q: 如何自定义主题？
A: 修改 `tailwind.config.ts` 中的主题配置，或在 `globals.css` 中添加自定义样式。

## 📅 更新日志

### v1.0.0 (2024-01-18)
- 🎉 首次发布
- ✨ 完整的企业OA功能
- 🔐 安全认证体系
- 💬 实时聊天系统
- 📱 PWA移动端支持
- 🚀 WebSocket实时通信

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 贡献类型

- 🐛 Bug修复
- ✨ 新功能开发
- 📝 文档改进
- 🎨 UI/UX优化
- ⚡ 性能优化
- 🔧 配置改进

### 开发规范

- 遵循ESLint规则
- 使用TypeScript编写
- 添加适当的注释
- 编写测试用例
- 更新相关文档

## 📞 技术支持

- 📧 邮箱：support@bushidageoa.com
- 💬 讨论：[GitHub Discussions](https://github.com/GmgnAIzh/bushidageOA/discussions)
- 🐛 问题反馈：[GitHub Issues](https://github.com/GmgnAIzh/bushidageOA/issues)

## 📄 许可证

本项目采用 [MIT许可证](LICENSE)。

## 🌟 致谢

感谢所有为本项目做出贡献的开发者！

- [Next.js](https://nextjs.org/) - React框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Radix UI](https://www.radix-ui.com/) - UI组件库
- [Socket.io](https://socket.io/) - 实时通信
- [Drizzle ORM](https://orm.drizzle.team/) - 数据库ORM

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给我们一个Star！**

Made with ❤️ by [BushidageOA Team](https://github.com/GmgnAIzh)

</div>
