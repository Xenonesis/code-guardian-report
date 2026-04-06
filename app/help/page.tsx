import type { Metadata } from "next";
import HelpPageWrapper from "./HelpPageWrapper";

export const metadata: Metadata = {
  title: "Help & Documentation - Code Guardian Enterprise",
  description:
    "Get help with Code Guardian Enterprise. Find documentation, FAQs, and support resources.",
};

export default function HelpPage() {
  return <HelpPageWrapper />;
}
