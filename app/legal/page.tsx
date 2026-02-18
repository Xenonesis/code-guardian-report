import type { Metadata } from "next";
import LegalPageWrapper from "./LegalPageWrapper";

// Force dynamic rendering to prevent SSR issues with browser APIs
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Legal - Code Guardian Enterprise",
  description:
    "Legal information for Code Guardian Enterprise, including Privacy Policy and Terms of Service.",
};

export default function LegalPage() {
  return <LegalPageWrapper />;
}
