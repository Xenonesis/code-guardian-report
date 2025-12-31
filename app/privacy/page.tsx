import type { Metadata } from "next";
import PrivacyPageWrapper from "./PrivacyPageWrapper";

// Force dynamic rendering to prevent SSR issues with browser APIs
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy - Code Guardian Enterprise",
  description:
    "Privacy policy for Code Guardian Enterprise. Learn how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return <PrivacyPageWrapper />;
}
