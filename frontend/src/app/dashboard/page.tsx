"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import api from "@/lib/api";
import type { Note } from "@/types/note";

interface Stats {
  note_count: number;
  todo_count: number;
  done_count: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/stats/dashboard").then((r) => setStats(r.data.data)),
      api.get("/api/notes").then((r) => setRecentNotes(r.data.data.slice(0, 5))),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">仪表盘</h1>

        {loading ? (
          <div className="grid grid-cols-3 gap-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <div className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <p className="text-sm text-gray-500">笔记总数</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">{stats?.note_count ?? 0}</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <p className="text-sm text-gray-500">待办总数</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{stats?.todo_count ?? 0}</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <p className="text-sm text-gray-500">已完成</p>
              <p className="mt-2 text-3xl font-bold text-purple-600">{stats?.done_count ?? 0}</p>
            </div>
          </div>
        )}

        {/* 最近笔记 */}
        {!loading && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">最近笔记</h2>
              <a href="/notes" className="text-sm text-blue-600 hover:underline">
                查看全部 →
              </a>
            </div>
            {recentNotes.length === 0 ? (
              <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                <p className="text-4xl">📝</p>
                <p className="mt-2 text-sm text-gray-400">还没有笔记，去创建第一篇吧</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentNotes.map((note) => (
                  <a
                    key={note.id}
                    href={`/notes/${note.id}`}
                    className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-800">{note.title}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(note.updated_at).toLocaleDateString("zh-CN")}
                      </p>
                    </div>
                    {note.tag && (
                      <span className="ml-2 shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                        {note.tag}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
