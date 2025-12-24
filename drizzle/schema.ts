import { integer, pgEnum, pgTable, text, timestamp, varchar, decimal, json, boolean, serial } from "drizzle-orm/pg-core";

// Enums for PostgreSQL
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const jobTypeEnum = pgEnum("job_type", ["search_console", "pagespeed", "ai_visibility"]);
export const statusEnum = pgEnum("status", ["pending", "running", "completed", "failed"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  /** Google OAuth refresh token for Search Console API access */
  googleRefreshToken: text("google_refresh_token"),
  /** Google OAuth access token */
  googleAccessToken: text("google_access_token"),
  /** Google token expiry timestamp */
  googleTokenExpiry: timestamp("google_token_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tracked domains - domains the user wants to monitor
 */
export const trackedDomains = pgTable("tracked_domains", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  domain: varchar("domain", { length: 255 }).notNull(),
  /** Google Search Console property URL (e.g., sc-domain:example.com) */
  searchConsoleProperty: varchar("search_console_property", { length: 500 }),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TrackedDomain = typeof trackedDomains.$inferSelect;
export type InsertTrackedDomain = typeof trackedDomains.$inferInsert;

/**
 * Tracked keywords - keywords the user wants to monitor
 */
export const trackedKeywords = pgTable("tracked_keywords", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  domainId: integer("domain_id").notNull(),
  keyword: varchar("keyword", { length: 500 }).notNull(),
  targetUrl: varchar("target_url", { length: 2000 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TrackedKeyword = typeof trackedKeywords.$inferSelect;
export type InsertTrackedKeyword = typeof trackedKeywords.$inferInsert;

/**
 * Keyword ranking history - daily snapshots of keyword performance
 */
export const keywordHistory = pgTable("keyword_history", {
  id: serial("id").primaryKey(),
  keywordId: integer("keyword_id").notNull(),
  /** Date of the snapshot */
  date: timestamp("date").notNull(),
  /** Google Search position (average) */
  position: decimal("position", { precision: 5, scale: 2 }),
  /** Number of clicks from Google Search */
  clicks: integer("clicks"),
  /** Number of impressions in Google Search */
  impressions: integer("impressions"),
  /** Click-through rate */
  ctr: decimal("ctr", { precision: 5, scale: 4 }),
  /** AI visibility scores as JSON */
  aiVisibility: json("ai_visibility"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type KeywordHistory = typeof keywordHistory.$inferSelect;
export type InsertKeywordHistory = typeof keywordHistory.$inferInsert;

/**
 * Domain metrics history - daily snapshots of domain performance
 */
export const domainHistory = pgTable("domain_history", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull(),
  /** Date of the snapshot */
  date: timestamp("date").notNull(),
  /** Total clicks from Google Search */
  totalClicks: integer("total_clicks"),
  /** Total impressions in Google Search */
  totalImpressions: integer("total_impressions"),
  /** Average position across all keywords */
  avgPosition: decimal("avg_position", { precision: 5, scale: 2 }),
  /** Average CTR */
  avgCtr: decimal("avg_ctr", { precision: 5, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DomainHistory = typeof domainHistory.$inferSelect;
export type InsertDomainHistory = typeof domainHistory.$inferInsert;

/**
 * PageSpeed metrics - Core Web Vitals and performance scores
 */
export const pageSpeedHistory = pgTable("pagespeed_history", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull(),
  url: varchar("url", { length: 2000 }).notNull(),
  /** Date of the test */
  date: timestamp("date").notNull(),
  /** Performance score (0-100) */
  performanceScore: integer("performance_score"),
  /** Accessibility score (0-100) */
  accessibilityScore: integer("accessibility_score"),
  /** Best practices score (0-100) */
  bestPracticesScore: integer("best_practices_score"),
  /** SEO score (0-100) */
  seoScore: integer("seo_score"),
  /** Largest Contentful Paint (ms) */
  lcp: integer("lcp"),
  /** First Input Delay (ms) */
  fid: integer("fid"),
  /** Cumulative Layout Shift (score * 1000) */
  cls: integer("cls"),
  /** Time to First Byte (ms) */
  ttfb: integer("ttfb"),
  /** First Contentful Paint (ms) */
  fcp: integer("fcp"),
  /** Speed Index (ms) */
  speedIndex: integer("speed_index"),
  /** Total Blocking Time (ms) */
  tbt: integer("tbt"),
  /** Raw Lighthouse data as JSON */
  rawData: json("raw_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PageSpeedHistory = typeof pageSpeedHistory.$inferSelect;
export type InsertPageSpeedHistory = typeof pageSpeedHistory.$inferInsert;

/**
 * Data sync jobs - track scheduled data updates
 */
export const syncJobs = pgTable("sync_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  jobType: jobTypeEnum("job_type").notNull(),
  status: statusEnum("status").default("pending").notNull(),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SyncJob = typeof syncJobs.$inferSelect;
export type InsertSyncJob = typeof syncJobs.$inferInsert;
