# NoteVault 2.0 — 完整设计文档

> 基于 https://github.com/qizhuxu/notevault 的重新设计方案
> 设计日期: 2026-05-03

---

## 1. 项目概述

NoteVault 是一个基于 Cloudflare 边缘计算平台的个人笔记应用。本次重新设计保留 Cloudflare Workers + React 技术栈，全面重构前端 UI/UX，并新增 AI 辅助写作、知识图谱双向链接、实时协作、富文本编辑器等核心功能。

### 1.1 设计目标

- 保留原版所有功能并增强，数据向下兼容
- 三套可切换主题（极简/温暖/信息密度）× 暗色/亮色 = 6 种外观
- AI 辅助写作（OpenAI 兼容格式代理层）
- 知识图谱与双向链接
- Durable Objects 实时协作
- TipTap 富文本编辑器（Markdown + 所见即所得双模式）
- 三级认证体系（OAuth + 自建 + Cloudflare Access）

---

## 2. 系统架构

### 2.1 架构总览

```
┌─────────────────────────────────────────────────────┐
│                   Cloudflare Edge Network            │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Cloudflare│  │ Durable  │  │   Workers AI      │  │
│  │ Workers   │◄►│ Objects  │  │   (内置模型)       │  │
│  │ (Hono API)│  │(WebSocket│  ├───────────────────┤  │
│  │           │  │ 协作)    │  │ 外部 AI 代理       │  │
│  └────┬──┬───┘  └──────────┘  │ (OpenAI兼容格式)   │  │
│       │  │                    └───────────────────┘  │
│  ┌────▼──▼────┐  ┌──────────┐  ┌──────────────────┐ │
│  │     D1     │  │    KV    │  │        R2         │ │
│  │ (SQLite)   │  │ (会话/缓存)│ │  (文件/附件)      │ │
│  └────────────┘  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────┘
         ▲                              ▲
         │ API + WebSocket              │ 文件上传/下载
    ┌────┴──────────────────────────────┴────┐
    │          React 前端 (SPA)               │
    │   Vite + TypeScript + TailwindCSS 4     │
    │   主题引擎: 极简 / 温暖 / 信息密度       │
    │   编辑器: TipTap (富文本+Markdown)       │
    │   图谱: D3.js 可视化                    │
    │   AI: 侧边栏浮层交互                    │
    │   协作: WebSocket 实时光标              │
    └────────────────────────────────────────┘
```

### 2.2 技术选型对比

| 模块 | 原版 | 新版 |
|------|------|------|
| 后端框架 | Hono (单文件 448 行) | Hono (模块化路由 + 中间件) |
| 编辑器 | textarea + react-markdown | TipTap (富文本所见即所得) |
| 协作 | 无 | Durable Objects (WebSocket) |
| AI | 无 | Workers AI + OpenAI 兼容代理 |
| 知识图谱 | 无 | D3.js 双向链接可视化 |
| 认证 | 无 | OAuth + 自建 + Cloudflare Access |
| 主题 | 硬编码 dark/light | CSS 变量 + 3 套主题预设 |
| 状态管理 | useState 集中 App.tsx | Zustand + React Context |
| 路由 | react-router-dom (未使用) | React Router v7 (真正使用) |

---

## 3. 数据库设计

### 3.1 新增表

```sql
-- 用户表
CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  username    TEXT,
  email       TEXT UNIQUE,
  avatar_url  TEXT,
  auth_method TEXT,           -- 'oauth' | 'password' | 'cf_access'
  oauth_provider TEXT,        -- 'github' | 'google' | 'wechat' | NULL
  oauth_id    TEXT,
  password_hash TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- OAuth 绑定表
CREATE TABLE user_oauth_bindings (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  provider    TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  UNIQUE(provider, provider_id)
);

-- 会话表 (实际用 KV，此为备份)
CREATE TABLE sessions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  token_hash  TEXT NOT NULL,
  ip_address  TEXT,
  user_agent  TEXT,
  expires_at  TEXT NOT NULL,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- API Key 表
CREATE TABLE user_api_keys (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  service     TEXT NOT NULL,
  key_encrypted TEXT NOT NULL,
  base_url    TEXT,
  label       TEXT,
  is_default  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- 笔记关联表（双向链接）
CREATE TABLE note_links (
  id          TEXT PRIMARY KEY,
  source_id   TEXT NOT NULL REFERENCES notes(id),
  target_id   TEXT NOT NULL REFERENCES notes(id),
  context     TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  UNIQUE(source_id, target_id)
);
CREATE INDEX idx_links_target ON note_links(target_id);

-- 笔记版本历史
CREATE TABLE note_versions (
  id          TEXT PRIMARY KEY,
  note_id     TEXT NOT NULL REFERENCES notes(id),
  content_json TEXT,
  word_count  INTEGER,
  created_at  TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_versions_note ON note_versions(note_id, created_at);

-- 笔记分享/协作权限
CREATE TABLE note_shares (
  id          TEXT PRIMARY KEY,
  note_id     TEXT NOT NULL REFERENCES notes(id),
  shared_with_user_id TEXT REFERENCES users(id),
  permission  TEXT NOT NULL DEFAULT 'viewer',  -- 'editor' | 'viewer'
  share_token TEXT UNIQUE,                     -- 匿名分享链接
  password    TEXT,                            -- 分享密码 (可选)
  expires_at  TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- AI 对话历史
CREATE TABLE ai_conversations (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  note_id     TEXT REFERENCES notes(id),
  title       TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE ai_messages (
  id          TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES ai_conversations(id),
  role        TEXT NOT NULL,  -- 'user' | 'assistant' | 'system'
  content     TEXT NOT NULL,
  model       TEXT,
  tokens_used INTEGER,
  created_at  TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_messages_conv ON ai_messages(conversation_id, created_at);
```

