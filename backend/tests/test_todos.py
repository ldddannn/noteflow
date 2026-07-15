def _login(client, account="testuser", password="123456"):
    """辅助：注册并登录，返回 token"""
    client.post(
        "/api/auth/register",
        json={"account": account, "username": account, "email": f"{account}@test.com", "password": password},
    )
    res = client.post("/api/auth/login", json={"account": account, "password": password})
    return res.get_json()["data"]["access_token"]


def _auth_header(token):
    return {"Authorization": f"Bearer {token}"}


class TestCreateTodo:
    """创建待办"""

    def test_create_success(self, client):
        token = _login(client)
        res = client.post(
            "/api/todos",
            json={"title": "buy milk"},
            headers=_auth_header(token),
        )
        assert res.status_code == 201
        data = res.get_json()["data"]
        assert data["title"] == "buy milk"
        assert data["status"] == "pending"

    def test_create_without_auth(self, client):
        res = client.post("/api/todos", json={"title": "x"})
        assert res.status_code == 401

    def test_create_empty_title(self, client):
        token = _login(client)
        res = client.post(
            "/api/todos",
            json={"title": ""},
            headers=_auth_header(token),
        )
        assert res.status_code == 400


class TestListTodos:
    """待办列表"""

    def test_list_empty(self, client):
        token = _login(client)
        res = client.get("/api/todos", headers=_auth_header(token))
        assert res.status_code == 200
        assert res.get_json()["data"] == []

    def test_list_filter(self, client):
        """按状态过滤"""
        token = _login(client)
        # 创建两条不同状态
        r1 = client.post("/api/todos", json={"title": "A"}, headers=_auth_header(token))
        tid = r1.get_json()["data"]["id"]
        client.put(f"/api/todos/{tid}", json={"status": "done"}, headers=_auth_header(token))
        client.post("/api/todos", json={"title": "B"}, headers=_auth_header(token))

        # 过滤 pending
        res = client.get("/api/todos?status=pending", headers=_auth_header(token))
        assert len(res.get_json()["data"]) == 1
        assert res.get_json()["data"][0]["title"] == "B"

        # 过滤 done
        res = client.get("/api/todos?status=done", headers=_auth_header(token))
        assert len(res.get_json()["data"]) == 1
        assert res.get_json()["data"][0]["title"] == "A"

    def test_list_isolated(self, client):
        """用户隔离"""
        token1 = _login(client, "u1")
        token2 = _login(client, "u2")
        client.post("/api/todos", json={"title": "U1"}, headers=_auth_header(token1))
        client.post("/api/todos", json={"title": "U2"}, headers=_auth_header(token2))

        res = client.get("/api/todos", headers=_auth_header(token1))
        assert len(res.get_json()["data"]) == 1
        assert res.get_json()["data"][0]["title"] == "U1"


class TestGetTodo:
    """获取单条待办"""

    def test_get_own(self, client):
        token = _login(client)
        r = client.post("/api/todos", json={"title": "T"}, headers=_auth_header(token))
        tid = r.get_json()["data"]["id"]

        res = client.get(f"/api/todos/{tid}", headers=_auth_header(token))
        assert res.status_code == 200
        assert res.get_json()["data"]["title"] == "T"

    def test_get_others(self, client):
        token1 = _login(client, "u1")
        token2 = _login(client, "u2")
        r = client.post("/api/todos", json={"title": "U1"}, headers=_auth_header(token1))
        tid = r.get_json()["data"]["id"]

        res = client.get(f"/api/todos/{tid}", headers=_auth_header(token2))
        assert res.status_code == 403

    def test_get_not_found(self, client):
        token = _login(client)
        res = client.get("/api/todos/99999", headers=_auth_header(token))
        assert res.status_code == 404


class TestUpdateTodo:
    """更新待办"""

    def test_toggle_status(self, client):
        """切换状态"""
        token = _login(client)
        r = client.post("/api/todos", json={"title": "T"}, headers=_auth_header(token))
        tid = r.get_json()["data"]["id"]

        res = client.put(f"/api/todos/{tid}", json={"status": "done"}, headers=_auth_header(token))
        assert res.status_code == 200
        assert res.get_json()["data"]["status"] == "done"

    def test_update_title(self, client):
        """修改标题"""
        token = _login(client)
        r = client.post("/api/todos", json={"title": "old"}, headers=_auth_header(token))
        tid = r.get_json()["data"]["id"]

        res = client.put(f"/api/todos/{tid}", json={"title": "new title"}, headers=_auth_header(token))
        assert res.status_code == 200
        assert res.get_json()["data"]["title"] == "new title"

    def test_update_others(self, client):
        """越权更新"""
        token1 = _login(client, "u1")
        token2 = _login(client, "u2")
        r = client.post("/api/todos", json={"title": "U1"}, headers=_auth_header(token1))
        tid = r.get_json()["data"]["id"]

        res = client.put(f"/api/todos/{tid}", json={"status": "done"}, headers=_auth_header(token2))
        assert res.status_code == 403


class TestDeleteTodo:
    """删除待办"""

    def test_delete_success(self, client):
        token = _login(client)
        r = client.post("/api/todos", json={"title": "del"}, headers=_auth_header(token))
        tid = r.get_json()["data"]["id"]

        res = client.delete(f"/api/todos/{tid}", headers=_auth_header(token))
        assert res.status_code == 200
        assert res.get_json()["message"] == "删除成功"

        # 确认已删除
        get_res = client.get(f"/api/todos/{tid}", headers=_auth_header(token))
        assert get_res.status_code == 404

    def test_delete_others(self, client):
        """越权删除"""
        token1 = _login(client, "u1")
        token2 = _login(client, "u2")
        r = client.post("/api/todos", json={"title": "U1"}, headers=_auth_header(token1))
        tid = r.get_json()["data"]["id"]

        res = client.delete(f"/api/todos/{tid}", headers=_auth_header(token2))
        assert res.status_code == 403
