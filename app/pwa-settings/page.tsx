import type { Metadata } from "next";
import PWASettingsPageWrapper from "./PWASettingsPageWrapper";

export const metadata: Metadata = {
  title: "PWA Settings - Code Guardian Enterprise",
  description:
    "Configure Progressive Web App settings, notifications, and offline functionality.",
};

export default function PWASettingsPage() {
  return <PWASettingsPageWrapper />;
}
