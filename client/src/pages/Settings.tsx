/*
 * Settings Page - Google Search Console連携とドメイン管理
 */

import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Globe,
  Link2,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Database,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export default function Settings() {
  const [newDomain, setNewDomain] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [selectedDomainId, setSelectedDomainId] = useState<number | null>(null);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  // tRPC queries
  const { data: domainsData, refetch: refetchDomains } = trpc.domains.list.useQuery();
  const { data: keywordsData, refetch: refetchKeywords } = trpc.keywords.list.useQuery({
    domainId: selectedDomainId || undefined,
  });
  const { data: googleSitesData, refetch: refetchGoogleSites } = trpc.google.listSites.useQuery();

  // tRPC mutations
  const addDomainMutation = trpc.domains.add.useMutation();
  const deleteDomainMutation = trpc.domains.delete.useMutation();
  const addKeywordMutation = trpc.keywords.add.useMutation();
  const deleteKeywordMutation = trpc.keywords.delete.useMutation();
  const syncDataMutation = trpc.google.syncData.useMutation();
  const syncPageSpeedMutation = trpc.pageSpeed.syncAll.useMutation();
  const getAuthUrlQuery = trpc.google.getAuthUrl.useQuery({
    redirectUri: `${window.location.origin}/settings/google-callback`,
  });

  // Google OAuth接続
  const handleConnectGoogle = () => {
    if (getAuthUrlQuery.data?.authUrl) {
      setIsConnectingGoogle(true);
      window.location.href = getAuthUrlQuery.data.authUrl;
    } else {
      toast.error("Google認証URLの取得に失敗しました");
    }
  };

  // ドメイン追加
  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      toast.error("ドメインを入力してください");
      return;
    }

    try {
      const result = await addDomainMutation.mutateAsync({
        domain: newDomain.trim(),
      });

      if (result.success) {
        toast.success("ドメインを追加しました");
        setNewDomain("");
        refetchDomains();
      } else {
        toast.error(result.error || "追加に失敗しました");
      }
    } catch (error) {
      toast.error("エラーが発生しました");
    }
  };

  // ドメイン削除
  const handleDeleteDomain = async (id: number) => {
    try {
      const result = await deleteDomainMutation.mutateAsync({ id });
      if (result.success) {
        toast.success("ドメインを削除しました");
        refetchDomains();
      }
    } catch (error) {
      toast.error("削除に失敗しました");
    }
  };

  // キーワード追加
  const handleAddKeyword = async () => {
    if (!newKeyword.trim() || !selectedDomainId) {
      toast.error("キーワードとドメインを選択してください");
      return;
    }

    try {
      const result = await addKeywordMutation.mutateAsync({
        domainId: selectedDomainId,
        keyword: newKeyword.trim(),
      });

      if (result.success) {
        toast.success("キーワードを追加しました");
        setNewKeyword("");
        refetchKeywords();
      } else {
        toast.error(result.error || "追加に失敗しました");
      }
    } catch (error) {
      toast.error("エラーが発生しました");
    }
  };

  // キーワード削除
  const handleDeleteKeyword = async (id: number) => {
    try {
      const result = await deleteKeywordMutation.mutateAsync({ id });
      if (result.success) {
        toast.success("キーワードを削除しました");
        refetchKeywords();
      }
    } catch (error) {
      toast.error("削除に失敗しました");
    }
  };

  // Search Consoleデータ同期
  const handleSyncData = async () => {
    try {
      const result = await syncDataMutation.mutateAsync();
      if (result.success && 'domainsUpdated' in result) {
        toast.success(`同期完了: ${result.domainsUpdated}ドメイン、${result.keywordsUpdated}キーワード更新`);
      } else {
        toast.error(result.error || "同期に失敗しました");
      }
    } catch (error) {
      toast.error("同期中にエラーが発生しました");
    }
  };

  // PageSpeed同期
  const handleSyncPageSpeed = async () => {
    try {
      const result = await syncPageSpeedMutation.mutateAsync();
      if (result.success && 'urlsAnalyzed' in result) {
        toast.success(`PageSpeed分析完了: ${result.urlsAnalyzed}URL分析`);
      } else {
        toast.error(result.error || "分析に失敗しました");
      }
    } catch (error) {
      toast.error("分析中にエラーが発生しました");
    }
  };

  const domains = domainsData?.domains || [];
  const keywords = keywordsData?.keywords || [];
  const googleSites = googleSitesData?.sites || [];
  const isGoogleConnected = googleSites.length > 0;

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl p-8"
          style={{
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(34, 211, 238, 0.1) 100%)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <SettingsIcon className="w-5 h-5 text-[#8b5cf6]" />
              <span className="text-xs font-mono text-[#8b5cf6] uppercase tracking-widest">
                設定
              </span>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              データ連携 & 管理
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Google Search Consoleとの連携設定、トラッキング対象のドメインとキーワードを管理します。
            </p>
          </div>
        </motion.div>

        {/* Google Search Console連携 */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl p-6"
          style={{
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-foreground">
                  Google Search Console
                </h2>
                <p className="text-sm text-muted-foreground">
                  検索パフォーマンスデータを自動取得
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isGoogleConnected ? (
                <span className="flex items-center gap-1 text-sm text-[#22c55e]">
                  <CheckCircle className="w-4 h-4" />
                  接続済み
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-[#f59e0b]">
                  <AlertCircle className="w-4 h-4" />
                  未接続
                </span>
              )}
            </div>
          </div>

          {isGoogleConnected ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white/5 border border-border/50">
                <h3 className="text-sm font-mono text-muted-foreground mb-2">接続済みサイト</h3>
                <ul className="space-y-2">
                  {googleSites.map((site, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                      {site}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSyncData}
                  disabled={syncDataMutation.isPending}
                  className="gap-2"
                >
                  {syncDataMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  データを同期
                </Button>
                <Button
                  variant="outline"
                  onClick={handleConnectGoogle}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  再接続
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleConnectGoogle}
              disabled={isConnectingGoogle}
              className="gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed]"
            >
              {isConnectingGoogle ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
              Googleアカウントを接続
            </Button>
          )}
        </motion.div>

        {/* PageSpeed Insights */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl p-6"
          style={{
            background: "linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)",
            border: "1px solid rgba(34, 211, 238, 0.2)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#22d3ee]/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#22d3ee]" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-foreground">
                  PageSpeed Insights
                </h2>
                <p className="text-sm text-muted-foreground">
                  Core Web Vitalsとパフォーマンス分析
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleSyncPageSpeed}
            disabled={syncPageSpeedMutation.isPending || domains.length === 0}
            className="gap-2"
          >
            {syncPageSpeedMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            全ドメインを分析
          </Button>
          {domains.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              ※ 先にドメインを追加してください
            </p>
          )}
        </motion.div>

        {/* ドメイン管理 */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl p-6"
          style={{
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#ec4899]/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-[#ec4899]" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-foreground">
                トラッキング対象ドメイン
              </h2>
              <p className="text-sm text-muted-foreground">
                監視するドメインを追加・管理
              </p>
            </div>
          </div>

          {/* ドメイン追加フォーム */}
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="example.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="flex-1 bg-white/5 border-border/50 font-mono"
            />
            <Button
              onClick={handleAddDomain}
              disabled={addDomainMutation.isPending}
              className="gap-2"
            >
              {addDomainMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              追加
            </Button>
          </div>

          {/* ドメイン一覧 */}
          {domains.length > 0 ? (
            <div className="space-y-2">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedDomainId === domain.id
                      ? "bg-[#8b5cf6]/10 border-[#8b5cf6]/50"
                      : "bg-white/5 border-border/50 hover:bg-white/10"
                  }`}
                  onClick={() => setSelectedDomainId(domain.id)}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#8b5cf6]" />
                    <span className="text-sm text-foreground font-mono">{domain.domain}</span>
                    {domain.isVerified && (
                      <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDomain(domain.id);
                    }}
                    className="text-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef4444]/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              ドメインが登録されていません
            </p>
          )}
        </motion.div>

        {/* キーワード管理 */}
        {selectedDomainId && (
          <motion.div
            variants={itemVariants}
            className="rounded-xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)",
              border: "1px solid rgba(34, 211, 238, 0.2)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#22d3ee]/20 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-[#22d3ee]" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-foreground">
                  トラッキング対象キーワード
                </h2>
                <p className="text-sm text-muted-foreground">
                  選択したドメインのキーワードを管理
                </p>
              </div>
            </div>

            {/* キーワード追加フォーム */}
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                placeholder="キーワードを入力..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                className="flex-1 bg-white/5 border-border/50 font-mono"
              />
              <Button
                onClick={handleAddKeyword}
                disabled={addKeywordMutation.isPending}
                className="gap-2"
              >
                {addKeywordMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                追加
              </Button>
            </div>

            {/* キーワード一覧 */}
            {keywords.length > 0 ? (
              <div className="space-y-2">
                {keywords.map((keyword) => (
                  <div
                    key={keyword.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-border/50"
                  >
                    <span className="text-sm text-foreground font-mono">{keyword.keyword}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteKeyword(keyword.id)}
                      className="text-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef4444]/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                キーワードが登録されていません
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
