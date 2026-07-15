"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import api from "@/lib/api";
import { setToken, setUser } from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      setSuccess("注册成功，请登录");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", { account, password });
      setToken(res.data.data.access_token);
      setUser(res.data.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          NoteFlow 登录
        </h1>
        {success && (
          <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-600">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">
              账号
            </label>
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="请输入账号"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="请输入密码"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          还没有账号？{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            立即注册
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-400">加载中...</div>}>
      <LoginForm />
    </Suspense>
  );
}
