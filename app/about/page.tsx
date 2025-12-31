import type { Metadata } from "next";
import AboutPageWrapper from "./AboutPageWrapper";

// Force dynamic rendering to prevent SSR issues with browser APIs
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About - Code Guardian Enterprise",
  description:
    "Learn about Code Guardian Enterprise, the AI-powered security analysis platform trusted by developers worldwide.",
};

export default function AboutPage() {
  return <AboutPageWrapper />;
}
