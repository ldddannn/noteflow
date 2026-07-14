"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import type { Todo } from "@/types/todo";

export default function TodosPage() {
  const router = useRouter();
  const user = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  // 新建
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  // 编辑
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const fetchTodos = useCallback(() => {
    setLoading(true);
    const params = filter !== "all" ? `?status=${filter}` : "";
    api
      .get(`/api/todos${params}`)
      .then((res) => setTodos(res.data.data))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await api.post("/api/todos", { title: newTitle.trim() });
      setTodos((prev) => [res.data.data, ...prev]);
      setNewTitle("");
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (todo: Todo) => {
    const newStatus = todo.status === "pending" ? "done" : "pending";
    try {
      await api.put(`/api/todos/${todo.id}`, { status: newStatus });
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, status: newStatus } : t))
      );
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/todos/${id}`);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch {
      // ignore
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  };

  const saveEdit = async (id: number) => {
    if (!editTitle.trim()) return;
    try {
      const res = await api.put(`/api/todos/${id}`, { title: editTitle.trim() });
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title: res.data.data.title } : t))
      );
      setEditingId(null);
    } catch {
      // ignore
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  const pendingCount = todos.filter((t) => t.status === "pending").length;

  return (
    <div className="flex min-h-screen">
      {/* 侧栏 */}
      <aside className="flex w-56 flex-col bg-white shadow-md">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-bold text-blue-600">NoteFlow</h2>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <a href="/dashboard" className="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
            📊 仪表盘
          </a>
          <a href="/notes" className="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
            📝 笔记
          </a>
          <a href="/todos" className="block rounded bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
            ✅ 待办
          </a>
          <a href="/profile" className="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
            👤 个人中心
          </a>
        </nav>
        <div className="border-t p-4">
          <p className="text-sm text-gray-500">{user?.username}</p>
          <button onClick={handleLogout} className="mt-2 text-sm text-red-500 hover:underline">
            退出登录
          </button>
        </div>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 p-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">待办事项</h1>
        <p className="mb-6 text-sm text-gray-400">
          {pendingCount} 项未完成
        </p>

        {/* 新建输入框 */}
        <form onSubmit={handleCreate} className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="添加新待办..."
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={creating || !newTitle.trim()}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? "..." : "添加"}
          </button>
        </form>

        {/* 过滤标签 */}
        <div className="mb-4 flex gap-2">
          {(["all", "pending", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
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
              <div
                key={todo.id}
                className="flex items-center gap-3 rounded-lg bg-white p-3 shadow group"
              >
                <input
                  type="checkbox"
                  checked={todo.status === "done"}
                  onChange={() => toggleStatus(todo)}
                  className="h-4 w-4 shrink-0 accent-blue-600 cursor-pointer"
                />

                {editingId === todo.id ? (
                  /* 编辑模式 */
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(todo.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="flex-1 rounded border border-blue-400 px-2 py-1 text-sm focus:outline-none"
                    autoFocus
                  />
                ) : (
                  /* 显示模式 */
                  <span
                    className={`flex-1 text-sm cursor-pointer ${
                      todo.status === "done" ? "text-gray-400 line-through" : "text-gray-800"
                    }`}
                    onDoubleClick={() => startEdit(todo)}
                    title="双击编辑"
                  >
                    {todo.title}
                  </span>
                )}

                {editingId === todo.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => saveEdit(todo.id)}
                      className="rounded px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50"
                    >
                      保存
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded px-2 py-0.5 text-xs text-gray-400 hover:bg-gray-100"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="shrink-0 rounded px-2 py-1 text-xs text-gray-300 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="删除"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
