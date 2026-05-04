# NoteVault 2.0

> 基于 Next.js 的智能笔记应用 — 三套可切换主题 × AI 辅助写作 × 知识图谱 × 富文本编辑器

## 技术栈

- **前端**: Next.js 16 + React 19 + TypeScript + TailwindCSS 4
- **编辑器**: TipTap (ProseMirror) — WYSIWYG + Markdown 双模式
- **AI**: z-ai-web-dev-sdk 流式对话
- **知识图谱**: D3.js 力导向图 + 双向链接
- **状态管理**: Zustand
- **UI**: shadcn/ui + Lucide Icons + Framer Motion
- **部署**: Cloudflare Pages (@cloudflare/next-on-pages)

## 功能

- 三套主题切换 (极简 / 温暖 / 信息密度) × 亮色/暗色 = 6 种外观
- TipTap 富文本编辑器 (工具栏 + Slash 命令 + Markdown 源码模式)
- AI 辅助写作 (续写 / 摘要 / 润色 / 翻译 + 侧边栏对话)
- D3.js 知识图谱可视化 (力导向图 + 拖拽 + 缩放 + 搜索)
- 双向链接 + WikiLink 搜索
- 登录 / 注册 / OAuth (GitHub / Google / 微信)
- 搜索防抖 + 关键词高亮
- 全局快捷键 (Ctrl+J/K/N/,/Shift+T)
- 完整 RESTful API (Notes / Auth / Settings / Folders / Tags)

## 开发

```bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev

# 构建
bun run build

# Cloudflare Pages 本地预览
bunx wrangler pages dev .vercel/output/static
```

## 部署

推送到 `main` 分支自动触发 GitHub Actions 部署到 Cloudflare Pages。

需要在 GitHub 仓库 Settings → Secrets 中配置:

| Secret | 说明 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token (Pages 编辑权限) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID |

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+J` | 打开 AI 助手 |
| `Ctrl+K` | 聚焦搜索 |
| `Ctrl+N` | 新建笔记 |
| `Ctrl+,` | 打开设置 |
| `Ctrl+Shift+T` | 切换亮色/暗色模式 |

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API 路由 (14 个 endpoints)
│   ├── login/              # 登录页
│   ├── register/           # 注册页
│   ├── graph/              # 知识图谱全屏页
│   ├── settings/           # 设置页 (4 Tab)
│   ├── auth/callback/      # OAuth 回调
│   ├── themes.css          # 6 种主题 CSS 变量
│   ├── error.tsx           # 错误边界
│   ├── not-found.tsx       # 404 页面
│   └── loading.tsx         # 加载状态
├── components/
│   ├── editor/             # TipTap 编辑器 (4 文件)
│   ├── ai/                 # AI 组件 (4 文件)
│   ├── graph/              # 知识图谱 (1 文件)
│   ├── auth/               # 认证组件 (1 文件)
│   ├── notevault/          # 主应用布局 (4 文件)
│   └── ui/                 # shadcn/ui 组件
├── stores/                 # Zustand 状态 (4 文件)
├── hooks/                  # 自定义 Hooks
└── lib/                    # 工具函数 + mock 数据
```

## License

MIT
