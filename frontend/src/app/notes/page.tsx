"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { NoteCardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import api from "@/lib/api";
import type { Note } from "@/types/note";

const COMMON_TAGS = ["工作", "生活", "学习", "想法", "待办", "重要"];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; id: number; title: string }>({ isOpen: false, id: 0, title: "" });
  const { toasts, removeToast, success, error } = useToast();

  const fetchNotes = useCallback(() => {
    setLoading(true);
    api
      .get("/api/notes", {
        params: {
          keyword,
          tag: selectedTag,
          page,
          size: 10,
        },
      })
      .then((res) => {
        setNotes(res.data.data.items);
        setTotal(res.data.data.total);
        setPages(res.data.data.pages);
      })
      .catch(() => {
        error("加载笔记失败");
      })
      .finally(() => setLoading(false));
  }, [keyword, selectedTag, page, error]);

  useEffect(() => {
    setPage(1);
  }, [keyword, selectedTag]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/notes/${confirmDialog.id}`);
      success("删除成功");
      fetchNotes();
    } catch {
      error("删除失败");
    }
  };

  return (
    <>
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

          <div className="mb-6 space-y-4">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="搜索笔记标题或内容..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-10 py-2.5 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag("")}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  selectedTag === ""
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                全部
              </button>
              {COMMON_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    selectedTag === tag
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
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
              <p className="mt-3 text-gray-400">
                {keyword || selectedTag ? "没有找到匹配的笔记" : "还没有笔记"}
              </p>
              <p className="text-sm text-gray-300">
                {keyword || selectedTag
                  ? "尝试调整搜索条件"
                  : "点击上方按钮创建第一篇"}
              </p>
            </div>
          ) : (
            <>
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
                          <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                            {note.tag}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(note.updated_at).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setConfirmDialog({ isOpen: true, id: note.id, title: note.title })}
                      className="ml-4 shrink-0 rounded px-2 py-1 text-xs text-gray-400 hover:bg-red-50 hover:text-red-500"
                      title="删除"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              {pages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                  >
                    上一页
                  </button>
                  <span className="text-sm text-gray-500">
                    第 {page} / {pages} 页
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="确认删除"
        message={`确定要删除笔记「${confirmDialog.title}」吗？此操作无法撤销。`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, id: 0, title: "" })}
      />
    </>
  );
}