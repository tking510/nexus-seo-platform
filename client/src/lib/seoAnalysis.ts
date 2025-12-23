/*
 * SEO & LLMO Analysis Core Logic
 * 
 * This module contains the core analysis algorithms for:
 * - Keyword difficulty calculation
 * - AI readability scoring
 * - Backlink quality assessment
 * - Competitor gap analysis
 */

// ============================================
// Types & Interfaces
// ============================================

export interface KeywordMetrics {
  keyword: string;
  searchVolume: number;
  keywordDifficulty: number;
  cpc: number;
  intent: "informational" | "navigational" | "commercial" | "transactional";
  serpFeatures: string[];
  aiVisibility: {
    chatgpt: number;
    perplexity: number;
    gemini: number;
  };
}

export interface DomainMetrics {
  domain: string;
  domainRating: number;
  organicTraffic: number;
  backlinks: number;
  referringDomains: number;
  aiReadabilityScore: number;
}

export interface BacklinkData {
  sourceDomain: string;
  targetUrl: string;
  domainRating: number;
  doFollow: boolean;
  anchorText: string;
  firstSeen: string;
}

export interface AIReadabilityAudit {
  semanticHtmlScore: number;
  schemaOrgScore: number;
  contentClarityScore: number;
  overallScore: number;
  recommendations: string[];
}

export interface CompetitorGap {
  competitor: string;
  sharedKeywords: number;
  uniqueKeywords: number;
  gap: number;
  opportunities: string[];
}

// ============================================
// Keyword Analysis Functions
// ============================================

/**
 * Calculate keyword difficulty based on various factors
 * This simulates how SEO tools like Ahrefs/SEMrush calculate KD
 */
export function calculateKeywordDifficulty(
  searchVolume: number,
  competitorDomainRatings: number[],
  serpFeatures: string[]
): number {
  // Base difficulty from competitor strength
  const avgCompetitorDR = competitorDomainRatings.length > 0
    ? competitorDomainRatings.reduce((a, b) => a + b, 0) / competitorDomainRatings.length
    : 50;

  // Volume factor (higher volume = more competition)
  const volumeFactor = Math.min(searchVolume / 100000, 1) * 20;

  // SERP features factor (more features = harder to rank)
  const serpFactor = serpFeatures.length * 3;

  // Calculate final KD (0-100 scale)
  const kd = Math.min(100, Math.max(0, avgCompetitorDR * 0.6 + volumeFactor + serpFactor));

  return Math.round(kd);
}

/**
 * Determine search intent from keyword
 */
export function analyzeSearchIntent(
  keyword: string
): "informational" | "navigational" | "commercial" | "transactional" {
  const lowerKeyword = keyword.toLowerCase();

  // Transactional indicators
  const transactionalTerms = ["buy", "purchase", "order", "discount", "deal", "coupon", "price"];
  if (transactionalTerms.some(term => lowerKeyword.includes(term))) {
    return "transactional";
  }

  // Commercial indicators
  const commercialTerms = ["best", "top", "review", "compare", "vs", "alternative"];
  if (commercialTerms.some(term => lowerKeyword.includes(term))) {
    return "commercial";
  }

  // Navigational indicators
  const navigationalTerms = ["login", "sign in", "official", "website"];
  if (navigationalTerms.some(term => lowerKeyword.includes(term))) {
    return "navigational";
  }

  // Default to informational
  return "informational";
}

/**
 * Calculate AI visibility score based on citation frequency
 */
export function calculateAIVisibility(
  citationCount: number,
  totalQueries: number,
  sentimentScore: number // -1 to 1
): number {
  if (totalQueries === 0) return 0;

  const citationRate = citationCount / totalQueries;
  const sentimentBonus = (sentimentScore + 1) / 2 * 20; // 0-20 bonus

  const visibility = Math.min(100, citationRate * 100 + sentimentBonus);
  return Math.round(visibility);
}

// ============================================
// Domain Analysis Functions
// ============================================

/**
 * Calculate Domain Rating (DR) simulation
 * Based on backlink profile strength
 */
