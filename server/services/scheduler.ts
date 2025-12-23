/**
 * 毎日自動更新スケジューラー
 * 登録されたドメインのSearch ConsoleデータとPageSpeedデータを毎日更新
 */

import { getDb } from '../db';
import { trackedDomains, pageSpeedHistory } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { fetchPageSpeedInsights, PageSpeedMetrics } from './pageSpeedInsights';

export class SchedulerService {
  private static isRunning = false;
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * スケジューラーを開始
   * 毎日午前3時（JST）に自動更新を実行
   */
  static start() {
    if (this.isRunning) {
      console.log('[Scheduler] Already running');
      return;
    }

    this.isRunning = true;
    console.log('[Scheduler] Started - Daily updates enabled');

    // 初回実行（サーバー起動時）- 5分後に実行
    setTimeout(() => {
      this.runDailyUpdate().catch(console.error);
    }, 5 * 60 * 1000);

    // 24時間ごとに実行（86400000ms = 24時間）
    this.intervalId = setInterval(() => {
      this.runDailyUpdate().catch(console.error);
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * スケジューラーを停止
   */
  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('[Scheduler] Stopped');
  }

  /**
   * 毎日の更新処理を実行
   */
  static async runDailyUpdate() {
    console.log('[Scheduler] Starting daily update...', new Date().toISOString());

    try {
      const db = await getDb();
      if (!db) {
        console.error('[Scheduler] Database not available');
        return;
      }
      
      // すべてのドメインを取得
      const domains = await db
        .select()
        .from(trackedDomains);

      console.log(`[Scheduler] Found ${domains.length} domains to update`);

      for (const domain of domains) {
        try {
          // PageSpeed Insightsデータを更新
          await this.updatePageSpeedData(domain.domain, domain.id);
          
          console.log(`[Scheduler] Updated data for ${domain.domain}`);
        } catch (error) {
          console.error(`[Scheduler] Error updating ${domain.domain}:`, error);
        }
      }

      console.log('[Scheduler] Daily update completed', new Date().toISOString());
    } catch (error) {
      console.error('[Scheduler] Daily update failed:', error);
    }
  }

  /**
   * 特定ドメインのPageSpeedデータを更新
   */
  private static async updatePageSpeedData(domain: string, domainId: number) {
    try {
      const url = domain.startsWith('http') ? domain : `https://${domain}`;
      
      // モバイルとデスクトップの両方を分析
      const [mobileResult, desktopResult] = await Promise.all([
        fetchPageSpeedInsights(url, 'mobile').catch(() => null),
        fetchPageSpeedInsights(url, 'desktop').catch(() => null),
      ]);

      const db = await getDb();
      if (!db) return null;

      const now = new Date();

      // モバイルデータを保存
      if (mobileResult) {
        await db.insert(pageSpeedHistory).values({
          domainId,
          url: `${url} (mobile)`,
          date: now,
          performanceScore: mobileResult.performanceScore,
          accessibilityScore: mobileResult.accessibilityScore,
          bestPracticesScore: mobileResult.bestPracticesScore,
          seoScore: mobileResult.seoScore,
          fcp: mobileResult.fcp,
          lcp: mobileResult.lcp,
          cls: mobileResult.cls,
          tbt: mobileResult.tbt,
          speedIndex: mobileResult.speedIndex,
        });
      }

      // デスクトップデータを保存
      if (desktopResult) {
        await db.insert(pageSpeedHistory).values({
          domainId,
          url: `${url} (desktop)`,
          date: now,
          performanceScore: desktopResult.performanceScore,
          accessibilityScore: desktopResult.accessibilityScore,
          bestPracticesScore: desktopResult.bestPracticesScore,
          seoScore: desktopResult.seoScore,
          fcp: desktopResult.fcp,
          lcp: desktopResult.lcp,
          cls: desktopResult.cls,
          tbt: desktopResult.tbt,
          speedIndex: desktopResult.speedIndex,
        });
      }

      return { mobile: mobileResult, desktop: desktopResult };
    } catch (error) {
      console.error(`[Scheduler] PageSpeed update failed for ${domain}:`, error);
      return null;
    }
  }

  /**
   * 手動で更新を実行
   */
  static async manualUpdate(domain: string, domainId: number) {
    console.log(`[Scheduler] Manual update requested for ${domain}`);
    return this.updatePageSpeedData(domain, domainId);
  }

  /**
   * スケジューラーの状態を取得
   */
  static getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.intervalId ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
    };
  }
}

// サーバー起動時にスケジューラーを自動開始
if (process.env.NODE_ENV === 'production') {
  SchedulerService.start();
}
