"use client";

import dynamic from "next/dynamic";

const HomePageClient = dynamic(() => import("./HomePageClient"), {
  ssr: false,
  loading: () => null,
});

export default function HomePageWrapper() {
  return <HomePageClient />;
}
