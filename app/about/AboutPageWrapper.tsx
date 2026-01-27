"use client";

import dynamic from "next/dynamic";

const AboutPageClient = dynamic(() => import("./AboutPageClient"), {
  ssr: false,
  loading: () => null,
});

export default function AboutPageWrapper() {
  return <AboutPageClient />;
}
