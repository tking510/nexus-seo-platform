/*
 * Design Philosophy: Cyberpunk Data Noir
 * - Domain analysis with backlink profile
 * - AI-Readability audit scores
 * - Competitor gap analysis
 * - AI-powered improvement suggestions
 * - CSV export functionality
 * - Real AI-powered data analysis
 */

import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  Globe,
  Link2,
  Search,
  Brain,
  Eye,
  ExternalLink,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Users,
  Download,
  Loader2,
  Lightbulb,
  Target,
  X,
  AlertCircle,
  TrendingUp,
  Sparkles,
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

// AI分析結果の型定義
interface DomainAnalysisResult {
  domainOverview: {
    estimatedDR: number;
    estimatedTraffic: number;
    mainTopics: string[];
    targetAudience: string;
    siteType: string;
  };
  strengthKeywords: Array<{
    keyword: string;
    searchVolume: number;
    estimatedRank: number;
    aiVisibility: number;
    intent: string;
    difficulty: number;
  }>;
  competitors: Array<{
    domain: string;
    overlapScore: number;
    strengths: string[];
  }>;
  backlinks: {
    estimatedTotal: number;
    estimatedReferringDomains: number;
    topSources: Array<{
      domain: string;
      dr: number;
      type: string;
      context: string;
    }>;
  };
  aiReadability: {
    semanticHTML: number;
    schemaOrg: number;
    contentClarity: number;
    overallScore: number;
  };
  improvements: Array<{
    category: string;
    priority: string;
    title: string;
    description: string;
    expectedImpact: string;
    implementationSteps: string[];
  }>;
}

interface LLMCitationResult {
  overallVisibility: number;
  platforms: {
    chatgpt: { score: number; mentions: string[]; sentiment: string };
    perplexity: { score: number; mentions: string[]; sentiment: string };
    gemini: { score: number; mentions: string[]; sentiment: string };
  };
  recommendations: string[];
}

