"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Tag, Target, Home, Settings } from "lucide-react";

const menuItems = [
  {
    href: "/dashboard",
    label: "ダッシュボード",
    icon: Home,
  },
  {
    href: "/transactions",
    label: "家計簿入力",
    icon: FileText,
  },
  {
    href: "/categories",
    label: "カテゴリー管理",
    icon: Tag,
  },
  {
    href: "/goals",
    label: "目標設定",
    icon: Target,
    disabled: true,
  },
  {
    href: "/settings",
    label: "設定",
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 border-r bg-background overflow-y-auto">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                item.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : isActive
                  ? ""
                  : "hover:bg-gray-100"
              }`}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <Icon className="h-5 w-5" />
              <span className={`font-medium ${isActive ? "underline" : ""}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
