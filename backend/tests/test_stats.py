def _login(client, username="testuser", password="123456"):
    client.post(
        "/api/auth/register",
        json={"username": username, "email": f"{username}@test.com", "password": password},
    )
    res = client.post("/api/auth/login", json={"username": username, "password": password})
    return res.get_json()["data"]["access_token"]


def _auth_header(token):
    return {"Authorization": f"Bearer {token}"}


class TestStats:
    def test_empty_dashboard(self, client):
        """空数据"""
        token = _login(client)
        res = client.get("/api/stats/dashboard", headers=_auth_header(token))
        assert res.status_code == 200
        data = res.get_json()["data"]
        assert data["note_count"] == 0
        assert data["todo_count"] == 0
        assert data["done_count"] == 0

    def test_dashboard_with_data(self, client):
        """有数据时的统计"""
        token = _login(client)
        # 创建 2 条笔记
        client.post("/api/notes", json={"title": "A", "content": "a"}, headers=_auth_header(token))
        client.post("/api/notes", json={"title": "B", "content": "b"}, headers=_auth_header(token))
        # 创建 3 条待办，其中 1 条已完成
        r = client.post("/api/todos", json={"title": "T1"}, headers=_auth_header(token))
        client.put(f"/api/todos/{r.get_json()['data']['id']}", json={"status": "done"}, headers=_auth_header(token))
        client.post("/api/todos", json={"title": "T2"}, headers=_auth_header(token))
        client.post("/api/todos", json={"title": "T3"}, headers=_auth_header(token))

        res = client.get("/api/stats/dashboard", headers=_auth_header(token))
        assert res.status_code == 200
        data = res.get_json()["data"]
        assert data["note_count"] == 2
        assert data["todo_count"] == 3
        assert data["done_count"] == 1

    def test_dashboard_user_isolated(self, client):
        """用户隔离"""
        token1 = _login(client, "u1")
        token2 = _login(client, "u2")
        client.post("/api/notes", json={"title": "U1", "content": "x"}, headers=_auth_header(token1))

        # u2 看不到 u1 的数据
        res = client.get("/api/stats/dashboard", headers=_auth_header(token2))
        data = res.get_json()["data"]
        assert data["note_count"] == 0

    def test_without_auth(self, client):
        """未登录"""
        res = client.get("/api/stats/dashboard")
        assert res.status_code == 401
