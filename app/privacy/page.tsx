import type { Metadata } from "next";
import Link from "next/link";
import { Shield } from "lucide-react";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { PrivacySection } from "@/components/pages/legal/PrivacySection";

export const metadata: Metadata = {
  title: "Privacy Policy - Code Guardian Enterprise",
  description:
    "Privacy policy for Code Guardian Enterprise, including data retention, deletion workflow, and user privacy rights.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="How we process, protect, retain, and delete service data."
      lastUpdated="April 6, 2026"
      icon={<Shield className="h-8 w-8" />}
    >
      <PrivacySection />

      <div className="border-border/60 bg-muted/40 mt-10 rounded-lg border p-5 text-sm">
        <p className="mb-2 font-semibold">Need additional legal details?</p>
        <p className="text-muted-foreground">
          Review terms, limitations, and service obligations on the legal page.
        </p>
        <Link
          href="/legal?tab=terms"
          className="text-primary mt-3 inline-block font-mono text-xs tracking-wide uppercase underline underline-offset-4"
        >
          View Terms of Service
        </Link>
      </div>
    </LegalPageLayout>
  );
}
