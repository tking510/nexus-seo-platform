/*
 * Design Philosophy: Cyberpunk Data Noir
 * - Keyword analysis with SEO + LLMO metrics
 * - Trend visualization and AI visibility tracking
 * - Interactive data tables with filtering
 */

import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Target,
  DollarSign,
  BarChart3,
  Brain,
  Bot,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { keywordData, type KeywordData } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  },
};

function KeywordTrendChart({ data }: { data: number[] }) {
  const chartData = data.map((value, index) => ({
    month: index + 1,
    value,
  }));

  return (
    <div className="h-12 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke="#8b5cf6"
            strokeWidth={1.5}
            fill="url(#trendGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function AIVisibilityBar({ chatgpt, perplexity, gemini }: { chatgpt: number; perplexity: number; gemini: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex gap-0.5">
        <div
          className="h-6 rounded-l bg-[#8b5cf6]"
          style={{ width: `${chatgpt / 3}%` }}
          title={`ChatGPT: ${chatgpt}%`}
        />
        <div
          className="h-6 bg-[#22d3ee]"
          style={{ width: `${perplexity / 3}%` }}
          title={`Perplexity: ${perplexity}%`}
        />
        <div
          className="h-6 rounded-r bg-[#ec4899]"
          style={{ width: `${gemini / 3}%` }}
          title={`Gemini: ${gemini}%`}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-10 text-right">
        {Math.round((chatgpt + perplexity + gemini) / 3)}%
      </span>
    </div>
  );
}

function KeywordDetailPanel({ keyword }: { keyword: KeywordData | null }) {
  if (!keyword) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p className="text-sm font-mono">Select a keyword to view details</p>
      </div>
    );
  }

  const trendChartData = keyword.trend.map((value, index) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][index],
    volume: value,
  }));

  const aiData = [
    { name: "ChatGPT", value: keyword.aiVisibility.chatgpt, color: "#8b5cf6" },
    { name: "Perplexity", value: keyword.aiVisibility.perplexity, color: "#22d3ee" },
    { name: "Gemini", value: keyword.aiVisibility.gemini, color: "#ec4899" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-5 h-5 text-[#8b5cf6]" />
          <h3 className="text-xl font-display font-bold text-foreground">
            {keyword.keyword}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-mono px-2 py-0.5 rounded uppercase",
              keyword.intent === "transactional"
                ? "bg-[#22c55e]/20 text-[#22c55e]"
                : keyword.intent === "commercial"
                ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                : keyword.intent === "informational"
                ? "bg-[#22d3ee]/20 text-[#22d3ee]"
                : "bg-[#8b5cf6]/20 text-[#8b5cf6]"
            )}
          >
            {keyword.intent}
          </span>
          {keyword.serpFeatures.map((feature) => (
            <span
              key={feature}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-muted-foreground"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white/5 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-[#8b5cf6]" />
            <span className="text-xs text-muted-foreground font-mono">Search Volume</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {keyword.searchVolume.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-[#22d3ee]" />
            <span className="text-xs text-muted-foreground font-mono">Keyword Difficulty</span>
          </div>
          <p
            className={cn(
              "text-2xl font-display font-bold",
              keyword.keywordDifficulty >= 70
                ? "text-[#ef4444]"
                : keyword.keywordDifficulty >= 50
                ? "text-[#f59e0b]"
                : "text-[#22c55e]"
            )}
          >
            {keyword.keywordDifficulty}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-[#ec4899]" />
            <span className="text-xs text-muted-foreground font-mono">CPC</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            ${keyword.cpc.toFixed(2)}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-[#22c55e]" />
            <span className="text-xs text-muted-foreground font-mono">AI Visibility</span>
          </div>
          <p className="text-2xl font-display font-bold text-[#22c55e]">
            {Math.round(
              (keyword.aiVisibility.chatgpt +
                keyword.aiVisibility.perplexity +
                keyword.aiVisibility.gemini) /
                3
            )}%
          </p>
        </div>
      </div>

      {/* Trend Chart */}
      <div>
        <h4 className="text-sm font-mono text-muted-foreground mb-3">
          12-Month Search Volume Trend
        </h4>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendChartData}>
              <defs>
                <linearGradient id="detailTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
              <XAxis
                dataKey="month"
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "JetBrains Mono" }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "JetBrains Mono" }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(26, 26, 46, 0.95)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: "8px",
                  fontFamily: "JetBrains Mono",
                }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#detailTrendGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Visibility Breakdown */}
      <div>
        <h4 className="text-sm font-mono text-muted-foreground mb-3">
          AI Platform Visibility
        </h4>
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aiData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "JetBrains Mono" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "JetBrains Mono" }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(26, 26, 46, 0.95)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: "8px",
                  fontFamily: "JetBrains Mono",
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {aiData.map((entry, index) => (
                  <motion.rect
                    key={`bar-${index}`}
                    fill={entry.color}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function KeywordIntelligence() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordData | null>(null);

  const filteredKeywords = keywordData.filter((kw) =>
    kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl p-8"
          style={{
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(34, 211, 238, 0.1) 100%)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "url('/images/keyword-intelligence-bg.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#8b5cf6]" />
              <span className="text-xs font-mono text-[#8b5cf6] uppercase tracking-widest">
                Keyword Intelligence
              </span>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              SEO + <span className="text-[#22d3ee]">LLMO</span> Analysis
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Track traditional SEO metrics alongside AI visibility scores. Understand how your
              keywords perform across Google and generative AI platforms.
            </p>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-border/50 font-mono"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Keywords Table */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 rounded-xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs text-muted-foreground font-mono uppercase tracking-wider py-3 px-2">
                      Keyword
                    </th>
                    <th className="text-right text-xs text-muted-foreground font-mono uppercase tracking-wider py-3 px-2">
                      Volume
                    </th>
                    <th className="text-right text-xs text-muted-foreground font-mono uppercase tracking-wider py-3 px-2">
                      KD
                    </th>
                    <th className="text-right text-xs text-muted-foreground font-mono uppercase tracking-wider py-3 px-2">
                      CPC
                    </th>
                    <th className="text-center text-xs text-muted-foreground font-mono uppercase tracking-wider py-3 px-2">
                      Trend
                    </th>
                    <th className="text-left text-xs text-muted-foreground font-mono uppercase tracking-wider py-3 px-2">
                      AI Visibility
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKeywords.map((kw) => (
                    <tr
                      key={kw.id}
                      onClick={() => setSelectedKeyword(kw)}
                      className={cn(
                        "border-b border-border/30 cursor-pointer transition-colors",
                        selectedKeyword?.id === kw.id
                          ? "bg-[#8b5cf6]/10"
                          : "hover:bg-white/5"
                      )}
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-[#8b5cf6]" />
                          <span className="text-sm text-foreground font-medium">
                            {kw.keyword}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-4 px-2">
                        <span className="text-sm text-foreground font-mono">
                          {kw.searchVolume.toLocaleString()}
                        </span>
                      </td>
                      <td className="text-right py-4 px-2">
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
                      <td className="text-right py-4 px-2">
                        <span className="text-sm text-foreground font-mono">
                          ${kw.cpc.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <KeywordTrendChart data={kw.trend} />
                      </td>
                      <td className="py-4 px-2 w-40">
                        <AIVisibilityBar
                          chatgpt={kw.aiVisibility.chatgpt}
                          perplexity={kw.aiVisibility.perplexity}
                          gemini={kw.aiVisibility.gemini}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Detail Panel */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)",
              border: "1px solid rgba(34, 211, 238, 0.2)",
            }}
          >
            <KeywordDetailPanel keyword={selectedKeyword} />
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
