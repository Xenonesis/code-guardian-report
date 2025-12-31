import type { Metadata } from "next";
import PWASettingsPageWrapper from "./PWASettingsPageWrapper";

// Force dynamic rendering to prevent SSR issues with browser APIs
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PWA Settings - Code Guardian Enterprise",
  description:
    "Configure Progressive Web App settings, notifications, and offline functionality.",
};

export default function PWASettingsPage() {
  return <PWASettingsPageWrapper />;
}
