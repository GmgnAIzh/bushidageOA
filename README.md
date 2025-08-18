# 🏢 BushidageOA - 企业级智能OA办公自动化系统

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/GmgnAIzh/bushidageOA)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.1.6-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)](https://www.typescriptlang.org/)

## 📋 项目介绍

BushidageOA是一款现代化的企业级智能办公自动化系统，专为中小企业设计，集成了员工管理、项目管理、财务管理、内部沟通、审批流程等核心业务功能。系统采用响应式设计，支持多端访问，提供流畅的用户体验。

## ✨ 功能特性

### 🏠 仪表板
- 📊 数据概览与统计分析
- 📈 实时业务指标监控
- 🔔 重要通知与提醒
- 📱 响应式布局设计

### 👥 员工管理
- 👤 员工信息管理
- 🏢 部门架构管理
- 📝 考勤管理
- 📊 绩效评估

### 💬 内部聊天
- 💬 实时消息通讯
- 👥 群组聊天
- 📎 文件传输
- 🔍 聊天记录搜索

### 📋 项目管理
- 📋 项目创建与管理
- 📅 任务分配与跟踪
- 🗓️ 时间线管理
- 📊 项目进度监控

### 💰 财务管理
- 💸 收支管理
- 📊 财务报表
- 💳 预算控制
- 🧾 发票管理

### ✅ 审批流程
- 📝 审批流程设计
- 🔄 审批状态跟踪
- 📋 审批历史记录
- ⚡ 智能审批提醒

### 📢 公告管理
- 📢 企业公告发布
- 🎯 定向消息推送
- 📅 公告时效管理
- 👁️ 阅读状态追踪

### 📊 报表分析
- 📈 多维度数据分析
- 📊 可视化图表展示
- 📋 自定义报表生成
- 📤 报表导出功能

### ⚙️ 系统设置
- 🎨 界面主题切换
- 🌐 多语言支持
- 🔧 系统参数配置
- 👤 用户权限管理

### 📱 Telegram集成
- 🤖 Telegram Bot集成
- 📲 移动端消息推送
- 🔔 重要事件提醒
- 📊 数据查询接口

## 🛠️ 技术栈

### 前端技术
- **框架**: Next.js 15.1.6 (React 19.0.0)
- **语言**: TypeScript 5.7.3
- **样式**: Tailwind CSS 3.4.1
- **UI组件**: Radix UI + shadcn/ui
- **动画**: Framer Motion 11.15.0
- **图表**: Recharts 2.15.0
- **图标**: Lucide React 0.472.0

### 后端技术
- **数据库**: Prisma ORM 5.19.0
- **认证**: JWT + BCrypt
- **API**: Next.js API Routes
- **实时通信**: Socket.io 4.7.5
- **邮件服务**: Nodemailer 6.9.13

### 开发工具
- **包管理**: Bun
- **代码规范**: Biome 1.9.4
- **类型检查**: TypeScript
- **构建工具**: Next.js + Turbopack

## 🚀 快速开始

### 环境要求
- Node.js 18.17.0 或更高版本
- Bun 1.0.0 或更高版本
- Git

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/GmgnAIzh/bushidageOA.git
cd bushidageOA
```

2. **安装依赖**
```bash
bun install
```

3. **环境配置**
```bash
# 复制环境变量文件
cp .env.example .env.local

# 编辑环境变量
# 配置数据库连接、JWT密钥等
```

4. **数据库初始化**
```bash
# 生成Prisma客户端
bunx prisma generate

# 运行数据库迁移
bunx prisma db push
```

5. **启动开发服务器**
```bash
bun dev
```

6. **访问应用**
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 🔐 演示账号

### 管理员账号
- 用户名: `admin`
- 密码: `admin123`
- 权限: 系统管理员，拥有所有功能权限

### 普通用户账号
- 用户名: `user`
- 密码: `user123`
- 权限: 普通员工，基础功能权限

### 测试账号
- 用户名: `test`
- 密码: `test123`
- 权限: 测试用户，部分功能权限

## 📁 项目结构

```
bushidageOA/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # 根布局组件
│   │   ├── page.tsx           # 主页面
│   │   └── globals.css        # 全局样式
│   ├── components/            # 组件目录
│   │   ├── ui/               # UI基础组件
│   │   ├── AnnouncementModule.tsx  # 公告模块
│   │   ├── ApprovalModule.tsx      # 审批模块
│   │   ├── ChatModule.tsx          # 聊天模块
│   │   ├── EmployeeModule.tsx      # 员工管理模块
│   │   ├── FinanceModule.tsx       # 财务模块
│   │   ├── ProjectModule.tsx       # 项目管理模块
│   │   ├── ReportsModule.tsx       # 报表模块
│   │   ├── SettingsModule.tsx      # 设置模块
│   │   └── TelegramModule.tsx      # Telegram集成模块
│   └── lib/                   # 工具库
│       ├── utils.ts          # 工具函数
│       └── data-service.ts   # 数据服务
├── public/                    # 静态资源
├── package.json              # 项目配置
├── tailwind.config.ts        # Tailwind配置
├── tsconfig.json            # TypeScript配置
└── README.md                # 项目文档
```

## 🚀 部署指南

### Vercel部署
1. Fork本仓库到你的GitHub账号
2. 在[Vercel](https://vercel.com)创建新项目
3. 选择Fork的仓库进行部署
4. 配置环境变量
5. 部署完成

### Netlify部署
1. 在[Netlify](https://netlify.com)连接GitHub仓库
2. 设置构建命令: `bun build`
3. 设置发布目录: `out`
4. 配置环境变量
5. 开始部署

### Docker部署
```bash
# 构建镜像
docker build -t bushidage-oa .

# 运行容器
docker run -p 3000:3000 bushidage-oa
```

## 🤝 贡献指南

我们欢迎任何形式的贡献！

### 贡献方式
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

### 开发规范
- 遵循TypeScript类型安全
- 使用Biome进行代码格式化
- 编写清晰的提交信息
- 添加必要的测试用例

## 📄 许可证

本项目采用 MIT 许可证。查看 [LICENSE](LICENSE) 文件了解更多信息。

## 📞 联系我们

- 项目主页: [https://github.com/GmgnAIzh/bushidageOA](https://github.com/GmgnAIzh/bushidageOA)
- 问题反馈: [Issues](https://github.com/GmgnAIzh/bushidageOA/issues)
- 功能建议: [Discussions](https://github.com/GmgnAIzh/bushidageOA/discussions)

## 🌟 致谢

感谢以下开源项目为本项目提供的支持：
- [Next.js](https://nextjs.org/) - React框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Radix UI](https://www.radix-ui.com/) - 无障碍UI组件
- [shadcn/ui](https://ui.shadcn.com/) - 美观的React组件
- [Prisma](https://www.prisma.io/) - 现代数据库工具包

---

⭐ 如果这个项目对你有帮助，请给我们一个星标！

🔗 **仓库地址**: https://github.com/GmgnAIzh/bushidageOA
