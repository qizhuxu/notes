<p align="center">
  <h1 align="center">NoteVault 2.0</h1>
  <p align="center">
    <strong>下一代智能笔记应用</strong> — 三套可切换主题 &times; AI 辅助写作 &times; 知识图谱 &times; 富文本编辑器
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06b6d4?logo=tailwindcss" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Cloudflare-Pages-f38020?logo=cloudflare" alt="Cloudflare Pages" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT" />
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> &bull;
  <a href="#技术架构">技术架构</a> &bull;
  <a href="#快速开始">快速开始</a> &bull;
  <a href="#部署">部署</a> &bull;
  <a href="#快捷键">快捷键</a> &bull;
  <a href="#项目结构">项目结构</a>
</p>

---

## 功能特性

### 编辑器 — TipTap (ProseMirror)

基于 TipTap v3 构建的专业级 WYSIWYG 编辑器，支持 Markdown 双模式切换：

- **格式化**: 标题 (H1-H3)、粗体、斜体、下划线、删除线、高亮
- **代码**: 语法高亮代码块 (highlight.js + lowlight)、行内代码
- **数学公式**: KaTeX 渲染，支持行内和块级公式
- **列表**: 有序列表、无序列表、任务列表 (Todo)
- **表格**: 完整表格操作 (插入、删除行列、合并单元格)
- **媒体**: 图片插入、链接管理
- **Slash 命令**: 输入 `/` 触发命令面板，快速插入各类内容块
- **字数统计**: 实时显示字数和字符数
- **Markdown 模式**: 一键切换 Markdown 源码编辑
- **占位符**: 空内容时显示引导提示

### AI 助手 — 流式对话

集成 AI 侧边栏，提供智能写作辅助：

- **流式输出**: 实时流式响应，打字机效果展示 AI 回复
- **快捷操作**: 一键续写、生成摘要、润色文字、翻译文本
- **上下文感知**: 自动将当前笔记内容作为上下文发送给 AI
- **对话历史**: 保持多轮对话上下文
- **侧边栏设计**: 不干扰编辑流程，随时呼出收起

### 知识图谱 — D3.js 可视化

使用 D3.js 力导向图将笔记间的关联可视化：

- **力导向布局**: 自动排列节点，物理模拟弹性连线
- **拖拽交互**: 拖拽节点重新布局，其他节点自动响应
- **缩放平移**: 鼠标滚轮缩放，拖拽画布平移
- **双向链接**: 笔记间的 [[WikiLink]] 自动建立关联
- **搜索高亮**: 搜索节点并高亮定位
- **节点详情**: 点击节点查看笔记摘要

### 主题引擎 — 6 种外观

三套设计主题 × 亮色/暗色模式 = 6 种视觉风格：

| 主题 | 亮色 | 暗色 |
|------|------|------|
| **极简 Minimal** | 纯白背景、低对比度、专注内容 | 深灰底色、柔和配色 |
| **温暖 Warm** | 奶油色调、圆角元素、亲切感 | 暖灰色调、低蓝光 |
| **信息密度 Dense** | 紧凑布局、高信息密度 | 深色紧凑、适合大屏 |

所有主题通过 CSS 变量驱动，基于 `data-theme` 和 `data-mode` 属性切换，支持系统偏好自动检测。

### 认证系统

完整的三层认证体系：

- **本地登录**: 邮箱 + 密码注册/登录
- **OAuth 第三方**: GitHub / Google / 微信登录
- **认证守卫**: AuthGuard 组件保护需登录页面
- **会话管理**: 登出、Token 自动刷新

### 全局快捷键

高效的键盘操作体验，无需鼠标即可完成核心操作。

---

## 技术架构

