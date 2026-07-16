"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import api from "@/lib/api";
import type { Note } from "@/types/note";

interface TagStat {
  tag: string;
  count: number;
}

interface Stats {
  note_count: number;
  todo_count: number;
  done_count: number;
  completion_rate: number;
  tag_stats: TagStat[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/stats/dashboard").then((r) => setStats(r.data.data)),
      api.get("/api/notes").then((r) => setRecentNotes(r.data.data.items?.slice(0, 5) || r.data.data.slice(0, 5))),
    ]).finally(() => setLoading(false));
  }, []);

  const completionRate = stats?.completion_rate ?? 0;
  const totalTodos = stats?.todo_count ?? 0;
  const completedTodos = stats?.done_count ?? 0;

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
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">笔记总数</p>
                  <p className="mt-1 text-2xl font-bold text-blue-600">{stats?.note_count ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">待办总数</p>
                  <p className="mt-1 text-2xl font-bold text-green-600">{stats?.todo_count ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-100 p-3">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">已完成</p>
                  <p className="mt-1 text-2xl font-bold text-purple-600">{stats?.done_count ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-700">待办完成进度</h2>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="h-4 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500">已完成 {completedTodos} / {totalTodos} 项</span>
                  <span className="font-semibold text-blue-600">{completionRate}%</span>
                </div>
              </div>
              <div className="text-center">
                <svg className="h-20 w-20 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="40" fill="none" stroke="url(#progressGradient)" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${completionRate * 2.51} 251`}
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                </svg>
                <p className="mt-2 text-lg font-bold text-blue-600">{completionRate}%</p>
              </div>
            </div>
          </div>
        )}

        {!loading && stats?.tag_stats && stats.tag_stats.length > 0 && (
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-700">笔记分类统计</h2>
            <div className="space-y-3">
              {stats.tag_stats.map((item) => {
                const maxCount = Math.max(...stats.tag_stats.map(t => t.count));
                const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                return (
                  <div key={item.tag} className="flex items-center gap-4">
                    <span className="w-16 text-sm font-medium text-gray-600">{item.tag}</span>
                    <div className="flex-1 h-6 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-sm font-semibold text-gray-700">{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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