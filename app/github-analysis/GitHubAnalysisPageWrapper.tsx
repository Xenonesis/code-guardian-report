"use client";

import dynamic from "next/dynamic";

const GitHubAnalysisPageClient = dynamic(
  () => import("./GitHubAnalysisPageClient"),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function GitHubAnalysisPageWrapper() {
  return <GitHubAnalysisPageClient />;
}
