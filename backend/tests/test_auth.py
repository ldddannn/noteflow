import json


def test_register_success(client):
    """测试注册成功"""
    res = client.post(
        "/api/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "123456"},
    )
    assert res.status_code == 201
    assert res.get_json()["message"] == "注册成功"


def test_register_duplicate_username(client):
    """测试重复用户名"""
    client.post(
        "/api/auth/register",
        json={"username": "dupuser", "email": "dup1@example.com", "password": "123456"},
    )
    res = client.post(
        "/api/auth/register",
        json={"username": "dupuser", "email": "dup2@example.com", "password": "123456"},
    )
    assert res.status_code == 409
    assert "用户名已存在" in res.get_json()["message"]


def test_register_duplicate_email(client):
    """测试重复邮箱"""
    client.post(
        "/api/auth/register",
        json={"username": "user1", "email": "same@example.com", "password": "123456"},
    )
    res = client.post(
        "/api/auth/register",
        json={"username": "user2", "email": "same@example.com", "password": "123456"},
    )
    assert res.status_code == 409
    assert "邮箱已被注册" in res.get_json()["message"]


def test_register_short_password(client):
    """测试密码过短"""
    res = client.post(
        "/api/auth/register",
        json={"username": "test", "email": "test@test.com", "password": "12345"},
    )
    assert res.status_code == 400


def test_login_success(client):
    """测试登录成功"""
    client.post(
        "/api/auth/register",
        json={"username": "loginuser", "email": "login@test.com", "password": "123456"},
    )
    res = client.post(
        "/api/auth/login",
        json={"username": "loginuser", "password": "123456"},
    )
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert "access_token" in data
    assert data["user"]["username"] == "loginuser"


def test_login_wrong_password(client):
    """测试密码错误"""
    client.post(
        "/api/auth/register",
        json={"username": "wrongpw", "email": "wrong@test.com", "password": "123456"},
    )
    res = client.post(
        "/api/auth/login",
        json={"username": "wrongpw", "password": "wrongpassword"},
    )
    assert res.status_code == 401


def test_me_with_token(client):
    """测试获取当前用户"""
    client.post(
        "/api/auth/register",
        json={"username": "meuser", "email": "me@test.com", "password": "123456"},
    )
    login_res = client.post(
        "/api/auth/login",
        json={"username": "meuser", "password": "123456"},
    )
    token = login_res.get_json()["data"]["access_token"]

    res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    assert res.get_json()["data"]["username"] == "meuser"


def test_me_without_token(client):
    """测试未登录获取用户信息"""
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_update_profile(client):
    """测试修改昵称"""
    client.post(
        "/api/auth/register",
        json={"username": "oldname", "email": "old@test.com", "password": "123456"},
    )
    login_res = client.post(
        "/api/auth/login",
        json={"username": "oldname", "password": "123456"},
    )
    token = login_res.get_json()["data"]["access_token"]

    res = client.put(
        "/api/auth/profile",
        json={"username": "newname"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    assert res.get_json()["data"]["username"] == "newname"


def test_update_password(client):
    """测试修改密码"""
    client.post(
        "/api/auth/register",
        json={"username": "pwuser", "email": "pw@test.com", "password": "123456"},
    )
    login_res = client.post(
        "/api/auth/login",
        json={"username": "pwuser", "password": "123456"},
    )
    token = login_res.get_json()["data"]["access_token"]

    res = client.put(
        "/api/auth/password",
        json={"old_password": "123456", "new_password": "654321"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200

    # 用新密码登录
    res2 = client.post(
        "/api/auth/login",
        json={"username": "pwuser", "password": "654321"},
    )
    assert res2.status_code == 200
