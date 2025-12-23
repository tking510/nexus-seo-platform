/*
 * Custom React Hooks for SEO Data
 * 
 * These hooks provide easy access to the API service
 * with built-in loading states and error handling.
 */

import { useState, useEffect, useCallback } from "react";
import { API } from "@/lib/apiService";
import type { KeywordData, RankingData } from "@/lib/mockData";

// ============================================
// Types
// ============================================

interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseMutationResult<T, P> {
  mutate: (params: P) => Promise<T | null>;
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// Dashboard Hooks
// ============================================

export function useDashboardStats() {
  const [data, setData] = useState<typeof import("@/lib/mockData").dashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.Dashboard.getStats();
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || "Failed to fetch dashboard stats");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useTrafficData() {
  const [data, setData] = useState<typeof import("@/lib/mockData").trafficTrendData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.Dashboard.getTrafficData();
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || "Failed to fetch traffic data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useAlerts(limit: number = 10) {
  const [data, setData] = useState<typeof import("@/lib/mockData").recentAlerts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.Dashboard.getAlerts(limit);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || "Failed to fetch alerts");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// ============================================
// Keyword Hooks
// ============================================

export function useKeywords(searchQuery: string = "") {
  const [data, setData] = useState<KeywordData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.Keyword.search({ query: searchQuery });
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || "Failed to fetch keywords");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useKeywordDetails(id: string | null) {
  const [data, setData] = useState<KeywordData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await API.Keyword.getById(id);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || "Failed to fetch keyword details");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useKeywordAIVisibility(keyword: string | null) {
  const [data, setData] = useState<{
    chatgpt: number;
    perplexity: number;
    gemini: number;
    sentiment: "positive" | "neutral" | "negative";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!keyword) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await API.Keyword.getAIVisibility(keyword);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || "Failed to fetch AI visibility");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// ============================================
// Domain Hooks
// ============================================

export function useDomainAnalysis(domain: string | null) {
  const [data, setData] = useState<typeof import("@/lib/mockData").domainData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!domain) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await API.Domain.analyze({ domain });
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || "Failed to analyze domain");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [domain]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useAIReadabilityAudit(url: string | null) {
  const [data, setData] = useState<{
    semanticHtmlScore: number;
    schemaOrgScore: number;
    contentClarityScore: number;
    aiReadabilityScore: number;
    recommendations: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audit = useCallback(async () => {
    if (!url) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await API.Domain.auditAIReadability(url);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || "Failed to audit AI readability");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    audit();
  }, [audit]);

  return { data, isLoading, error, refetch: audit };
}

// ============================================
// Ranking Hooks
// ============================================

export function useRankings() {
  const [data, setData] = useState<RankingData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.Ranking.getAll();
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || "Failed to fetch rankings");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useRankingHistory(keyword: string | null, days: number = 30) {
  const [data, setData] = useState<{
    date: string;
    googleRank: number;
    aiMentions: number;
  }[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!keyword) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await API.Ranking.getHistory(keyword, days);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || "Failed to fetch ranking history");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [keyword, days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useTrackKeyword() {
  const [data, setData] = useState<RankingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const track = useCallback(async (keyword: string, url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.Ranking.trackKeyword(keyword, url);
      if (response.success) {
        setData(response.data);
        return response.data;
      } else {
        setError(response.error || "Failed to track keyword");
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { track, data, isLoading, error };
}

// ============================================
// LLM Analysis Hooks
// ============================================

export function useCitationCheck(url: string | null, keyword: string | null) {
  const [data, setData] = useState<{
    chatgpt: { cited: boolean; context?: string };
    perplexity: { cited: boolean; context?: string };
    gemini: { cited: boolean; context?: string };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    if (!url || !keyword) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await API.LLM.checkCitations(url, keyword);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || "Failed to check citations");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [url, keyword]);

  useEffect(() => {
    check();
  }, [check]);

  return { data, isLoading, error, refetch: check };
}

export function useAIContentAnalysis() {
  const [data, setData] = useState<{
    score: number;
    suggestions: string[];
    keyTopics: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (content: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.LLM.analyzeForAI(content);
      if (response.success) {
        setData(response.data);
        return response.data;
      } else {
        setError(response.error || "Failed to analyze content");
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { analyze, data, isLoading, error };
}

// ============================================
// Export All Hooks
// ============================================

export const SEOHooks = {
  // Dashboard
  useDashboardStats,
  useTrafficData,
  useAlerts,

  // Keywords
  useKeywords,
  useKeywordDetails,
  useKeywordAIVisibility,

  // Domain
  useDomainAnalysis,
  useAIReadabilityAudit,

  // Rankings
  useRankings,
  useRankingHistory,
  useTrackKeyword,

  // LLM
  useCitationCheck,
  useAIContentAnalysis,
};

export default SEOHooks;
