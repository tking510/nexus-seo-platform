import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** Google OAuth refresh token for Search Console API access */
  googleRefreshToken: text("googleRefreshToken"),
  /** Google OAuth access token */
  googleAccessToken: text("googleAccessToken"),
  /** Google token expiry timestamp */
  googleTokenExpiry: timestamp("googleTokenExpiry"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tracked domains - domains the user wants to monitor
 */
export const trackedDomains = mysqlTable("tracked_domains", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  domain: varchar("domain", { length: 255 }).notNull(),
  /** Google Search Console property URL (e.g., sc-domain:example.com) */
  searchConsoleProperty: varchar("searchConsoleProperty", { length: 500 }),
  isVerified: boolean("isVerified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrackedDomain = typeof trackedDomains.$inferSelect;
export type InsertTrackedDomain = typeof trackedDomains.$inferInsert;

/**
 * Tracked keywords - keywords the user wants to monitor
 */
export const trackedKeywords = mysqlTable("tracked_keywords", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  domainId: int("domainId").notNull(),
  keyword: varchar("keyword", { length: 500 }).notNull(),
  targetUrl: varchar("targetUrl", { length: 2000 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrackedKeyword = typeof trackedKeywords.$inferSelect;
export type InsertTrackedKeyword = typeof trackedKeywords.$inferInsert;

/**
 * Keyword ranking history - daily snapshots of keyword performance
 */
export const keywordHistory = mysqlTable("keyword_history", {
  id: int("id").autoincrement().primaryKey(),
  keywordId: int("keywordId").notNull(),
  /** Date of the snapshot */
  date: timestamp("date").notNull(),
  /** Google Search position (average) */
  position: decimal("position", { precision: 5, scale: 2 }),
  /** Number of clicks from Google Search */
  clicks: int("clicks"),
  /** Number of impressions in Google Search */
  impressions: int("impressions"),
  /** Click-through rate */
  ctr: decimal("ctr", { precision: 5, scale: 4 }),
  /** AI visibility scores as JSON */
  aiVisibility: json("aiVisibility"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type KeywordHistory = typeof keywordHistory.$inferSelect;
export type InsertKeywordHistory = typeof keywordHistory.$inferInsert;

/**
 * Domain metrics history - daily snapshots of domain performance
 */
export const domainHistory = mysqlTable("domain_history", {
  id: int("id").autoincrement().primaryKey(),
  domainId: int("domainId").notNull(),
  /** Date of the snapshot */
  date: timestamp("date").notNull(),
  /** Total clicks from Google Search */
  totalClicks: int("totalClicks"),
  /** Total impressions in Google Search */
  totalImpressions: int("totalImpressions"),
  /** Average position across all keywords */
  avgPosition: decimal("avgPosition", { precision: 5, scale: 2 }),
  /** Average CTR */
  avgCtr: decimal("avgCtr", { precision: 5, scale: 4 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DomainHistory = typeof domainHistory.$inferSelect;
export type InsertDomainHistory = typeof domainHistory.$inferInsert;

/**
 * PageSpeed metrics - Core Web Vitals and performance scores
 */
export const pageSpeedHistory = mysqlTable("pagespeed_history", {
  id: int("id").autoincrement().primaryKey(),
  domainId: int("domainId").notNull(),
  url: varchar("url", { length: 2000 }).notNull(),
  /** Date of the test */
  date: timestamp("date").notNull(),
  /** Performance score (0-100) */
  performanceScore: int("performanceScore"),
  /** Accessibility score (0-100) */
  accessibilityScore: int("accessibilityScore"),
  /** Best practices score (0-100) */
  bestPracticesScore: int("bestPracticesScore"),
  /** SEO score (0-100) */
  seoScore: int("seoScore"),
  /** Largest Contentful Paint (ms) */
  lcp: int("lcp"),
  /** First Input Delay (ms) */
  fid: int("fid"),
  /** Cumulative Layout Shift (score * 1000) */
  cls: int("cls"),
  /** Time to First Byte (ms) */
  ttfb: int("ttfb"),
  /** First Contentful Paint (ms) */
  fcp: int("fcp"),
  /** Speed Index (ms) */
  speedIndex: int("speedIndex"),
  /** Total Blocking Time (ms) */
  tbt: int("tbt"),
  /** Raw Lighthouse data as JSON */
  rawData: json("rawData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PageSpeedHistory = typeof pageSpeedHistory.$inferSelect;
export type InsertPageSpeedHistory = typeof pageSpeedHistory.$inferInsert;

/**
 * Data sync jobs - track scheduled data updates
 */
export const syncJobs = mysqlTable("sync_jobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  jobType: mysqlEnum("jobType", ["search_console", "pagespeed", "ai_visibility"]).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  lastRunAt: timestamp("lastRunAt"),
  nextRunAt: timestamp("nextRunAt"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SyncJob = typeof syncJobs.$inferSelect;
export type InsertSyncJob = typeof syncJobs.$inferInsert;
