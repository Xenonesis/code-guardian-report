"use client";

import dynamic from "next/dynamic";

const PWASettingsPageClient = dynamic(() => import("./PWASettingsPageClient"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  ),
});

export default function PWASettingsPageWrapper() {
  return <PWASettingsPageClient />;
}
