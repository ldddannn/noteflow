"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { removeToken, setUser } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import api from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuth();
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

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

  const initials = user?.username?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* 头部卡片 — 头像 + 基本信息 */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {/* 背景色块 */}
            <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600" />
            <div className="-mt-10 px-6 pb-6">
              <div className="flex items-end gap-5">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="h-20 w-20 rounded-xl border-4 border-white object-cover shadow-sm"
                  />
                ) : (
                  <span className="flex h-20 w-20 items-center justify-center rounded-xl border-4 border-white bg-gradient-to-br from-blue-400 to-blue-600 text-2xl font-bold text-white shadow-sm">
                    {initials}
                  </span>
                )}
                <div className="pb-1">
                  <h2 className="text-xl font-bold text-gray-800">{user?.username}</h2>
                  <p className="text-sm text-gray-500">@{user?.account}</p>
                </div>
              </div>

              {/* 只读信息网格 */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-400">账号</p>
                  <p className="mt-0.5 text-sm font-medium text-gray-700">{user?.account}</p>
                  <p className="mt-0.5 text-xs text-gray-300">注册后不可修改</p>
                </div>
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-400">邮箱</p>
                  <p className="mt-0.5 truncate text-sm font-medium text-gray-700">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 编辑资料 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-5 flex items-center gap-2 text-base font-semibold text-gray-700">
              <svg className="h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              编辑资料
            </h3>
            {profileMsg && (
              <div className={`mb-4 rounded-xl px-4 py-2.5 text-sm ${profileMsg.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                {profileMsg.text}
              </div>
            )}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-600">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-600">头像 URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="https://example.com/avatar.png"
                />
                <p className="mt-1 text-xs text-gray-400">粘贴图片链接作为头像，留空则显示首字母</p>
              </div>
              <button
                type="submit"
                disabled={profileLoading}
                className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {profileLoading ? "保存中..." : "保存修改"}
              </button>
            </form>
          </div>

          {/* 修改密码 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-5 flex items-center gap-2 text-base font-semibold text-gray-700">
              <svg className="h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              修改密码
            </h3>
            {pwdMsg && (
              <div className={`mb-4 rounded-xl px-4 py-2.5 text-sm ${pwdMsg.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                {pwdMsg.text}
              </div>
            )}
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-600">原密码</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-600">新密码</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="至少 6 位"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-600">确认新密码</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={pwdLoading}
                className="w-full rounded-xl bg-gray-800 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-900 disabled:opacity-50"
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
