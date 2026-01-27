"use client";

import dynamic from "next/dynamic";

const HelpPageClient = dynamic(() => import("./HelpPageClient"), {
  ssr: false,
  loading: () => null,
});

export default function HelpPageWrapper() {
  return <HelpPageClient />;
}
