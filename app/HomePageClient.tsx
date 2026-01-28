"use client";

import { useDarkMode } from "@/hooks/useDarkMode";
import HomeSection from "@/components/pages/home/HomeSection";

export default function HomePageClient() {
  const { theme } = useDarkMode();

  return <HomeSection theme={theme} />;
}
