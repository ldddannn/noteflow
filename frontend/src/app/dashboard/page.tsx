"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, removeToken } from "@/lib/auth";
import api from "@/lib/api";

interface Stats {
  note_count: number;
  todo_count: number;
  done_count: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const user = getUser();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get("/api/stats/dashboard").then((res) => setStats(res.data.data));
  }, []);

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* 侧栏 */}
      <aside className="flex w-56 flex-col bg-white shadow-md">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-bold text-blue-600">NoteFlow</h2>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <a
            href="/dashboard"
            className="block rounded bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
          >
            📊 仪表盘
          </a>
          <a
            href="/notes"
            className="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            📝 笔记
          </a>
          <a
            href="/todos"
            className="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            ✅ 待办
          </a>
          <a
            href="/profile"
            className="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            👤 个人中心
          </a>
        </nav>
        <div className="border-t p-4">
          <p className="text-sm text-gray-500">{user?.username}</p>
          <button
            onClick={handleLogout}
            className="mt-2 text-sm text-red-500 hover:underline"
          >
            退出登录
          </button>
        </div>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 p-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">仪表盘</h1>
        <div className="grid grid-cols-3 gap-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-gray-500">笔记总数</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {stats?.note_count ?? "—"}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-gray-500">待办总数</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {stats?.todo_count ?? "—"}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-gray-500">已完成</p>
            <p className="mt-2 text-3xl font-bold text-purple-600">
              {stats?.done_count ?? "—"}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
