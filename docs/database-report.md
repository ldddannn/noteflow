# NoteFlow 数据库设计报告

> 数据库引擎：SQLite（本地）/ PostgreSQL（生产）  
> ORM：Flask-SQLAlchemy  
> 迁移工具：Flask-Migrate

---

## 一、ER 图（实体关系）

```
┌──────────────────────┐
│       users          │
├──────────────────────┤
│ id          INTEGER  │──┐
│ account     STRING   │  │  1:N
│ username    STRING   │  │
│ email       STRING   │  │
│ avatar      STRING   │  │
│ password_hash STRING │  │
│ created_at  DATETIME │  │
│ updated_at  DATETIME │  │
└──────────────────────┘  │
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               │               ▼
┌──────────────────┐      │      ┌──────────────────┐
│      notes       │      │      │      todos       │
├──────────────────┤      │      ├──────────────────┤
│ id       INTEGER │      │      │ id       INTEGER │
│ title    STRING  │      │      │ title    STRING  │
│ content  TEXT    │      │      │ status   STRING  │
│ tag      STRING  │      │      │ user_id  FK      │──► users.id
│ user_id  FK      │──────┘      │ created_at DATETIME│
│ created_at DATETIME│           │ updated_at DATETIME│
│ updated_at DATETIME│           └──────────────────┘
└──────────────────┘
```

### 关系说明

| 关系 | 类型 | 说明 |
|------|------|------|
| User → Note | 1:N | 一个用户有多条笔记 |
| User → Todo | 1:N | 一个用户有多条待办 |
| 级联删除 | CASCADE | 删除用户时自动删除其所有笔记和待办 |

---

## 二、表结构详情

### 2.1 `users` — 用户表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | INTEGER | PRIMARY KEY | 自增主键 |
| `account` | VARCHAR(80) | **UNIQUE**, NOT NULL, INDEX | 登录标识，注册后不可修改 |
| `username` | VARCHAR(80) | NOT NULL | 显示名称，可修改 |
| `email` | VARCHAR(120) | **UNIQUE**, NOT NULL | 邮箱 |
| `avatar` | VARCHAR(500) | NULLABLE | 头像 URL |
| `password_hash` | VARCHAR(256) | NOT NULL | werkzeug 哈希密码 |
| `created_at` | DATETIME | DEFAULT UTC | 注册时间 |
| `updated_at` | DATETIME | ON UPDATE UTC | 最后修改时间 |

**索引**：
- `PRIMARY KEY (id)`
- `UNIQUE INDEX (account)`
- `UNIQUE INDEX (email)`

---

### 2.2 `notes` — 笔记表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | INTEGER | PRIMARY KEY | 自增主键 |
| `title` | VARCHAR(200) | NOT NULL | 笔记标题 |
| `content` | TEXT | NOT NULL, DEFAULT "" | 笔记内容 |
| `tag` | VARCHAR(50) | NULLABLE | 标签（如"工作""学习"） |
| `user_id` | INTEGER | **FK → users.id**, NOT NULL, INDEX | 所属用户 |
| `created_at` | DATETIME | DEFAULT UTC | 创建时间 |
| `updated_at` | DATETIME | ON UPDATE UTC | 最后修改时间 |

**索引**：
- `PRIMARY KEY (id)`
- `INDEX (user_id)`

**外键**：
- `user_id → users.id`（CASCADE 删除）

---

### 2.3 `todos` — 待办表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | INTEGER | PRIMARY KEY | 自增主键 |
| `title` | VARCHAR(200) | NOT NULL | 待办标题 |
| `status` | VARCHAR(10) | NOT NULL, DEFAULT "pending" | pending \| done |
| `user_id` | INTEGER | **FK → users.id**, NOT NULL, INDEX | 所属用户 |
| `created_at` | DATETIME | DEFAULT UTC | 创建时间 |
| `updated_at` | DATETIME | ON UPDATE UTC | 最后修改时间 |

**索引**：
- `PRIMARY KEY (id)`
- `INDEX (user_id)`

**外键**：
- `user_id → users.id`（CASCADE 删除）

---

## 三、建表 SQL（等价 DDL）

```sql
CREATE TABLE users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    account       VARCHAR(80)  NOT NULL UNIQUE,
    username      VARCHAR(80)  NOT NULL,
    email         VARCHAR(120) NOT NULL UNIQUE,
    avatar        VARCHAR(500),
    password_hash VARCHAR(256) NOT NULL,
    created_at    DATETIME DEFAULT (datetime('now')),
    updated_at    DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_account ON users(account);

CREATE TABLE notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      VARCHAR(200) NOT NULL,
    content    TEXT         NOT NULL DEFAULT '',
    tag        VARCHAR(50),
    user_id    INTEGER      NOT NULL,
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notes_user_id ON notes(user_id);

CREATE TABLE todos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      VARCHAR(200) NOT NULL,
    status     VARCHAR(10)  NOT NULL DEFAULT 'pending',
    user_id    INTEGER      NOT NULL,
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_todos_user_id ON todos(user_id);
```

---

## 四、字段类型映射

| Python / SQLAlchemy | SQLite | PostgreSQL |
|---------------------|--------|------------|
| `db.Integer` | INTEGER | INTEGER |
| `db.String(N)` | VARCHAR(N) | VARCHAR(N) |
| `db.Text` | TEXT | TEXT |
| `db.DateTime` | DATETIME (ISO-8601 string) | TIMESTAMPTZ |

---

## 五、数据安全

| 措施 | 说明 |
|------|------|
| 密码哈希 | werkzeug `generate_password_hash`（默认 pbkdf2:sha256） |
| 不返回密码 | `to_dict()` 不含 `password_hash` |
| 用户隔离 | 所有查询按 `user_id` 过滤 |
| 外键约束 | SQLite 默认启用，PostgreSQL 原生支持 |
| 级联删除 | 删除用户 → 自动删除关联笔记和待办 |

---

## 六、统计信息

| 指标 | 数值 |
|------|------|
| 表数量 | 3 |
| 总字段数 | 17 |
| 索引数 | 5 |
| 外键数 | 2 |
| CASCADE 关系 | 2 |

---

*报告日期：2026-07-15*
