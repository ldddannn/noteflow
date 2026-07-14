def _login(client, username="testuser", password="123456"):
    """辅助：注册并登录，返回 token"""
    client.post(
        "/api/auth/register",
        json={"username": username, "email": f"{username}@test.com", "password": password},
    )
    res = client.post("/api/auth/login", json={"username": username, "password": password})
    return res.get_json()["data"]["access_token"]


def _auth_header(token):
    return {"Authorization": f"Bearer {token}"}


class TestCreateNote:
    """创建笔记"""

    def test_create_success(self, client):
        token = _login(client)
        res = client.post(
            "/api/notes",
            json={"title": "test title", "content": "test content", "tag": "test"},
            headers=_auth_header(token),
        )
        assert res.status_code == 201
        data = res.get_json()["data"]
        assert data["title"] == "test title"
        assert data["content"] == "test content"
        assert data["tag"] == "test"

    def test_create_minimal(self, client):
        """最小字段创建（无 tag）"""
        token = _login(client)
        res = client.post(
            "/api/notes",
            json={"title": "minimal", "content": "body"},
            headers=_auth_header(token),
        )
        assert res.status_code == 201
        assert res.get_json()["data"]["tag"] is None

    def test_create_without_auth(self, client):
        """未登录创建"""
        res = client.post("/api/notes", json={"title": "x", "content": "x"})
        assert res.status_code == 401

    def test_create_empty_title(self, client):
        """空标题"""
        token = _login(client)
        res = client.post(
            "/api/notes",
            json={"title": "", "content": "x"},
            headers=_auth_header(token),
        )
        assert res.status_code == 400


class TestListNotes:
    """笔记列表"""

    def test_list_empty(self, client):
        """空列表"""
        token = _login(client)
        res = client.get("/api/notes", headers=_auth_header(token))
        assert res.status_code == 200
        assert res.get_json()["data"] == []

    def test_list_multiple(self, client):
        """多笔记列表"""
        token = _login(client)
        client.post("/api/notes", json={"title": "A", "content": "a"}, headers=_auth_header(token))
        client.post("/api/notes", json={"title": "B", "content": "b"}, headers=_auth_header(token))

        res = client.get("/api/notes", headers=_auth_header(token))
        assert res.status_code == 200
        assert len(res.get_json()["data"]) == 2

    def test_list_isolated(self, client):
        """用户隔离：只能看到自己的笔记"""
        token1 = _login(client, "user1")
        token2 = _login(client, "user2")
        client.post("/api/notes", json={"title": "U1", "content": "x"}, headers=_auth_header(token1))
        client.post("/api/notes", json={"title": "U2", "content": "x"}, headers=_auth_header(token2))

        res = client.get("/api/notes", headers=_auth_header(token1))
        assert len(res.get_json()["data"]) == 1
        assert res.get_json()["data"][0]["title"] == "U1"


class TestGetNote:
    """获取单条笔记"""

    def test_get_own(self, client):
        token = _login(client)
        create_res = client.post(
            "/api/notes", json={"title": "T", "content": "C"}, headers=_auth_header(token)
        )
        note_id = create_res.get_json()["data"]["id"]

        res = client.get(f"/api/notes/{note_id}", headers=_auth_header(token))
        assert res.status_code == 200
        assert res.get_json()["data"]["title"] == "T"

    def test_get_others_note(self, client):
        """越权：不能看别人的笔记"""
        token1 = _login(client, "u1")
        token2 = _login(client, "u2")
        create_res = client.post(
            "/api/notes", json={"title": "U1", "content": "x"}, headers=_auth_header(token1)
        )
        note_id = create_res.get_json()["data"]["id"]

        res = client.get(f"/api/notes/{note_id}", headers=_auth_header(token2))
        assert res.status_code == 403

    def test_get_not_found(self, client):
        token = _login(client)
        res = client.get("/api/notes/99999", headers=_auth_header(token))
        assert res.status_code == 404


class TestUpdateNote:
    """更新笔记"""

    def test_update_success(self, client):
        token = _login(client)
        create_res = client.post(
            "/api/notes", json={"title": "old", "content": "old"}, headers=_auth_header(token)
        )
        note_id = create_res.get_json()["data"]["id"]

        res = client.put(
            f"/api/notes/{note_id}",
            json={"title": "new", "content": "new body", "tag": "updated"},
            headers=_auth_header(token),
        )
        assert res.status_code == 200
        data = res.get_json()["data"]
        assert data["title"] == "new"
        assert data["content"] == "new body"
        assert data["tag"] == "updated"

    def test_update_others_note(self, client):
        """越权更新"""
        token1 = _login(client, "u1")
        token2 = _login(client, "u2")
        create_res = client.post(
            "/api/notes", json={"title": "U1", "content": "x"}, headers=_auth_header(token1)
        )
        note_id = create_res.get_json()["data"]["id"]

        res = client.put(
            f"/api/notes/{note_id}",
            json={"title": "hacked", "content": "x"},
            headers=_auth_header(token2),
        )
        assert res.status_code == 403


class TestDeleteNote:
    """删除笔记"""

    def test_delete_success(self, client):
        token = _login(client)
        create_res = client.post(
            "/api/notes", json={"title": "del", "content": "x"}, headers=_auth_header(token)
        )
        note_id = create_res.get_json()["data"]["id"]

        res = client.delete(f"/api/notes/{note_id}", headers=_auth_header(token))
        assert res.status_code == 200
        assert res.get_json()["message"] == "删除成功"

        # 确认已删除
        get_res = client.get(f"/api/notes/{note_id}", headers=_auth_header(token))
        assert get_res.status_code == 404

    def test_delete_others_note(self, client):
        """越权删除"""
        token1 = _login(client, "u1")
        token2 = _login(client, "u2")
        create_res = client.post(
            "/api/notes", json={"title": "U1", "content": "x"}, headers=_auth_header(token1)
        )
        note_id = create_res.get_json()["data"]["id"]

        res = client.delete(f"/api/notes/{note_id}", headers=_auth_header(token2))
        assert res.status_code == 403