export function calculateDomainRating(
  backlinks: BacklinkData[],
  referringDomains: number
): number {
  if (backlinks.length === 0) return 0;

  // Calculate average backlink quality
  const avgBacklinkDR = backlinks.reduce((sum, bl) => sum + bl.domainRating, 0) / backlinks.length;

  // DoFollow ratio bonus
  const doFollowRatio = backlinks.filter(bl => bl.doFollow).length / backlinks.length;
  const doFollowBonus = doFollowRatio * 15;

  // Referring domains factor (logarithmic scale)
  const domainFactor = Math.log10(referringDomains + 1) * 10;

  // Calculate final DR (0-100 scale)
  const dr = Math.min(100, avgBacklinkDR * 0.5 + doFollowBonus + domainFactor);

  return Math.round(dr);
}

/**
 * Analyze backlink quality
 */
export function analyzeBacklinkQuality(backlink: BacklinkData): {
  quality: "high" | "medium" | "low";
  score: number;
  factors: string[];
} {
  const factors: string[] = [];
  let score = 0;

  // Domain Rating factor
  if (backlink.domainRating >= 80) {
    score += 40;
    factors.push("High authority source");
  } else if (backlink.domainRating >= 50) {
    score += 25;
    factors.push("Medium authority source");
  } else {
    score += 10;
    factors.push("Low authority source");
  }

  // DoFollow factor
  if (backlink.doFollow) {
    score += 30;
    factors.push("DoFollow link");
  } else {
    score += 10;
    factors.push("NoFollow link");
  }

  // Anchor text relevance (simplified)
  if (backlink.anchorText && backlink.anchorText.length > 0) {
    score += 20;
    factors.push("Has anchor text");
  }

  // Age factor (older = better)
  const linkAge = Date.now() - new Date(backlink.firstSeen).getTime();
  const ageInMonths = linkAge / (1000 * 60 * 60 * 24 * 30);
  if (ageInMonths > 12) {
    score += 10;
    factors.push("Established link (>1 year)");
  }

  const quality = score >= 70 ? "high" : score >= 40 ? "medium" : "low";

  return { quality, score, factors };
}

// ============================================
// AI Readability Analysis
// ============================================

/**
 * Analyze page structure for AI readability
 * Simulates how LLM crawlers interpret content
 */
export function analyzeAIReadability(htmlContent: string): AIReadabilityAudit {
  const recommendations: string[] = [];

  // Semantic HTML Score
  let semanticScore = 50;
  const semanticElements = ["header", "nav", "main", "article", "section", "aside", "footer"];
  semanticElements.forEach(el => {
    if (htmlContent.includes(`<${el}`)) {
      semanticScore += 7;
    } else {
      recommendations.push(`Add <${el}> element for better structure`);
    }
  });
  semanticScore = Math.min(100, semanticScore);

  // Schema.org Score
  let schemaScore = 0;
  if (htmlContent.includes("application/ld+json")) {
    schemaScore += 50;
  } else {
    recommendations.push("Add JSON-LD structured data");
  }
  if (htmlContent.includes("itemtype")) {
    schemaScore += 30;
  }
  if (htmlContent.includes("itemprop")) {
    schemaScore += 20;
  }
  if (schemaScore === 0) {
    recommendations.push("Implement Schema.org markup");
  }

  // Content Clarity Score
  let clarityScore = 60;
  
  // Check for headings hierarchy
  if (htmlContent.includes("<h1") && htmlContent.includes("<h2")) {
    clarityScore += 15;
  } else {
    recommendations.push("Use proper heading hierarchy (H1, H2, H3)");
  }

  // Check for lists
  if (htmlContent.includes("<ul") || htmlContent.includes("<ol")) {
    clarityScore += 10;
  } else {
    recommendations.push("Use lists to organize information");
  }

  // Check for alt text
  if (htmlContent.includes('alt="')) {
    clarityScore += 15;
  } else {
    recommendations.push("Add alt text to all images");
  }

  clarityScore = Math.min(100, clarityScore);

  // Overall Score (weighted average)
  const overallScore = Math.round(
    semanticScore * 0.3 + schemaScore * 0.35 + clarityScore * 0.35
  );

  return {
    semanticHtmlScore: semanticScore,
    schemaOrgScore: schemaScore,
    contentClarityScore: clarityScore,
    overallScore,
    recommendations: recommendations.slice(0, 5), // Top 5 recommendations
  };
}

// ============================================
// Competitor Analysis Functions
// ============================================

/**
 * Analyze keyword gap between domains
 */