```
┌─────────────────────────────────────────────────────┐
│                   Cloudflare Pages                  │
│  ┌───────────────────────────────────────────────┐  │
│  │          Next.js 16 (App Router)               │  │
│  │  ┌───────────┐ ┌──────────┐ ┌──────────────┐  │  │
│  │  │  Pages    │ │ API      │ │  Middleware   │  │  │
│  │  │  (SSR)    │ │ Routes   │ │  (Auth)      │  │  │
│  │  └─────┬─────┘ └────┬─────┘ └──────────────┘  │  │
│  └────────┼────────────┼──────────────────────────┘  │
│           │            │                              │
│  ┌────────┼────────────┼──────────────────────────┐  │
│  │        ▼            ▼                           │  │
│  │  ┌─────────┐  ┌──────────┐  ┌───────────────┐  │  │
│  │  │ Zustand │  │  TipTap  │  │   D3.js       │  │  │
│  │  │ Stores  │  │  Editor  │  │  Knowledge    │  │  │
│  │  └─────────┘  └──────────┘  │  Graph       │  │  │
│  │                              └───────────────┘  │  │
│  │  ┌─────────────────────────────────────────┐    │  │
│  │  │  Theme Engine (CSS Variables)           │    │  │
│  │  │  3 Themes × 2 Modes = 6 Appearances    │    │  │
│  │  └─────────────────────────────────────────┘    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                      │
│  ┌─────────────────────────────────────────────────┐  │
│  │  shadcn/ui + Lucide Icons + Framer Motion      │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) + React 19 |
| 语言 | TypeScript 5 |
| 样式 | TailwindCSS 4 + CSS Variables |
| 编辑器 | TipTap v3 (ProseMirror) + KaTeX + highlight.js |
| 可视化 | D3.js v7 (力导向图) |
| 状态管理 | Zustand v5 |
| UI 组件 | shadcn/ui + Radix UI + Lucide Icons |
| 动画 | Framer Motion |
| AI | z-ai-web-dev-sdk (流式对话) |
| 数据库 | Prisma ORM (可选 PostgreSQL) |
| 部署 | Cloudflare Pages (@cloudflare/next-on-pages) |
| 包管理 | Bun |

---

## 快速开始

### 环境要求

- Node.js 18+ / Bun 1.0+
- Git

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/qizhuxu/notes.git
cd notes

# 安装依赖
bun install

# 启动开发服务器
bun run dev

# 打开浏览器访问
open http://localhost:3000
```

### 构建命令

```bash
# Next.js 标准构建
bun run build

# Cloudflare Pages 构建
bun run build:cf

# Cloudflare Pages 本地预览
bun run preview:cf

# 代码检查
bun run lint
```

### 数据库 (可选)

```bash
# 初始化 Prisma
bun run db:push        # 推送 Schema 到数据库
bun run db:generate    # 生成 Prisma Client
bun run db:migrate     # 运行迁移
```

---

## 部署

推送到 `main` 分支会自动触发 GitHub Actions 部署到 Cloudflare Pages。

### 自动部署 (GitHub Actions)

1. Fork 或克隆本仓库到你的 GitHub 账号
2. 在 Cloudflare Dashboard 创建一个 Pages 项目 (命名为 `notevault`)
3. 在 GitHub 仓库 **Settings → Secrets and variables → Actions** 中添加以下密钥：

| Secret | 说明 | 获取方式 |
|--------|------|----------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | Cloudflare Dashboard → My Profile → API Tokens → Create Token → Edit Cloudflare Workers |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID | Cloudflare Dashboard → 任意域名 → 右侧栏 Account ID |

4. 推送到 `main` 分支，Actions 会自动构建并部署

### 手动部署

```bash
# 安装 Wrangler CLI
bun add -g wrangler

# 登录 Cloudflare
wrangler login

# 构建
bun run build:cf

# 部署
wrangler pages deploy .vercel/output/static --project-name=notevault
```

