/*
 * Design Philosophy: Cyberpunk Data Noir
 * - Bento Grid layout for dashboard overview
 * - Glassmorphism cards with neon accents
 * - Interactive charts with smooth animations
 */

import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Globe,
  Link2,
  Brain,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  dashboardStats,
  trafficTrendData,
  aiPlatformData,
  recentAlerts,
  keywordData,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  color: string;
  suffix?: string;
}

function StatCard({ title, value, change, icon: Icon, color, suffix = "" }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <motion.div
      variants={itemVariants}
      className="relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`,
      }}
      whileHover={{
        boxShadow: `0 0 30px ${color}20`,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold font-display tracking-tight" style={{ color }}>
            {typeof value === "number" ? value.toLocaleString() : value}
            {suffix && <span className="text-lg ml-1">{suffix}</span>}
          </p>
        </div>
        <div
          className="p-3 rounded-lg"
          style={{ background: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-[#22c55e]" />
        ) : (
          <TrendingDown className="w-4 h-4 text-[#ef4444]" />
        )}
        <span
          className={cn(
            "text-sm font-mono",
            isPositive ? "text-[#22c55e]" : "text-[#ef4444]"
          )}
        >
          {isPositive ? "+" : ""}
          {change}%
        </span>
        <span className="text-xs text-muted-foreground">vs last month</span>
      </div>

      {/* Decorative gradient line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
    </motion.div>
  );
}

function TrafficChart() {
  return (
    <motion.div
      variants={itemVariants}
      className="col-span-2 rounded-xl p-6"
      style={{
        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)",
        border: "1px solid rgba(139, 92, 246, 0.2)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-display font-bold text-foreground">
            Traffic Overview
          </h3>
          <p className="text-sm text-muted-foreground font-mono">
            Organic vs AI-Referred Traffic
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
            <span className="text-xs text-muted-foreground font-mono">Organic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#22d3ee]" />
            <span className="text-xs text-muted-foreground font-mono">AI-Referred</span>
          </div>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trafficTrendData}>
            <defs>
              <linearGradient id="organicGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
            <XAxis
              dataKey="month"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "JetBrains Mono" }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "JetBrains Mono" }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(26, 26, 46, 0.95)",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                borderRadius: "8px",
                fontFamily: "JetBrains Mono",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Area
              type="monotone"
              dataKey="organic"
              stroke="#8b5cf6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#organicGradient)"
            />
            <Area
              type="monotone"
              dataKey="ai"
              stroke="#22d3ee"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#aiGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function AIPlatformChart() {
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl p-6"
      style={{
        background: "linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)",
        border: "1px solid rgba(34, 211, 238, 0.2)",
      }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-display font-bold text-foreground">
          AI Platform Distribution
        </h3>
        <p className="text-sm text-muted-foreground font-mono">
          Share of Model Citations
        </p>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={aiPlatformData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {aiPlatformData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "rgba(26, 26, 46, 0.95)",
                border: "1px solid rgba(34, 211, 238, 0.3)",
                borderRadius: "8px",
                fontFamily: "JetBrains Mono",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {aiPlatformData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: item.color }}
            />
            <span className="text-xs text-muted-foreground font-mono">
              {item.name}: {item.value}%
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function RecentAlerts() {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-[#22c55e]" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-[#f59e0b]" />;
      case "info":
        return <Info className="w-4 h-4 text-[#22d3ee]" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl p-6"
      style={{
        background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)",
        border: "1px solid rgba(236, 72, 153, 0.2)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-bold text-foreground">
          Recent Alerts
        </h3>
        <button className="text-xs text-[#8b5cf6] font-mono hover:underline">
          View All
        </button>
      </div>
      <div className="space-y-3">
        {recentAlerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            {getAlertIcon(alert.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {alert.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {alert.message}
              </p>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
              {alert.time}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function TopKeywords() {
  return (
    <motion.div
      variants={itemVariants}
      className="col-span-2 rounded-xl p-6"
      style={{
        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)",
        border: "1px solid rgba(139, 92, 246, 0.2)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-bold text-foreground">
          Top Performing Keywords
        </h3>
        <button className="flex items-center gap-1 text-xs text-[#8b5cf6] font-mono hover:underline">
          View All <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-xs text-muted-foreground font-mono uppercase tracking-wider py-3">
                Keyword
              </th>
              <th className="text-right text-xs text-muted-foreground font-mono uppercase tracking-wider py-3">
                Volume
              </th>
              <th className="text-right text-xs text-muted-foreground font-mono uppercase tracking-wider py-3">
                KD
              </th>
              <th className="text-right text-xs text-muted-foreground font-mono uppercase tracking-wider py-3">
                AI Visibility
              </th>
            </tr>
          </thead>
          <tbody>
            {keywordData.slice(0, 5).map((kw) => (
              <tr
                key={kw.id}
                className="border-b border-border/30 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#8b5cf6]" />
                    <span className="text-sm text-foreground font-medium">
                      {kw.keyword}
                    </span>
                  </div>
                </td>
                <td className="text-right py-3">
                  <span className="text-sm text-foreground font-mono">
                    {kw.searchVolume.toLocaleString()}
                  </span>
                </td>
                <td className="text-right py-3">
                  <span
                    className={cn(
                      "text-sm font-mono px-2 py-0.5 rounded",
                      kw.keywordDifficulty >= 70
                        ? "bg-[#ef4444]/20 text-[#ef4444]"
                        : kw.keywordDifficulty >= 50
                        ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                        : "bg-[#22c55e]/20 text-[#22c55e]"
                    )}
                  >
                    {kw.keywordDifficulty}
                  </span>
                </td>
                <td className="text-right py-3">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#22d3ee]"
                        style={{
                          width: `${(kw.aiVisibility.chatgpt + kw.aiVisibility.perplexity + kw.aiVisibility.gemini) / 3}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-foreground font-mono">
                      {Math.round(
                        (kw.aiVisibility.chatgpt + kw.aiVisibility.perplexity + kw.aiVisibility.gemini) / 3
                      )}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default function Home() {
  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Hero Section */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl p-8"
          style={{
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(34, 211, 238, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
          }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url('/images/hero-background.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-[#8b5cf6]" />
              <span className="text-xs font-mono text-[#8b5cf6] uppercase tracking-widest">
                Intelligence Dashboard
              </span>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Welcome to <span className="text-[#8b5cf6] neon-text-violet">Nexus</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Your unified command center for SEO and Generative Engine Optimization. 
              Monitor traditional search rankings alongside AI visibility metrics in real-time.
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tracked Keywords"
            value={dashboardStats.totalKeywords}
            change={dashboardStats.keywordsChange}
            icon={Search}
            color="#8b5cf6"
          />
          <StatCard
            title="Avg. Position"
            value={dashboardStats.avgPosition}
            change={dashboardStats.positionChange}
            icon={TrendingUp}
            color="#22d3ee"
          />
          <StatCard
            title="AI Visibility"
            value={dashboardStats.aiVisibility}
            change={dashboardStats.aiVisibilityChange}
            icon={Brain}
            color="#ec4899"
            suffix="%"
          />
          <StatCard
            title="Domain Rating"
            value={dashboardStats.domainRating}
            change={dashboardStats.drChange}
            icon={Globe}
            color="#22c55e"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <TrafficChart />
          <AIPlatformChart />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <TopKeywords />
          <RecentAlerts />
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
