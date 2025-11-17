"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, Tag, Target, Home, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    href: "/dashboard",
    label: "ダッシュボード",
    icon: Home,
  },
  {
    href: "/transactions",
    label: "収支管理",
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
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <aside className="fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 border-r bg-background overflow-y-auto flex flex-col">
      <nav className="p-4 space-y-2 flex-1">
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
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start cursor-pointer text-destructive hover:text-destructive hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span className="font-medium">ログアウト</span>
        </Button>
      </div>
    </aside>
  );
}
