"use client";

import { PageShell } from "@/components/PageShell";
import { GitHubAnalysisPage as GitHubAnalysisPageContent } from "@/views/GitHubAnalysisPage";

export default function GitHubAnalysisPageClient() {
  return (
    <PageShell>
      <GitHubAnalysisPageContent />
    </PageShell>
  );
}
