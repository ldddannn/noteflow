"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { TodoRowSkeleton } from "@/components/ui/Skeleton";
import api from "@/lib/api";
import type { Todo } from "@/types/todo";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  // 新建弹窗
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStatus, setNewStatus] = useState<"pending" | "done">("pending");
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

  const openModal = () => {
    setNewTitle("");
    setNewStatus("pending");
    setShowModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await api.post("/api/todos", { title: newTitle.trim() });
      // 如果初始状态是 done，再调一次更新
      if (newStatus === "done") {
        await api.put(`/api/todos/${res.data.data.id}`, { status: "done" });
        res.data.data.status = "done";
      }
      setTodos((prev) => [res.data.data, ...prev]);
      setShowModal(false);
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

  const cancelEdit = () => setEditingId(null);

  const pendingCount = todos.filter((t) => t.status === "pending").length;
  const doneCount = todos.filter((t) => t.status === "done").length;

  const filters = [
    { key: "all" as const, label: "全部", count: todos.length },
    { key: "pending" as const, label: "未完成", count: pendingCount },
    { key: "done" as const, label: "已完成", count: doneCount },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl">
          {/* 头部 */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">待办事项</h1>
              <p className="mt-1 text-sm text-gray-400">
                {pendingCount} 项未完成 · {doneCount} 项已完成
              </p>
            </div>
            <button
              onClick={openModal}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              新建
            </button>
          </div>

          {/* 过滤标签 */}
          <div className="mb-6 flex gap-1.5 rounded-xl bg-white p-1 shadow-sm">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  filter === f.key
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
              >
                {f.label}
                <span className={`ml-1.5 text-xs ${filter === f.key ? "text-blue-200" : "text-gray-300"}`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* 列表 */}
          {loading ? (
            <div className="space-y-2">
              <TodoRowSkeleton />
              <TodoRowSkeleton />
              <TodoRowSkeleton />
              <TodoRowSkeleton />
              <TodoRowSkeleton />
            </div>
          ) : todos.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
              <p className="text-5xl">✅</p>
              <p className="mt-3 text-gray-400">
                {filter === "all" ? "暂无待办事项" : filter === "pending" ? "所有任务已完成 🎉" : "还没有已完成的任务"}
              </p>
              <button
                onClick={openModal}
                className="mt-4 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                创建第一个
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 rounded-xl bg-white p-3.5 shadow-sm transition-all hover:shadow-md group"
                >
                  {/* 自定义 checkbox */}
                  <button
                    onClick={() => toggleStatus(todo)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      todo.status === "done"
                        ? "border-green-400 bg-green-400"
                        : "border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {todo.status === "done" && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>

                  {editingId === todo.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(todo.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="flex-1 rounded-lg border-2 border-blue-400 bg-white px-2 py-1 text-sm focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span
                      onDoubleClick={() => startEdit(todo)}
                      className={`flex-1 cursor-pointer select-none text-sm transition-colors ${
                        todo.status === "done"
                          ? "text-gray-400 line-through decoration-gray-300"
                          : "text-gray-700"
                      }`}
                      title="双击编辑"
                    >
                      {todo.title}
                    </span>
                  )}

                  {editingId === todo.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => saveEdit(todo.id)} className="rounded-lg px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50">保存</button>
                      <button onClick={cancelEdit} className="rounded-lg px-2.5 py-1 text-xs text-gray-400 hover:bg-gray-100">取消</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="shrink-0 rounded-lg p-1 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-400 group-hover:opacity-100"
                      title="删除"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 新建弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-5 text-lg font-semibold text-gray-800">新建待办</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-600">标题</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="输入待办内容"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-600">初始状态</label>
                <div className="flex gap-2">
                  {(["pending", "done"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewStatus(s)}
                      className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-medium transition-all ${
                        newStatus === s
                          ? s === "done"
                            ? "border-green-400 bg-green-50 text-green-700"
                            : "border-blue-400 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {s === "pending" ? "未完成" : "已完成"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={creating || !newTitle.trim()}
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? "创建中..." : "创建"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
