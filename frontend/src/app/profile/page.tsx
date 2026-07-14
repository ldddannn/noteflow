"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuth();
  const [nickname, setNickname] = useState(user?.username || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await api.put("/api/auth/profile", { username: nickname });
      setMessage("修改成功");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "修改失败");
    } finally {
      setLoading(false);
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
        <div className="max-w-md rounded-lg bg-white p-6 shadow">
          {message && (
            <div className={`mb-4 rounded p-3 text-sm ${message === "修改成功" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
              {message}
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
              disabled={loading}
              className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "保存中..." : "保存修改"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
