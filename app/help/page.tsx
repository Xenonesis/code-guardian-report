import type { Metadata } from "next";
import HelpPageWrapper from "./HelpPageWrapper";

// Force dynamic rendering to prevent SSR issues with browser APIs
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Help & Documentation - Code Guardian Enterprise",
  description:
    "Get help with Code Guardian Enterprise. Find documentation, FAQs, and support resources.",
};

export default function HelpPage() {
  return <HelpPageWrapper />;
}
