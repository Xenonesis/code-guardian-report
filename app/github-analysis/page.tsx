import type { Metadata } from "next";
import GitHubAnalysisPageWrapper from "./GitHubAnalysisPageWrapper";

// Force dynamic rendering to prevent SSR issues with browser APIs
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GitHub Repository Analysis - Code Guardian Enterprise",
  description:
    "Analyze GitHub repositories for security vulnerabilities. Connect your GitHub account and scan your code.",
};

export default function GitHubAnalysisPage() {
  return <GitHubAnalysisPageWrapper />;
}