export function analyzeCompetitorGap(
  yourKeywords: string[],
  competitorKeywords: string[]
): CompetitorGap {
  const yourSet = new Set(yourKeywords.map(k => k.toLowerCase()));
  const competitorSet = new Set(competitorKeywords.map(k => k.toLowerCase()));

  const shared: string[] = [];
  const gap: string[] = [];

  competitorSet.forEach(keyword => {
    if (yourSet.has(keyword)) {
      shared.push(keyword);
    } else {
      gap.push(keyword);
    }
  });

  // Identify top opportunities (simplified)
  const opportunities = gap.slice(0, 10);

  return {
    competitor: "",
    sharedKeywords: shared.length,
    uniqueKeywords: competitorSet.size,
    gap: gap.length,
    opportunities,
  };
}

/**
 * Calculate share of model (SoM) for AI visibility
 */
export function calculateShareOfModel(
  yourCitations: number,
  totalCitationsInCategory: number
): number {
  if (totalCitationsInCategory === 0) return 0;
  return Math.round((yourCitations / totalCitationsInCategory) * 100);
}

// ============================================
// Trend Analysis Functions
// ============================================

/**
 * Calculate trend direction and magnitude
 */
export function analyzeTrend(
  dataPoints: number[]
): { direction: "up" | "down" | "stable"; magnitude: number; forecast: number[] } {
  if (dataPoints.length < 2) {
    return { direction: "stable", magnitude: 0, forecast: [] };
  }

  // Calculate simple moving average trend
  const recentAvg = dataPoints.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const olderAvg = dataPoints.slice(0, 3).reduce((a, b) => a + b, 0) / 3;

  const change = ((recentAvg - olderAvg) / olderAvg) * 100;

  let direction: "up" | "down" | "stable";
  if (change > 5) {
    direction = "up";
  } else if (change < -5) {
    direction = "down";
  } else {
    direction = "stable";
  }

  // Simple linear forecast (next 3 periods)
  const slope = (dataPoints[dataPoints.length - 1] - dataPoints[0]) / (dataPoints.length - 1);
  const lastValue = dataPoints[dataPoints.length - 1];
  const forecast = [
    Math.max(0, Math.round(lastValue + slope)),
    Math.max(0, Math.round(lastValue + slope * 2)),
    Math.max(0, Math.round(lastValue + slope * 3)),
  ];

  return { direction, magnitude: Math.abs(change), forecast };
}

// ============================================
// Alert Generation Functions
// ============================================

export interface Alert {
  id: string;
  type: "ranking_improved" | "ranking_dropped" | "new_citation" | "new_backlink" | "lost_backlink";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

/**
 * Generate alerts based on ranking changes
 */
export function generateRankingAlert(
  keyword: string,
  previousRank: number,
  currentRank: number
): Alert | null {
  const change = previousRank - currentRank; // Positive = improvement

  if (Math.abs(change) < 2) return null; // Ignore minor fluctuations

  const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  if (change > 0) {
    return {
      id,
      type: "ranking_improved",
      severity: change >= 5 ? "info" : "info",
      title: "Ranking Improved",
      message: `"${keyword}" moved from #${previousRank} to #${currentRank} on Google`,
      timestamp: new Date(),
      data: { keyword, previousRank, currentRank, change },
    };
  } else {
    return {
      id,
      type: "ranking_dropped",
      severity: Math.abs(change) >= 5 ? "warning" : "info",
      title: "Ranking Drop",
      message: `"${keyword}" dropped from #${previousRank} to #${currentRank}`,
      timestamp: new Date(),
      data: { keyword, previousRank, currentRank, change },
    };
  }
}

/**
 * Generate alert for new AI citation
 */
export function generateCitationAlert(
  keyword: string,
  platform: "chatgpt" | "perplexity" | "gemini"
): Alert {
  const platformNames = {
    chatgpt: "ChatGPT",
    perplexity: "Perplexity",
    gemini: "Gemini",
  };

  return {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: "new_citation",
    severity: "info",
    title: "New AI Citation",
    message: `Your content was cited by ${platformNames[platform]} for "${keyword}"`,
    timestamp: new Date(),
    data: { keyword, platform },
  };
}

// ============================================
// Export Summary
// ============================================

export const SEOAnalysis = {
  // Keyword functions
  calculateKeywordDifficulty,
  analyzeSearchIntent,
  calculateAIVisibility,

  // Domain functions
  calculateDomainRating,
  analyzeBacklinkQuality,

  // AI Readability
  analyzeAIReadability,

  // Competitor Analysis
  analyzeCompetitorGap,
  calculateShareOfModel,

  // Trends
  analyzeTrend,

  // Alerts
  generateRankingAlert,
  generateCitationAlert,
};

export default SEOAnalysis;