### 3.2 原有表变更（向下兼容）

```sql
-- notes 表新增字段
ALTER TABLE notes ADD COLUMN content_json TEXT;   -- TipTap ProseMirror JSON
ALTER TABLE notes ADD COLUMN word_count INTEGER DEFAULT 0;
ALTER TABLE notes ADD COLUMN owner_id TEXT REFERENCES users(id);
ALTER TABLE notes ADD COLUMN created_at TEXT DEFAULT (datetime('now'));

-- folders 表新增字段（如无）
ALTER TABLE folders ADD COLUMN sort_order INTEGER DEFAULT 0;
```

---

## 4. 后端 API 设计

### 4.1 认证 API

```
POST   /api/auth/register          -- 邮箱注册
POST   /api/auth/login             -- 邮箱登录
POST   /api/auth/logout            -- 登出
POST   /api/auth/refresh           -- 刷新 token
GET    /api/auth/oauth/:provider   -- OAuth 跳转 (github/google/wechat)
GET    /api/auth/oauth/:provider/callback  -- OAuth 回调
GET    /api/auth/me                -- 当前用户信息
PUT    /api/auth/me                -- 更新用户信息
POST   /api/auth/bind-oauth        -- 绑定第三方账号
DELETE /api/auth/bind-oauth/:provider  -- 解绑
```

### 4.2 笔记 API（原有，增强）

```
GET    /api/notes                  -- 列表 (分页、筛选、搜索)
POST   /api/notes                  -- 创建
GET    /api/notes/:id              -- 详情
PUT    /api/notes/:id              -- 更新
DELETE /api/notes/:id              -- 软删除
GET    /api/notes/:id/versions     -- 版本历史
POST   /api/notes/:id/restore      -- 恢复版本
GET    /api/notes/:id/links        -- 双向链接
```

### 4.3 协作 API（新增）

```
POST   /api/notes/:id/share        -- 创建分享
GET    /api/notes/:id/shares       -- 查看分享列表
DELETE /api/notes/:id/share/:id    -- 取消分享
GET    /api/shared/with-me         -- 分享给我的笔记
```

### 4.4 AI API（新增）

```
POST   /api/ai/chat                -- AI 对话（流式）
POST   /api/ai/complete            -- AI 补全（续写/润色/翻译等）
GET    /api/ai/conversations       -- 对话历史
GET    /api/ai/conversations/:id   -- 对话详情
DELETE /api/ai/conversations/:id   -- 删除对话
GET    /api/ai/config              -- 获取 AI 配置
PUT    /api/ai/config              -- 更新 AI 配置
POST   /api/ai/test-connection     -- 测试 AI 连接
```

### 4.5 用户设置 API（新增）

```
GET    /api/settings               -- 获取用户设置
PUT    /api/settings               -- 更新设置（主题/语言等）
POST   /api/settings/api-keys      -- 添加 AI API Key
DELETE /api/settings/api-keys/:id  -- 删除 API Key
```

---

## 5. 前端设计

### 5.1 项目结构

