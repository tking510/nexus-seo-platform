/*
 * Mock Data for Nexus SEO & LLMO Intelligence Platform
 * This file contains sample data for demonstrating the dashboard functionality
 */

// Keyword Intelligence Data
export interface KeywordData {
  id: string;
  keyword: string;
  searchVolume: number;
  keywordDifficulty: number;
  cpc: number;
  serpFeatures: string[];
  aiVisibility: {
    chatgpt: number;
    perplexity: number;
    gemini: number;
  };
  trend: number[];
  intent: "informational" | "transactional" | "navigational" | "commercial";
}

export const keywordData: KeywordData[] = [
  {
    id: "1",
    keyword: "best seo tools 2024",
    searchVolume: 12500,
    keywordDifficulty: 67,
    cpc: 4.52,
    serpFeatures: ["Featured Snippet", "People Also Ask", "Video"],
    aiVisibility: { chatgpt: 78, perplexity: 82, gemini: 71 },
    trend: [8500, 9200, 10100, 11000, 11800, 12500, 13200, 14100, 13800, 12900, 12500, 12800],
    intent: "commercial",
  },
  {
    id: "2",
    keyword: "how to improve website ranking",
    searchVolume: 8900,
    keywordDifficulty: 54,
    cpc: 3.21,
    serpFeatures: ["Featured Snippet", "People Also Ask"],
    aiVisibility: { chatgpt: 85, perplexity: 79, gemini: 88 },
    trend: [7200, 7800, 8100, 8400, 8600, 8900, 9100, 9400, 9200, 8800, 8900, 9000],
    intent: "informational",
  },
  {
    id: "3",
    keyword: "ai content optimization",
    searchVolume: 15200,
    keywordDifficulty: 72,
    cpc: 5.87,
    serpFeatures: ["Featured Snippet", "Knowledge Panel", "Video"],
    aiVisibility: { chatgpt: 92, perplexity: 95, gemini: 89 },
    trend: [5000, 6200, 7800, 9500, 11200, 13000, 14200, 15200, 16100, 15800, 15200, 15500],
    intent: "commercial",
  },
  {
    id: "4",
    keyword: "local seo strategies",
    searchVolume: 6700,
    keywordDifficulty: 48,
    cpc: 2.95,
    serpFeatures: ["Local Pack", "People Also Ask"],
    aiVisibility: { chatgpt: 72, perplexity: 68, gemini: 75 },
    trend: [6100, 6300, 6500, 6600, 6700, 6700, 6800, 6900, 6800, 6700, 6700, 6800],
    intent: "informational",
  },
  {
    id: "5",
    keyword: "buy backlinks safely",
    searchVolume: 4200,
    keywordDifficulty: 81,
    cpc: 8.45,
    serpFeatures: ["People Also Ask"],
    aiVisibility: { chatgpt: 15, perplexity: 12, gemini: 18 },
    trend: [3800, 3900, 4000, 4100, 4200, 4200, 4300, 4400, 4300, 4200, 4200, 4100],
    intent: "transactional",
  },
  {
    id: "6",
    keyword: "generative engine optimization",
    searchVolume: 22100,
    keywordDifficulty: 45,
    cpc: 6.12,
    serpFeatures: ["Featured Snippet", "Knowledge Panel", "Video", "People Also Ask"],
    aiVisibility: { chatgpt: 98, perplexity: 96, gemini: 94 },
    trend: [2000, 4500, 7800, 11200, 14500, 17800, 19500, 22100, 24500, 23800, 22100, 23200],
    intent: "informational",
  },
];

// Domain Explorer Data
export interface BacklinkData {
  id: string;
  sourceDomain: string;
  targetUrl: string;
  anchorText: string;
  domainRating: number;
  doFollow: boolean;
  firstSeen: string;
  lastSeen: string;
}

export interface DomainData {
  domain: string;
  domainRating: number;
  organicTraffic: number;
  backlinks: number;
  referringDomains: number;
  aiReadabilityScore: number;
  semanticHtmlScore: number;
  schemaOrgScore: number;
  contentClarityScore: number;
  topBacklinks: BacklinkData[];
  competitorOverlap: {
    competitor: string;
    sharedKeywords: number;
    uniqueKeywords: number;
    gap: number;
  }[];
}

