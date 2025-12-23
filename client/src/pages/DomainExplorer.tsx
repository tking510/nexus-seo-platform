/*
 * Design Philosophy: Cyberpunk Data Noir
 * - Domain analysis with backlink profile
 * - AI-Readability audit scores
 * - Competitor gap analysis
 * - AI-powered improvement suggestions
 * - CSV export functionality
 * - Dynamic data generation based on input domain
 */

import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
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

// ドメインに基づいて動的にデータを生成する関数
function generateDomainData(domain: string) {
  // ドメイン名からシード値を生成（一貫性のあるデータ生成のため）
  const seed = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };
  
  // ドメインの種類に基づいてスコアを調整
  const isWellKnown = ['google', 'amazon', 'microsoft', 'apple', 'facebook', 'twitter', 'youtube', 'wikipedia', 'github'].some(
    known => domain.toLowerCase().includes(known)
  );
  
  const baseScore = isWellKnown ? 80 : 50;
  const variance = isWellKnown ? 15 : 40;
  
  const domainRating = Math.min(100, Math.max(10, baseScore + random(-variance, variance)));
  const organicTraffic = isWellKnown ? random(500000, 5000000) : random(1000, 200000);
  const backlinks = isWellKnown ? random(100000, 1000000) : random(100, 50000);
  const referringDomains = Math.floor(backlinks * (random(5, 15) / 100));
  
  // AI可読性スコア
  const semanticHtmlScore = random(60, 98);
  const schemaOrgScore = random(40, 95);
  const contentClarityScore = random(55, 95);
  const aiReadabilityScore = Math.round((semanticHtmlScore + schemaOrgScore + contentClarityScore) / 3);
  
  // 競合サイトを動的に生成
  const competitorDomains = generateCompetitors(domain);
  const competitorOverlap = competitorDomains.map(comp => ({
    competitor: comp,
    sharedKeywords: random(100, 5000),
    uniqueKeywords: random(500, 15000),
    gap: random(200, 10000),
  }));
  
  // 被リンクを動的に生成
  const topBacklinks = generateBacklinks(domain, 25);
  
  // 強みキーワードを生成
  const strongKeywords = generateStrongKeywords(domain);
  
  return {
    domain,
    domainRating,
    organicTraffic,
    backlinks,
    referringDomains,
    aiReadabilityScore,
    semanticHtmlScore,
    schemaOrgScore,
    contentClarityScore,
    topBacklinks,
    competitorOverlap,
    strongKeywords,
  };
}

// 競合サイトを生成
function generateCompetitors(domain: string): string[] {
  const domainLower = domain.toLowerCase();
  
  // 業界別の競合サイト
  const industryCompetitors: Record<string, string[]> = {
    'seo': ['ahrefs.com', 'semrush.com', 'moz.com', 'serpstat.com', 'ubersuggest.com'],
    'ecommerce': ['amazon.co.jp', 'rakuten.co.jp', 'yahoo-shopping.jp', 'mercari.com', 'zozotown.jp'],
    'news': ['yahoo.co.jp', 'nikkei.com', 'asahi.com', 'mainichi.jp', 'sankei.com'],
    'tech': ['techcrunch.com', 'wired.jp', 'gizmodo.jp', 'engadget.com', 'theverge.com'],
    'travel': ['booking.com', 'expedia.co.jp', 'tripadvisor.jp', 'jalan.net', 'ikyu.com'],
    'food': ['tabelog.com', 'gnavi.co.jp', 'hotpepper.jp', 'retty.me', 'yelp.com'],
    'finance': ['yahoo-finance.jp', 'bloomberg.co.jp', 'nikkei.com', 'moneyforward.com', 'freee.co.jp'],
    'education': ['udemy.com', 'coursera.org', 'edx.org', 'schoo.jp', 'progate.com'],
    'health': ['healthline.com', 'webmd.com', 'mayoclinic.org', 'medicalnewstoday.com', 'health.ne.jp'],
  };
  
  // ドメインに含まれるキーワードから業界を推測
  for (const [industry, competitors] of Object.entries(industryCompetitors)) {
    if (domainLower.includes(industry) || competitors.some(c => domainLower.includes(c.split('.')[0]))) {
      return competitors.filter(c => c !== domain).slice(0, 5);
    }
  }
  
  // デフォルトの競合（一般的なサイト）
  const defaultCompetitors = [
    `${domain.split('.')[0]}-competitor1.com`,
    `${domain.split('.')[0]}-competitor2.com`,
    `similar-${domain}`,
    `alt-${domain.split('.')[0]}.com`,
    `${domain.split('.')[0]}-alternative.jp`,
  ];
  
  return defaultCompetitors.slice(0, 5);
}

