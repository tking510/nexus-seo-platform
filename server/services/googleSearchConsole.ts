/**
 * Google Search Console API Integration Service
 * Handles OAuth authentication and data fetching from Search Console
 */

import { getDb } from "../db";
import { users, trackedDomains, trackedKeywords, keywordHistory, domainHistory } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEARCH_CONSOLE_API_BASE = "https://www.googleapis.com/webmasters/v3";
const SEARCH_ANALYTICS_API_BASE = "https://searchconsole.googleapis.com/v1";

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SearchAnalyticsResponse {
  rows?: SearchAnalyticsRow[];
  responseAggregationType?: string;
}

/**
 * Generate Google OAuth authorization URL
 */
export function getGoogleAuthUrl(redirectUri: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }

  const scopes = [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes.join(" "),
    access_type: "offline",
    prompt: "consent",
  });

  return `${GOOGLE_OAUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<TokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  return response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  return response.json();
}

/**
 * Get valid access token for a user (refresh if needed)
 */
export async function getValidAccessToken(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = result[0];

  if (!user || !user.googleRefreshToken) {
    throw new Error("User not connected to Google");
  }

  // Check if token is expired
  const now = new Date();
  if (user.googleTokenExpiry && user.googleAccessToken && user.googleTokenExpiry > now) {
    return user.googleAccessToken;
  }

  // Refresh the token
  const tokens = await refreshAccessToken(user.googleRefreshToken);
  const expiry = new Date(Date.now() + tokens.expires_in * 1000);

  await db
    .update(users)
    .set({
      googleAccessToken: tokens.access_token,
      googleTokenExpiry: expiry,
    })
    .where(eq(users.id, userId));

  return tokens.access_token;
}

/**
 * List all Search Console sites for a user
 */
export async function listSearchConsoleSites(accessToken: string): Promise<string[]> {
  const response = await fetch(`${SEARCH_CONSOLE_API_BASE}/sites`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list sites: ${error}`);
  }

  const data = await response.json();
  return (data.siteEntry || []).map((site: { siteUrl: string }) => site.siteUrl);
}

/**
 * Fetch search analytics data for a site
 */
export async function fetchSearchAnalytics(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  dimensions: string[] = ["query", "page"],
  rowLimit: number = 1000
): Promise<SearchAnalyticsResponse> {
  const encodedSiteUrl = encodeURIComponent(siteUrl);
  const url = `${SEARCH_ANALYTICS_API_BASE}/sites/${encodedSiteUrl}/searchAnalytics/query`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions,
      rowLimit,
      dataState: "final",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch search analytics: ${error}`);
  }

  return response.json();
}

/**
 * Fetch overall site performance
 */
export async function fetchSitePerformance(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string
): Promise<{ clicks: number; impressions: number; ctr: number; position: number }> {
  const encodedSiteUrl = encodeURIComponent(siteUrl);
  const url = `${SEARCH_ANALYTICS_API_BASE}/sites/${encodedSiteUrl}/searchAnalytics/query`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dataState: "final",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch site performance: ${error}`);
  }

  const data = await response.json();
  
  if (data.rows && data.rows.length > 0) {
    return {
      clicks: data.rows[0].clicks || 0,
      impressions: data.rows[0].impressions || 0,
      ctr: data.rows[0].ctr || 0,
      position: data.rows[0].position || 0,
    };
  }

  return { clicks: 0, impressions: 0, ctr: 0, position: 0 };
}

/**
 * Sync Search Console data for a user
 */
export async function syncSearchConsoleData(userId: number): Promise<{
  success: boolean;
  domainsUpdated: number;
  keywordsUpdated: number;
  error?: string;
}> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const accessToken = await getValidAccessToken(userId);
    
    // Get user's tracked domains
    const domains = await db.select().from(trackedDomains).where(eq(trackedDomains.userId, userId));

    if (domains.length === 0) {
      return { success: true, domainsUpdated: 0, keywordsUpdated: 0 };
    }

    let domainsUpdated = 0;
    let keywordsUpdated = 0;

    // Calculate date range (last 7 days, excluding today)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);

    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    for (const domain of domains) {
      if (!domain.searchConsoleProperty) continue;

      try {
        // Fetch overall site performance
        const sitePerformance = await fetchSitePerformance(
          accessToken,
          domain.searchConsoleProperty,
          formatDate(startDate),
          formatDate(endDate)
        );

        // Save domain history
        await db.insert(domainHistory).values({
          domainId: domain.id,
          date: endDate,
          totalClicks: sitePerformance.clicks,
          totalImpressions: sitePerformance.impressions,
          avgPosition: String(sitePerformance.position),
          avgCtr: String(sitePerformance.ctr),
        });

        domainsUpdated++;

        // Fetch keyword-level data
        const keywordData = await fetchSearchAnalytics(
          accessToken,
          domain.searchConsoleProperty,
          formatDate(startDate),
          formatDate(endDate),
          ["query"],
          500
        );

        if (keywordData.rows) {
          for (const row of keywordData.rows) {
            const keyword = row.keys[0];

            // Find or create tracked keyword
            const existingKeywords = await db.select().from(trackedKeywords).where(
              and(
                eq(trackedKeywords.domainId, domain.id),
                eq(trackedKeywords.keyword, keyword)
              )
            ).limit(1);

            let keywordId: number;

            if (existingKeywords.length === 0) {
              const inserted = await db.insert(trackedKeywords).values({
                userId,
                domainId: domain.id,
                keyword,
              }).returning();
              keywordId = inserted[0].id;
            } else {
              keywordId = existingKeywords[0].id;
            }

            // Save keyword history
            await db.insert(keywordHistory).values({
              keywordId,
              date: endDate,
              position: String(row.position),
              clicks: row.clicks,
              impressions: row.impressions,
              ctr: String(row.ctr),
            });

            keywordsUpdated++;
          }
        }
      } catch (domainError) {
        console.error(`Error syncing domain ${domain.domain}:`, domainError);
      }
    }

    return { success: true, domainsUpdated, keywordsUpdated };
  } catch (error) {
    console.error("Search Console sync error:", error);
    return {
      success: false,
      domainsUpdated: 0,
      keywordsUpdated: 0,
      error: String(error),
    };
  }
}

/**
 * Save Google tokens for a user
 */
export async function saveGoogleTokens(
  userId: number,
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const expiry = new Date(Date.now() + expiresIn * 1000);

  await db
    .update(users)
    .set({
      googleAccessToken: accessToken,
      googleRefreshToken: refreshToken,
      googleTokenExpiry: expiry,
    })
    .where(eq(users.id, userId));
}
