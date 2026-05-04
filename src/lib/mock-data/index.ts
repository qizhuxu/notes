/**
 * Shared in-memory mock data store for API routes.
 *
 * This module mirrors the data structures used in the Zustand client stores
 * (note-store, auth-store, theme-store) so that API routes can serve
 * realistic responses. Data lives in process memory and resets on restart.
 */

import { nanoid } from 'nanoid';

// ============================================================
// Types
// ============================================================

export interface MockNote {
  id: string;
  title: string;
  content: string;
  contentHtml?: string;
  contentJson?: object;
  folderId: string | null;
  tags: string[];
  isStarred: boolean;
  isTrashed: boolean;
  updatedAt: string;
  createdAt: string;
  wordCount: number;
}

export interface MockFolder {
  id: string;
  name: string;
  icon: string;
  count: number;
  type: 'system' | 'custom';
}

export interface MockTag {
  id: string;
  name: string;
  color: string;
}

export interface MockUser {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface MockApiKey {
  id: string;
  name: string;
  provider: string;
  key: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface MockNoteVersion {
  id: string;
  noteId: string;
  title: string;
  content: string;
  createdAt: string;
  wordCount: number;
}

export interface MockSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  fontSize: number;
  editorMode: 'rich' | 'markdown' | 'split';
  autoSave: boolean;
  autoSaveInterval: number;
  sidebarCollapsed: boolean;
  showWordCount: boolean;
  confirmBeforeDelete: boolean;
}

// ============================================================
// Helper – time offsets
// ============================================================

const NOW = Date.now();

function minutesAgo(m: number): string {
  return new Date(NOW - m * 60_000).toISOString();
}
function hoursAgo(h: number): string {
  return new Date(NOW - h * 3_600_000).toISOString();
}
function daysAgo(d: number): string {
  return new Date(NOW - d * 86_400_000).toISOString();
}

// ============================================================
// Mock Data Stores
// ============================================================

export const mockNotes: MockNote[] = [
  {
    id: 'n1',
    title: 'Next.js 15 App Router 新特性总结',
    content:
      'Next.js 15 引入了多项令人兴奋的新特性，包括改进的服务端组件性能、增强的缓存策略以及全新的 Turbopack 编译器。Server Actions 现在支持更灵活的表单处理，中间件的执行效率也得到了显著提升。本文将详细梳理这些更新，并结合实际项目案例进行分析和演示。',
    folderId: 'work',
    tags: ['tag-tech', 'tag-study'],
    isStarred: true,
    isTrashed: false,
    updatedAt: minutesAgo(5),
    createdAt: daysAgo(30),
    wordCount: 1520,
  },
  {
    id: 'n2',
    title: '产品需求文档：NoteVault 2.0',
    content:
      'NoteVault 2.0 将从单一的笔记记录工具升级为智能知识管理系统。核心功能包括三栏布局编辑器、双向链接、标签系统重构、全文搜索、Markdown 实时预览以及 AI 辅助写作。设计上追求简洁高效，支持多种主题切换，满足不同用户的使用习惯。',
    folderId: 'work',
    tags: ['tag-product', 'tag-important', 'tag-project'],
    isStarred: true,
    isTrashed: false,
    updatedAt: minutesAgo(30),
    createdAt: daysAgo(25),
    wordCount: 2340,
  },
  {
    id: 'n3',
    title: '第三季度工作周报 — 第12周',
    content:
      '本周完成了 NoteVault 前端框架的搭建工作，包括路由配置、组件库集成和主题系统的开发。与后端团队对接了 API 接口规范，完成了用户认证模块的联调。下周计划重点投入编辑器核心功能的开发，预计月底前完成第一版内部测试。',
    folderId: 'work',
    tags: ['tag-weekly', 'tag-project'],
    isStarred: false,
    isTrashed: false,
    updatedAt: hoursAgo(2),
    createdAt: daysAgo(7),
    wordCount: 890,
  },
  {
    id: 'n4',
    title: 'Tailwind CSS 4 迁移指南',
    content:
      '从 Tailwind CSS 3 升级到 4 需要注意几个关键变化。首先是配置文件从 tailwind.config.js 迁移到 CSS 中的 @theme 指令。其次是新的 @property 语法用于自定义设计令牌。颜色系统也经过了重新设计，建议使用 oklch 色彩空间以获得更一致的视觉效果。',
    folderId: 'work',
    tags: ['tag-tech', 'tag-study'],
    isStarred: true,
    isTrashed: false,
    updatedAt: hoursAgo(5),
    createdAt: daysAgo(20),
    wordCount: 1850,
  },
  {
    id: 'n5',
    title: '读书笔记：《设计心理学》',
    content:
      '唐·诺曼在《设计心理学》中提出了"可供性"（Affordance）的核心概念。好的设计应该让用户一眼就能理解如何操作，而无需额外的说明。映射、反馈和约束是三个基本的设计原则。映射确保控制元素与其效果之间有清晰的关系，反馈让用户知道操作已被接收。',
    folderId: 'personal',
    tags: ['tag-design', 'tag-study'],
    isStarred: false,
    isTrashed: false,
    updatedAt: hoursAgo(8),
    createdAt: daysAgo(15),
    wordCount: 2100,
  },
  {
    id: 'n6',
    title: '周末旅行计划：杭州',
    content:
      '计划本周末去杭州西湖周边走走，行程安排如下：周六上午抵达杭州，先去灵隐寺参观，下午沿着苏堤散步，傍晚在湖边看日落。周日去龙井村品茶，下午逛逛南宋御街，傍晚返程。需要提前预订酒店和高铁票，记得带相机和充电宝。',
    folderId: 'personal',
    tags: [],
    isStarred: false,
    isTrashed: false,
    updatedAt: daysAgo(1),
    createdAt: daysAgo(3),
    wordCount: 320,
  },
  {
    id: 'n7',
    title: 'Zustand 状态管理最佳实践',
    content:
      '在使用 Zustand 进行状态管理时，有几个最佳实践值得注意。使用 selector 模式避免不必要的重渲染；利用中间件处理持久化和日志记录；将相关的状态和操作组织在同一个 slice 中。与 React Context 相比，Zustand 的性能优势在大型应用中尤为明显。',
    folderId: 'work',
    tags: ['tag-tech'],
    isStarred: true,
    isTrashed: false,
    updatedAt: daysAgo(1),
    createdAt: daysAgo(10),
    wordCount: 1340,
  },
  {
    id: 'n8',
    title: 'AI 写作助手功能设想',
    content:
      '如果在笔记应用中集成 AI 写作助手，可以提供以下功能：自动补全段落、智能摘要生成、语法纠错建议、多语言翻译、风格改写。用户可以通过快捷键或侧边栏触发 AI 建议。关键是要让 AI 的介入自然且不打断用户的写作心流。',
    folderId: 'ideas',
    tags: ['tag-product', 'tag-tech'],
    isStarred: true,
    isTrashed: false,
    updatedAt: daysAgo(2),
    createdAt: daysAgo(14),
    wordCount: 560,
  },
  {
    id: 'n9',
    title: 'TypeScript 高级类型技巧',
    content:
      'TypeScript 的高级类型系统提供了强大的表达能力。条件类型（Conditional Types）可以根据输入类型动态选择输出类型。映射类型（Mapped Types）可以批量转换对象类型的属性。模板字面量类型（Template Literal Types）可以在类型层面操作字符串。掌握这些技巧可以显著提升代码的类型安全性。',
    folderId: 'work',
    tags: ['tag-tech', 'tag-study'],
    isStarred: false,
    isTrashed: false,
    updatedAt: daysAgo(2),
    createdAt: daysAgo(12),
    wordCount: 1780,
  },
  {
    id: 'n10',
    title: '健身计划与饮食记录',
    content:
      '本月健身目标：每周至少4次力量训练，2次有氧运动。周一练胸和三头，周三练背和二头，周五练肩和核心，周日腿部训练。饮食方面控制碳水摄入，增加蛋白质比例，每天至少2升水。已经坚持了两周，体重下降了1.5kg。',
    folderId: 'personal',
    tags: [],
    isStarred: false,
    isTrashed: false,
    updatedAt: daysAgo(3),
    createdAt: daysAgo(8),
    wordCount: 280,
  },
  {
    id: 'n11',
    title: '组件设计系统搭建思路',
    content:
      '构建一套完整的组件设计系统需要从设计令牌（Design Token）开始，定义颜色、间距、字体、圆角等基础变量。然后建立原子组件（Button、Input、Tag），再组合成分子组件（SearchBar、Card、Dialog），最终形成页面模板。每个组件都需要有清晰的使用文档和无障碍支持。',
    folderId: 'work',
    tags: ['tag-design', 'tag-tech', 'tag-project'],
    isStarred: false,
    isTrashed: false,
    updatedAt: daysAgo(4),
    createdAt: daysAgo(18),
    wordCount: 1920,
  },
  {
    id: 'n12',
    title: '关于知识管理的一些随想',
    content:
      '知识管理不仅仅是收集信息，更重要的是建立连接。每一条笔记都应该像一个节点，通过标签、链接和引用与其他笔记产生关联。Zettelkasten（卡片盒笔记法）的核心理念就是鼓励这种网状的知识结构，而不是线性的文件夹分类。好的知识管理系统应该帮助发现隐藏的联系。',
    folderId: 'ideas',
    tags: ['tag-thoughts'],
    isStarred: false,
    isTrashed: false,
    updatedAt: daysAgo(5),
    createdAt: daysAgo(22),
    wordCount: 420,
  },
  {
    id: 'n13',
    title: '前端性能优化清单',
    content:
      '页面加载性能优化清单：1. 图片懒加载和格式优化（WebP/AVIF）；2. 代码分割和动态导入；3. 关键CSS内联，非关键CSS异步加载；4. Service Worker 缓存策略；5. 预连接和预加载关键资源；6. 减少主线程阻塞时间；7. 使用虚拟列表处理大数据渲染。',
    folderId: 'work',
    tags: ['tag-tech', 'tag-important'],
    isStarred: false,
    isTrashed: false,
    updatedAt: daysAgo(6),
    createdAt: daysAgo(16),
    wordCount: 1450,
  },
  {
    id: 'n14',
    title: 'API 接口设计规范文档',
    content:
      'RESTful API 设计规范：使用名词复数作为资源路径（/api/notes）；使用标准 HTTP 方法（GET/POST/PUT/DELETE）；分页参数统一使用 page 和 pageSize；响应格式包含 code、message、data 三个字段；错误码分段管理，2xx 成功、4xx 客户端错误、5xx 服务端错误。',
    folderId: 'archive',
    tags: ['tag-tech', 'tag-project'],
    isStarred: false,
    isTrashed: false,
    updatedAt: daysAgo(10),
    createdAt: daysAgo(40),
    wordCount: 2100,
  },
  {
    id: 'n15',
    title: '旧版项目需求备份',
    content:
      '这是旧版 NoteVault 1.0 的需求文档备份，包含用户管理、笔记 CRUD、文件夹分类等基础功能描述。由于项目已经进入 2.0 阶段，此文档仅作历史参考。核心变化是从单栏编辑器升级为三栏布局，新增了双向链接和标签系统。',
    folderId: 'archive',
    tags: ['tag-project'],
    isStarred: false,
    isTrashed: false,
    updatedAt: daysAgo(30),
    createdAt: daysAgo(60),
    wordCount: 980,
  },
  // Trashed notes
  {
    id: 'n16',
    title: '已废弃的首页设计方案',
    content:
      '这个首页设计方案已经被团队否决了，主要原因是布局过于复杂，用户学习成本太高。新的方案将采用更简洁的卡片式布局，强调内容的可发现性。保留一些有价值的设计元素，比如渐变背景和微交互动画。',
    folderId: 'work',
    tags: ['tag-design'],
    isStarred: false,
    isTrashed: true,
    updatedAt: daysAgo(7),
    createdAt: daysAgo(20),
    wordCount: 540,
  },
  {
    id: 'n17',
    title: '过期的会议纪要',
    content:
      '2024年10月产品评审会议纪要。参会人员：张三、李四、王五。讨论了Q4的产品路线图，确定了三个核心功能优先级：1. 编辑器升级 2. 搜索优化 3. 多端同步。后续需要与设计团队确认UI方案。',
    folderId: 'work',
    tags: ['tag-weekly'],
    isStarred: false,
    isTrashed: true,
    updatedAt: daysAgo(14),
    createdAt: daysAgo(30),
    wordCount: 380,
  },
  {
    id: 'n18',
    title: '测试用的临时笔记',
    content: '这是一条用于测试回收站功能的临时笔记，可以在测试完成后安全删除。',
    folderId: null,
    tags: [],
    isStarred: false,
    isTrashed: true,
    updatedAt: daysAgo(20),
    createdAt: daysAgo(25),
    wordCount: 42,
  },
];

export const mockFolders: MockFolder[] = [
  { id: 'all', name: '全部笔记', icon: '📝', count: 24, type: 'system' },
  { id: 'favorites', name: '收藏', icon: '⭐', count: 5, type: 'system' },
  { id: 'work', name: '工作', icon: '💼', count: 12, type: 'system' },
  { id: 'personal', name: '个人', icon: '🏠', count: 4, type: 'system' },
  { id: 'ideas', name: '想法', icon: '💡', count: 3, type: 'custom' },
  { id: 'archive', name: '归档', icon: '📦', count: 2, type: 'custom' },
];

export const mockTags: MockTag[] = [
  { id: 'tag-tech', name: '技术', color: '#3b82f6' },
  { id: 'tag-design', name: '设计', color: '#a855f7' },
  { id: 'tag-product', name: '产品', color: '#f97316' },
  { id: 'tag-weekly', name: '周报', color: '#06b6d4' },
  { id: 'tag-study', name: '学习', color: '#10b981' },
  { id: 'tag-project', name: '项目', color: '#ec4899' },
  { id: 'tag-thoughts', name: '随想', color: '#8b5cf6' },
  { id: 'tag-important', name: '重要', color: '#ef4444' },
];

export const mockApiKeys: MockApiKey[] = [
  {
    id: 'ak1',
    name: 'OpenAI API Key',
    provider: 'openai',
    key: 'sk-xxxx...xxxx',
    createdAt: daysAgo(30),
    lastUsedAt: minutesAgo(10),
  },
  {
    id: 'ak2',
    name: 'Anthropic API Key',
    provider: 'anthropic',
    key: 'sk-ant-xxxx...xxxx',
    createdAt: daysAgo(15),
    lastUsedAt: hoursAgo(3),
  },
];

export const mockNoteVersions: MockNoteVersion[] = [
  {
    id: 'v1',
    noteId: 'n1',
    title: 'Next.js 15 App Router 新特性总结',
    content:
      'Next.js 15 引入了多项令人兴奋的新特性，包括改进的服务端组件性能、增强的缓存策略以及全新的 Turbopack 编译器。',
    createdAt: daysAgo(2),
    wordCount: 680,
  },
  {
    id: 'v2',
    noteId: 'n1',
    title: 'Next.js 15 App Router 新特性总结',
    content:
      'Next.js 15 引入了多项令人兴奋的新特性。Server Actions 现在支持更灵活的表单处理，中间件的执行效率也得到了显著提升。',
    createdAt: daysAgo(1),
    wordCount: 1100,
  },
  {
    id: 'v3',
    noteId: 'n2',
    title: '产品需求文档：NoteVault 2.0',
    content:
      'NoteVault 2.0 将从单一的笔记记录工具升级为智能知识管理系统。核心功能包括三栏布局编辑器和双向链接。',
    createdAt: daysAgo(10),
    wordCount: 1200,
  },
];

export const defaultSettings: MockSettings = {
  theme: 'system',
  language: 'zh-CN',
  fontSize: 16,
  editorMode: 'rich',
  autoSave: true,
  autoSaveInterval: 5,
  sidebarCollapsed: false,
  showWordCount: true,
  confirmBeforeDelete: true,
};

/** Runtime mutable settings – starts from defaults */
export let currentSettings: MockSettings = { ...defaultSettings };

// ============================================================
// Utility: generate short IDs for mock data
// ============================================================

let _counter = 100;

export function genId(prefix = 'id'): string {
  _counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${_counter}`;
}

export { nanoid };
