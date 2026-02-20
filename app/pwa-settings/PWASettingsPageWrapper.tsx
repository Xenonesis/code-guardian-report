"use client";

import dynamic from "next/dynamic";

const PWASettingsPageClient = dynamic(() => import("./PWASettingsPageClient"), {
  ssr: false,
});

export default function PWASettingsPageWrapper() {
  return <PWASettingsPageClient />;
}
