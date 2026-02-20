"use client";

import dynamic from "next/dynamic";

const LegalPageClient = dynamic(
  () => import("@/components/pages/legal/LegalPageClient"),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function LegalPageWrapper() {
  return <LegalPageClient />;
}
