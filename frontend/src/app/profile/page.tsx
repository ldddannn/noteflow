"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuth();
  const [nickname, setNickname] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // 改密码
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  // user 加载后同步 nickname
  useEffect(() => {
    if (user) setNickname(user.username);
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      await api.put("/api/auth/profile", { username: nickname });
      setProfileMsg({ type: "success", text: "昵称修改成功" });
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
      setPwdMsg({ type: "success", text: "密码修改成功" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
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
          <p className="text-sm text-gray-500">{user?.username}</p>
          <button onClick={handleLogout} className="mt-2 text-sm text-red-500 hover:underline">退出登录</button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">个人中心</h1>

        <div className="max-w-md space-y-6">
          {/* 修改昵称 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-700">修改昵称</h2>
            {profileMsg && (
              <div className={`mb-4 rounded p-3 text-sm ${profileMsg.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                {profileMsg.text}
              </div>
            )}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">昵称</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  required
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
