import type { Metadata } from "next";
import GitHubAnalysisPageWrapper from "./GitHubAnalysisPageWrapper";

export const metadata: Metadata = {
  title: "GitHub Repository Analysis - Code Guardian Enterprise",
  description:
    "Analyze GitHub repositories for security vulnerabilities. Connect your GitHub account and scan your code.",
};

export default function GitHubAnalysisPage() {
  return <GitHubAnalysisPageWrapper />;
}
