"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import type { Note } from "@/types/note";

type Mode = "view" | "edit" | "new";

export default function NoteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = useAuth();
  const isNew = id === "new";

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<Mode>(isNew ? "new" : "view");
  const [error, setError] = useState("");

  // 表单字段
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => {
    if (!isNew) {
      api
        .get(`/api/notes/${id}`)
        .then((res) => {
          const n = res.data.data;
          setNote(n);
          setTitle(n.title);
          setContent(n.content);
          setTag(n.tag || "");
        })
        .catch(() => setError("笔记不存在或无权访问"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, isNew]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("标题不能为空");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (isNew) {
        const res = await api.post("/api/notes", {
          title: title.trim(),
          content,
          tag: tag.trim() || undefined,
        });
        const created: Note = res.data.data;
        router.replace(`/notes/${created.id}`);
      } else {
        const res = await api.put(`/api/notes/${id}`, {
          title: title.trim(),
          content,
          tag: tag.trim() || undefined,
        });
        setNote(res.data.data);
        setMode("view");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("确定删除这条笔记？")) return;
    try {
      await api.delete(`/api/notes/${id}`);
      router.push("/notes");
    } catch (err: any) {
      setError(err.response?.data?.message || "删除失败");
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  const isEditing = mode === "edit" || mode === "new";

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
          <a href="/notes" className="block rounded bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
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

      {/* 主内容 */}
      <main className="flex-1 p-8">
        <a href="/notes" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
          ← 返回笔记列表
        </a>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="rounded-lg bg-white p-6 shadow">
          {isNew && !note ? (
            /* 新建模式 */
            <>
              <h1 className="mb-4 text-2xl font-bold text-gray-800">新建笔记</h1>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">标题</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="笔记标题"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">标签（可选）</label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="如：工作、学习"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">内容</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="笔记内容..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "保存中..." : "创建笔记"}
                  </button>
                  <a
                    href="/notes"
                    className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    取消
                  </a>
                </div>
              </div>
            </>
          ) : note && isEditing ? (
            /* 编辑模式 */
            <>
              <h1 className="mb-4 text-2xl font-bold text-gray-800">编辑笔记</h1>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">标题</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">标签</label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">内容</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "保存中..." : "保存"}
                  </button>
                  <button
                    onClick={() => {
                      setMode("view");
                      setTitle(note.title);
                      setContent(note.content);
                      setTag(note.tag || "");
                      setError("");
                    }}
                    className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    取消
                  </button>
                </div>
              </div>
            </>
          ) : note ? (
            /* 查看模式 */
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{note.title}</h1>
                  {note.tag && (
                    <span className="mt-2 inline-block rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                      {note.tag}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode("edit")}
                    className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    编辑
                  </button>
                  <button
                    onClick={handleDelete}
                    className="rounded border border-red-200 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50"
                  >
                    删除
                  </button>
                </div>
              </div>
              <div className="mt-6 whitespace-pre-wrap text-gray-700 leading-relaxed">{note.content}</div>
              <p className="mt-6 text-sm text-gray-400">
                更新于 {new Date(note.updated_at).toLocaleString("zh-CN")}
              </p>
            </>
          ) : (
            <p className="text-gray-400">笔记不存在</p>
          )}
        </div>
      </main>
    </div>
  );
}
