# NoteFlow — 个人笔记与待办管理系统

> **线上 Demo**：（部署后填写）  
> **AI 辅助编程实训项目** | Next.js 14 + Flask | 个人独立完成

---

## 项目介绍

NoteFlow 是一个个人笔记与待办管理系统，支持用户注册登录、笔记增删改查、待办事项管理和仪表盘统计。

### 功能截图

（部署后补充截图到 `docs/screenshots/app/`）

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| 后端 | Flask 3 + SQLAlchemy + JWT |
| 数据库 | SQLite（本地）/ PostgreSQL（线上） |
| 部署 | Vercel（前端）+ Render（后端） |

---

## 本地安装与运行

### 环境要求

- Python 3.11+（conda 环境 `noteflow`）
- Node.js 18+

### 1. 克隆项目

```bash
git clone https://github.com/你的用户名/noteflow.git
cd noteflow
```

### 2. 启动后端

```bash
conda activate noteflow
cd backend
cp .env.example .env        # 修改 .env 中的密钥
python run.py               # 启动在 http://localhost:5000
```

### 3. 启动前端

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                 # 启动在 http://localhost:3000
```

---

## API 文档

详见 [`docs/api.md`](./docs/api.md) 或导入 Postman Collection `docs/noteflow.postman_collection.json`。

### 主要接口

| 模块 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 认证 | POST | `/api/auth/register` | 注册 |
| 认证 | POST | `/api/auth/login` | 登录 |
| 笔记 | GET/POST | `/api/notes` | 列表/创建 |
| 笔记 | GET/PUT/DELETE | `/api/notes/<id>` | 详情/更新/删除 |
| 待办 | GET/POST | `/api/todos` | 列表/创建 |
| 待办 | PUT/DELETE | `/api/todos/<id>` | 更新/删除 |
| 统计 | GET | `/api/stats/dashboard` | 仪表盘统计 |

---

## 项目结构

```
noteflow/
├── backend/          # Flask 后端
│   ├── app/
│   │   ├── api/      # 路由蓝图
│   │   ├── models/   # 数据库模型
│   │   ├── schemas/  # 请求校验
│   │   └── utils/    # 工具函数
│   └── tests/        # PyTest 测试
├── frontend/         # Next.js 前端
│   └── src/
│       ├── app/      # 页面路由（App Router）
│       ├── components/
│       ├── lib/      # API 封装 & 工具
│       └── types/    # TypeScript 类型
└── docs/             # 文档 & 截图
```

---

## 异常场景覆盖

| 场景 | 处理方式 |
|------|----------|
| 未登录访问受保护路由 | 重定向登录页 |
| Token 过期 | 401 拦截 → 清除登录态 |
| 表单校验失败 | 前端即时提示 + 后端二次校验 |
| 删除操作 | 二次确认弹窗 |
| 网络错误 | 友好错误提示 |
| 后端异常 | 统一 JSON 错误响应 |

---

## 注意事项

- Render 免费实例 15 分钟无请求会休眠，首次访问可能需要 30–60 秒唤醒
- 本地开发使用 SQLite，无需额外安装数据库
- 生产环境请修改 `.env` 中的 `SECRET_KEY` 和 `JWT_SECRET_KEY`

---

*项目完成日期：2026-07-XX*
