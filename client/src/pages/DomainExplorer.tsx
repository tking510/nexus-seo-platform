/*
 * Design Philosophy: Cyberpunk Data Noir
 * - Domain analysis with backlink profile
 * - AI-Readability audit scores
 * - Competitor gap analysis
 */

import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Globe,
  Link2,
  Search,
  Shield,
  FileCode,
  Brain,
  Eye,
  ExternalLink,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  BarChart3,
  Users,
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

export default function DomainExplorer() {
  const [searchUrl, setSearchUrl] = useState("example.com");

  const aiReadabilityData = [
    { subject: "Semantic HTML", A: domainData.semanticHtmlScore, fullMark: 100 },
    { subject: "Schema.org", A: domainData.schemaOrgScore, fullMark: 100 },
    { subject: "Content Clarity", A: domainData.contentClarityScore, fullMark: 100 },
    { subject: "AI Readability", A: domainData.aiReadabilityScore, fullMark: 100 },
  ];

  const competitorData = domainData.competitorOverlap.map((comp) => ({
    name: comp.competitor.replace(".com", ""),
    shared: comp.sharedKeywords,
    gap: comp.gap,
  }));

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
                Domain & URL Explorer
              </span>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Backlink Profile & <span className="text-[#22d3ee]">AI Audit</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Analyze backlink profiles, domain authority, and AI-readability scores.
              Understand how LLM crawlers interpret your content.
            </p>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter domain or URL to analyze..."
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
              className="pl-10 bg-white/5 border-border/50 font-mono"
            />
          </div>
          <Button className="gap-2 bg-[#22d3ee] hover:bg-[#22d3ee]/80 text-black">
            <Search className="w-4 h-4" />
            Analyze
          </Button>
        </motion.div>

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
              <span className="text-xs text-muted-foreground font-mono">Domain Rating</span>
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
              <span className="text-xs text-muted-foreground font-mono">Organic Traffic</span>
            </div>
            <p className="text-3xl font-display font-bold text-[#22d3ee]">
              {(domainData.organicTraffic / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">monthly visits</p>
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
              <span className="text-xs text-muted-foreground font-mono">Backlinks</span>
            </div>
            <p className="text-3xl font-display font-bold text-[#ec4899]">
              {(domainData.backlinks / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">total links</p>
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
              <span className="text-xs text-muted-foreground font-mono">Referring Domains</span>
            </div>
            <p className="text-3xl font-display font-bold text-[#22c55e]">
              {(domainData.referringDomains / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">unique domains</p>
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
                AI-Readability Audit
              </h3>
            </div>

            {/* Score Gauges */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <ScoreGauge
                score={domainData.semanticHtmlScore}
                label="Semantic HTML"
                color="#8b5cf6"
              />
              <ScoreGauge
                score={domainData.schemaOrgScore}
                label="Schema.org"
                color="#22d3ee"
              />
              <ScoreGauge
                score={domainData.contentClarityScore}
                label="Content Clarity"
                color="#ec4899"
              />
              <ScoreGauge
                score={domainData.aiReadabilityScore}
                label="AI Readability"
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
                    name="Score"
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
                  Top Backlinks
                </h3>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-[#22d3ee]">
                View All <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs text-muted-foreground font-mono uppercase tracking-wider py-3">
                      Source Domain
                    </th>
                    <th className="text-left text-xs text-muted-foreground font-mono uppercase tracking-wider py-3">
                      Target URL
                    </th>
                    <th className="text-center text-xs text-muted-foreground font-mono uppercase tracking-wider py-3">
                      DR
                    </th>
                    <th className="text-center text-xs text-muted-foreground font-mono uppercase tracking-wider py-3">
                      Type
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
              Competitor Keyword Gap
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
                  <Bar dataKey="shared" name="Shared Keywords" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="gap" name="Keyword Gap" fill="#ec4899" radius={[0, 4, 4, 0]} />
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
                      {comp.uniqueKeywords.toLocaleString()} total keywords
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Shared</span>
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
                        <span className="text-muted-foreground">Gap</span>
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
