"use client";

import { PageShell } from "@/components/PageShell";
import { PWASettingsPage as PWASettingsPageContent } from "@/views/PWASettingsPage";

export default function PWASettingsPageClient() {
  return (
    <PageShell>
      <PWASettingsPageContent />
    </PageShell>
  );
}
