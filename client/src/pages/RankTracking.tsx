/*
 * Design Philosophy: Cyberpunk Data Noir
 * - Hybrid rank tracking (Google + AI)
 * - Side-by-side comparison view
 * - Alert system for ranking changes
 */

import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Filter,
  Bell,
  CheckCircle,
  XCircle,
  Bot,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { rankingData, type RankingData } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

function RankChangeIndicator({ change }: { change: number }) {
  if (change > 0) {
    return (
      <span className="flex items-center gap-1 text-[#22c55e]">
        <ArrowUpRight className="w-4 h-4" />
        <span className="font-mono text-sm">+{change}</span>
      </span>
    );
  } else if (change < 0) {
    return (
      <span className="flex items-center gap-1 text-[#ef4444]">
        <ArrowDownRight className="w-4 h-4" />
        <span className="font-mono text-sm">{change}</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-muted-foreground">
      <Minus className="w-4 h-4" />
      <span className="font-mono text-sm">0</span>
    </span>
  );
}

function AICitationBadges({ citations }: { citations: { chatgpt: boolean; perplexity: boolean; gemini: boolean } }) {
  return (
    <div className="flex items-center gap-1">
      <span
        className={cn(
          "px-1.5 py-0.5 rounded text-[10px] font-mono",
          citations.chatgpt
            ? "bg-[#8b5cf6]/20 text-[#8b5cf6]"
            : "bg-white/5 text-muted-foreground/50"
        )}
      >
        GPT
      </span>
      <span
        className={cn(
          "px-1.5 py-0.5 rounded text-[10px] font-mono",
          citations.perplexity
            ? "bg-[#22d3ee]/20 text-[#22d3ee]"
            : "bg-white/5 text-muted-foreground/50"
        )}
      >
        PPX
      </span>
      <span
        className={cn(
          "px-1.5 py-0.5 rounded text-[10px] font-mono",
          citations.gemini
            ? "bg-[#ec4899]/20 text-[#ec4899]"
            : "bg-white/5 text-muted-foreground/50"
        )}
      >
        GEM
      </span>
    </div>
  );
}

function SentimentBadge({ sentiment }: { sentiment: "positive" | "neutral" | "negative" }) {
  const config = {
    positive: { icon: CheckCircle, color: "#22c55e", label: "ポジティブ" },
    neutral: { icon: Minus, color: "#f59e0b", label: "ニュートラル" },
    negative: { icon: XCircle, color: "#ef4444", label: "ネガティブ" },
  };

  const { icon: Icon, color, label } = config[sentiment];

  return (
    <span
      className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono"
      style={{ background: `${color}20`, color }}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function RankingDetailChart({ ranking }: { ranking: RankingData }) {
  const chartData = ranking.history.map((h) => ({
    date: h.date.split("-").slice(1).join("/"),
    rank: h.googleRank,
    aiMentions: h.aiMentions,
  }));

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "JetBrains Mono" }}
          />
          <YAxis
            yAxisId="left"
            reversed
            domain={[1, 20]}
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "JetBrains Mono" }}
            label={{
              value: "Google順位",
              angle: -90,
              position: "insideLeft",
              fill: "rgba(255,255,255,0.5)",
              fontSize: 10,
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 3]}
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "JetBrains Mono" }}
            label={{
              value: "AI言及",
              angle: 90,
              position: "insideRight",
              fill: "rgba(255,255,255,0.5)",
              fontSize: 10,
            }}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(26, 26, 46, 0.95)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              borderRadius: "8px",
              fontFamily: "JetBrains Mono",
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="rank"
            name="Google順位"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: "#8b5cf6", strokeWidth: 0 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="aiMentions"
            name="AI言及"
            stroke="#22d3ee"
            strokeWidth={2}
            dot={{ fill: "#22d3ee", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function RankTracking() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRanking, setSelectedRanking] = useState<RankingData | null>(rankingData[0]);

  const filteredRankings = rankingData.filter((r) =>
    r.keyword.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate summary stats
  const avgRank = Math.round(
    rankingData.reduce((acc, r) => acc + r.googleRank, 0) / rankingData.length
  );
  const improved = rankingData.filter((r) => r.googleRankChange > 0).length;
  const declined = rankingData.filter((r) => r.googleRankChange < 0).length;
  const aiCited = rankingData.filter(
    (r) => r.aiCitations.chatgpt || r.aiCitations.perplexity || r.aiCitations.gemini
  ).length;

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
            background: "linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)",
            border: "1px solid rgba(236, 72, 153, 0.3)",
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "url('/images/rank-tracking-bg.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[#ec4899]" />
              <span className="text-xs font-mono text-[#ec4899] uppercase tracking-widest">
                ハイブリッド順位トラッキング
              </span>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Google + <span className="text-[#ec4899]">AI検索</span> ランキング
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              従来の検索エンジンとAI検索プラットフォーム全体でのランキングを監視。
              可視性が大きく変化した際にアラートを受け取れます。
            </p>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            variants={itemVariants}
            className="rounded-xl p-4"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-xs text-muted-foreground font-mono">平均順位</span>
            </div>
            <p className="text-2xl font-display font-bold text-[#8b5cf6]">{avgRank}</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-xl p-4"
            style={{
              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-[#22c55e]" />
              <span className="text-xs text-muted-foreground font-mono">上昇</span>
            </div>
            <p className="text-2xl font-display font-bold text-[#22c55e]">{improved}</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-xl p-4"
            style={{
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-[#ef4444]" />
              <span className="text-xs text-muted-foreground font-mono">下落</span>
            </div>
            <p className="text-2xl font-display font-bold text-[#ef4444]">{declined}</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-xl p-4"
            style={{
              background: "linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(34, 211, 238, 0.05) 100%)",
              border: "1px solid rgba(34, 211, 238, 0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Bot className="w-4 h-4 text-[#22d3ee]" />
              <span className="text-xs text-muted-foreground font-mono">AI引用</span>
            </div>
            <p className="text-2xl font-display font-bold text-[#22d3ee]">{aiCited}</p>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="トラッキング中のキーワードを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-border/50 font-mono"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            フィルター
          </Button>
          <Button variant="outline" className="gap-2">
            <Bell className="w-4 h-4" />
            アラート
          </Button>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rankings Table */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 rounded-xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
            }}
          >
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4 bg-white/5">
                <TabsTrigger value="all" className="font-mono text-xs">
                  すべて
                </TabsTrigger>
                <TabsTrigger value="improved" className="font-mono text-xs">
                  上昇
                </TabsTrigger>
                <TabsTrigger value="declined" className="font-mono text-xs">
                  下落
                </TabsTrigger>
                <TabsTrigger value="ai-cited" className="font-mono text-xs">
                  AI引用
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left text-xs text-muted-foreground font-mono uppercase tracking-wider py-3">
                          キーワード
                        </th>
                        <th className="text-center text-xs text-muted-foreground font-mono uppercase tracking-wider py-3">
                          Google
                        </th>
                        <th className="text-center text-xs text-muted-foreground font-mono uppercase tracking-wider py-3">
                          変動
                        </th>
                        <th className="text-center text-xs text-muted-foreground font-mono uppercase tracking-wider py-3">
                          AI引用
                        </th>
                        <th className="text-center text-xs text-muted-foreground font-mono uppercase tracking-wider py-3">
                          センチメント
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRankings.map((ranking) => (
                        <tr
                          key={ranking.id}
                          onClick={() => setSelectedRanking(ranking)}
                          className={cn(
                            "border-b border-border/30 cursor-pointer transition-colors",
                            selectedRanking?.id === ranking.id
                              ? "bg-[#8b5cf6]/10"
                              : "hover:bg-white/5"
                          )}
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <Search className="w-4 h-4 text-[#8b5cf6]" />
                              <span className="text-sm text-foreground font-medium">
                                {ranking.keyword}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <span
                              className={cn(
                                "text-lg font-display font-bold",
                                ranking.googleRank <= 3
                                  ? "text-[#22c55e]"
                                  : ranking.googleRank <= 10
                                  ? "text-[#f59e0b]"
                                  : "text-[#ef4444]"
                              )}
                            >
                              #{ranking.googleRank}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <RankChangeIndicator change={ranking.googleRankChange} />
                          </td>
                          <td className="py-4">
                            <div className="flex justify-center">
                              <AICitationBadges citations={ranking.aiCitations} />
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex justify-center">
                              <SentimentBadge sentiment={ranking.aiSentiment} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="improved" className="mt-0">
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-[#22c55e]" />
                  <p className="font-mono text-sm">
                    {improved}件のキーワードが順位上昇
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="declined" className="mt-0">
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingDown className="w-8 h-8 mx-auto mb-2 text-[#ef4444]" />
                  <p className="font-mono text-sm">
                    {declined}件のキーワードが順位下落
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="ai-cited" className="mt-0">
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-[#22d3ee]" />
                  <p className="font-mono text-sm">
                    {aiCited}件のキーワードがAIプラットフォームで引用
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Detail Panel */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)",
              border: "1px solid rgba(34, 211, 238, 0.2)",
            }}
          >
            {selectedRanking ? (
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-5 h-5 text-[#22d3ee]" />
                    <h3 className="text-lg font-display font-bold text-foreground">
                      {selectedRanking.keyword}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {selectedRanking.url}
                  </p>
                </div>

                {/* Current Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-border/50 text-center">
                    <Globe className="w-5 h-5 text-[#8b5cf6] mx-auto mb-2" />
                    <p className="text-2xl font-display font-bold text-[#8b5cf6]">
                      #{selectedRanking.googleRank}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">Google順位</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-border/50 text-center">
                    <Bot className="w-5 h-5 text-[#22d3ee] mx-auto mb-2" />
                    <p className="text-2xl font-display font-bold text-[#22d3ee]">
                      {Object.values(selectedRanking.aiCitations).filter(Boolean).length}/3
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">AIプラットフォーム</p>
                  </div>
                </div>

                {/* AI Citations */}
                <div>
                  <h4 className="text-sm font-mono text-muted-foreground mb-3">
                    AIプラットフォーム状態
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded bg-white/5">
                      <span className="text-sm text-foreground">ChatGPT</span>
                      {selectedRanking.aiCitations.chatgpt ? (
                        <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-white/5">
                      <span className="text-sm text-foreground">Perplexity</span>
                      {selectedRanking.aiCitations.perplexity ? (
                        <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-white/5">
                      <span className="text-sm text-foreground">Gemini</span>
                      {selectedRanking.aiCitations.gemini ? (
                        <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground/50" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Trend Chart */}
                <div>
                  <h4 className="text-sm font-mono text-muted-foreground mb-3">
                    7日間のトレンド
                  </h4>
                  <RankingDetailChart ranking={selectedRanking} />
                </div>

                {/* Last Updated */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span className="font-mono">
                    最終更新: {selectedRanking.lastUpdated}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p className="text-sm font-mono">キーワードを選択して詳細を表示</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
