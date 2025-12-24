/**
 * AI SEO Analyzer Service
 * LLMを活用してドメインのSEO/LLMO分析を行う
 */

import { invokeLLM } from "../_core/llm";

// ドメインのSEO分析結果の型
export interface DomainAnalysisResult {
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
  topPages: Array<{
    url: string;
    title: string;
    estimatedTraffic: number;
    topKeywords: string[];
    seoScore: number;
    contentType: string;
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

// キーワード分析結果の型
export interface KeywordAnalysisResult {
  keyword: string;
  metrics: {
    searchVolume: number;
    difficulty: number;
    cpc: number;
    trend: string;
  };
  serpFeatures: string[];
  aiVisibility: {
    chatgpt: number;
    perplexity: number;
    gemini: number;
  };
  relatedKeywords: Array<{
    keyword: string;
    searchVolume: number;
    difficulty: number;
  }>;
  contentStrategy: {
    recommendedFormat: string;
    targetWordCount: number;
    keyTopics: string[];
    uniqueAngle: string;
  };
}

// LLM引用状況の型
export interface LLMCitationResult {
  overallVisibility: number;
  platforms: {
    chatgpt: { score: number; mentions: string[]; sentiment: string };
    perplexity: { score: number; mentions: string[]; sentiment: string };
    gemini: { score: number; mentions: string[]; sentiment: string };
  };
  recommendations: string[];
}

// JSONをパースするヘルパー関数
function parseJSONResponse<T>(content: string): T {
  // コードブロックを除去
  let cleanContent = content;
  if (content.includes("```json")) {
    cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  } else if (content.includes("```")) {
    cleanContent = content.replace(/```\n?/g, "");
  }
  
  return JSON.parse(cleanContent.trim()) as T;
}

// ドメインを分析
export async function analyzeDomainWithAI(domain: string, siteContent: string): Promise<DomainAnalysisResult> {
  const prompt = `
あなたはSEO/LLMO分析の専門家です。以下のドメインとそのコンテンツを分析し、詳細なSEOレポートをJSON形式で作成してください。

## 分析対象ドメイン
${domain}

## サイトコンテンツ（抜粋）
${siteContent.substring(0, 6000)}

## 出力形式（必ずこのJSON形式で出力）
{
  "domainOverview": {
    "estimatedDR": 50,
    "estimatedTraffic": 10000,
    "mainTopics": ["トピック1", "トピック2"],
    "targetAudience": "ターゲット層の説明",
    "siteType": "メディア/EC/コーポレート等"
  },
  "strengthKeywords": [
    {
      "keyword": "実際のキーワード（日本語）",
      "searchVolume": 5000,
      "estimatedRank": 3,
      "aiVisibility": 75,
      "intent": "情報収集型/取引型/ナビゲーション型/商業調査型",
      "difficulty": 45
    }
  ],
  "topPages": [
    {
      "url": "/example-page",
      "title": "ページタイトル",
      "estimatedTraffic": 5000,
      "topKeywords": ["キーワード1", "キーワード2"],
      "seoScore": 85,
      "contentType": "記事/商品ページ/カテゴリページ等"
    }
  ],
  "competitors": [
    {
      "domain": "competitor.com",
      "overlapScore": 65,
      "strengths": ["強み1", "強み2"]
    }
  ],
  "backlinks": {
    "estimatedTotal": 5000,
    "estimatedReferringDomains": 500,
    "topSources": [
      {
        "domain": "source.com",
        "dr": 70,
        "type": "DoFollow",
        "context": "リンクの文脈"
      }
    ]
  },
  "aiReadability": {
    "semanticHTML": 80,
    "schemaOrg": 60,
    "contentClarity": 75,
    "overallScore": 72
  },
  "improvements": [
    {
      "category": "コンテンツ/技術SEO/被リンク/AI最適化/UX",
      "priority": "高/中/低",
      "title": "改善タイトル",
      "description": "詳細な改善内容",
      "expectedImpact": "期待される効果",
      "implementationSteps": ["手順1", "手順2"]
    }
  ]
}

重要な注意事項:
1. strengthKeywordsには、実際にユーザーが検索しそうな自然な日本語キーワードを15件含めてください
2. 「ドメイン名 + ○○」のような単純なパターンは避けてください
3. サイトのコンテンツに基づいて、そのサイトが上位表示できそうなキーワードを推測してください
4. 競合サイトは、同じ業界・トピックの実在するサイトを挙げてください
5. 改善提案は具体的で実行可能なものにしてください
6. topPagesには、SEOが強いと推測されるページを10件含めてください（URLはサイト構造から推測）
7. 各ページには、そのページがターゲットとしているキーワードを含めてください

JSONのみを出力してください。説明文は不要です。
`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: "あなたはSEO/LLMO分析の専門家です。必ずJSON形式で回答してください。" },
        { role: "user", content: prompt }
      ],
    });

    const content = typeof result.choices[0].message.content === "string" 
      ? result.choices[0].message.content 
      : JSON.stringify(result.choices[0].message.content);

    return parseJSONResponse<DomainAnalysisResult>(content);
  } catch (error) {
    console.error("AI domain analysis error:", error);
    throw error;
  }
}

// キーワードを分析
export async function analyzeKeywordWithAI(keyword: string, targetDomain?: string): Promise<KeywordAnalysisResult> {
  const prompt = `
あなたはSEO/LLMO分析の専門家です。以下のキーワードを詳細に分析し、JSON形式で出力してください。

## 分析対象キーワード
${keyword}

${targetDomain ? `## ターゲットドメイン\n${targetDomain}` : ""}

## 出力形式（必ずこのJSON形式で出力）
{
  "keyword": "${keyword}",
  "metrics": {
    "searchVolume": 5000,
    "difficulty": 45,
    "cpc": 2.5,
    "trend": "上昇/安定/下降"
  },
  "serpFeatures": ["Featured Snippet", "People Also Ask", "Video", "Image Pack", "Local Pack", "Knowledge Panel", "Shopping", "News", "Reviews"],
  "aiVisibility": {
    "chatgpt": 70,
    "perplexity": 65,
    "gemini": 60
  },
  "relatedKeywords": [
    {
      "keyword": "関連キーワード",
      "searchVolume": 3000,
      "difficulty": 35
    }
  ],
  "contentStrategy": {
    "recommendedFormat": "ハウツー記事/比較記事/リスト記事等",
    "targetWordCount": 3000,
    "keyTopics": ["含めるべきトピック1", "トピック2"],
    "uniqueAngle": "差別化ポイント"
  }
}

日本市場を前提として分析してください。
JSONのみを出力してください。説明文は不要です。
`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: "あなたはSEO/LLMO分析の専門家です。必ずJSON形式で回答してください。" },
        { role: "user", content: prompt }
      ],
    });

    const content = typeof result.choices[0].message.content === "string" 
      ? result.choices[0].message.content 
      : JSON.stringify(result.choices[0].message.content);

    return parseJSONResponse<KeywordAnalysisResult>(content);
  } catch (error) {
    console.error("AI keyword analysis error:", error);
    throw error;
  }
}

// LLM引用状況をチェック
export async function checkLLMCitationsWithAI(domain: string, keywords: string[]): Promise<LLMCitationResult> {
  const prompt = `
あなたはLLMO（Large Language Model Optimization）の専門家です。
以下のドメインが各AIプラットフォームでどのように引用・言及されているかを分析し、JSON形式で出力してください。

## 分析対象ドメイン
${domain}

## 関連キーワード
${keywords.join(", ")}

## 出力形式（必ずこのJSON形式で出力）
{
  "overallVisibility": 65,
  "platforms": {
    "chatgpt": {
      "score": 70,
      "mentions": ["言及される文脈1", "言及される文脈2"],
      "sentiment": "positive/neutral/negative"
    },
    "perplexity": {
      "score": 60,
      "mentions": ["言及される文脈1"],
      "sentiment": "positive/neutral/negative"
    },
    "gemini": {
      "score": 55,
      "mentions": ["言及される文脈1"],
      "sentiment": "positive/neutral/negative"
    }
  },
  "recommendations": [
    "AI検索での可視性を向上させるための具体的な提案1",
    "提案2"
  ]
}

JSONのみを出力してください。説明文は不要です。
`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: "あなたはLLMO分析の専門家です。必ずJSON形式で回答してください。" },
        { role: "user", content: prompt }
      ],
    });

    const content = typeof result.choices[0].message.content === "string" 
      ? result.choices[0].message.content 
      : JSON.stringify(result.choices[0].message.content);

    return parseJSONResponse<LLMCitationResult>(content);
  } catch (error) {
    console.error("AI LLM citation check error:", error);
    return {
      overallVisibility: 50,
      platforms: {
        chatgpt: { score: 50, mentions: [], sentiment: "neutral" },
        perplexity: { score: 50, mentions: [], sentiment: "neutral" },
        gemini: { score: 50, mentions: [], sentiment: "neutral" },
      },
      recommendations: ["AI検索での可視性を向上させるため、構造化データを実装してください。"],
    };
  }
}

// 改善提案を生成
export async function generateImprovementSuggestions(
  domain: string,
  currentMetrics: {
    dr: number;
    traffic: number;
    keywords: Array<{ keyword: string; rank: number }>;
  }
): Promise<Array<{
  category: string;
  priority: string;
  title: string;
  description: string;
  expectedImpact: string;
  steps: string[];
}>> {
  const prompt = `
あなたはSEOコンサルタントです。以下のドメインの現状を分析し、具体的な改善提案をJSON形式で作成してください。

## ドメイン
${domain}

## 現在の指標
- ドメインレーティング: ${currentMetrics.dr}
- 月間トラフィック: ${currentMetrics.traffic}
- 主要キーワード順位:
${currentMetrics.keywords.map(k => `  - ${k.keyword}: ${k.rank}位`).join("\n")}

## 出力形式（必ずこのJSON形式で出力）
{
  "suggestions": [
    {
      "category": "コンテンツ/技術SEO/被リンク/AI最適化/UX",
      "priority": "高/中/低",
      "title": "改善タイトル",
      "description": "詳細な改善内容",
      "expectedImpact": "期待される効果",
      "steps": ["実装手順1", "実装手順2"]
    }
  ]
}

5-10件の具体的で実行可能な改善提案を作成してください。
JSONのみを出力してください。説明文は不要です。
`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: "あなたはSEOコンサルタントです。必ずJSON形式で回答してください。" },
        { role: "user", content: prompt }
      ],
    });

    const content = typeof result.choices[0].message.content === "string" 
      ? result.choices[0].message.content 
      : JSON.stringify(result.choices[0].message.content);

    const parsed = parseJSONResponse<{ suggestions: Array<{
      category: string;
      priority: string;
      title: string;
      description: string;
      expectedImpact: string;
      steps: string[];
    }> }>(content);

    return parsed.suggestions;
  } catch (error) {
    console.error("AI improvement suggestions error:", error);
    return [];
  }
}

export default {
  analyzeDomainWithAI,
  analyzeKeywordWithAI,
  checkLLMCitationsWithAI,
  generateImprovementSuggestions,
};
