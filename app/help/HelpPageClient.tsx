"use client";

import { PageShell } from "@/components/PageShell";
import { HelpPage as HelpPageContent } from "@/components/HelpPage";

export default function HelpPageClient() {
  return (
    <PageShell>
      <HelpPageContent />
    </PageShell>
  );
}