export const domainData: DomainData = {
  domain: "example.com",
  domainRating: 72,
  organicTraffic: 125000,
  backlinks: 45200,
  referringDomains: 3420,
  aiReadabilityScore: 85,
  semanticHtmlScore: 92,
  schemaOrgScore: 78,
  contentClarityScore: 88,
  topBacklinks: [
    {
      id: "1",
      sourceDomain: "techcrunch.com",
      targetUrl: "/blog/ai-seo-guide",
      anchorText: "comprehensive AI SEO guide",
      domainRating: 94,
      doFollow: true,
      firstSeen: "2024-03-15",
      lastSeen: "2024-12-20",
    },
    {
      id: "2",
      sourceDomain: "searchengineland.com",
      targetUrl: "/tools/keyword-analyzer",
      anchorText: "keyword analysis tool",
      domainRating: 89,
      doFollow: true,
      firstSeen: "2024-05-22",
      lastSeen: "2024-12-18",
    },
    {
      id: "3",
      sourceDomain: "moz.com",
      targetUrl: "/",
      anchorText: "Nexus SEO Platform",
      domainRating: 91,
      doFollow: true,
      firstSeen: "2024-01-10",
      lastSeen: "2024-12-21",
    },
    {
      id: "4",
      sourceDomain: "ahrefs.com",
      targetUrl: "/blog/llmo-optimization",
      anchorText: "LLMO optimization strategies",
      domainRating: 92,
      doFollow: false,
      firstSeen: "2024-07-08",
      lastSeen: "2024-12-19",
    },
    {
      id: "5",
      sourceDomain: "semrush.com",
      targetUrl: "/features",
      anchorText: "SEO features comparison",
      domainRating: 93,
      doFollow: true,
      firstSeen: "2024-09-14",
      lastSeen: "2024-12-22",
    },
  ],
  competitorOverlap: [
    { competitor: "ahrefs.com", sharedKeywords: 2450, uniqueKeywords: 8900, gap: 6450 },
    { competitor: "semrush.com", sharedKeywords: 3120, uniqueKeywords: 12400, gap: 9280 },
    { competitor: "moz.com", sharedKeywords: 1890, uniqueKeywords: 5600, gap: 3710 },
  ],
};

// Rank Tracking Data
export interface RankingData {
  id: string;
  keyword: string;
  googleRank: number;
  googleRankChange: number;
  aiCitations: {
    chatgpt: boolean;
    perplexity: boolean;
    gemini: boolean;
  };
  aiSentiment: "positive" | "neutral" | "negative";
  url: string;
  lastUpdated: string;
  history: { date: string; googleRank: number; aiMentions: number }[];
}

