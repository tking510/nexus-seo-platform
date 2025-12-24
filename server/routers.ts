import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { trackedDomains, trackedKeywords, keywordHistory, domainHistory, pageSpeedHistory } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  getGoogleAuthUrl,
  exchangeCodeForTokens,
  saveGoogleTokens,
  listSearchConsoleSites,
  getValidAccessToken,
  syncSearchConsoleData,
} from "./services/googleSearchConsole";
import {
  fetchPageSpeedInsights,
  analyzeAndSavePageSpeed,
  syncPageSpeedData,
  calculateAIReadabilityScore,
} from "./services/pageSpeedInsights";
import {
  analyzeDomainWithAI,
  analyzeKeywordWithAI,
  checkLLMCitationsWithAI,
  generateImprovementSuggestions,
} from "./services/aiSeoAnalyzer";

// Google Search Console連携用のルーター
const googleRouter = router({
  // Google OAuth認証URLを取得
  getAuthUrl: publicProcedure
    .input(z.object({
      redirectUri: z.string(),
    }))
    .query(({ input }) => {
      try {
        const authUrl = getGoogleAuthUrl(input.redirectUri);
        return { success: true, authUrl };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  // OAuth認証コードをトークンに交換
  exchangeCode: publicProcedure
    .input(z.object({
      code: z.string(),
      redirectUri: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          return { success: false, error: "ログインが必要です" };
        }

        const tokens = await exchangeCodeForTokens(input.code, input.redirectUri);
        await saveGoogleTokens(
          ctx.user.id,
          tokens.access_token,
          tokens.refresh_token || "",
          tokens.expires_in
        );

        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  // Search Consoleのサイト一覧を取得
  listSites: publicProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user?.id) {
        return { success: false, error: "ログインが必要です", sites: [] };
      }

      const accessToken = await getValidAccessToken(ctx.user.id);
      const sites = await listSearchConsoleSites(accessToken);
      return { success: true, sites };
    } catch (error) {
      return { success: false, error: String(error), sites: [] };
    }
  }),

  // Search Consoleデータを同期
  syncData: publicProcedure.mutation(async ({ ctx }) => {
    try {
      if (!ctx.user?.id) {
        return { success: false, error: "ログインが必要です" };
      }

      const result = await syncSearchConsoleData(ctx.user.id);
      return result;
    } catch (error) {
      return { success: false, error: String(error), domainsUpdated: 0, keywordsUpdated: 0 };
    }
  }),
});

// ドメイン管理用のルーター
const domainsRouter = router({
  // ドメインを追加
  add: publicProcedure
    .input(z.object({
      domain: z.string(),
      searchConsoleProperty: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          return { success: false, error: "ログインが必要です" };
        }

        const db = await getDb();
        if (!db) return { success: false, error: "データベースに接続できません" };

        const inserted = await db.insert(trackedDomains).values({
          userId: ctx.user.id,
          domain: input.domain,
          searchConsoleProperty: input.searchConsoleProperty,
        }).returning();

        return { success: true, id: inserted[0]?.id };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  // ドメイン一覧を取得
  list: publicProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user?.id) {
        return { success: false, domains: [] };
      }

      const db = await getDb();
      if (!db) return { success: false, domains: [] };

      const domains = await db.select().from(trackedDomains).where(eq(trackedDomains.userId, ctx.user.id));
      return { success: true, domains };
    } catch (error) {
      return { success: false, domains: [], error: String(error) };
    }
  }),

  // ドメインを削除
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          return { success: false, error: "ログインが必要です" };
        }

        const db = await getDb();
        if (!db) return { success: false, error: "データベースに接続できません" };

        await db.delete(trackedDomains).where(
          and(eq(trackedDomains.id, input.id), eq(trackedDomains.userId, ctx.user.id))
        );

        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  // ドメインの履歴データを取得
  getHistory: publicProcedure
    .input(z.object({ domainId: z.number(), limit: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          return { success: false, history: [] };
        }

        const db = await getDb();
        if (!db) return { success: false, history: [] };

        const history = await db
          .select()
          .from(domainHistory)
          .where(eq(domainHistory.domainId, input.domainId))
          .orderBy(desc(domainHistory.date))
          .limit(input.limit || 30);

        return { success: true, history };
      } catch (error) {
        return { success: false, history: [], error: String(error) };
      }
    }),
});

