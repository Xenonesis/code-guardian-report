"use client";

import dynamic from "next/dynamic";

const HistoryPageClient = dynamic(() => import("./HistoryPageClient"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  ),
});

export default function HistoryPageWrapper() {
  return <HistoryPageClient />;
}
