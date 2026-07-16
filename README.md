# NoteFlow — 个人笔记与待办管理系统

> **AI 辅助编程实训项目** | Next.js 16 + Flask 3 | 个人独立完成

---

## 项目介绍

NoteFlow 是一个个人笔记与待办管理系统，支持：

- 用户注册 / 登录（JWT 鉴权）
- 笔记增删改查（标题、内容、标签）
- 待办事项管理（状态切换、过滤、双击编辑）
- 仪表盘统计（笔记数、待办数、最近笔记）
- 个人中心（修改用户名、头像、密码）

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 |
| 后端 | Flask 3 + SQLAlchemy + Flask-JWT-Extended + Marshmallow |
| 数据库 | SQLite（本地）/ PostgreSQL（Render） |
| 测试 | PyTest（42 个测试用例） |
| 部署 | Vercel（前端）+ Render（后端） |

---

## 本地安装与运行

### 环境要求

- Python 3.11+（conda 环境 `noteflow`）
- Node.js 18+

### 1. 克隆项目

```bash
git clone https://gitee.com/liu-danD/noteflow.git
cd noteflow
```

### 2. 启动后端

```bash
conda activate noteflow
cd backend
python run.py               # 启动在 http://localhost:5000
```

首次运行会自动创建 SQLite 数据库和表。

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev                 # 启动在 http://localhost:3000
```

### 4. 运行测试

```bash
conda activate noteflow
python -m pytest backend/tests/ -v   # 42 个测试
```

---

## API 文档

### 认证模块 `/api/auth`

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/auth/register` | 公开 | 注册（account/username/email/password） |
| POST | `/api/auth/login` | 公开 | 登录，返回 access_token |
| GET | `/api/auth/me` | JWT | 获取当前用户信息 |
| PUT | `/api/auth/profile` | JWT | 修改用户名/头像 |
| PUT | `/api/auth/password` | JWT | 修改密码 |

### 笔记模块 `/api/notes`

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/notes` | JWT | 笔记列表 |
| POST | `/api/notes` | JWT | 创建笔记 |
| GET | `/api/notes/<id>` | JWT | 笔记详情 |
| PUT | `/api/notes/<id>` | JWT | 更新笔记 |
| DELETE | `/api/notes/<id>` | JWT | 删除笔记 |

### 待办模块 `/api/todos`

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/todos?status=pending\|done` | JWT | 待办列表（支持状态过滤） |
| POST | `/api/todos` | JWT | 创建待办 |
| GET | `/api/todos/<id>` | JWT | 待办详情 |
| PUT | `/api/todos/<id>` | JWT | 更新待办（标题/状态） |
| DELETE | `/api/todos/<id>` | JWT | 删除待办 |

### 统计模块 `/api/stats`

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/stats/dashboard` | JWT | 笔记总数/待办总数/已完成数 |

### 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": { }
}
```

---

## 项目结构

```
noteflow/
├── backend/
│   ├── app/
│   │   ├── api/           # 蓝图路由
│   │   │   ├── auth.py    # /api/auth/*
│   │   │   ├── notes.py   # /api/notes/*
│   │   │   ├── todos.py   # /api/todos/*
│   │   │   └── stats.py   # /api/stats/*
│   │   ├── models/        # 数据库模型
│   │   ├── schemas/       # Marshmallow 校验
│   │   └── utils/         # 工具函数
│   ├── tests/             # PyTest（42 用例）
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── app/           # App Router 页面（7 路由）
│       ├── components/    # 可复用组件
│       ├── lib/           # Axios 封装 & 工具
│       ├── hooks/         # 自定义 Hooks
│       └── types/         # TypeScript 类型
└── docs/
    └── code-review-report.md
```

---

## 前端路由

| 路由 | 页面 | 鉴权 |
|------|------|------|
| `/login` | 登录 | 公开 |
| `/register` | 注册 | 公开 |
| `/dashboard` | 仪表盘 | 需登录 |
| `/notes` | 笔记列表 | 需登录 |
| `/notes/[id]` | 笔记详情/编辑 | 需登录 |
| `/todos` | 待办列表 | 需登录 |
| `/profile` | 个人中心 | 需登录 |

---

## 异常场景覆盖

| 场景 | 处理方式 |
|------|----------|
| 未登录访问受保护路由 | proxy.ts 拦截 → 重定向 `/login` |
| Token 过期 | Axios 401 拦截器 → 清除登录态 → 跳转登录页 |
| 表单校验失败 | 前端即时提示 + 后端 Marshmallow 双重校验 |
| 删除操作 | `confirm()` 二次确认 |
| 修改密码成功 | 自动退出 → 跳转登录页重新登录 |
| 后端异常 | 全局错误处理器 → 统一 JSON 错误响应 |
| 404 页面 | Next.js `not-found.tsx` 友好页面 |

---

## 注意事项

- Render 免费实例 15 分钟无请求会休眠，首次访问可能需 30–60 秒唤醒
- 本地开发使用 SQLite，无需额外安装数据库
- 生产环境请修改 `SECRET_KEY` 和 `JWT_SECRET_KEY`

---
