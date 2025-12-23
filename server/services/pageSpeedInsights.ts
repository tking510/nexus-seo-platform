/**
 * PageSpeed Insights API Integration Service
 * Fetches Core Web Vitals and performance metrics
 */

import { getDb } from "../db";
import { trackedDomains, pageSpeedHistory } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const PAGESPEED_API_BASE = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

interface LighthouseAudit {
  id: string;
  title: string;
  score: number | null;
  numericValue?: number;
  displayValue?: string;
}

interface LighthouseCategory {
  id: string;
  title: string;
  score: number | null;
}

interface PageSpeedResult {
  lighthouseResult: {
    categories: {
      performance?: LighthouseCategory;
      accessibility?: LighthouseCategory;
      "best-practices"?: LighthouseCategory;
      seo?: LighthouseCategory;
    };
    audits: {
      "largest-contentful-paint"?: LighthouseAudit;
      "first-input-delay"?: LighthouseAudit;
      "cumulative-layout-shift"?: LighthouseAudit;
      "server-response-time"?: LighthouseAudit;
      "first-contentful-paint"?: LighthouseAudit;
      "speed-index"?: LighthouseAudit;
      "total-blocking-time"?: LighthouseAudit;
      [key: string]: LighthouseAudit | undefined;
    };
  };
  loadingExperience?: {
    metrics?: {
      LARGEST_CONTENTFUL_PAINT_MS?: { percentile: number };
      FIRST_INPUT_DELAY_MS?: { percentile: number };
      CUMULATIVE_LAYOUT_SHIFT_SCORE?: { percentile: number };
    };
  };
}

export interface PageSpeedMetrics {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift (score * 1000)
  ttfb: number; // Time to First Byte (ms)
  fcp: number; // First Contentful Paint (ms)
  speedIndex: number; // Speed Index (ms)
  tbt: number; // Total Blocking Time (ms)
  rawData: object;
}

/**
 * Fetch PageSpeed Insights for a URL
 */
export async function fetchPageSpeedInsights(
  url: string,
  strategy: "mobile" | "desktop" = "mobile"
): Promise<PageSpeedMetrics> {
  // Build API URL with multiple categories
  const apiUrl = `${PAGESPEED_API_BASE}?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;

  const response = await fetch(apiUrl);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PageSpeed API error: ${error}`);
  }

  const data: PageSpeedResult = await response.json();
  const { lighthouseResult, loadingExperience } = data;

  // Extract scores (convert from 0-1 to 0-100)
  const performanceScore = Math.round((lighthouseResult.categories.performance?.score || 0) * 100);
  const accessibilityScore = Math.round((lighthouseResult.categories.accessibility?.score || 0) * 100);
  const bestPracticesScore = Math.round((lighthouseResult.categories["best-practices"]?.score || 0) * 100);
  const seoScore = Math.round((lighthouseResult.categories.seo?.score || 0) * 100);

  // Extract Core Web Vitals from audits
  const audits = lighthouseResult.audits;
  
  const lcp = Math.round(audits["largest-contentful-paint"]?.numericValue || 0);
  const fid = Math.round(loadingExperience?.metrics?.FIRST_INPUT_DELAY_MS?.percentile || 0);
  const cls = Math.round((audits["cumulative-layout-shift"]?.numericValue || 0) * 1000);
  const ttfb = Math.round(audits["server-response-time"]?.numericValue || 0);
  const fcp = Math.round(audits["first-contentful-paint"]?.numericValue || 0);
  const speedIndex = Math.round(audits["speed-index"]?.numericValue || 0);
  const tbt = Math.round(audits["total-blocking-time"]?.numericValue || 0);

  return {
    performanceScore,
    accessibilityScore,
    bestPracticesScore,
    seoScore,
    lcp,
    fid,
    cls,
    ttfb,
    fcp,
    speedIndex,
    tbt,
    rawData: data,
  };
}

/**
 * Analyze a URL and save results to database
 */
export async function analyzeAndSavePageSpeed(
  domainId: number,
  url: string
): Promise<PageSpeedMetrics> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const metrics = await fetchPageSpeedInsights(url);

  // Save to database
  await db.insert(pageSpeedHistory).values({
    domainId,
    url,
    date: new Date(),
    performanceScore: metrics.performanceScore,
    accessibilityScore: metrics.accessibilityScore,
    bestPracticesScore: metrics.bestPracticesScore,
    seoScore: metrics.seoScore,
    lcp: metrics.lcp,
    fid: metrics.fid,
    cls: metrics.cls,
    ttfb: metrics.ttfb,
    fcp: metrics.fcp,
    speedIndex: metrics.speedIndex,
    tbt: metrics.tbt,
    rawData: metrics.rawData,
  });

  return metrics;
}

/**
 * Sync PageSpeed data for all tracked domains
 */
export async function syncPageSpeedData(userId: number): Promise<{
  success: boolean;
  urlsAnalyzed: number;
  error?: string;
}> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get user's tracked domains
    const domains = await db.select().from(trackedDomains).where(eq(trackedDomains.userId, userId));

    if (domains.length === 0) {
      return { success: true, urlsAnalyzed: 0 };
    }

    let urlsAnalyzed = 0;

    for (const domain of domains) {
      try {
        // Analyze the main domain URL
        const url = domain.domain.startsWith("http") 
          ? domain.domain 
          : `https://${domain.domain}`;

        await analyzeAndSavePageSpeed(domain.id, url);
        urlsAnalyzed++;

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (domainError) {
        console.error(`Error analyzing PageSpeed for ${domain.domain}:`, domainError);
      }
    }

    return { success: true, urlsAnalyzed };
  } catch (error) {
    console.error("PageSpeed sync error:", error);
    return {
      success: false,
      urlsAnalyzed: 0,
      error: String(error),
    };
  }
}

/**
 * Get AI-readability score based on PageSpeed and SEO metrics
 */
export function calculateAIReadabilityScore(metrics: PageSpeedMetrics): {
  overall: number;
  semanticHTML: number;
  schemaOrg: number;
  contentClarity: number;
  technicalSEO: number;
} {
  // Calculate component scores based on various metrics
  const semanticHTML = Math.min(100, Math.round(
    (metrics.accessibilityScore * 0.6) + 
    (metrics.seoScore * 0.4)
  ));

  // Schema.org score estimation (based on SEO score and best practices)
  const schemaOrg = Math.min(100, Math.round(
    (metrics.seoScore * 0.7) + 
    (metrics.bestPracticesScore * 0.3)
  ));

  // Content clarity (based on performance and accessibility)
  const contentClarity = Math.min(100, Math.round(
    (metrics.accessibilityScore * 0.5) + 
    (metrics.performanceScore * 0.3) +
    (metrics.seoScore * 0.2)
  ));

  // Technical SEO (based on Core Web Vitals)
  const lcpScore = metrics.lcp <= 2500 ? 100 : metrics.lcp <= 4000 ? 75 : 50;
  const clsScore = metrics.cls <= 100 ? 100 : metrics.cls <= 250 ? 75 : 50;
  const fidScore = metrics.fid <= 100 ? 100 : metrics.fid <= 300 ? 75 : 50;
  
  const technicalSEO = Math.round((lcpScore + clsScore + fidScore) / 3);

  // Overall AI readability score
  const overall = Math.round(
    (semanticHTML * 0.3) +
    (schemaOrg * 0.25) +
    (contentClarity * 0.25) +
    (technicalSEO * 0.2)
  );

  return {
    overall,
    semanticHTML,
    schemaOrg,
    contentClarity,
    technicalSEO,
  };
}
