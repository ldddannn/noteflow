"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getUser, removeToken } from "@/lib/auth";
import api from "@/lib/api";
import type { Note } from "@/types/note";

export default function NotesPage() {
  const router = useRouter();
  const user = getUser();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(() => {
    setLoading(true);
    api
      .get("/api/notes")
      .then((res) => setNotes(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`确定删除「${title}」？`)) return;
    try {
      await api.delete(`/api/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // ignore
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
          <a href="/dashboard" className="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
            📊 仪表盘
          </a>
          <a
            href="/notes"
            className="block rounded bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
          >
            📝 笔记
          </a>
          <a href="/todos" className="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
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
      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">笔记</h1>
          <a
            href="/notes/new"
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            + 新建笔记
          </a>
        </div>
        {loading ? (
          <p className="text-gray-400">加载中...</p>
        ) : notes.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <p className="text-gray-400">还没有笔记，点击上方按钮创建第一篇</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="flex items-center justify-between rounded-lg bg-white p-4 shadow hover:shadow-md transition-shadow"
              >
                <div className="min-w-0 flex-1">
                  <a
                    href={`/notes/${note.id}`}
                    className="text-lg font-semibold text-gray-800 hover:text-blue-600 truncate block"
                  >
                    {note.title}
                  </a>
                  <div className="mt-1 flex items-center gap-2">
                    {note.tag && (
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">{note.tag}</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(note.updated_at).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(note.id, note.title)}
                  className="ml-4 shrink-0 rounded px-2 py-1 text-xs text-gray-400 hover:bg-red-50 hover:text-red-500"
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
