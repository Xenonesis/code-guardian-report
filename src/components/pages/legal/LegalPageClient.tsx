"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { PrivacySection } from "@/components/pages/legal/PrivacySection";
import { TermsSection } from "@/components/pages/legal/TermsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, Shield, FileText } from "lucide-react";

export default function LegalPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("privacy");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === "privacy" || tab === "terms")) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without full reload
    const newUrl = `/legal?tab=${value}`;
    router.push(newUrl, { scroll: false });
  };

  const getPageDetails = () => {
    if (activeTab === "privacy") {
      return {
        title: "Privacy Policy",
        subtitle:
          "Your privacy is our priority. Learn how we protect and handle your data.",
        icon: <Shield className="h-8 w-8" />,
      };
    } else {
      return {
        title: "Terms of Service",
        subtitle:
          "Please read these terms carefully before using Code Guardian.",
        icon: <Scale className="h-8 w-8" />,
      };
    }
  };

  const details = getPageDetails();

  return (
    <LegalPageLayout
      title={details.title}
      subtitle={details.subtitle}
      lastUpdated="November 28, 2025"
      icon={details.icon}
    >
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="mx-auto mb-8 grid w-full grid-cols-2 sm:w-[400px]">
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy Policy
          </TabsTrigger>
          <TabsTrigger value="terms" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Terms of Service
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="privacy"
          className="animate-in fade-in-50 slide-in-from-bottom-2 mt-0 duration-500"
        >
          <PrivacySection />
        </TabsContent>
        <TabsContent
          value="terms"
          className="animate-in fade-in-50 slide-in-from-bottom-2 mt-0 duration-500"
        >
          <TermsSection />
        </TabsContent>
      </Tabs>
    </LegalPageLayout>
  );
}