---

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + J` | 打开 / 关闭 AI 助手侧边栏 |
| `Ctrl + K` | 聚焦搜索栏 |
| `Ctrl + N` | 新建笔记 |
| `Ctrl + ,` | 打开设置页 |
| `Ctrl + Shift + T` | 切换亮色 / 暗色模式 |

---

## API 接口

共 14 个 RESTful API 端点：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api` | API 健康检查 |
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/logout` | 用户登出 |
| GET | `/api/auth/me` | 获取当前用户 |
| GET | `/api/notes` | 获取笔记列表 |
| POST | `/api/notes` | 创建笔记 |
| GET | `/api/notes/[id]` | 获取笔记详情 |
| PUT | `/api/notes/[id]` | 更新笔记 |
| DELETE | `/api/notes/[id]` | 删除笔记 |
| GET | `/api/notes/[id]/versions` | 获取笔记版本历史 |
| GET | `/api/folders` | 获取文件夹列表 |
| GET/PUT/DELETE | `/api/folders/[id]` | 文件夹 CRUD |
| GET | `/api/tags` | 获取标签列表 |
| GET/PUT | `/api/settings` | 获取 / 更新设置 |
| GET/PUT | `/api/settings/api-keys` | 管理 AI API Key |
| POST | `/api/ai/chat` | AI 对话 (流式) |

---

## 项目结构

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局 (字体 + 主题初始化)
│   ├── page.tsx                  # 主页 (重定向到编辑器)
│   ├── globals.css               # 全局样式 + TailwindCSS
│   ├── themes.css                # 6 种主题 CSS 变量定义
│   ├── error.tsx                 # 错误边界
│   ├── not-found.tsx             # 404 页面
│   ├── loading.tsx               # 全局加载状态
│   ├── login/page.tsx            # 登录页
│   ├── register/page.tsx         # 注册页
│   ├── auth/callback/page.tsx    # OAuth 回调页
│   ├── graph/page.tsx            # 知识图谱全屏页
│   ├── settings/
│   │   ├── layout.tsx            # 设置布局
│   │   └── page.tsx              # 设置页 (4 Tab: 通用 / 编辑器 / 外观 / 快捷键)
│   └── api/                      # API 路由 (14 个端点)
│       ├── route.ts
│       ├── auth/                 # 认证接口
│       ├── notes/                # 笔记 CRUD + 版本
│       ├── folders/              # 文件夹管理
│       ├── tags/                 # 标签
│       ├── settings/             # 设置 + API Key
│       └── ai/chat/              # AI 流式对话
├── components/
│   ├── editor/                   # TipTap 编辑器
│   │   ├── TipTapEditor.tsx      # 编辑器主体 + 扩展注册
│   │   ├── Toolbar.tsx           # 格式化工具栏
│   │   ├── SlashCommand.tsx      # Slash 命令菜单
│   │   ├── WikiLinkSearch.tsx    # WikiLink 搜索弹窗
│   │   └── editor.css            # 编辑器专用样式
│   ├── ai/                       # AI 组件
│   │   ├── ai-sidebar.tsx        # AI 侧边栏 (对话 + 流式)
│   │   ├── ai-message.tsx        # 消息气泡
│   │   ├── ai-quick-actions.tsx  # 快捷操作按钮
│   │   └── ai-settings.tsx       # AI 配置
│   ├── graph/
│   │   └── KnowledgeGraph.tsx    # D3.js 知识图谱
│   ├── auth/
│   │   └── auth-guard.tsx        # 路由认证守卫
│   ├── notevault/                # 主应用布局
│   │   ├── app-layout.tsx        # 三栏布局容器
│   │   ├── sidebar.tsx           # 左侧边栏 (笔记列表 + 文件夹)
│   │   ├── editor-panel.tsx      # 中间编辑区
│   │   └── note-list.tsx         # 笔记列表组件
│   ├── theme-switcher.tsx        # 主题切换器
│   ├── theme-initializer.tsx     # 主题初始化 (系统偏好检测)
│   └── ui/                       # shadcn/ui 组件库 (50+ 组件)
├── stores/                       # Zustand 状态管理
│   ├── note-store.ts             # 笔记 + 文件夹 + 搜索
│   ├── auth-store.ts             # 认证状态
│   ├── theme-store.ts            # 主题 + 模式
│   └── ai-store.ts              # AI 对话 + 设置
├── hooks/
│   ├── use-mobile.ts             # 移动端检测
│   ├── use-keyboard-shortcuts.ts # 全局快捷键
│   └── use-toast.ts              # Toast 通知
├── lib/
│   ├── utils.ts                  # 工具函数 (cn, formatDate 等)
│   ├── api-response.ts           # API 响应格式化
│   ├── db.ts                     # 数据库连接 (Prisma)
│   └── mock-data/index.ts        # Mock 数据 (开发用)
└── types/                        # TypeScript 类型定义
```

---

## 开发说明

### 架构决策

- **Next.js App Router**: 使用最新的 App Router 架构，支持 Server Components 和流式渲染
- **Zustand 而非 Redux**: 轻量级状态管理，减少样板代码，适合中等规模应用
- **CSS Variables 主题**: 纯 CSS 方案实现主题切换，零 JS 开销，支持 SSR
- **TipTap v3**: 基于 ProseMirror 的编辑器框架，可扩展性强，社区活跃
- **Cloudflare Pages**: 边缘部署，全球 CDN，零冷启动，免费额度充足

### 本地开发注意事项

- 端口默认 `3000`，可通过 `bun run dev` 启动
- API 路由使用 Mock 数据，无需数据库即可运行
- 如需连接数据库，在 `.env` 中配置 `DATABASE_URL`

---

## License

[MIT](LICENSE)
