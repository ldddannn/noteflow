import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-200">404</p>
        <h1 className="mt-4 text-xl font-semibold text-gray-700">页面不存在</h1>
        <p className="mt-2 text-sm text-gray-400">你访问的页面可能已被移除或地址有误</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
        >
          返回仪表盘
        </Link>
      </div>
    </div>
  );
}
