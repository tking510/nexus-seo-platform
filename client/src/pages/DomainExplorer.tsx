/*
 * Design Philosophy: Cyberpunk Data Noir
 * - Domain analysis with backlink profile
 * - AI-Readability audit scores
 * - Competitor gap analysis
 * - AI-powered improvement suggestions
 * - CSV export functionality
 */

import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Globe,
  Link2,
  Search,
  Shield,
  Brain,
  Eye,
  ExternalLink,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  BarChart3,
  Users,
  Download,
  Loader2,
  Lightbulb,
  Target,
  X,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { domainData } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

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

function ScoreGauge({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-2">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${(score / 100) * 226} 226`}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-display font-bold" style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground font-mono">{label}</p>
    </div>
  );
}

// AI分析結果の型定義
interface DomainAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  technicalImprovements: Array<{
    area: string;
    action: string;
    impact: string;
  }>;
  backlinkStrategy: string[];
  differentiationPoints: string[];
  priorityActions: Array<{
    action: string;
    priority: number;
    effort: string;
    expectedImpact: string;
  }>;
}

function AIAnalysisPanel({ 
  analysis, 
  isLoading, 
  onClose 
}: { 
  analysis: DomainAnalysis | null; 
  isLoading: boolean;
  onClose: () => void;
}) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-6"
        style={{
          background: "linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)",
          border: "1px solid rgba(34, 211, 238, 0.3)",
        }}
      >
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="w-6 h-6 text-[#22d3ee] animate-spin" />
          <span className="text-muted-foreground font-mono">AIがドメインを分析中...</span>
        </div>
      </motion.div>
    );
  }

  if (!analysis) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="rounded-xl p-6 relative"
      style={{
        background: "linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)",
        border: "1px solid rgba(34, 211, 238, 0.3)",
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>

      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-[#22d3ee]" />
        <h3 className="text-lg font-display font-bold text-foreground">AI改善提案</h3>
      </div>

      {/* サマリー */}
      <div className="mb-6 p-4 rounded-lg bg-white/5 border border-border/50">
        <p className="text-sm text-foreground">{analysis.summary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 強み */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-[#22c55e]" />
            <h4 className="text-sm font-mono text-muted-foreground">強み</h4>
          </div>
          <ul className="space-y-2">
            {analysis.strengths.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                <TrendingUp className="w-4 h-4 text-[#22c55e] mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 弱み */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
            <h4 className="text-sm font-mono text-muted-foreground">改善点</h4>
          </div>
          <ul className="space-y-2">
            {analysis.weaknesses.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                <XCircle className="w-4 h-4 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 技術的改善点 */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-[#8b5cf6]" />
          <h4 className="text-sm font-mono text-muted-foreground">技術的改善点</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {analysis.technicalImprovements.map((item, index) => (
            <div key={index} className="p-3 rounded-lg bg-white/5 border border-border/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-[#8b5cf6]">{item.area}</span>
                <span className={cn(
                  "text-xs font-mono px-2 py-0.5 rounded",
                  item.impact === "高" ? "bg-[#22c55e]/20 text-[#22c55e]" :
                  item.impact === "中" ? "bg-[#f59e0b]/20 text-[#f59e0b]" :
                  "bg-[#ef4444]/20 text-[#ef4444]"
                )}>
                  影響度: {item.impact}
                </span>
              </div>
              <p className="text-sm text-foreground">{item.action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 被リンク戦略 */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-4 h-4 text-[#ec4899]" />
          <h4 className="text-sm font-mono text-muted-foreground">被リンク戦略</h4>
        </div>
        <ul className="space-y-2">
          {analysis.backlinkStrategy.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-foreground">
              <Lightbulb className="w-4 h-4 text-[#ec4899] mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 優先アクション */}
      <div className="mt-6 p-4 rounded-lg bg-[#22d3ee]/10 border border-[#22d3ee]/30">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-[#22d3ee]" />
          <h4 className="text-sm font-mono text-foreground">優先アクション（優先度順）</h4>
        </div>
        <div className="space-y-3">
          {analysis.priorityActions.sort((a, b) => a.priority - b.priority).map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#22d3ee]/20 flex items-center justify-center text-xs font-bold text-[#22d3ee]">
                {item.priority}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.action}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-muted-foreground">
                    工数: <span className={cn(
                      item.effort === "高" ? "text-[#ef4444]" :
                      item.effort === "中" ? "text-[#f59e0b]" :
                      "text-[#22c55e]"
                    )}>{item.effort}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    期待効果: {item.expectedImpact}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function DomainExplorer() {
  const [searchUrl, setSearchUrl] = useState("example.com");
  const [aiAnalysis, setAiAnalysis] = useState<DomainAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeDomainMutation = trpc.seo.analyzeDomain.useMutation();
  const exportCSVMutation = trpc.export.domainToCSV.useMutation();

  const aiReadabilityData = [
    { subject: "セマンティックHTML", A: domainData.semanticHtmlScore, fullMark: 100 },
    { subject: "Schema.org", A: domainData.schemaOrgScore, fullMark: 100 },
    { subject: "コンテンツ明瞭性", A: domainData.contentClarityScore, fullMark: 100 },
    { subject: "AI可読性", A: domainData.aiReadabilityScore, fullMark: 100 },
  ];

  const competitorData = domainData.competitorOverlap.map((comp) => ({
    name: comp.competitor.replace(".com", ""),
    shared: comp.sharedKeywords,
    gap: comp.gap,
  }));

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      const result = await analyzeDomainMutation.mutateAsync({
        domain: searchUrl,
        domainRating: domainData.domainRating,
        organicTraffic: domainData.organicTraffic,
        backlinks: domainData.backlinks,
        referringDomains: domainData.referringDomains,
        aiReadabilityScore: domainData.aiReadabilityScore,
        semanticHtmlScore: domainData.semanticHtmlScore,
        schemaOrgScore: domainData.schemaOrgScore,
        contentClarityScore: domainData.contentClarityScore,
      });

      if (result.success && result.analysis) {
        setAiAnalysis(result.analysis as DomainAnalysis);
        toast.success("AI分析が完了しました");
      } else {
        toast.error("分析に失敗しました");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("分析中にエラーが発生しました");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const result = await exportCSVMutation.mutateAsync({
        domain: searchUrl,
        domainRating: domainData.domainRating,
        organicTraffic: domainData.organicTraffic,
        backlinks: domainData.backlinks,
        referringDomains: domainData.referringDomains,
        aiReadabilityScore: domainData.aiReadabilityScore,
        semanticHtmlScore: domainData.semanticHtmlScore,
        schemaOrgScore: domainData.schemaOrgScore,
        contentClarityScore: domainData.contentClarityScore,
        topBacklinks: domainData.topBacklinks.map(bl => ({
          sourceDomain: bl.sourceDomain,
          targetUrl: bl.targetUrl,
          anchorText: bl.anchorText,
          domainRating: bl.domainRating,
          doFollow: bl.doFollow,
        })),
      });

      // CSVをダウンロード
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = result.filename;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.success("CSVエクスポートが完了しました");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("エクスポートに失敗しました");
    }
  };

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
            background: "linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)",
            border: "1px solid rgba(34, 211, 238, 0.3)",
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "url('/images/domain-explorer-bg.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-[#22d3ee]" />
              <span className="text-xs font-mono text-[#22d3ee] uppercase tracking-widest">
                ドメイン & URL エクスプローラー
              </span>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              被リンクプロファイル & <span className="text-[#22d3ee]">AI監査</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              被リンクプロファイル、ドメインオーソリティ、AI可読性スコアを分析。
              LLMクローラーがコンテンツをどのように解釈するかを把握できます。
            </p>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="分析するドメインまたはURLを入力..."
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
              className="pl-10 bg-white/5 border-border/50 font-mono"
            />
          </div>
          <Button 
            className="gap-2 bg-[#22d3ee] hover:bg-[#22d3ee]/80 text-black"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            分析
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleExportCSV}
            disabled={exportCSVMutation.isPending}
          >
            {exportCSVMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            CSVエクスポート
          </Button>
        </motion.div>

        {/* AI Analysis Panel */}
        <AnimatePresence>
          {(aiAnalysis || isAnalyzing) && (
            <motion.div variants={itemVariants}>
              <AIAnalysisPanel
                analysis={aiAnalysis}
                isLoading={isAnalyzing}
                onClose={() => setAiAnalysis(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Domain Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            variants={itemVariants}
            className="rounded-xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-xs text-muted-foreground font-mono">ドメインレーティング</span>
            </div>
            <p className="text-3xl font-display font-bold text-[#8b5cf6]">
              {domainData.domainRating}
            </p>
            <Progress value={domainData.domainRating} className="mt-2 h-1" />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(34, 211, 238, 0.05) 100%)",
              border: "1px solid rgba(34, 211, 238, 0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-[#22d3ee]" />
              <span className="text-xs text-muted-foreground font-mono">オーガニックトラフィック</span>
            </div>
            <p className="text-3xl font-display font-bold text-[#22d3ee]">
              {(domainData.organicTraffic / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">月間訪問数</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0.05) 100%)",
              border: "1px solid rgba(236, 72, 153, 0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-[#ec4899]" />
              <span className="text-xs text-muted-foreground font-mono">被リンク</span>
            </div>
            <p className="text-3xl font-display font-bold text-[#ec4899]">
              {(domainData.backlinks / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">総リンク数</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-[#22c55e]" />
              <span className="text-xs text-muted-foreground font-mono">参照ドメイン</span>
            </div>
            <p className="text-3xl font-display font-bold text-[#22c55e]">
              {(domainData.referringDomains / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">ユニークドメイン</p>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Readability Audit */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-[#8b5cf6]" />
              <h3 className="text-lg font-display font-bold text-foreground">
                AI可読性監査
              </h3>
            </div>

            {/* Score Gauges */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <ScoreGauge
                score={domainData.semanticHtmlScore}
                label="セマンティックHTML"
                color="#8b5cf6"
              />
              <ScoreGauge
                score={domainData.schemaOrgScore}
                label="Schema.org"
                color="#22d3ee"
              />
              <ScoreGauge
                score={domainData.contentClarityScore}
                label="コンテンツ明瞭性"
                color="#ec4899"
              />
              <ScoreGauge
                score={domainData.aiReadabilityScore}
                label="AI可読性"
                color="#22c55e"
              />
            </div>

            {/* Radar Chart */}
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={aiReadabilityData}>
                  <PolarGrid stroke="rgba(139, 92, 246, 0.2)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "JetBrains Mono" }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 8 }}
                  />
                  <Radar
                    name="スコア"
                    dataKey="A"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Top Backlinks */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 rounded-xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)",
              border: "1px solid rgba(34, 211, 238, 0.2)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-[#22d3ee]" />
                <h3 className="text-lg font-display font-bold text-foreground">
                  上位被リンク
                </h3>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-[#22d3ee]">
                すべて表示 <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs text-muted-foreground font-mono uppercase tracking-wider py-3">
                      参照元ドメイン
                    </th>
                    <th className="text-left text-xs text-muted-foreground font-mono uppercase tracking-wider py-3">
                      ターゲットURL
                    </th>
                    <th className="text-center text-xs text-muted-foreground font-mono uppercase tracking-wider py-3">
                      DR
                    </th>
                    <th className="text-center text-xs text-muted-foreground font-mono uppercase tracking-wider py-3">
                      タイプ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {domainData.topBacklinks.map((link) => (
                    <tr
                      key={link.id}
                      className="border-b border-border/30 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-[#22d3ee]" />
                          <span className="text-sm text-foreground font-medium">
                            {link.sourceDomain}
                          </span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-sm text-muted-foreground font-mono">
                          {link.targetUrl}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={cn(
                            "text-sm font-mono px-2 py-0.5 rounded",
                            link.domainRating >= 90
                              ? "bg-[#22c55e]/20 text-[#22c55e]"
                              : link.domainRating >= 70
                              ? "bg-[#22d3ee]/20 text-[#22d3ee]"
                              : "bg-[#f59e0b]/20 text-[#f59e0b]"
                          )}
                        >
                          {link.domainRating}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {link.doFollow ? (
                          <span className="flex items-center justify-center gap-1 text-xs text-[#22c55e]">
                            <CheckCircle className="w-3 h-3" />
                            DoFollow
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                            <XCircle className="w-3 h-3" />
                            NoFollow
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Competitor Gap Analysis */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl p-6"
          style={{
            background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)",
            border: "1px solid rgba(236, 72, 153, 0.2)",
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Eye className="w-5 h-5 text-[#ec4899]" />
            <h3 className="text-lg font-display font-bold text-foreground">
              競合キーワードギャップ分析
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={competitorData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(236, 72, 153, 0.1)" />
                  <XAxis
                    type="number"
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
                      border: "1px solid rgba(236, 72, 153, 0.3)",
                      borderRadius: "8px",
                      fontFamily: "JetBrains Mono",
                    }}
                  />
                  <Bar dataKey="shared" name="共有キーワード" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="gap" name="キーワードギャップ" fill="#ec4899" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              {domainData.competitorOverlap.map((comp) => (
                <div
                  key={comp.competitor}
                  className="p-4 rounded-lg bg-white/5 border border-border/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#ec4899]" />
                      <span className="text-sm font-medium text-foreground">
                        {comp.competitor}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {comp.uniqueKeywords.toLocaleString()} 総キーワード
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">共有</span>
                        <span className="text-[#8b5cf6] font-mono">
                          {comp.sharedKeywords.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#8b5cf6] rounded-full"
                          style={{
                            width: `${(comp.sharedKeywords / comp.uniqueKeywords) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">ギャップ</span>
                        <span className="text-[#ec4899] font-mono">
                          {comp.gap.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#ec4899] rounded-full"
                          style={{
                            width: `${(comp.gap / comp.uniqueKeywords) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
