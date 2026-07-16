# AI 辅助编程 Prompt 日志 — NoteFlow 项目

> 作者：刘丹  
> 日期：2026年7月  
> 项目：NoteFlow 个人笔记与待办管理系统

---

## Prompt 1：项目初始化与技术选型

**时间**：2026-07-14  
**对应文件**：项目整体架构、`README.md`  
**目标**：确定技术栈并初始化项目结构

**Prompt**：
```
我需要创建一个个人笔记与待办管理系统，使用 AI 辅助编程完成。

技术栈要求：
- 前端：Next.js 16 + TypeScript + Tailwind CSS 4
- 后端：Flask 3 + SQLAlchemy + Flask-JWT-Extended + Marshmallow
- 数据库：SQLite（本地）
- 测试：PyTest

功能需求：
1. 用户注册/登录（JWT鉴权）
2. 笔记增删改查（标题、内容、标签）
3. 待办事项管理（状态切换、过滤）
4. 仪表盘统计（笔记数、待办数、最近笔记）
5. 个人中心（修改用户名、头像、密码）

请帮我初始化项目结构，创建前后端基础框架。
```

**AI 返回要点**：
- 创建了完整的项目目录结构（backend/ + frontend/）
- 搭建了 Flask 工厂模式框架（app/__init__.py）
- 创建了 Next.js App Router 基础页面
- 配置了 Tailwind CSS 4 和 TypeScript

---

## Prompt 2：用户认证模块开发

**时间**：2026-07-14  
**对应文件**：`backend/app/api/auth.py`、`backend/app/models/user.py`、`backend/app/schemas/auth.py`、`frontend/src/app/login/page.tsx`、`frontend/src/app/register/page.tsx`

**目标**：实现用户注册、登录、JWT鉴权功能

**Prompt**：
```
请帮我实现用户认证模块，包括：

后端（Flask）：
1. 注册接口 POST /api/auth/register（account/username/email/password）
2. 登录接口 POST /api/auth/login（account/password），返回 access_token
3. 获取当前用户 GET /api/auth/me（需JWT）
4. 修改资料 PUT /api/auth/profile（username/avatar）
5. 修改密码 PUT /api/auth/password（old_password/new_password）

需要使用 Flask-JWT-Extended 进行鉴权，密码使用 werkzeug 哈希存储。

前端（Next.js）：
1. 登录页面 /login
2. 注册页面 /register
3. 使用 axios 封装 API 请求，自动附带 Token

请确保前后端统一响应格式：{code, message, data}
```

**AI 返回要点**：
- 实现了完整的认证 API（注册/登录/个人信息/修改资料/修改密码）
- 创建了 User 模型和 AuthSchema 校验
- 实现了登录和注册页面，包含表单校验
- 封装了 axios 请求拦截器，自动处理 Token

---

## Prompt 3：笔记模块开发

**时间**：2026-07-14  
**对应文件**：`backend/app/api/notes.py`、`backend/app/models/note.py`、`backend/app/schemas/note.py`、`frontend/src/app/notes/page.tsx`、`frontend/src/app/notes/[id]/page.tsx`

**目标**：实现笔记的增删改查功能

**Prompt**：
```
请帮我实现笔记管理模块：

后端：
1. GET /api/notes - 获取当前用户的笔记列表
2. POST /api/notes - 创建笔记（title/content/tag）
3. GET /api/notes/<id> - 获取笔记详情
4. PUT /api/notes/<id> - 更新笔记
5. DELETE /api/notes/<id> - 删除笔记

要求：
- 所有接口需要 JWT 鉴权
- 按 user_id 过滤，防止越权访问
- tag 字段可选，用于分类

前端：
1. 笔记列表页面 /notes - 展示所有笔记，支持按标签筛选
2. 笔记详情/编辑页面 /notes/[id] - 查看和编辑笔记内容
```

**AI 返回要点**：
- 实现了笔记 CRUD API
- 创建了 Note 模型和 NoteSchema
- 实现了笔记列表和详情页面
- 添加了标签筛选功能

---

## Prompt 4：待办模块开发

**时间**：2026-07-14  
**对应文件**：`backend/app/api/todos.py`、`backend/app/models/todo.py`、`backend/app/schemas/todo.py`、`frontend/src/app/todos/page.tsx`

