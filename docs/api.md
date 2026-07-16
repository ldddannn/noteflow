# NoteFlow API 文档

> Base URL: `http://localhost:5000`  
> Content-Type: `application/json`  
> 鉴权方式: `Authorization: Bearer <token>`

---

## 统一响应格式

### 成功

```json
{
  "code": 200,
  "message": "success",
  "data": { }
}
```

### 错误

```json
{
  "code": 400,
  "message": "错误描述",
  "data": null
}
```

---

## 1. 认证模块 `/api/auth`

### POST `/api/auth/register` — 注册

**请求体**：
```json
{
  "account": "myaccount",
  "username": "My Name",
  "email": "test@example.com",
  "password": "123456"
}
```

**成功响应 (201)**：
```json
{
  "code": 201,
  "message": "注册成功",
  "data": null
}
```

**错误响应**：
- `400` — 参数校验失败（account/username/email/password 为空或格式错误）
- `409` — 账号已存在 / 邮箱已被注册

---

### POST `/api/auth/login` — 登录

**请求体**：
```json
{
  "account": "myaccount",
  "password": "123456"
}
```

**成功响应 (200)**：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "access_token": "eyJ...",
    "user": {
      "id": 1,
      "account": "myaccount",
      "username": "My Name",
      "email": "test@example.com",
      "avatar": null,
      "created_at": "2026-07-15T00:00:00+00:00"
    }
  }
}
```

---

### GET `/api/auth/me` — 当前用户信息

**请求头**：`Authorization: Bearer <token>`

**成功响应 (200)**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "account": "myaccount",
    "username": "My Name",
    "email": "test@example.com",
    "avatar": null,
    "created_at": "2026-07-15T00:00:00+00:00"
  }
}
```

---

### PUT `/api/auth/profile` — 修改资料

**请求头**：`Authorization: Bearer <token>`

**请求体**：
```json
{
  "username": "New Name",
  "avatar": "https://example.com/avatar.png"
}
```

**成功响应 (200)**：返回更新后的 user 对象（同上结构）

---

### PUT `/api/auth/password` — 修改密码

**请求头**：`Authorization: Bearer <token>`

**请求体**：
```json
{
  "old_password": "123456",
  "new_password": "654321"
}
```

**错误响应**：
- `400` — 原密码错误 / 新密码少于 6 位

---

## 2. 笔记模块 `/api/notes`

### GET `/api/notes` — 笔记列表（支持搜索、筛选、分页）

**请求头**：`Authorization: Bearer <token>`

**查询参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| keyword | string | 否 | - | 关键词搜索（标题或内容） |
| tag | string | 否 | - | 标签筛选 |
| page | integer | 否 | 1 | 页码 |
| size | integer | 否 | 10 | 每页数量 |

**成功响应 (200)**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "title": "笔记标题",
        "content": "内容...",
        "tag": "工作",
        "user_id": 1,
        "created_at": "2026-07-15T00:00:00+00:00",
        "updated_at": "2026-07-15T00:00:00+00:00"
      }
    ],
    "total": 50,
    "page": 1,
    "size": 10,
    "pages": 5
  }
}
```

---

### POST `/api/notes` — 创建笔记

**请求头**：`Authorization: Bearer <token>`

**请求体**：
```json
{
  "title": "标题",
  "content": "内容",
  "tag": "标签（可选）"
}
```

**成功响应 (201)**：返回创建的 note 对象

---

### GET `/api/notes/<id>` — 笔记详情

**请求头**：`Authorization: Bearer <token>`

**错误**：`403` 无权访问（非本人笔记）/ `404` 不存在

---

### PUT `/api/notes/<id>` — 更新笔记

**请求头**：`Authorization: Bearer <token>`

**请求体**：同创建

---

### DELETE `/api/notes/<id>` — 删除笔记

**请求头**：`Authorization: Bearer <token>`

**成功响应 (200)**：`{"code": 200, "message": "删除成功", "data": null}`

---

## 3. 待办模块 `/api/todos`

### GET `/api/todos` — 待办列表

**请求头**：`Authorization: Bearer <token>`

**查询参数**：`?status=pending|done`（可选，不传返回全部）

**成功响应 (200)**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "买牛奶",
      "status": "pending",
      "user_id": 1,
      "created_at": "2026-07-15T00:00:00+00:00",
      "updated_at": "2026-07-15T00:00:00+00:00"
    }
  ]
}
```

---

### POST `/api/todos` — 创建待办

**请求头**：`Authorization: Bearer <token>`

**请求体**：
```json
{
  "title": "待办标题"
}
```

默认状态为 `pending`。创建后可通过 PUT 修改状态为 `done`。

---

### GET `/api/todos/<id>` — 待办详情

**请求头**：`Authorization: Bearer <token>`

---

### PUT `/api/todos/<id>` — 更新待办

**请求头**：`Authorization: Bearer <token>`

**请求体**（至少一个字段）：
```json
{
  "title": "新标题",
  "status": "done"
}
```

---

### DELETE `/api/todos/<id>` — 删除待办

**请求头**：`Authorization: Bearer <token>`

---

### POST `/api/todos/reorder` — 批量重排序

**请求头**：`Authorization: Bearer <token>`

**请求体**：
```json
{
  "order": [3, 1, 2, 5, 4]
}
```

**说明**：传入排序后的 todo_id 数组，系统会根据数组顺序更新每个待办的 order 字段。

**成功响应 (200)**：
```json
{
  "code": 200,
  "message": "排序更新成功",
  "data": null
}
```

---

## 4. 统计模块 `/api/stats`

### GET `/api/stats/dashboard` — 仪表盘统计

**请求头**：`Authorization: Bearer <token>`

**成功响应 (200)**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "note_count": 5,
    "todo_count": 10,
    "done_count": 3,
    "completion_rate": 30,
    "tag_stats": [
      {"tag": "工作", "count": 2},
      {"tag": "学习", "count": 2},
      {"tag": "生活", "count": 1}
    ]
  }
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| note_count | integer | 笔记总数 |
| todo_count | integer | 待办总数 |
| done_count | integer | 已完成待办数 |
| completion_rate | integer | 待办完成率（0-100） |
| tag_stats | array | 标签统计数组 |

---

## 5. 健康检查

### GET `/api/health`

```json
{
  "code": 200,
  "message": "ok"
}
```
