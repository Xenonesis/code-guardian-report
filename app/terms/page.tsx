import type { Metadata } from "next";
import TermsPageWrapper from "./TermsPageWrapper";

// Force dynamic rendering to prevent SSR issues with browser APIs
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms of Service - Code Guardian Enterprise",
  description:
    "Terms of service for Code Guardian Enterprise. Read our terms and conditions for using the platform.",
};

export default function TermsPage() {
  return <TermsPageWrapper />;
}