**目标**：实现待办事项管理功能

**Prompt**：
```
请帮我实现待办事项管理模块：

后端：
1. GET /api/todos - 获取待办列表，支持 ?status=pending|done 过滤
2. POST /api/todos - 创建待办（title），默认状态 pending
3. PUT /api/todos/<id> - 更新待办（title/status）
4. DELETE /api/todos/<id> - 删除待办

要求：
- 状态只有 pending 和 done 两种
- 按 user_id 过滤

前端：
1. 待办列表页面 /todos
2. 支持状态过滤（全部/待办/已完成）
3. 点击切换状态，双击编辑标题
```

**AI 返回要点**：
- 实现了待办 CRUD API
- 创建了 Todo 模型和 TodoSchema
- 实现了待办列表页面，支持状态过滤和双击编辑

---

## Prompt 5：仪表盘与统计模块

**时间**：2026-07-14  
**对应文件**：`backend/app/api/stats.py`、`frontend/src/app/dashboard/page.tsx`、`backend/tests/test_stats.py`、`backend/tests/test_notes.py`、`backend/tests/test_todos.py`

**目标**：实现仪表盘统计功能和单元测试

**Prompt**：
```
请帮我实现仪表盘统计模块和单元测试：

后端：
1. GET /api/stats/dashboard - 返回 {note_count, todo_count, done_count}

前端：
1. 仪表盘页面 /dashboard - 展示统计卡片和最近笔记列表

测试（PyTest）：
1. 为 auth、notes、todos、stats 模块编写单元测试
2. 覆盖 CRUD 操作、越权访问、参数校验失败等场景
3. 至少 40 个测试用例
```

**AI 返回要点**：
- 实现了仪表盘统计 API
- 创建了仪表盘页面，展示统计卡片和最近笔记
- 编写了 42 个 PyTest 测试用例，覆盖所有主要场景

---

## Prompt 6：个人中心页面

**时间**：2026-07-15  
**对应文件**：`frontend/src/app/profile/page.tsx`、`backend/app/api/auth.py`（修改密码部分）

**目标**：实现个人中心和修改密码功能

**Prompt**：
```
请帮我实现个人中心页面：

1. 展示当前用户信息（头像、用户名、邮箱、注册时间）
2. 修改用户名和头像
3. 修改密码（需要输入原密码）
4. 修改密码成功后自动退出登录

要求：
- 修改密码成功后清除 token，跳转到登录页
- 表单验证：新密码至少6位
```

**AI 返回要点**：
- 实现了个人中心页面，展示用户信息
- 实现了修改用户名/头像功能
- 实现了修改密码功能，成功后自动退出

---

## Prompt 7：代码审查与优化

**时间**：2026-07-15  
**对应文件**：`docs/code-review-report.md`、`docs/database-report.md`、`docs/api.md`

**目标**：进行代码审查并生成文档

**Prompt**：
```
请帮我对整个项目进行代码审查，并生成以下文档：

1. Code Review 报告 - 包含代码质量、安全性、性能、工程规范等维度的评估
2. 数据库设计报告 - 包含 ER 图、表结构详情、建表 SQL
3. API 文档 - 包含所有接口的请求/响应格式、参数说明

同时请指出需要优化的地方并提供改进建议。
```

**AI 返回要点**：
- 生成了完整的代码审查报告，包含优缺点分析和优化建议
- 生成了数据库设计报告，包含 ER 图和详细表结构
- 生成了完整的 API 文档，包含所有接口说明
- 建议了分页优化、CI/CD 添加等改进方向

---

## Prompt 8：CI/CD 配置

**时间**：2026-07-15  
**对应文件**：`.github/workflows/ci.yml`

**目标**：配置 GitHub Actions 自动测试

**Prompt**：
```
请帮我配置 GitHub Actions CI/CD：

1. 后端：push 时自动安装依赖并运行 PyTest
2. 前端：push 时自动安装依赖并运行 TypeScript 类型检查
3. 分别在 ubuntu-latest 上运行

请创建 .github/workflows/ci.yml 文件。
```

**AI 返回要点**：
- 创建了 GitHub Actions CI 配置文件
- 配置了后端测试和前端类型检查两个独立 job
- 支持 push 和 pull_request 触发

---

