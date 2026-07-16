"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { removeToken } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/dashboard", icon: "📊", label: "仪表盘" },
  { href: "/notes", icon: "📝", label: "笔记" },
  { href: "/todos", icon: "✅", label: "待办" },
  { href: "/profile", icon: "👤", label: "个人中心" },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    removeToken();
    router.push("/login");
    setMobileMenuOpen(false);
  };

  const initials = user?.username?.charAt(0)?.toUpperCase() || "?";
  const avatarSrc = user?.avatar || null;

  return (
    <>
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="fixed right-4 top-4 z-50 rounded-lg bg-white p-2 shadow-md lg:hidden"
        aria-label="打开菜单"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <aside className="hidden w-56 flex-col bg-white shadow-md lg:flex">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-bold text-blue-600">NoteFlow</h2>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={`block rounded px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-blue-50 font-medium text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.icon} {item.label}
              </a>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <div className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50">
            <div className="flex min-w-0 items-center gap-2.5">
              {avatarSrc ? (
                <img src={avatarSrc} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white">
                  {initials}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-700">{user?.username}</p>
                <p className="truncate text-xs text-gray-400">@{user?.account}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="ml-1 shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              title="退出登录"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transition-transform lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ animation: mobileMenuOpen ? "slideIn 0.3s ease-out" : undefined }}
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="text-lg font-bold text-blue-600">NoteFlow</h2>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
            aria-label="关闭菜单"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-blue-50 font-medium text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.icon} {item.label}
              </a>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-gray-50">
            <div className="flex min-w-0 items-center gap-3">
              {avatarSrc ? (
                <img src={avatarSrc} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-bold text-white">
                  {initials}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-700">{user?.username}</p>
                <p className="truncate text-xs text-gray-400">@{user?.account}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              title="退出登录"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}