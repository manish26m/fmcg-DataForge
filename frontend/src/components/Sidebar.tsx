"use client";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard, Upload, Activity, BookOpen,
  GitBranch, Home, Database, Sparkles,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/",             icon: Home,            label: "Home" },
  { href: "/upload",       icon: Upload,          label: "Upload Dataset" },
  { href: "/monitor",      icon: Activity,        label: "Pipeline Monitor" },
  { href: "/dashboard",    icon: LayoutDashboard, label: "Analytics" },
  { href: "/aibi",         icon: Sparkles,        label: "AI/BI Dashboard" },
  { href: "/architecture", icon: GitBranch,       label: "Architecture" },
  { href: "/docs",         icon: BookOpen,        label: "Documentation" },
];

export default function Sidebar() {
  const { pathname } = useRouter();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0
                      border-r border-white/5 bg-surface-900/60 backdrop-blur-md">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-cyan-400
                        flex items-center justify-center shadow-lg shadow-brand-500/30">
          <Database className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white tracking-tight">DataForge</span>
        <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded
                         bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/40">
          v1.0
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 py-4 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx("nav-link", active && "nav-link-active")}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/5 text-xs text-slate-500">
        FMCG Medallion Pipeline<br />
        <span className="text-slate-600">Powered by Databricks + AWS S3</span>
      </div>
    </aside>
  );
}
