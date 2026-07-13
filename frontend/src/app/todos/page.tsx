"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, removeToken } from "@/lib/auth";
import api from "@/lib/api";
import type { Todo } from "@/types/todo";

export default function TodosPage() {
  const router = useRouter();
  const user = getUser();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  useEffect(() => {
    const params = filter !== "all" ? `?status=${filter}` : "";
    api
      .get(`/api/todos${params}`)
      .then((res) => setTodos(res.data.data))
      .finally(() => setLoading(false));
  }, [filter]);

  const toggleStatus = async (todo: Todo) => {
    const newStatus = todo.status === "pending" ? "done" : "pending";
    await api.put(`/api/todos/${todo.id}`, { status: newStatus });
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, status: newStatus } : t))
    );
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
          <a href="/todos" className="block rounded bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">✅ 待办</a>
          <a href="/profile" className="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">👤 个人中心</a>
        </nav>
        <div className="border-t p-4">
          <p className="text-sm text-gray-500">{user?.username}</p>
          <button onClick={handleLogout} className="mt-2 text-sm text-red-500 hover:underline">退出登录</button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">待办事项</h1>
        <div className="mb-4 flex gap-2">
          {(["all", "pending", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-3 py-1 text-sm ${filter === f ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
            >
              {f === "all" ? "全部" : f === "pending" ? "未完成" : "已完成"}
            </button>
          ))}
        </div>
        {loading ? (
          <p className="text-gray-400">加载中...</p>
        ) : todos.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <p className="text-gray-400">暂无待办事项</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div key={todo.id} className="flex items-center gap-3 rounded-lg bg-white p-3 shadow">
                <input
                  type="checkbox"
                  checked={todo.status === "done"}
                  onChange={() => toggleStatus(todo)}
                  className="h-4 w-4 accent-blue-600"
                />
                <span className={`flex-1 text-sm ${todo.status === "done" ? "text-gray-400 line-through" : "text-gray-800"}`}>
                  {todo.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
