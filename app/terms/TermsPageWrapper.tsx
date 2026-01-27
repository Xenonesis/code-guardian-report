"use client";

import dynamic from "next/dynamic";

const TermsPageClient = dynamic(() => import("./TermsPageClient"), {
  ssr: false,
  loading: () => null,
});

export default function TermsPageWrapper() {
  return <TermsPageClient />;
}
