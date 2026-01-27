"use client";

import dynamic from "next/dynamic";

const HistoryPageClient = dynamic(() => import("./HistoryPageClient"), {
  ssr: false,
  loading: () => null,
});

export default function HistoryPageWrapper() {
  return <HistoryPageClient />;
}
