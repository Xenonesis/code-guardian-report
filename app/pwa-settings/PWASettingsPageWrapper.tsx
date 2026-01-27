"use client";

import dynamic from "next/dynamic";

const PWASettingsPageClient = dynamic(() => import("./PWASettingsPageClient"), {
  ssr: false,
  loading: () => null,
});

export default function PWASettingsPageWrapper() {
  return <PWASettingsPageClient />;
}
