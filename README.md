# NoteFlow — 个人笔记与待办管理系统

> **AI 辅助编程实训项目** | Next.js 16 + Flask 3 | 个人独立完成

## 项目介绍
NoteFlow 是一个个人笔记与待办管理系统，支持：
- 用户注册 / 登录（JWT 鉴权）
- 笔记增删改查（标题、内容、标签）
- **笔记搜索与分页**（支持关键词搜索和标签筛选）
- 待办事项管理（状态切换、过滤、双击编辑）
- **待办拖拽排序**（HTML5 Drag API，自动保存排序）
- **仪表盘统计**（笔记数、待办数、完成进度、标签统计）
- 个人中心（修改用户名、头像、密码）
- **响应式布局**（适配桌面端和移动端）
- **统一操作反馈**（Toast 提示、Confirm 确认弹窗）

## 技术栈
| 层级 | 技术 |
|------|------|
| 前端 | Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 |
| 后端 | Flask 3 + SQLAlchemy + Flask-JWT-Extended + Marshmallow |
| 数据库 | SQLite（本地）/ PostgreSQL（腾讯云 Debian 服务器） |
| 测试 | PyTest（42 个测试用例） |
| 部署 | 腾讯云 Debian 服务器（公网IP：124.221.220.227）+ Nginx 反向代理 |

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

# 腾讯云 Debian 服务器部署流程

服务器信息：系统 Debian，公网 IP：124.221.220.227

### 1. 服务器初始化依赖
```bash
apt update && apt upgrade -y
apt install python3 python3-pip python3-venv git nginx postgresql postgresql-contrib nodejs npm -y
```
### 可选：安装 Miniconda 对齐本地开发环境
```bash
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh
source ~/.bashrc
conda create -n noteflow python=3.11 -y
conda activate noteflow
```
### 2. 拉取项目代码
```bash
git clone https://github.com/ldddannn/noteflow.git
cd noteflow
```
### 3. 后端 Flask 生产部署
```bash
conda activate noteflow
cd backend
pip install -r requirements.txt
pip install gunicorn
```
### 新建环境变量配置文
```bash
.env 内容：
SECRET_KEY=自定义随机高强度密钥
JWT_SECRET_KEY=自定义随机高强度密钥
DATABASE_URI=postgresql://postgres:你的数据库密码@127.0.0.1:5432/noteflow
FLASK_ENV=production
后台启动后端服务：
nohup gunicorn -w 4 -b 127.0.0.1:5000 run:app > backend.log 2>&1 &
```
### 4. 前端 Next.js 打包启动
```bash
cd ../frontend
npm install
npm run build
nohup npm start > frontend.log 2>&1 &
```
### 5. Nginx 反向代理配置（对外暴露公网 IP）
```bash
创建站点配置

vim /etc/nginx/sites-available/noteflow
nginx
server {
    listen 80;
    server_name 124.221.220.227;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
启用并重启 Nginx

ln -s /etc/nginx/sites-available/noteflow /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

部署完成访问地址：http://124.221.220.227
```
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
| GET | `/api/notes?keyword=&tag=&page=&size=` | JWT | 笔记列表（支持搜索、筛选、分页） |
| POST | `/api/notes` | JWT | 创建笔记 |
| GET | `/api/notes/<id>` | JWT | 笔记详情 |
| PUT | `/api/notes/<id>` | JWT | 更新笔记 |
| DELETE | `/api/notes/<id>` | JWT | 删除笔记 |

**查询参数**：
- `keyword` - 关键词搜索（标题或内容）
- `tag` - 标签筛选
- `page` - 页码（默认 1）
- `size` - 每页数量（默认 10）

### 待办模块 `/api/todos`

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/todos?status=pending\|done` | JWT | 待办列表（支持状态过滤） |
| POST | `/api/todos` | JWT | 创建待办 |
| GET | `/api/todos/<id>` | JWT | 待办详情 |
| PUT | `/api/todos/<id>` | JWT | 更新待办（标题/状态） |
| DELETE | `/api/todos/<id>` | JWT | 删除待办 |
| POST | `/api/todos/reorder` | JWT | 批量重排序 |

### 统计模块 `/api/stats`

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/stats/dashboard` | JWT | 笔记总数/待办总数/已完成数/完成率/标签统计 |

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
```bash
noteflow/
├── .github/
│   └── workflows/          # CI自动化工作流配置
├── backend/
│   ├── app/
│   │   ├── api/           # 蓝图路由
│   │   │   ├── auth.py    # /api/auth/*
│   │   │   ├── notes.py   # /api/notes/*
│   │   │   ├── todos.py   # /api/todos/*
│   │   │   └── stats.py   # /api/stats/*
│   │   ├── models/        # 数据库模型
│   │   ├── schemas/       # Marshmallow 参数校验
│   │   └── utils/         # 通用工具函数
│   ├── tests/             # PyTest 测试用例（共42个）
│   └── requirements.txt   # Python依赖清单
├── frontend/
│   └── src/
│       ├── app/           # Next.js App Router 页面（7个路由）
│       ├── components/    # 全局复用组件
│       ├── lib/           # Axios请求封装、工具函数
│       ├── hooks/         # 自定义React Hooks
│       └── types/         # TypeScript 类型定义
├── docs/                   # 项目文档目录
│    └── README.md
│    └── api.md
│    └── code-review-report.md
│    └── database-report.md
├── screenshot/             # 系统截图素材
├── .gitignore              # Git忽略文件配置
├── prompt_log.md           # 开发提示日志
├── README.md               # 项目说明文档
├── 个人总结报告.md         # 实训个人总结
└── 项目演示录屏.mp4        # 系统操作演示视频
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

# 注意事项
```bash
1.腾讯云服务器安全组必须放行 80（网页）、5432（PostgreSQL） 端口，否则公网无法访问服务和数据库；
2.本地开发使用 SQLite，腾讯云生产环境使用 PostgreSQL，需提前登录数据库创建 noteflow 库；
3.生产环境务必修改 .env 内 SECRET_KEY 和 JWT_SECRET_KEY，使用随机高强度密钥，禁止明文泄露；
4.当前使用 nohup 后台常驻进程，服务器重启后需重新执行前后端启动命令；如需开机自启，可配置 systemd 服务托管；
5.项目公网访问地址：http://124.221.220.227
```

## 补充额外优化建议

### 1. 补充 PostgreSQL 创建库命令：
```bash
sudo -u postgres psql
CREATE DATABASE noteflow;
\q
```
### 2.进程托管优化：
使用 systemd 替代 nohup，实现开机自启、崩溃自动重启
### 3.HTTPS 可选：
在 Nginx 配置 SSL 证书，实现 https://124.221.220.227 安全访问
### 4.前端接口地址修改：
前端 lib/axios.ts 开发环境为 http://localhost:5000/api，服务器环境改为 /api（Nginx 统一转发，无需写公网 IP）
