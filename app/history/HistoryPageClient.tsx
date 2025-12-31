"use client";

import { PageShell } from "@/components/PageShell";
import { HistoryPage as HistoryPageContent } from "@/views/HistoryPage";
import { useNavigation } from "@/lib/navigation-context";
import { useEnhancedAnalysis } from "@/hooks/useEnhancedAnalysis";
import { useRouter } from "next/navigation";
import type { FirebaseAnalysisData } from "@/services/storage/firebaseAnalysisStorage";

export default function HistoryPageClient() {
  const router = useRouter();
  const { navigateTo } = useNavigation();
  const { restoreFromHistory } = useEnhancedAnalysis();

  const handleAnalysisSelect = (analysis: FirebaseAnalysisData) => {
    if (analysis) {
      const storedData = {
        ...analysis,
        timestamp: analysis.timestamp.toMillis(),
        version: "2",
        metadata: {
          userAgent: "",
          analysisEngine: "",
          engineVersion: "",
          sessionId: "",
        },
      };
      restoreFromHistory(storedData);
      navigateTo("home", "results");
      router.push("/");
    }
  };

  const handleNavigateBack = () => {
    router.push("/");
  };

  return (
    <PageShell>
      <HistoryPageContent
        onAnalysisSelect={handleAnalysisSelect}
        onNavigateBack={handleNavigateBack}
      />
    </PageShell>
  );
}
