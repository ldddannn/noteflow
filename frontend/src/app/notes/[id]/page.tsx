"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUser, removeToken } from "@/lib/auth";
import api from "@/lib/api";
import type { Note } from "@/types/note";

export default function NoteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = getUser();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  const isNew = id === "new";

  useEffect(() => {
    if (!isNew) {
      api
        .get(`/api/notes/${id}`)
        .then((res) => setNote(res.data.data))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, isNew]);

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  if (loading) return <p className="p-8 text-gray-400">加载中...</p>;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col bg-white shadow-md">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-bold text-blue-600">NoteFlow</h2>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <a href="/dashboard" className="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">📊 仪表盘</a>
          <a href="/notes" className="block rounded bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">📝 笔记</a>
          <a href="/todos" className="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">✅ 待办</a>
          <a href="/profile" className="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">👤 个人中心</a>
        </nav>
        <div className="border-t p-4">
          <p className="text-sm text-gray-500">{user?.username}</p>
          <button onClick={handleLogout} className="mt-2 text-sm text-red-500 hover:underline">退出登录</button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <a href="/notes" className="mb-4 inline-block text-sm text-blue-600 hover:underline">← 返回笔记列表</a>
        <div className="rounded-lg bg-white p-6 shadow">
          {isNew ? (
            <p className="text-gray-400">新建笔记功能将在后续实现</p>
          ) : note ? (
            <>
              <h1 className="text-2xl font-bold text-gray-800">{note.title}</h1>
              {note.tag && <span className="mt-2 inline-block rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">{note.tag}</span>}
              <p className="mt-4 whitespace-pre-wrap text-gray-600">{note.content}</p>
              <p className="mt-4 text-sm text-gray-400">更新于 {new Date(note.updated_at).toLocaleString("zh-CN")}</p>
            </>
          ) : (
            <p className="text-gray-400">笔记不存在</p>
          )}
        </div>
      </main>
    </div>
  );
}