// キーワード管理用のルーター
const keywordsRouter = router({
  // キーワードを追加
  add: publicProcedure
    .input(z.object({
      domainId: z.number(),
      keyword: z.string(),
      targetUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          return { success: false, error: "ログインが必要です" };
        }

        const db = await getDb();
        if (!db) return { success: false, error: "データベースに接続できません" };

        const inserted = await db.insert(trackedKeywords).values({
          userId: ctx.user.id,
          domainId: input.domainId,
          keyword: input.keyword,
          targetUrl: input.targetUrl,
        }).returning();

        return { success: true, id: inserted[0]?.id };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  // キーワード一覧を取得
  list: publicProcedure
    .input(z.object({ domainId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          return { success: false, keywords: [] };
        }

        const db = await getDb();
        if (!db) return { success: false, keywords: [] };

        let query = db.select().from(trackedKeywords).where(eq(trackedKeywords.userId, ctx.user.id));
        
        if (input.domainId) {
          query = db.select().from(trackedKeywords).where(
            and(eq(trackedKeywords.userId, ctx.user.id), eq(trackedKeywords.domainId, input.domainId))
          );
        }

        const keywords = await query;
        return { success: true, keywords };
      } catch (error) {
        return { success: false, keywords: [], error: String(error) };
      }
    }),

  // キーワードを削除
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          return { success: false, error: "ログインが必要です" };
        }

        const db = await getDb();
        if (!db) return { success: false, error: "データベースに接続できません" };

        await db.delete(trackedKeywords).where(
          and(eq(trackedKeywords.id, input.id), eq(trackedKeywords.userId, ctx.user.id))
        );

        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  // キーワードの履歴データを取得
  getHistory: publicProcedure
    .input(z.object({ keywordId: z.number(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { success: false, history: [] };

        const history = await db
          .select()
          .from(keywordHistory)
          .where(eq(keywordHistory.keywordId, input.keywordId))
          .orderBy(desc(keywordHistory.date))
          .limit(input.limit || 30);

        return { success: true, history };
      } catch (error) {
        return { success: false, history: [], error: String(error) };
      }
    }),
});

// PageSpeed分析用のルーター
const pageSpeedRouter = router({
  // URLを分析
  analyze: publicProcedure
    .input(z.object({
      url: z.string(),
      domainId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const metrics = await fetchPageSpeedInsights(input.url);
        const aiReadability = calculateAIReadabilityScore(metrics);

        // domainIdがあればデータベースに保存
        if (input.domainId) {
          await analyzeAndSavePageSpeed(input.domainId, input.url);
        }

        return {
          success: true,
          metrics,
          aiReadability,
        };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  // PageSpeed履歴を取得
  getHistory: publicProcedure
    .input(z.object({ domainId: z.number(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { success: false, history: [] };

        const history = await db
          .select()
          .from(pageSpeedHistory)
          .where(eq(pageSpeedHistory.domainId, input.domainId))
          .orderBy(desc(pageSpeedHistory.date))
          .limit(input.limit || 30);

        return { success: true, history };
      } catch (error) {
        return { success: false, history: [], error: String(error) };
      }
    }),

  // 全ドメインのPageSpeedを同期
  syncAll: publicProcedure.mutation(async ({ ctx }) => {
    try {
      if (!ctx.user?.id) {
        return { success: false, error: "ログインが必要です" };
      }

      const result = await syncPageSpeedData(ctx.user.id);
      return result;
    } catch (error) {
      return { success: false, error: String(error), urlsAnalyzed: 0 };
    }
  }),
});

// SEO分析用のルーター
const seoRouter = router({
  // キーワード分析のAI改善提案
  analyzeKeyword: publicProcedure
    .input(z.object({
      keyword: z.string(),
      searchVolume: z.number(),
      keywordDifficulty: z.number(),
      cpc: z.number(),
      aiVisibility: z.object({
        chatgpt: z.number(),
        perplexity: z.number(),
        gemini: z.number(),
      }),
      intent: z.string(),
    }))
    .mutation(async ({ input }) => {
      const avgAiVisibility = Math.round(
        (input.aiVisibility.chatgpt + input.aiVisibility.perplexity + input.aiVisibility.gemini) / 3
      );

      const prompt = `あなたはSEOとLLMO（Large Language Model Optimization）の専門家です。
以下のキーワードデータを分析し、改善提案を日本語で提供してください。

キーワード: ${input.keyword}
検索ボリューム: ${input.searchVolume.toLocaleString()}
キーワード難易度: ${input.keywordDifficulty}/100
CPC: $${input.cpc}
AI可視性スコア: ChatGPT ${input.aiVisibility.chatgpt}%, Perplexity ${input.aiVisibility.perplexity}%, Gemini ${input.aiVisibility.gemini}%
平均AI可視性: ${avgAiVisibility}%
検索意図: ${input.intent}

以下の観点から分析してください：
1. このキーワードの競争力と機会
2. AI検索エンジンでの可視性を向上させる具体的な方法
3. コンテンツ最適化の推奨事項
4. ターゲットすべき関連キーワード（3-5個）
5. 優先度と期待される成果

回答は構造化されたJSON形式で返してください。`;

      try {
        const result = await invokeLLM({
          messages: [
            { role: "system", content: "あなたはSEOとAI検索最適化の専門家です。常に実用的で具体的なアドバイスを提供します。" },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "keyword_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  summary: { type: "string", description: "キーワードの総合評価（2-3文）" },
                  competitiveness: {
                    type: "object",
                    properties: {
                      score: { type: "string", description: "高/中/低" },
                      analysis: { type: "string", description: "競争力の分析" },
                    },
                    required: ["score", "analysis"],
                    additionalProperties: false,
                  },
                  aiOptimization: {
                    type: "array",
                    items: { type: "string" },
                    description: "AI可視性向上のための具体的な施策リスト",
                  },
                  contentRecommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "コンテンツ最適化の推奨事項",
                  },
                  relatedKeywords: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        keyword: { type: "string" },
                        reason: { type: "string" },
                      },
                      required: ["keyword", "reason"],
                      additionalProperties: false,
                    },
                    description: "ターゲットすべき関連キーワード",
                  },
                  priority: {
                    type: "object",
                    properties: {
                      level: { type: "string", description: "高/中/低" },
                      expectedOutcome: { type: "string", description: "期待される成果" },
                      timeframe: { type: "string", description: "成果が出るまでの期間" },
                    },
                    required: ["level", "expectedOutcome", "timeframe"],
                    additionalProperties: false,
                  },
                },
                required: ["summary", "competitiveness", "aiOptimization", "contentRecommendations", "relatedKeywords", "priority"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = result.choices[0]?.message?.content;
        if (typeof content === "string") {
          return { success: true, analysis: JSON.parse(content) };
        }
        return { success: false, error: "Invalid response format" };
      } catch (error) {
        console.error("Keyword analysis error:", error);
        return { success: false, error: String(error) };
      }
    }),

  // ドメイン分析のAI改善提案
  analyzeDomain: publicProcedure
    .input(z.object({
      domain: z.string(),
      domainRating: z.number(),
      organicTraffic: z.number(),
      backlinks: z.number(),
      referringDomains: z.number(),
      aiReadabilityScore: z.number(),
      semanticHtmlScore: z.number(),
      schemaOrgScore: z.number(),
      contentClarityScore: z.number(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `あなたはSEOとLLMO（Large Language Model Optimization）の専門家です。
以下のドメインデータを分析し、改善提案を日本語で提供してください。

ドメイン: ${input.domain}
ドメインレーティング: ${input.domainRating}/100
オーガニックトラフィック: ${input.organicTraffic.toLocaleString()}
被リンク数: ${input.backlinks.toLocaleString()}
参照ドメイン数: ${input.referringDomains.toLocaleString()}

AI可読性スコア:
- セマンティックHTML: ${input.semanticHtmlScore}/100
- Schema.org: ${input.schemaOrgScore}/100
- コンテンツ明瞭性: ${input.contentClarityScore}/100
- 総合AI可読性: ${input.aiReadabilityScore}/100

以下の観点から分析してください：
1. ドメインの強みと弱み
2. AI検索エンジンでの可視性を向上させる技術的な改善点
3. 被リンク戦略の推奨事項
4. 競合に対する差別化ポイント
5. 優先的に取り組むべきアクション（優先度順）

回答は構造化されたJSON形式で返してください。`;

      try {
        const result = await invokeLLM({
          messages: [
            { role: "system", content: "あなたはSEOとAI検索最適化の専門家です。常に実用的で具体的なアドバイスを提供します。" },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "domain_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  summary: { type: "string", description: "ドメインの総合評価（2-3文）" },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "ドメインの強み",
                  },
                  weaknesses: {
                    type: "array",
                    items: { type: "string" },
                    description: "ドメインの弱み",
                  },
                  technicalImprovements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        area: { type: "string" },
                        action: { type: "string" },
                        impact: { type: "string", description: "高/中/低" },
                      },
                      required: ["area", "action", "impact"],
                      additionalProperties: false,
                    },
                    description: "技術的な改善点",
                  },
                  backlinkStrategy: {
                    type: "array",
                    items: { type: "string" },
                    description: "被リンク戦略の推奨事項",
                  },
                  differentiationPoints: {
                    type: "array",
                    items: { type: "string" },
                    description: "競合との差別化ポイント",
                  },
                  priorityActions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        action: { type: "string" },
                        priority: { type: "number", description: "1-5の優先度" },
                        effort: { type: "string", description: "高/中/低" },
                        expectedImpact: { type: "string" },
                      },
                      required: ["action", "priority", "effort", "expectedImpact"],
                      additionalProperties: false,
                    },
                    description: "優先的に取り組むべきアクション",
                  },
                },
                required: ["summary", "strengths", "weaknesses", "technicalImprovements", "backlinkStrategy", "differentiationPoints", "priorityActions"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = result.choices[0]?.message?.content;
        if (typeof content === "string") {
          return { success: true, analysis: JSON.parse(content) };
        }
        return { success: false, error: "Invalid response format" };
      } catch (error) {
        console.error("Domain analysis error:", error);
        return { success: false, error: String(error) };
      }
    }),

  // 順位トラッキングのAI分析
  analyzeRanking: publicProcedure
    .input(z.object({
      keyword: z.string(),
      googleRank: z.number(),
      googleRankChange: z.number(),
      aiCitations: z.object({
        chatgpt: z.boolean(),
        perplexity: z.boolean(),
        gemini: z.boolean(),
      }),
      aiSentiment: z.string(),
      url: z.string(),
    }))
    .mutation(async ({ input }) => {
      const citedPlatforms = Object.entries(input.aiCitations)
        .filter(([_, cited]) => cited)
        .map(([platform]) => platform)
        .join(", ");

      const prompt = `あなたはSEOとLLMO（Large Language Model Optimization）の専門家です。
以下の順位トラッキングデータを分析し、改善提案を日本語で提供してください。

キーワード: ${input.keyword}
Google順位: #${input.googleRank}
順位変動: ${input.googleRankChange > 0 ? "+" : ""}${input.googleRankChange}
AI引用プラットフォーム: ${citedPlatforms || "なし"}
AIセンチメント: ${input.aiSentiment}
対象URL: ${input.url}

以下の観点から分析してください：
1. 現在の順位パフォーマンスの評価
2. Google順位を改善するための具体的なアクション
3. AI検索での引用を増やすための戦略
4. センチメントを改善するためのコンテンツ調整
5. 短期・中期・長期の目標設定

回答は構造化されたJSON形式で返してください。`;

      try {
        const result = await invokeLLM({
          messages: [
            { role: "system", content: "あなたはSEOとAI検索最適化の専門家です。常に実用的で具体的なアドバイスを提供します。" },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "ranking_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  summary: { type: "string", description: "現在の順位パフォーマンス評価（2-3文）" },
                  googleImprovements: {
                    type: "array",
                    items: { type: "string" },
                    description: "Google順位改善のためのアクション",
                  },
                  aiCitationStrategy: {
                    type: "array",
                    items: { type: "string" },
                    description: "AI引用を増やすための戦略",
                  },
                  sentimentOptimization: {
                    type: "array",
                    items: { type: "string" },
                    description: "センチメント改善のためのコンテンツ調整",
                  },
                  goals: {
                    type: "object",
                    properties: {
                      shortTerm: { type: "string", description: "1-3ヶ月の目標" },
                      midTerm: { type: "string", description: "3-6ヶ月の目標" },
                      longTerm: { type: "string", description: "6-12ヶ月の目標" },
                    },
                    required: ["shortTerm", "midTerm", "longTerm"],
                    additionalProperties: false,
                  },
                },
                required: ["summary", "googleImprovements", "aiCitationStrategy", "sentimentOptimization", "goals"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = result.choices[0]?.message?.content;
        if (typeof content === "string") {
          return { success: true, analysis: JSON.parse(content) };
        }
        return { success: false, error: "Invalid response format" };
      } catch (error) {
        console.error("Ranking analysis error:", error);
        return { success: false, error: String(error) };
      }
    }),
});

// AI駆動のSEO分析ルーター
const aiAnalysisRouter = router({
  // ドメインをAIで深く分析
  analyzeDomainDeep: publicProcedure
    .input(z.object({
      domain: z.string(),
      siteContent: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        // サイトコンテンツが提供されていない場合、簡易的な説明を使用
        const content = input.siteContent || `ドメイン ${input.domain} の分析`;
        const result = await analyzeDomainWithAI(input.domain, content);
        return { success: true, analysis: result };
      } catch (error) {
        console.error("AI domain analysis error:", error);
        return { success: false, error: String(error) };
      }
    }),

  // キーワードをAIで分析
  analyzeKeywordDeep: publicProcedure
    .input(z.object({
      keyword: z.string(),
      targetDomain: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await analyzeKeywordWithAI(input.keyword, input.targetDomain);
        return { success: true, analysis: result };
      } catch (error) {
        console.error("AI keyword analysis error:", error);
        return { success: false, error: String(error) };
      }
    }),

  // LLM引用状況をチェック
  checkLLMCitations: publicProcedure
    .input(z.object({
      domain: z.string(),
      keywords: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await checkLLMCitationsWithAI(input.domain, input.keywords);
        return { success: true, citations: result };
      } catch (error) {
        console.error("LLM citation check error:", error);
        return { success: false, error: String(error) };
      }
    }),

  // 改善提案を生成
  generateImprovements: publicProcedure
    .input(z.object({
      domain: z.string(),
      dr: z.number(),
      traffic: z.number(),
      keywords: z.array(z.object({
        keyword: z.string(),
        rank: z.number(),
      })),
    }))
    .mutation(async ({ input }) => {
      try {
        const suggestions = await generateImprovementSuggestions(
          input.domain,
          {
            dr: input.dr,
            traffic: input.traffic,
            keywords: input.keywords,
          }
        );
        return { success: true, suggestions };
      } catch (error) {
        console.error("Improvement suggestions error:", error);
        return { success: false, error: String(error) };
      }
    }),

  // Webサイトのコンテンツを取得して分析
  fetchAndAnalyzeDomain: publicProcedure
    .input(z.object({
      domain: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        // まずドメインのコンテンツを取得
        const url = input.domain.startsWith('http') ? input.domain : `https://${input.domain}`;
        let siteContent = '';
        
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; NexusSEOBot/1.0)',
            },
          });
          if (response.ok) {
            const html = await response.text();
            // HTMLからテキストを抽出（簡易版）
            siteContent = html
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .substring(0, 10000);
          }
        } catch (fetchError) {
          console.log('Could not fetch site content, using domain name only');
          siteContent = `ドメイン: ${input.domain}`;
        }

        // AIで分析
        const analysis = await analyzeDomainWithAI(input.domain, siteContent);
        
        // LLM引用状況もチェック
        const mainKeywords = analysis.strengthKeywords.slice(0, 5).map(k => k.keyword);
        const citations = await checkLLMCitationsWithAI(input.domain, mainKeywords);

        return {
          success: true,
          analysis,
          citations,
          fetchedContentLength: siteContent.length,
        };
      } catch (error) {
        console.error("Fetch and analyze error:", error);
        return { success: false, error: String(error) };
      }
    }),
});

