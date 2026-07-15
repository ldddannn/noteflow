"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { NoteCardSkeleton } from "@/components/ui/Skeleton";
import api from "@/lib/api";
import type { Note } from "@/types/note";

export default function NotesPage() {
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

  return (
    <div className="flex min-h-screen">
      <Sidebar />
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
          <div className="space-y-4">
            <NoteCardSkeleton />
            <NoteCardSkeleton />
            <NoteCardSkeleton />
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <p className="text-5xl">📝</p>
            <p className="mt-3 text-gray-400">还没有笔记</p>
            <p className="text-sm text-gray-300">点击上方按钮创建第一篇</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
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
