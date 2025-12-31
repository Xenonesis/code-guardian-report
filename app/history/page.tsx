import type { Metadata } from "next";
import HistoryPageWrapper from "./HistoryPageWrapper";

// Force dynamic rendering to prevent SSR issues with browser APIs
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Analysis History - Code Guardian Enterprise",
  description:
    "View your code security analysis history. Access past reports and track your security improvements.",
};

export default function HistoryPage() {
  return <HistoryPageWrapper />;
}
