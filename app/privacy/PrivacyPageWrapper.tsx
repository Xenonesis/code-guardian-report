"use client";

import dynamic from "next/dynamic";

const PrivacyPageClient = dynamic(() => import("./PrivacyPageClient"), {
  ssr: false,
  loading: () => null,
});

export default function PrivacyPageWrapper() {
  return <PrivacyPageClient />;
}
