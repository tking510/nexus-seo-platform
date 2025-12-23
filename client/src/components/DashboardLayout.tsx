/*
 * Design Philosophy: Cyberpunk Data Noir
 * - Persistent sidebar navigation for dashboard
 * - Glassmorphism effects on navigation elements
 * - Neon accent colors for active states
 */

import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Search,
  Globe,
  TrendingUp,
  LayoutDashboard,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Zap,
  Brain,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  {
    href: "/",
    icon: LayoutDashboard,
    label: "ダッシュボード",
    description: "概要と分析",
  },
  {
    href: "/keywords",
    icon: Search,
    label: "キーワード分析",
    description: "SEO + LLMO 分析",
  },
  {
    href: "/domains",
    icon: Globe,
    label: "ドメイン調査",
    description: "被リンク & AI監査",
  },
  {
    href: "/rank-tracking",
    icon: TrendingUp,
    label: "順位トラッキング",
    description: "ハイブリッド監視",
  },
  {
    href: "/settings",
    icon: Settings,
    label: "設定",
    description: "API連携 & 管理",
  },
];

const glassStyle = {
  background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(139, 92, 246, 0.2)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background circuit-pattern">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-screen z-50 flex flex-col"
      >
        {/* Sidebar Background */}
        <div 
          className="absolute inset-0 border-r border-border/50" 
          style={glassStyle}
        />

        {/* Logo Section */}
        <div className="relative z-10 p-4 border-b border-border/50">
          <Link href="/">
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#22d3ee] flex items-center justify-center neon-glow-violet">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#22d3ee] animate-pulse" />
              </div>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h1 className="font-display font-bold text-lg text-foreground tracking-wider">
                    NEXUS
                  </h1>
                  <p className="text-[10px] text-muted-foreground font-mono tracking-widest">
                    SEO & LLMO インテル
                  </p>
                </motion.div>
              )}
            </motion.div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-300 group",
                    isActive
                      ? "bg-[#8b5cf6]/20 border border-[#8b5cf6]/50"
                      : "hover:bg-white/5 border border-transparent"
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg transition-all duration-300",
                      isActive
                        ? "bg-[#8b5cf6] neon-glow-violet"
                        : "bg-white/5 group-hover:bg-[#8b5cf6]/30"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 transition-colors",
                        isActive ? "text-white" : "text-muted-foreground group-hover:text-[#8b5cf6]"
                      )}
                    />
                  </div>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 min-w-0"
                    >
                      <p
                        className={cn(
                          "font-medium text-sm truncate",
                          isActive ? "text-[#8b5cf6]" : "text-foreground"
                        )}
                      >
                        {item.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate font-mono">
                        {item.description}
                      </p>
                    </motion.div>
                  )}
                  {isActive && !collapsed && (
                    <div className="w-1.5 h-8 rounded-full bg-[#8b5cf6] neon-glow-violet" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* AI Status Section */}
        {!collapsed && (
          <div className="relative z-10 p-4 border-t border-border/50">
            <div 
              className="rounded-lg p-3"
              style={{
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)",
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-[#22d3ee]" />
                <span className="text-xs font-mono text-muted-foreground">
                  AIエンジン状態
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="status-dot success" />
                <span className="text-xs text-[#22c55e] font-mono">
                  全システム稼働中
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#8b5cf6] flex items-center justify-center hover:bg-[#7c3aed] transition-colors neon-glow-violet z-20"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-white" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-white" />
          )}
        </button>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        initial={false}
        animate={{ marginLeft: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        {/* Top Bar */}
        <header 
          className="sticky top-0 z-40 h-16 border-b border-border/50"
          style={glassStyle}
        >
          <div className="h-full px-6 flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="キーワード、ドメイン、指標を検索..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/50 transition-all font-mono"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ec4899] animate-pulse" />
              </button>

              {/* Settings */}
              <Link href="/settings">
                <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                </button>
              </Link>

              {/* User Avatar */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] flex items-center justify-center">
                <span className="text-xs font-bold text-white">N</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </motion.main>
    </div>
  );
}