## Prompt 9：UI 美化与完善

**时间**：2026-07-15  
**对应文件**：`frontend/src/components/layout/Sidebar.tsx`、`frontend/src/components/ui/Skeleton.tsx`、`frontend/src/components/ui/Toast.tsx`

**目标**：优化 UI 组件和交互体验

**Prompt**：
```
请帮我优化前端 UI：

1. 创建统一的 Sidebar 组件，包含导航菜单
2. 创建 Skeleton 骨架屏组件，用于加载状态
3. 创建 Toast 组件，用于全局消息提示
4. 添加响应式布局，适配不同屏幕尺寸
5. 优化按钮样式和交互反馈

使用 Tailwind CSS 4 实现。
```

**AI 返回要点**：
- 创建了统一的 Sidebar 导航组件
- 创建了 Skeleton 骨架屏组件
- 创建了 Toast 消息提示组件
- 优化了整体样式和交互体验

---

## Prompt 10：部署文档与项目完善

**时间**：2026-07-15  
**对应文件**：`README.md`、`vercel.json`、`backend/.env.example`

**目标**：完善项目文档和部署配置

**Prompt**：
```
请帮我完善项目文档和部署配置：

1. 更新 README.md，包含项目介绍、技术栈、安装运行指南、API 文档摘要
2. 创建 vercel.json 配置文件，用于 Vercel 部署
3. 创建 .env.example 文件，包含所有环境变量说明
4. 添加异常场景处理说明（Token过期、未登录访问、删除确认等）
```

**AI 返回要点**：
- 更新了 README.md，包含完整的项目文档
- 创建了 vercel.json 配置
- 创建了 .env.example 模板
- 添加了异常场景处理说明

---

## Prompt 11：笔记搜索与分页功能

**时间**：2026-07-16  
**对应文件**：`backend/app/api/notes.py`、`frontend/src/app/notes/page.tsx`

**目标**：实现笔记搜索、标签筛选和分页功能

**Prompt**：
```
请帮我实现笔记搜索和分页功能：

后端：
1. 修改 GET /api/notes 接口，支持以下查询参数：
   - keyword：关键词搜索（标题或内容）
   - tag：标签筛选
   - page：页码（默认1）
   - size：每页数量（默认10）
2. 返回格式改为分页格式：{items, total, page, size, pages}

前端：
1. 在笔记列表页面添加搜索框
2. 添加常用标签快捷选择按钮
3. 添加分页组件，支持翻页

使用 Tailwind CSS 4 实现美观的搜索和分页 UI。
```

**AI 返回要点**：
- 后端实现了搜索、筛选和分页功能
- 前端添加了搜索框和标签筛选按钮
- 添加了分页组件

---

## Prompt 12：待办拖拽排序功能

**时间**：2026-07-16  
**对应文件**：`backend/app/models/todo.py`、`backend/app/api/todos.py`、`frontend/src/app/todos/page.tsx`

**目标**：实现待办事项拖拽排序

**Prompt**：
```
请帮我实现待办事项拖拽排序功能：

后端：
1. 在 Todo 模型中添加 order 字段（Integer类型，默认0）
2. 添加 POST /api/todos/reorder 接口，接收排序后的 todo_id 数组
3. 更新 GET /api/todos 接口，按 order 字段排序

前端：
1. 使用 HTML5 Drag API 实现待办列表的拖拽排序
2. 拖拽时显示视觉反馈（高亮放置区域）
3. 拖拽结束后调用 reorder API 保存排序

使用 Tailwind CSS 4 实现拖拽效果。
```

**AI 返回要点**：
- 后端添加了 order 字段和 reorder API
- 前端实现了拖拽排序功能，带有视觉反馈

---

## Prompt 13：仪表盘可视化增强

**时间**：2026-07-16  
**对应文件**：`backend/app/api/stats.py`、`frontend/src/app/dashboard/page.tsx`

**目标**：增强仪表盘数据可视化展示

**Prompt**：
```
请帮我增强仪表盘功能：

后端：
1. 修改 GET /api/stats/dashboard 接口，添加：
   - completion_rate：待办完成率（百分比）
   - tag_stats：笔记标签统计（标签名和数量）

前端：
1. 添加待办完成进度条
2. 添加环形图展示完成率
3. 添加标签统计图表

使用 Tailwind CSS 4 和 SVG 实现图表效果。
```