export const rankingData: RankingData[] = [
  {
    id: "1",
    keyword: "best seo tools",
    googleRank: 3,
    googleRankChange: 2,
    aiCitations: { chatgpt: true, perplexity: true, gemini: true },
    aiSentiment: "positive",
    url: "/tools/seo-analyzer",
    lastUpdated: "2024-12-24",
    history: [
      { date: "2024-12-18", googleRank: 5, aiMentions: 2 },
      { date: "2024-12-19", googleRank: 5, aiMentions: 2 },
      { date: "2024-12-20", googleRank: 4, aiMentions: 3 },
      { date: "2024-12-21", googleRank: 4, aiMentions: 3 },
      { date: "2024-12-22", googleRank: 3, aiMentions: 3 },
      { date: "2024-12-23", googleRank: 3, aiMentions: 3 },
      { date: "2024-12-24", googleRank: 3, aiMentions: 3 },
    ],
  },
  {
    id: "2",
    keyword: "ai content optimization",
    googleRank: 1,
    googleRankChange: 0,
    aiCitations: { chatgpt: true, perplexity: true, gemini: true },
    aiSentiment: "positive",
    url: "/blog/ai-content-guide",
    lastUpdated: "2024-12-24",
    history: [
      { date: "2024-12-18", googleRank: 1, aiMentions: 3 },
      { date: "2024-12-19", googleRank: 1, aiMentions: 3 },
      { date: "2024-12-20", googleRank: 1, aiMentions: 3 },
      { date: "2024-12-21", googleRank: 1, aiMentions: 3 },
      { date: "2024-12-22", googleRank: 1, aiMentions: 3 },
      { date: "2024-12-23", googleRank: 1, aiMentions: 3 },
      { date: "2024-12-24", googleRank: 1, aiMentions: 3 },
    ],
  },
  {
    id: "3",
    keyword: "generative engine optimization",
    googleRank: 2,
    googleRankChange: 5,
    aiCitations: { chatgpt: true, perplexity: true, gemini: false },
    aiSentiment: "positive",
    url: "/blog/geo-guide",
    lastUpdated: "2024-12-24",
    history: [
      { date: "2024-12-18", googleRank: 7, aiMentions: 1 },
      { date: "2024-12-19", googleRank: 6, aiMentions: 1 },
      { date: "2024-12-20", googleRank: 5, aiMentions: 2 },
      { date: "2024-12-21", googleRank: 4, aiMentions: 2 },
      { date: "2024-12-22", googleRank: 3, aiMentions: 2 },
      { date: "2024-12-23", googleRank: 2, aiMentions: 2 },
      { date: "2024-12-24", googleRank: 2, aiMentions: 2 },
    ],
  },
  {
    id: "4",
    keyword: "keyword research tool",
    googleRank: 8,
    googleRankChange: -2,
    aiCitations: { chatgpt: false, perplexity: true, gemini: false },
    aiSentiment: "neutral",
    url: "/tools/keyword-research",
    lastUpdated: "2024-12-24",
    history: [
      { date: "2024-12-18", googleRank: 6, aiMentions: 1 },
      { date: "2024-12-19", googleRank: 6, aiMentions: 1 },
      { date: "2024-12-20", googleRank: 7, aiMentions: 1 },
      { date: "2024-12-21", googleRank: 7, aiMentions: 1 },
      { date: "2024-12-22", googleRank: 8, aiMentions: 1 },
      { date: "2024-12-23", googleRank: 8, aiMentions: 1 },
      { date: "2024-12-24", googleRank: 8, aiMentions: 1 },
    ],
  },
  {
    id: "5",
    keyword: "backlink checker",
    googleRank: 12,
    googleRankChange: -3,
    aiCitations: { chatgpt: false, perplexity: false, gemini: false },
    aiSentiment: "negative",
    url: "/tools/backlink-checker",
    lastUpdated: "2024-12-24",
    history: [
      { date: "2024-12-18", googleRank: 9, aiMentions: 0 },
      { date: "2024-12-19", googleRank: 10, aiMentions: 0 },
      { date: "2024-12-20", googleRank: 10, aiMentions: 0 },
      { date: "2024-12-21", googleRank: 11, aiMentions: 0 },
      { date: "2024-12-22", googleRank: 11, aiMentions: 0 },
      { date: "2024-12-23", googleRank: 12, aiMentions: 0 },
      { date: "2024-12-24", googleRank: 12, aiMentions: 0 },
    ],
  },
];

// Dashboard Overview Data
export const dashboardStats = {
  totalKeywords: 1247,
  keywordsChange: 12.5,
  avgPosition: 8.4,
  positionChange: -1.2,
  organicTraffic: 125000,
  trafficChange: 18.7,
  aiVisibility: 76,
  aiVisibilityChange: 8.3,
  domainRating: 72,
  drChange: 3,
  backlinks: 45200,
  backlinksChange: 5.2,
};

export const trafficTrendData = [
  { month: "Jan", organic: 85000, ai: 12000 },
  { month: "Feb", organic: 92000, ai: 15000 },
  { month: "Mar", organic: 98000, ai: 18000 },
  { month: "Apr", organic: 105000, ai: 22000 },
  { month: "May", organic: 112000, ai: 28000 },
  { month: "Jun", organic: 118000, ai: 35000 },
  { month: "Jul", organic: 122000, ai: 42000 },
  { month: "Aug", organic: 125000, ai: 48000 },
  { month: "Sep", organic: 128000, ai: 52000 },
  { month: "Oct", organic: 130000, ai: 58000 },
  { month: "Nov", organic: 127000, ai: 62000 },
  { month: "Dec", organic: 125000, ai: 68000 },
];

export const aiPlatformData = [
  { name: "ChatGPT", value: 42, color: "#8b5cf6" },
  { name: "Perplexity", value: 28, color: "#22d3ee" },
  { name: "Gemini", value: 18, color: "#ec4899" },
  { name: "Claude", value: 12, color: "#22c55e" },
];

export const recentAlerts = [
  {
    id: "1",
    type: "success",
    title: "Ranking Improved",
    message: '"best seo tools" moved from #5 to #3 on Google',
    time: "2 hours ago",
  },
  {
    id: "2",
    type: "info",
    title: "New AI Citation",
    message: "Your content was cited by ChatGPT for \"ai content optimization\"",
    time: "5 hours ago",
  },
  {
    id: "3",
    type: "warning",
    title: "Ranking Drop",
    message: '"backlink checker" dropped from #9 to #12',
    time: "1 day ago",
  },
  {
    id: "4",
    type: "success",
    title: "New Backlink",
    message: "High DR backlink acquired from techcrunch.com",
    time: "2 days ago",
  },
];