```
frontend/
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css                    -- TailwindCSS + CSS 变量主题
│   ├── themes/
│   │   ├── variables.css            -- CSS 变量定义
│   │   ├── minimal.css              -- 极简主题变量
│   │   ├── cozy.css                 -- 温暖主题变量
│   │   └── dense.css                -- 信息密度主题变量
│   ├── stores/
│   │   ├── theme.ts                 -- 主题状态 (Zustand)
│   │   ├── auth.ts                  -- 认证状态
│   │   ├── notes.ts                 -- 笔记状态
│   │   ├── editor.ts                -- 编辑器状态
│   │   └── ai.ts                    -- AI 状态
│   ├── api/
│   │   ├── client.ts                -- HTTP 客户端 (ky)
│   │   ├── auth.ts                  -- 认证 API
│   │   ├── notes.ts                 -- 笔记 API
│   │   ├── ai.ts                    -- AI API
│   │   └── ws.ts                    -- WebSocket 连接
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts
│   │   ├── useNotes.ts
│   │   ├── useCollaboration.ts
│   │   └── useAI.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx         -- 主布局容器
│   │   │   ├── Sidebar.tsx           -- 侧边栏
│   │   │   ├── NoteList.tsx          -- 笔记列表
│   │   │   └── EditorPanel.tsx       -- 编辑器面板
│   │   ├── editor/
│   │   │   ├── TipTapEditor.tsx      -- TipTap 编辑器主组件
│   │   │   ├── Toolbar.tsx           -- 工具栏
│   │   │   ├── SlashCommand.tsx      -- 斜杠命令菜单
│   │   │   ├── BackLinks.tsx         -- 反向链接面板
│   │   │   ├── LinkSearch.tsx        -- [[ 链接搜索弹窗
│   │   │   └── extensions/           -- TipTap 自定义扩展
│   │   ├── ai/
│   │   │   ├── AISidebar.tsx         -- AI 对话侧边栏
│   │   │   ├── AIInlineAction.tsx    -- 行内 AI 操作
│   │   │   └── AIStreamRenderer.tsx  -- 流式输出渲染
│   │   ├── graph/
│   │   │   ├── KnowledgeGraph.tsx    -- D3.js 知识图谱
│   │   │   └── GraphNode.tsx         -- 节点组件
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── OAuthCallback.tsx
│   │   ├── settings/
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── ThemeSettings.tsx
│   │   │   └── AISettings.tsx
│   │   └── common/
│   │       ├── Dialog.tsx
│   │       ├── Toast.tsx
│   │       ├── Avatar.tsx
│   │       └── LoadingSpinner.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── NotePage.tsx
│   │   ├── GraphPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── SharedNotePage.tsx
│   │   └── TrashPage.tsx
│   └── types/
│       └── index.ts
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

### 5.2 主题引擎

CSS 变量驱动，6 种组合：minimal-dark, minimal-light, cozy-dark, cozy-light, dense-dark, dense-light。

切换方式：`document.documentElement.setAttribute('data-theme', theme)` + `data-mode="dark|light"`

### 5.3 TipTap 编辑器

双模式编辑（Markdown 源码 + 所见即所得），扩展包括 StarterKit, Link, Image, Table, CodeBlockLowlight, TaskList, Collaboration, Mathematics, Typography, SlashCommand, Mention。

### 5.4 知识图谱

D3.js 力导向图，节点=笔记，边=双向链接，支持悬停预览、点击跳转、拖拽、缩放、筛选。

### 5.5 AI 辅助

代理层统一 OpenAI 兼容格式，支持 Workers AI / OpenAI / Claude / 自定义端点。前端通过 Slash 命令和侧边栏交互。

---

## 6. 实施阶段

### Phase 1: 项目脚手架 + 主题引擎 + 基础布局
- 初始化 Vite + React + TypeScript + TailwindCSS 4 项目
- 实现 CSS 变量主题系统（3 套主题 × 2 种模式）
- 构建三栏响应式布局框架
- 实现主题切换 UI

### Phase 2: 后端 API 重构 + 认证系统
- 模块化 Hono 后端（路由拆分、中间件系统）
- 实现认证中间件（JWT + Session）
- OAuth (GitHub/Google/微信) + 自建账号登录
- 数据库迁移脚本

### Phase 3: TipTap 编辑器 + 笔记管理
- TipTap 编辑器集成（双模式）
- Slash 命令菜单
- 笔记 CRUD + 自动保存 + 版本历史
- 文件夹/标签系统增强
- 文件上传/预览

### Phase 4: AI 辅助写作
- AI 代理层（OpenAI 兼容格式）
- Workers AI 集成
- AI 侧边栏 + 行内操作
- 对话历史管理

### Phase 5: 知识图谱 + 双向链接
- 双向链接语法 `[[笔记名]]`
- D3.js 知识图谱可视化
- 反向链接面板

### Phase 6: 实时协作
- Durable Objects WebSocket
- Yjs CRDT 集成
- 实时光标 + 选区同步
- 分享/权限管理

### Phase 7: 整合 + 优化 + 部署
- 错误边界 + Loading 状态
- 搜索增强（防抖 + 高亮）
- PWA 支持
- Cloudflare Pages 部署配置
