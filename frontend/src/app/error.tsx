"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-200">500</p>
        <h1 className="mt-4 text-xl font-semibold text-gray-700">出了点问题</h1>
        <p className="mt-2 text-sm text-gray-400">页面加载出错，请稍后重试</p>
        <button
          onClick={reset}
          className="mt-6 inline-block rounded bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
        >
          重试
        </button>
      </div>
    </div>
  );
}