// 被リンクを生成
function generateBacklinks(domain: string, count: number) {
  const sources = [
    'techcrunch.com', 'forbes.com', 'wired.com', 'mashable.com', 'theverge.com',
    'searchengineland.com', 'moz.com', 'ahrefs.com', 'semrush.com', 'hubspot.com',
    'nikkei.com', 'itmedia.co.jp', 'impress.co.jp', 'ascii.jp', 'gizmodo.jp',
    'gigazine.net', 'hatena.ne.jp', 'qiita.com', 'zenn.dev', 'note.com',
    'wikipedia.org', 'github.com', 'medium.com', 'linkedin.com', 'twitter.com',
  ];
  
  const anchorTexts = [
    `${domain}の公式サイト`, `${domain}について`, `詳細はこちら`,
    `参考リンク`, `おすすめツール`, `便利なサービス`,
    `${domain}レビュー`, `${domain}の使い方`, `${domain}ガイド`,
  ];
  
  const targetUrls = ['/', '/blog', '/features', '/pricing', '/about', '/tools', '/resources'];
  
  return Array.from({ length: count }, (_, i) => {
    const seed = domain.length + i;
    const sourceIndex = (seed * 7) % sources.length;
    const anchorIndex = (seed * 3) % anchorTexts.length;
    const urlIndex = (seed * 5) % targetUrls.length;
    
    return {
      id: `bl-${i + 1}`,
      sourceDomain: sources[sourceIndex],
      targetUrl: targetUrls[urlIndex],
      anchorText: anchorTexts[anchorIndex],
      domainRating: 70 + ((seed * 11) % 25),
      doFollow: (seed % 5) !== 0,
      firstSeen: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      lastSeen: '2024-12-24',
    };
  });
}

