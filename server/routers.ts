import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";

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
                  summary: { type: "string", description: "順位パフォーマンスの総合評価（2-3文）" },
                  currentPerformance: {
                    type: "object",
                    properties: {
                      googleScore: { type: "string", description: "優秀/良好/要改善/危険" },
                      aiScore: { type: "string", description: "優秀/良好/要改善/危険" },
                      overallAssessment: { type: "string" },
                    },
                    required: ["googleScore", "aiScore", "overallAssessment"],
                    additionalProperties: false,
                  },
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
                required: ["summary", "currentPerformance", "googleImprovements", "aiCitationStrategy", "sentimentOptimization", "goals"],
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

// エクスポート用のルーター
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
  seo: seoRouter,
  export: exportRouter,
});

export type AppRouter = typeof appRouter;