**AI 返回要点**：
- 后端返回了完成率和标签统计数据
- 前端添加了进度条和环形图
- 添加了标签统计展示

---

## Prompt 14：响应式布局与移动端适配

**时间**：2026-07-16  
**对应文件**：`frontend/src/components/layout/Sidebar.tsx`

**目标**：实现响应式布局，适配移动端

**Prompt**：
```
请帮我实现响应式布局：

1. Sidebar 组件添加移动端汉堡菜单按钮
2. 移动端点击菜单按钮弹出侧边导航
3. 添加遮罩层，点击遮罩关闭菜单
4. 确保所有页面在移动端正常显示

使用 Tailwind CSS 4 的响应式断点（sm, md, lg）实现。
```

**AI 返回要点**：
- 添加了移动端汉堡菜单
- 实现了侧边栏弹出效果
- 添加了遮罩层

---

## Prompt 15：统一操作反馈组件

**时间**：2026-07-16  
**对应文件**：`frontend/src/components/ui/Toast.tsx`、`frontend/src/components/ui/ConfirmDialog.tsx`、`frontend/src/app/layout.tsx`

**目标**：创建统一的操作反馈组件

**Prompt**：
```
请帮我创建统一的操作反馈组件：

1. Toast 组件：
   - 支持成功、错误、警告、信息四种类型
   - 自动消失（3秒）
   - 支持手动关闭
   - 使用 Context Provider 模式全局管理

2. ConfirmDialog 组件：
   - 确认弹窗，支持自定义标题和内容
   - 取消和确认按钮
   - 返回 Promise

3. 在 layout.tsx 中引入 ToastProvider

4. 在笔记和待办页面中使用 Toast 和 ConfirmDialog
```

**AI 返回要点**：
- 创建了 ToastProvider 和 useToast hook
- 创建了 ConfirmDialog 组件
- 在所有页面中集成了操作反馈

---

## Prompt 16：跨域问题修复与 API 代理配置

**时间**：2026-07-16  
**对应文件**：`frontend/next.config.ts`、`frontend/src/lib/api.ts`

**目标**：修复前后端跨域问题

**Prompt**：
```
前端调用后端 API 出现跨域错误，请帮我配置 Next.js 代理：

1. 在 next.config.ts 中配置 rewrites，将 /api/* 请求转发到 http://localhost:5000/api/*
2. 修改 api.ts 中的 baseURL，使用相对路径

确保前端可以正常调用后端 API。
```

**AI 返回要点**：
- 配置了 Next.js rewrites 代理
- 修改了 baseURL 使用相对路径
- 跨域问题解决

---

## 总结

| Prompt | 日期 | 对应文件 | 完成状态 |
|--------|------|----------|----------|
| 项目初始化 | 2026-07-14 | 整体架构 | ✅ |
| 用户认证 | 2026-07-14 | auth.py, user.py, login/register | ✅ |
| 笔记模块 | 2026-07-14 | notes.py, note.py, notes/ | ✅ |
| 待办模块 | 2026-07-14 | todos.py, todo.py, todos/ | ✅ |
| 仪表盘与测试 | 2026-07-14 | stats.py, dashboard/, tests/ | ✅ |
| 个人中心 | 2026-07-15 | profile/ | ✅ |
| 代码审查 | 2026-07-15 | docs/ | ✅ |
| CI/CD | 2026-07-15 | .github/workflows/ci.yml | ✅ |
| UI 美化 | 2026-07-15 | components/ | ✅ |
| 部署文档 | 2026-07-15 | README.md, vercel.json | ✅ |
| 笔记搜索与分页 | 2026-07-16 | notes.py, notes/page.tsx | ✅ |
| 待办拖拽排序 | 2026-07-16 | todo.py, todos.py, todos/page.tsx | ✅ |
| 仪表盘可视化 | 2026-07-16 | stats.py, dashboard/page.tsx | ✅ |
| 响应式布局 | 2026-07-16 | Sidebar.tsx | ✅ |
| 操作反馈组件 | 2026-07-16 | Toast.tsx, ConfirmDialog.tsx | ✅ |
| API 代理配置 | 2026-07-16 | next.config.ts, api.ts | ✅ |