// AI分析結果の型定義（既存のUI用）
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
        className="rounded-xl p-6 mt-4"
        style={{
          background: "linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)",
          border: "1px solid rgba(34, 211, 238, 0.3)",
        }}
      >
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="w-6 h-6 text-[#22d3ee] animate-spin" />
          <span className="text-muted-foreground font-mono">AIが分析中...</span>
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
      className="rounded-xl p-6 mt-4 relative"
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

      {/* Summary */}
      <div className="p-4 rounded-lg bg-white/5 mb-4">
        <p className="text-sm text-foreground">{analysis.summary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-4 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-[#22c55e]" />
            <h4 className="text-sm font-bold text-[#22c55e]">強み</h4>
          </div>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, i) => (
              <li key={i} className="text-xs text-foreground flex items-start gap-2">
                <span className="text-[#22c55e] mt-0.5">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="p-4 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-[#ef4444]" />
            <h4 className="text-sm font-bold text-[#ef4444]">改善点</h4>
          </div>
          <ul className="space-y-2">
            {analysis.weaknesses.map((weakness, i) => (
              <li key={i} className="text-xs text-foreground flex items-start gap-2">
                <span className="text-[#ef4444] mt-0.5">•</span>
                {weakness}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Technical Improvements */}
      <div className="mt-4 p-4 rounded-lg bg-white/5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-[#f59e0b]" />
          <h4 className="text-sm font-bold text-[#f59e0b]">技術的改善点</h4>
        </div>
        <div className="space-y-2">
          {analysis.technicalImprovements.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded font-mono",
                  item.impact === "高" ? "bg-[#ef4444]/20 text-[#ef4444]" :
                  item.impact === "中" ? "bg-[#f59e0b]/20 text-[#f59e0b]" :
                  "bg-[#22c55e]/20 text-[#22c55e]"
                )}>
                  {item.impact}
                </span>
                <span className="text-xs text-muted-foreground">{item.area}</span>
              </div>
              <span className="text-xs text-foreground">{item.action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Actions */}
      <div className="mt-4 p-4 rounded-lg bg-white/5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-[#8b5cf6]" />
          <h4 className="text-sm font-bold text-[#8b5cf6]">優先アクション</h4>
        </div>
        <div className="space-y-2">
          {analysis.priorityActions.slice(0, 5).map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#22d3ee]/20 flex items-center justify-center text-xs font-bold text-[#22d3ee]">
                  {item.priority}
                </span>
                <span className="text-foreground">{item.action}</span>
              </div>
              <span className="text-xs text-muted-foreground">{item.expectedImpact}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function DomainExplorer() {
  const [searchUrl, setSearchUrl] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<DomainAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // AI分析結果を保存
  const [domainAnalysisResult, setDomainAnalysisResult] = useState<DomainAnalysisResult | null>(null);
  const [llmCitations, setLlmCitations] = useState<LLMCitationResult | null>(null);

  const analyzeDomainMutation = trpc.seo.analyzeDomain.useMutation();
  const exportCSVMutation = trpc.export.domainToCSV.useMutation();
  const fetchAndAnalyzeMutation = trpc.aiAnalysis.fetchAndAnalyzeDomain.useMutation();

  // 分析結果からUIデータを生成
  const domainData = useMemo(() => {
    if (!domainAnalysisResult) return null;
    
    const analysis = domainAnalysisResult;
    return {
      domain: searchUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      domainRating: analysis.domainOverview.estimatedDR,
      organicTraffic: analysis.domainOverview.estimatedTraffic,
      backlinks: analysis.backlinks.estimatedTotal,
      referringDomains: analysis.backlinks.estimatedReferringDomains,
      aiReadabilityScore: analysis.aiReadability.overallScore,
      semanticHtmlScore: analysis.aiReadability.semanticHTML,
      schemaOrgScore: analysis.aiReadability.schemaOrg,
      contentClarityScore: analysis.aiReadability.contentClarity,
      topBacklinks: analysis.backlinks.topSources.map((source, i) => ({
        id: `bl-${i}`,
        sourceDomain: source.domain,
        targetUrl: '/',
        anchorText: source.context,
        domainRating: source.dr,
        doFollow: source.type === 'DoFollow',
        firstSeen: '2024-01-01',
        lastSeen: '2024-12-24',
      })),
      competitorOverlap: analysis.competitors.map(comp => ({
        competitor: comp.domain,
        sharedKeywords: Math.floor(comp.overlapScore * 50),
        uniqueKeywords: Math.floor(comp.overlapScore * 150),
        gap: Math.floor(comp.overlapScore * 100),
      })),
      strongKeywords: analysis.strengthKeywords.map(kw => ({
        keyword: kw.keyword,
        volume: kw.searchVolume,
        rank: kw.estimatedRank,
        aiVisibility: kw.aiVisibility,
      })),
      mainTopics: analysis.domainOverview.mainTopics,
      targetAudience: analysis.domainOverview.targetAudience,
      siteType: analysis.domainOverview.siteType,
      improvements: analysis.improvements,
    };
  }, [domainAnalysisResult, searchUrl]);

  const aiReadabilityData = domainData ? [
    { subject: "セマンティックHTML", A: domainData.semanticHtmlScore, fullMark: 100 },
    { subject: "Schema.org", A: domainData.schemaOrgScore, fullMark: 100 },
    { subject: "コンテンツ明瞭性", A: domainData.contentClarityScore, fullMark: 100 },
    { subject: "AI可読性", A: domainData.aiReadabilityScore, fullMark: 100 },
  ] : [];

  const competitorData = domainData ? domainData.competitorOverlap.map((comp) => ({
    name: comp.competitor.replace(".com", "").replace(".jp", "").replace(".co", "").substring(0, 15),
    shared: comp.sharedKeywords,
    gap: comp.gap,
  })) : [];

  const handleSearch = async () => {
    if (!searchUrl.trim()) {
      toast.error("ドメインを入力してください");
      return;
    }

    setIsLoadingData(true);
    setDomainAnalysisResult(null);
    setLlmCitations(null);
    setAiAnalysis(null);
    
    try {
      // AI分析APIを呼び出し
      const result = await fetchAndAnalyzeMutation.mutateAsync({
        domain: searchUrl.trim().replace(/^https?:\/\//, '').replace(/\/$/, ''),
      });

      if (result.success && result.analysis) {
        setDomainAnalysisResult(result.analysis as DomainAnalysisResult);
        if (result.citations) {
          setLlmCitations(result.citations as LLMCitationResult);
        }
        toast.success("AI分析が完了しました");
      } else {
        toast.error(result.error || "分析に失敗しました");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("分析中にエラーが発生しました");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAnalyze = async () => {
    if (!domainData) {
      toast.error("まずドメインを検索してください");
      return;
    }

    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      const result = await analyzeDomainMutation.mutateAsync({
        domain: domainData.domain,
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
    if (!domainData) {
      toast.error("まずドメインを検索してください");
      return;
    }

    try {
      const result = await exportCSVMutation.mutateAsync({
        domain: domainData.domain,
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
              placeholder="分析するドメインを入力（例: example.com）..."
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-white/5 border-border/50 font-mono"
            />
          </div>
          <Button 
            className="gap-2 bg-[#22d3ee] hover:bg-[#22d3ee]/80 text-black"
            onClick={handleSearch}
            disabled={isLoadingData}
          >
            {isLoadingData ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            AI分析
          </Button>
          {domainData && (
            <>
              <Button
                variant="outline"
                className="gap-2 border-[#8b5cf6]/50 text-[#8b5cf6] hover:bg-[#8b5cf6]/10"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                AI改善提案
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-border/50"
                onClick={handleExportCSV}
              >
                <Download className="w-4 h-4" />
                CSV
              </Button>
            </>
          )}
        </motion.div>

        {/* AI Analysis Panel */}
        <AnimatePresence>
          {(isAnalyzing || aiAnalysis) && (
            <AIAnalysisPanel
              analysis={aiAnalysis}
              isLoading={isAnalyzing}
              onClose={() => setAiAnalysis(null)}
            />
          )}
        </AnimatePresence>

        {/* No Data State */}
        {!domainData && !isLoadingData && (
          <motion.div
            variants={itemVariants}
            className="rounded-xl p-12 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
            }}
          >
            <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-display font-bold text-foreground mb-2">
              ドメインを入力して分析を開始
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              分析したいドメイン（例: example.com）を入力して「AI分析」ボタンをクリックしてください。
              AIがサイトを分析し、強みキーワード、競合、被リンクプロファイルなどを推定します。
            </p>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoadingData && (
          <motion.div
            variants={itemVariants}
            className="rounded-xl p-12 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)",
              border: "1px solid rgba(34, 211, 238, 0.2)",
            }}
          >
            <Loader2 className="w-16 h-16 text-[#22d3ee] mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-display font-bold text-foreground mb-2">
              AIがドメインを分析中...
            </h3>
            <p className="text-muted-foreground">
              サイトコンテンツを取得し、SEO/LLMO指標を分析しています。
              <br />
              <span className="text-xs">（通常10〜30秒かかります）</span>
            </p>
          </motion.div>
        )}

        {/* Domain Data Display */}
        {domainData && !isLoadingData && (
          <>
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
                  <Globe className="w-4 h-4 text-[#8b5cf6]" />
                  <span className="text-xs text-muted-foreground font-mono">ドメインレーティング</span>
                </div>
                <p className="text-3xl font-display font-bold text-[#8b5cf6]">
                  {domainData.domainRating}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">推定値 / 100</p>
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
                  <TrendingUp className="w-4 h-4 text-[#22d3ee]" />
                  <span className="text-xs text-muted-foreground font-mono">月間トラフィック</span>
                </div>
                <p className="text-3xl font-display font-bold text-[#22d3ee]">
                  {(domainData.organicTraffic / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">推定オーガニック</p>
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
                <p className="text-xs text-muted-foreground mt-1 font-mono">推定総数</p>
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

            {/* Site Info */}
            {domainData.mainTopics && (
              <motion.div
                variants={itemVariants}
                className="rounded-xl p-6"
                style={{
                  background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-[#8b5cf6]" />
                  <h2 className="text-lg font-display font-bold text-foreground">AI分析サマリー</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-white/5">
                    <h4 className="text-xs text-muted-foreground font-mono mb-2">サイトタイプ</h4>
                    <p className="text-sm text-foreground">{domainData.siteType}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5">
                    <h4 className="text-xs text-muted-foreground font-mono mb-2">ターゲット層</h4>
                    <p className="text-sm text-foreground">{domainData.targetAudience}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5">
                    <h4 className="text-xs text-muted-foreground font-mono mb-2">主要トピック</h4>
                    <div className="flex flex-wrap gap-1">
                      {domainData.mainTopics.map((topic, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-[#8b5cf6]/20 text-[#8b5cf6]">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* LLM Citation Status */}
            {llmCitations && (
              <motion.div
                variants={itemVariants}
                className="rounded-xl p-6"
                style={{
                  background: "linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)",
                  border: "1px solid rgba(34, 211, 238, 0.2)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-[#22d3ee]" />
                  <h2 className="text-lg font-display font-bold text-foreground">LLM引用状況</h2>
                  <span className="text-xs text-muted-foreground font-mono ml-auto">
                    総合スコア: {llmCitations.overallVisibility}%
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(llmCitations.platforms).map(([platform, data]) => (
                    <div key={platform} className="p-4 rounded-lg bg-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-foreground capitalize">{platform}</h4>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded font-mono",
                          data.score >= 70 ? "bg-[#22c55e]/20 text-[#22c55e]" :
                          data.score >= 50 ? "bg-[#f59e0b]/20 text-[#f59e0b]" :
                          "bg-[#ef4444]/20 text-[#ef4444]"
                        )}>
                          {data.score}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        センチメント: {data.sentiment === 'positive' ? '肯定的' : data.sentiment === 'negative' ? '否定的' : '中立'}
                      </p>
                      {data.mentions.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {data.mentions.slice(0, 2).map((mention, i) => (
                            <p key={i} className="truncate">• {mention}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Strong Keywords Section */}
            <motion.div
              variants={itemVariants}
              className="rounded-xl p-6"
              style={{
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)",
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#8b5cf6]" />
                  <h2 className="text-lg font-display font-bold text-foreground">強みキーワード（AI推定）</h2>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  このドメインが上位表示できそうなキーワード
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 text-xs font-mono text-muted-foreground">キーワード</th>
                      <th className="text-center py-3 text-xs font-mono text-muted-foreground">推定検索ボリューム</th>
                      <th className="text-center py-3 text-xs font-mono text-muted-foreground">推定順位</th>
                      <th className="text-center py-3 text-xs font-mono text-muted-foreground">AI可視性</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domainData.strongKeywords.map((kw, index) => (
                      <tr key={index} className="border-b border-border/30 hover:bg-white/5 transition-colors">
                        <td className="py-3">
                          <span className="text-sm font-medium text-foreground">{kw.keyword}</span>
                        </td>
                        <td className="py-3 text-center">
                          <span className="text-sm font-mono text-muted-foreground">
                            {kw.volume.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={cn(
                            "text-sm font-mono px-2 py-0.5 rounded",
                            kw.rank <= 3 ? "bg-[#22c55e]/20 text-[#22c55e]" :
                            kw.rank <= 10 ? "bg-[#22d3ee]/20 text-[#22d3ee]" :
                            "bg-[#f59e0b]/20 text-[#f59e0b]"
                          )}>
                            #{kw.rank}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={cn(
                            "text-sm font-mono px-2 py-0.5 rounded",
                            kw.aiVisibility >= 80 ? "bg-[#22c55e]/20 text-[#22c55e]" :
                            kw.aiVisibility >= 60 ? "bg-[#22d3ee]/20 text-[#22d3ee]" :
                            "bg-[#f59e0b]/20 text-[#f59e0b]"
                          )}>
                            {kw.aiVisibility}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* AI Readability & Backlinks Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Readability Audit */}
              <motion.div
                variants={itemVariants}
                className="rounded-xl p-6"
                style={{
                  background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-[#8b5cf6]" />
                  <h2 className="text-lg font-display font-bold text-foreground">AI可読性監査</h2>
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
                className="rounded-xl p-6"
                style={{
                  background: "linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)",
                  border: "1px solid rgba(34, 211, 238, 0.2)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-[#22d3ee]" />
                    <h2 className="text-lg font-display font-bold text-foreground">推定被リンク元</h2>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    AI推定
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-3 text-xs font-mono text-muted-foreground">参照元ドメイン</th>
                        <th className="text-center py-3 text-xs font-mono text-muted-foreground">DR</th>
                        <th className="text-center py-3 text-xs font-mono text-muted-foreground">タイプ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domainData.topBacklinks.slice(0, 8).map((link) => (
                        <tr
                          key={link.id}
                          className="border-b border-border/30 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground">
                                {link.sourceDomain}
                              </span>
                              <ExternalLink className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <span className="text-sm font-mono text-[#22d3ee]">
                              {link.domainRating}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            {link.doFollow ? (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-[#22c55e]/20 text-[#22c55e]">
                                <CheckCircle className="w-3 h-3" />
                                DoFollow
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-[#ef4444]/20 text-[#ef4444]">
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
                background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)",
                border: "1px solid rgba(236, 72, 153, 0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#ec4899]" />
                <h2 className="text-lg font-display font-bold text-foreground">競合分析（AI推定）</h2>
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
                          background: "rgba(0,0,0,0.8)",
                          border: "1px solid rgba(236, 72, 153, 0.3)",
                          borderRadius: "8px",
                          fontFamily: "JetBrains Mono",
                        }}
                      />
                      <Bar dataKey="shared" name="共有キーワード" fill="#ec4899" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="gap" name="ギャップ" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
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
                            <span className="text-[#ec4899] font-mono">
                              {comp.sharedKeywords.toLocaleString()}
                            </span>
                          </div>
                          <Progress
                            value={(comp.sharedKeywords / comp.uniqueKeywords) * 100}
                            className="h-1"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">ギャップ</span>
                            <span className="text-[#8b5cf6] font-mono">
                              {comp.gap.toLocaleString()}
                            </span>
                          </div>
                          <Progress
                            value={(comp.gap / comp.uniqueKeywords) * 100}
                            className="h-1 [&>div]:bg-[#8b5cf6]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Improvement Suggestions */}
            {domainData.improvements && domainData.improvements.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="rounded-xl p-6"
                style={{
                  background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-[#22c55e]" />
                  <h2 className="text-lg font-display font-bold text-foreground">AI改善提案</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {domainData.improvements.slice(0, 6).map((improvement, index) => (
                    <div key={index} className="p-4 rounded-lg bg-white/5 border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded font-mono",
                          improvement.priority === "高" ? "bg-[#ef4444]/20 text-[#ef4444]" :
                          improvement.priority === "中" ? "bg-[#f59e0b]/20 text-[#f59e0b]" :
                          "bg-[#22c55e]/20 text-[#22c55e]"
                        )}>
                          {improvement.priority}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">{improvement.category}</span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground mb-1">{improvement.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{improvement.description}</p>
                      <p className="text-xs text-[#22c55e]">期待効果: {improvement.expectedImpact}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
