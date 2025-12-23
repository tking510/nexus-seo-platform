import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("export.keywordsToCSV", () => {
  it("generates valid CSV from keyword data", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.export.keywordsToCSV({
      keywords: [
        {
          keyword: "SEOツール おすすめ",
          searchVolume: 12500,
          keywordDifficulty: 67,
          cpc: 4.52,
          aiVisibility: { chatgpt: 78, perplexity: 82, gemini: 71 },
          intent: "commercial",
        },
        {
          keyword: "AIコンテンツ最適化",
          searchVolume: 15200,
          keywordDifficulty: 72,
          cpc: 5.87,
          aiVisibility: { chatgpt: 92, perplexity: 95, gemini: 89 },
          intent: "commercial",
        },
      ],
    });

    expect(result.csv).toContain("キーワード");
    expect(result.csv).toContain("検索ボリューム");
    expect(result.csv).toContain("SEOツール おすすめ");
    expect(result.csv).toContain("12500");
    expect(result.filename).toMatch(/^keywords_export_\d{4}-\d{2}-\d{2}\.csv$/);
  });
});

describe("export.domainToCSV", () => {
  it("generates valid CSV from domain data", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.export.domainToCSV({
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
          sourceDomain: "techcrunch.com",
          targetUrl: "/blog/ai-seo-guide",
          anchorText: "AI SEOガイド",
          domainRating: 94,
          doFollow: true,
        },
      ],
    });

    expect(result.csv).toContain("ドメイン概要");
    expect(result.csv).toContain("example.com");
    expect(result.csv).toContain("72");
    expect(result.csv).toContain("上位被リンク");
    expect(result.csv).toContain("techcrunch.com");
    expect(result.filename).toMatch(/^domain_example\.com_\d{4}-\d{2}-\d{2}\.csv$/);
  });
});

describe("export.rankingsToCSV", () => {
  it("generates valid CSV from ranking data", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.export.rankingsToCSV({
      rankings: [
        {
          keyword: "SEOツール おすすめ",
          googleRank: 3,
          googleRankChange: 2,
          aiCitations: { chatgpt: true, perplexity: true, gemini: true },
          aiSentiment: "positive",
          url: "/tools/seo-analyzer",
          lastUpdated: "2024-12-24",
        },
        {
          keyword: "被リンクチェッカー",
          googleRank: 12,
          googleRankChange: -3,
          aiCitations: { chatgpt: false, perplexity: false, gemini: false },
          aiSentiment: "negative",
          url: "/tools/backlink-checker",
          lastUpdated: "2024-12-24",
        },
      ],
    });

    expect(result.csv).toContain("キーワード");
    expect(result.csv).toContain("Google順位");
    expect(result.csv).toContain("SEOツール おすすめ");
    expect(result.csv).toContain("+2");
    expect(result.csv).toContain("-3");
    expect(result.csv).toContain("○");
    expect(result.csv).toContain("×");
    expect(result.filename).toMatch(/^rankings_export_\d{4}-\d{2}-\d{2}\.csv$/);
  });
});
