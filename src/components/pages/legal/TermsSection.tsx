"use client";

import React from "react";
import {
  LegalSection,
  LegalSubsection,
  LegalList,
} from "@/components/legal/LegalSection";
import { FileText, Shield, Users, AlertTriangle } from "lucide-react";

export const TermsSection: React.FC = () => {
  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12">
      <LegalSection
        title="Agreement to Terms"
        icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5" />}
      >
        <p>
          Welcome to Code Guardian, an AI-powered code security analysis
          platform. These Terms of Service ("Terms") govern your use of our
          website and services. By accessing or using Code Guardian, you agree
          to be bound by these Terms.
        </p>
        <p>
          If you do not agree to these Terms, please do not use our service. We
          may update these Terms from time to time, and your continued use
          constitutes acceptance of any changes.
        </p>

        <div className="border-border bg-muted dark:border-border mt-6 rounded-lg border p-4 dark:bg-teal-900/20">
          <p className="font-medium text-blue-900 dark:text-blue-100">
            <strong>Important:</strong> Code Guardian is provided as a free
            service for educational and professional use. Commercial use may
            require additional agreements.
          </p>
        </div>
      </LegalSection>

      <LegalSection
        title="Service Description"
        icon={<Shield className="h-5 w-5" />}
      >
        <LegalSubsection title="What We Provide">
          <p>Code Guardian offers the following services:</p>
          <LegalList
            items={[
              "AI-powered code security analysis and vulnerability detection",
              "Static code analysis for multiple programming languages",
              "Integration with popular AI services (OpenAI, Anthropic)",
              "Real-time analysis results and recommendations",
              "Export capabilities for analysis reports",
              "Educational resources and security best practices",
            ]}
          />
        </LegalSubsection>
      </LegalSection>

      <LegalSection
        title="User Responsibilities"
        icon={<Users className="h-5 w-5" />}
      >
        <LegalSubsection title="Acceptable Use">
          <p>When using Code Guardian, you agree to:</p>
          <LegalList
            items={[
              "Use the service only for lawful purposes",
              "Respect intellectual property rights",
              "Not attempt to reverse engineer or hack the platform",
              "Not upload malicious code or content",
              "Comply with all applicable laws and regulations",
              "Use your own API keys for third-party AI services",
            ]}
          />
        </LegalSubsection>
      </LegalSection>

      <LegalSection
        title="Disclaimers & Limitations"
        icon={<AlertTriangle className="h-5 w-5" />}
      >
        <LegalSubsection title="Service Disclaimers">
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <p className="font-medium text-yellow-900 dark:text-yellow-100">
              <strong>Important:</strong> Code Guardian is provided "as is"
              without warranties of any kind.
            </p>
          </div>
          <LegalList
            items={[
              "We do not guarantee the accuracy of security analysis results",
              "Analysis results should not be the sole basis for security decisions",
              "We are not responsible for decisions made based on our analysis",
              "Third-party AI services have their own limitations and terms",
              "No warranty of merchantability or fitness for a particular purpose",
            ]}
          />
        </LegalSubsection>
      </LegalSection>
    </div>
  );
};

export default TermsSection;
