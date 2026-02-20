import { Metadata } from "next";
import ChangelogPageClient from "@/components/pages/changelog/ChangelogPageClient";

export const metadata: Metadata = {
  title: "Changelog - Code Guardian",
  description:
    "Track the latest updates, improvements, and fixes for Code Guardian.",
};

export default function ChangelogPage() {
  return <ChangelogPageClient />;
}
