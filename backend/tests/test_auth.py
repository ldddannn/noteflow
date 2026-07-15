import json


def test_register_success(client):
    """测试注册成功"""
    res = client.post(
        "/api/auth/register",
        json={
            "account": "testuser",
            "username": "Test User",
            "email": "test@example.com",
            "password": "123456",
        },
    )
    assert res.status_code == 201
    assert res.get_json()["message"] == "注册成功"


def test_register_duplicate_account(client):
    """测试重复账号"""
    client.post(
        "/api/auth/register",
        json={
            "account": "dup",
            "username": "Dup",
            "email": "dup1@example.com",
            "password": "123456",
        },
    )
    res = client.post(
        "/api/auth/register",
        json={
            "account": "dup",
            "username": "Dup2",
            "email": "dup2@example.com",
            "password": "123456",
        },
    )
    assert res.status_code == 409
    assert "账号已存在" in res.get_json()["message"]


def test_register_duplicate_email(client):
    """测试重复邮箱"""
    client.post(
        "/api/auth/register",
        json={
            "account": "user1",
            "username": "U1",
            "email": "same@example.com",
            "password": "123456",
        },
    )
    res = client.post(
        "/api/auth/register",
        json={
            "account": "user2",
            "username": "U2",
            "email": "same@example.com",
            "password": "123456",
        },
    )
    assert res.status_code == 409
    assert "邮箱已被注册" in res.get_json()["message"]


def test_register_short_password(client):
    """测试密码过短"""
    res = client.post(
        "/api/auth/register",
        json={
            "account": "test",
            "username": "Test",
            "email": "test@test.com",
            "password": "12345",
        },
    )
    assert res.status_code == 400


def test_login_success(client):
    """测试登录成功"""
    client.post(
        "/api/auth/register",
        json={
            "account": "loginuser",
            "username": "Login",
            "email": "login@test.com",
            "password": "123456",
        },
    )
    res = client.post(
        "/api/auth/login",
        json={"account": "loginuser", "password": "123456"},
    )
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert "access_token" in data
    assert data["user"]["account"] == "loginuser"
    assert data["user"]["username"] == "Login"


def test_login_wrong_password(client):
    """测试密码错误"""
    client.post(
        "/api/auth/register",
        json={
            "account": "wrongpw",
            "username": "WP",
            "email": "wrong@test.com",
            "password": "123456",
        },
    )
    res = client.post(
        "/api/auth/login",
        json={"account": "wrongpw", "password": "wrongpassword"},
    )
    assert res.status_code == 401


def test_me_with_token(client):
    """测试获取当前用户"""
    client.post(
        "/api/auth/register",
        json={
            "account": "meuser",
            "username": "Me",
            "email": "me@test.com",
            "password": "123456",
        },
    )
    login_res = client.post(
        "/api/auth/login",
        json={"account": "meuser", "password": "123456"},
    )
    token = login_res.get_json()["data"]["access_token"]

    res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    assert res.get_json()["data"]["account"] == "meuser"


def test_me_without_token(client):
    """测试未登录获取用户信息"""
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_update_profile(client):
    """测试修改昵称和头像"""
    client.post(
        "/api/auth/register",
        json={
            "account": "oldname",
            "username": "Old",
            "email": "old@test.com",
            "password": "123456",
        },
    )
    login_res = client.post(
        "/api/auth/login",
        json={"account": "oldname", "password": "123456"},
    )
    token = login_res.get_json()["data"]["access_token"]

    res = client.put(
        "/api/auth/profile",
        json={"username": "NewName", "avatar": "https://example.com/avatar.png"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert data["username"] == "NewName"
    assert data["avatar"] == "https://example.com/avatar.png"


def test_update_password(client):
    """测试修改密码"""
    client.post(
        "/api/auth/register",
        json={
            "account": "pwuser",
            "username": "PW",
            "email": "pw@test.com",
            "password": "123456",
        },
    )
    login_res = client.post(
        "/api/auth/login",
        json={"account": "pwuser", "password": "123456"},
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
        json={"account": "pwuser", "password": "654321"},
    )
    assert res2.status_code == 200