// CSVエクスポート用のルーター
const exportRouter = router({
  // キーワードデータをCSV形式で生成
  keywordsToCSV: publicProcedure
    .input(z.object({
      keywords: z.array(z.object({
        keyword: z.string(),
        searchVolume: z.number(),
        keywordDifficulty: z.number(),
        cpc: z.number(),
        aiVisibility: z.object({
          chatgpt: z.number(),
          perplexity: z.number(),
          gemini: z.number(),
        }),
        intent: z.string(),
      })),
    }))
    .mutation(({ input }) => {
      const headers = ["キーワード", "検索ボリューム", "難易度", "CPC", "ChatGPT可視性", "Perplexity可視性", "Gemini可視性", "平均AI可視性", "検索意図"];
      const rows = input.keywords.map(kw => {
        const avgAi = Math.round((kw.aiVisibility.chatgpt + kw.aiVisibility.perplexity + kw.aiVisibility.gemini) / 3);
        return [
          kw.keyword,
          kw.searchVolume,
          kw.keywordDifficulty,
          kw.cpc,
          kw.aiVisibility.chatgpt,
          kw.aiVisibility.perplexity,
          kw.aiVisibility.gemini,
          avgAi,
          kw.intent,
        ].join(",");
      });

      const csv = [headers.join(","), ...rows].join("\n");
      return { csv, filename: `keywords_export_${new Date().toISOString().split("T")[0]}.csv` };
    }),

  // ドメインデータをCSV形式で生成
  domainToCSV: publicProcedure
    .input(z.object({
      domain: z.string(),
      domainRating: z.number(),
      organicTraffic: z.number(),
      backlinks: z.number(),
      referringDomains: z.number(),
      aiReadabilityScore: z.number(),
      semanticHtmlScore: z.number(),
      schemaOrgScore: z.number(),
      contentClarityScore: z.number(),
      topBacklinks: z.array(z.object({
        sourceDomain: z.string(),
        targetUrl: z.string(),
        anchorText: z.string(),
        domainRating: z.number(),
        doFollow: z.boolean(),
      })),
    }))
    .mutation(({ input }) => {
      // ドメイン概要
      const summaryHeaders = ["指標", "値"];
      const summaryRows = [
        ["ドメイン", input.domain],
        ["ドメインレーティング", input.domainRating],
        ["オーガニックトラフィック", input.organicTraffic],
        ["被リンク数", input.backlinks],
        ["参照ドメイン数", input.referringDomains],
        ["AI可読性スコア", input.aiReadabilityScore],
        ["セマンティックHTMLスコア", input.semanticHtmlScore],
        ["Schema.orgスコア", input.schemaOrgScore],
        ["コンテンツ明瞭性スコア", input.contentClarityScore],
      ];

      // 被リンク一覧
      const backlinkHeaders = ["参照元ドメイン", "ターゲットURL", "アンカーテキスト", "DR", "タイプ"];
      const backlinkRows = input.topBacklinks.map(bl => [
        bl.sourceDomain,
        bl.targetUrl,
        bl.anchorText,
        bl.domainRating,
        bl.doFollow ? "DoFollow" : "NoFollow",
      ].join(","));

      const csv = [
        "=== ドメイン概要 ===",
        summaryHeaders.join(","),
        ...summaryRows.map(r => r.join(",")),
        "",
        "=== 上位被リンク ===",
        backlinkHeaders.join(","),
        ...backlinkRows,
      ].join("\n");

      return { csv, filename: `domain_${input.domain}_${new Date().toISOString().split("T")[0]}.csv` };
    }),

  // 順位トラッキングデータをCSV形式で生成
  rankingsToCSV: publicProcedure
    .input(z.object({
      rankings: z.array(z.object({
        keyword: z.string(),
        googleRank: z.number(),
        googleRankChange: z.number(),
        aiCitations: z.object({
          chatgpt: z.boolean(),
          perplexity: z.boolean(),
          gemini: z.boolean(),
        }),
        aiSentiment: z.string(),
        url: z.string(),
        lastUpdated: z.string(),
      })),
    }))
    .mutation(({ input }) => {
      const headers = ["キーワード", "Google順位", "順位変動", "ChatGPT引用", "Perplexity引用", "Gemini引用", "センチメント", "URL", "最終更新"];
      const rows = input.rankings.map(r => [
        r.keyword,
        r.googleRank,
        r.googleRankChange > 0 ? `+${r.googleRankChange}` : r.googleRankChange,
        r.aiCitations.chatgpt ? "○" : "×",
        r.aiCitations.perplexity ? "○" : "×",
        r.aiCitations.gemini ? "○" : "×",
        r.aiSentiment,
        r.url,
        r.lastUpdated,
      ].join(","));

      const csv = [headers.join(","), ...rows].join("\n");
      return { csv, filename: `rankings_export_${new Date().toISOString().split("T")[0]}.csv` };
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  google: googleRouter,
  domains: domainsRouter,
  keywords: keywordsRouter,
  pageSpeed: pageSpeedRouter,
  seo: seoRouter,
  export: exportRouter,
  aiAnalysis: aiAnalysisRouter,
});

export type AppRouter = typeof appRouter;