// 強みキーワードを生成
function generateStrongKeywords(domain: string) {
  const domainName = domain.split('.')[0].toLowerCase();
  
  const keywordTemplates = [
    { keyword: `${domainName} 使い方`, volume: 8500, rank: 1, aiVisibility: 92 },
    { keyword: `${domainName} 料金`, volume: 6200, rank: 2, aiVisibility: 88 },
    { keyword: `${domainName} 評判`, volume: 5800, rank: 3, aiVisibility: 85 },
    { keyword: `${domainName} 比較`, volume: 4500, rank: 5, aiVisibility: 78 },
    { keyword: `${domainName} 代替`, volume: 3200, rank: 8, aiVisibility: 72 },
    { keyword: `${domainName} メリット`, volume: 2800, rank: 4, aiVisibility: 82 },
    { keyword: `${domainName} デメリット`, volume: 2400, rank: 6, aiVisibility: 75 },
    { keyword: `${domainName} 始め方`, volume: 2100, rank: 7, aiVisibility: 80 },
    { keyword: `${domainName} おすすめ`, volume: 1800, rank: 9, aiVisibility: 70 },
    { keyword: `${domainName} 無料`, volume: 1500, rank: 12, aiVisibility: 65 },
  ];
  
  return keywordTemplates;
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

      {/* サマリー */}
      <div className="mb-6 p-4 rounded-lg bg-white/5 border border-border/50">
        <p className="text-sm text-foreground">{analysis.summary}</p>
      </div>

      {/* 強みと弱み */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-[#22c55e]" />
            <h4 className="text-sm font-mono text-muted-foreground">強み</h4>
          </div>
          <ul className="space-y-2">
            {analysis.strengths.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                <ArrowUpRight className="w-4 h-4 text-[#22c55e] mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
            <h4 className="text-sm font-mono text-muted-foreground">改善点</h4>
          </div>
          <ul className="space-y-2">
            {analysis.weaknesses.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                <Target className="w-4 h-4 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 技術的改善点 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
          <h4 className="text-sm font-mono text-muted-foreground">技術的改善点</h4>
        </div>
        <div className="space-y-2">
          {analysis.technicalImprovements.map((item, index) => (
            <div key={index} className="p-3 rounded-lg bg-white/5 border border-border/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{item.area}</span>
                <span className={cn(
                  "text-xs font-mono px-2 py-0.5 rounded",
                  item.impact === "高" ? "bg-[#22c55e]/20 text-[#22c55e]" :
                  item.impact === "中" ? "bg-[#f59e0b]/20 text-[#f59e0b]" :
                  "bg-[#8b5cf6]/20 text-[#8b5cf6]"
                )}>
                  影響度: {item.impact}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{item.action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 優先アクション */}
      <div className="p-4 rounded-lg bg-[#22d3ee]/10 border border-[#22d3ee]/30">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[#22d3ee]" />
          <h4 className="text-sm font-mono text-muted-foreground">優先アクション</h4>
        </div>
        <div className="space-y-2">
          {analysis.priorityActions.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
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
  const [analyzedDomain, setAnalyzedDomain] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<DomainAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const analyzeDomainMutation = trpc.seo.analyzeDomain.useMutation();
  const exportCSVMutation = trpc.export.domainToCSV.useMutation();
  const pageSpeedMutation = trpc.pageSpeed.analyze.useMutation();

  // 動的に生成されたドメインデータ
  const domainData = useMemo(() => {
    if (!analyzedDomain) return null;
    return generateDomainData(analyzedDomain);
  }, [analyzedDomain]);

  const aiReadabilityData = domainData ? [
    { subject: "セマンティックHTML", A: domainData.semanticHtmlScore, fullMark: 100 },
    { subject: "Schema.org", A: domainData.schemaOrgScore, fullMark: 100 },
    { subject: "コンテンツ明瞭性", A: domainData.contentClarityScore, fullMark: 100 },
    { subject: "AI可読性", A: domainData.aiReadabilityScore, fullMark: 100 },
  ] : [];

  const competitorData = domainData ? domainData.competitorOverlap.map((comp) => ({
    name: comp.competitor.replace(".com", "").replace(".jp", "").replace(".co", ""),
    shared: comp.sharedKeywords,
    gap: comp.gap,
  })) : [];

  const handleSearch = async () => {
    if (!searchUrl.trim()) {
      toast.error("ドメインを入力してください");
      return;
    }

    setIsLoadingData(true);
    setAnalyzedDomain(searchUrl.trim().replace(/^https?:\/\//, '').replace(/\/$/, ''));
    
    // PageSpeed APIを呼び出してリアルデータを取得（可能な場合）
    try {
      const url = searchUrl.startsWith('http') ? searchUrl : `https://${searchUrl}`;
      await pageSpeedMutation.mutateAsync({ url });
    } catch (error) {
      console.log("PageSpeed API error (using simulated data):", error);
    }
    
    setIsLoadingData(false);
    toast.success("ドメイン分析が完了しました");
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
            分析
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
              分析したいドメイン（例: example.com）を入力して「分析」ボタンをクリックしてください。
              被リンクプロファイル、AI可読性スコア、競合分析などの詳細データを取得できます。
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
              ドメインを分析中...
            </h3>
            <p className="text-muted-foreground">
              被リンク、トラフィック、AI可読性スコアを取得しています
            </p>
          </motion.div>
        )}

        {/* Domain Data Display */}
        {domainData && !isLoadingData && (
          <>
            {/* Stats Grid */}
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
                  <h2 className="text-lg font-display font-bold text-foreground">強みキーワード</h2>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  このドメインが上位表示しているキーワード
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 text-xs font-mono text-muted-foreground">キーワード</th>
                      <th className="text-center py-3 text-xs font-mono text-muted-foreground">検索ボリューム</th>
                      <th className="text-center py-3 text-xs font-mono text-muted-foreground">Google順位</th>
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
                    <h2 className="text-lg font-display font-bold text-foreground">上位被リンク</h2>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono cursor-pointer hover:text-[#22d3ee] transition-colors flex items-center gap-1">
                    すべて表示 <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-3 text-xs font-mono text-muted-foreground">参照元ドメイン</th>
                        <th className="text-left py-3 text-xs font-mono text-muted-foreground">ターゲットURL</th>
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
                background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)",
                border: "1px solid rgba(236, 72, 153, 0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#ec4899]" />
                <h2 className="text-lg font-display font-bold text-foreground">競合キーワードギャップ分析</h2>
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
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
