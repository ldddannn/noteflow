"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { removeToken, setUser } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuth();
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // 改密码
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setAvatarUrl(user.avatar || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await api.put("/api/auth/profile", {
        username: username.trim(),
        avatar: avatarUrl.trim() || null,
      });
      setUser(res.data.data);
      setProfileMsg({ type: "success", text: "修改成功" });
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.response?.data?.message || "修改失败" });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword.length < 6) {
      setPwdMsg({ type: "error", text: "新密码至少 6 位" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: "error", text: "两次密码不一致" });
      return;
    }

    setPwdLoading(true);
    try {
      await api.put("/api/auth/password", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPwdMsg({ type: "success", text: "密码修改成功，即将跳转登录页" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        removeToken();
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setPwdMsg({ type: "error", text: err.response?.data?.message || "修改失败" });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  // 头像：有 URL 则显示图片，否则显示首字母头像
  const avatarSrc = user?.avatar || null;
  const initials = user?.username?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col bg-white shadow-md">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-bold text-blue-600">NoteFlow</h2>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <a href="/dashboard" className="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">📊 仪表盘</a>
          <a href="/notes" className="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">📝 笔记</a>
          <a href="/todos" className="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">✅ 待办</a>
          <a href="/profile" className="block rounded bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">👤 个人中心</a>
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                {initials}
              </span>
            )}
            <p className="text-sm text-gray-500">{user?.username}</p>
          </div>
          <button onClick={handleLogout} className="mt-2 text-sm text-red-500 hover:underline">退出登录</button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">个人中心</h1>

        <div className="max-w-md space-y-6">
          {/* 头像 + 账号信息 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center gap-4">
              {avatarSrc ? (
                <img src={avatarSrc} alt="" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                  {initials}
                </span>
              )}
              <div>
                <p className="text-lg font-semibold text-gray-800">{user?.username}</p>
                <p className="text-sm text-gray-400">@{user?.account}</p>
              </div>
            </div>

            {/* 账号（只读） */}
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-600">账号</label>
              <input
                type="text"
                value={user?.account || ""}
                disabled
                className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-400">账号注册后不可修改</p>
            </div>

            {/* 邮箱（只读） */}
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-600">邮箱</label>
              <input
                type="text"
                value={user?.email || ""}
                disabled
                className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* 修改个人资料 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-700">修改资料</h2>
            {profileMsg && (
              <div className={`mb-4 rounded p-3 text-sm ${profileMsg.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                {profileMsg.text}
              </div>
            )}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">头像 URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="https://example.com/avatar.png（可选）"
                />
              </div>
              <button
                type="submit"
                disabled={profileLoading}
                className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {profileLoading ? "保存中..." : "保存"}
              </button>
            </form>
          </div>

          {/* 修改密码 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-700">修改密码</h2>
            {pwdMsg && (
              <div className={`mb-4 rounded p-3 text-sm ${pwdMsg.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                {pwdMsg.text}
              </div>
            )}
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">原密码</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="至少 6 位"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">确认新密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={pwdLoading}
                className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {pwdLoading ? "保存中..." : "修改密码"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
