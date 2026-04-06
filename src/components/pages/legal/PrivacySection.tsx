"use client";

import React from "react";
import {
  LegalSection,
  LegalSubsection,
  LegalList,
} from "@/components/legal/LegalSection";
import { Database, Lock, Eye } from "lucide-react";

export const PrivacySection: React.FC = () => {
  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12">
      <LegalSection
        title="Introduction"
        icon={<Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
      >
        <p>
          Welcome to Code Guardian, an AI-powered code security analysis
          platform. This Privacy Policy explains how we collect, use, protect,
          and share information about you when you use our service. We are
          committed to protecting your privacy and ensuring transparency about
          our data practices.
        </p>
        <p>
          Code Guardian is designed with privacy in mind. We process your code
          locally in your browser whenever possible and only collect the minimum
          data necessary to provide our services effectively.
        </p>
      </LegalSection>

      <LegalSection
        title="Information We Collect"
        icon={<Database className="h-5 w-5" />}
      >
        <LegalSubsection title="Code Analysis Data">
          <p>
            When you use our code analysis features, we may temporarily process:
          </p>
          <LegalList
            items={[
              "Source code files you upload for analysis",
              "Analysis results and security findings",
              "File metadata (names, sizes, types)",
              "Analysis preferences and settings",
            ]}
          />
          <p className="mt-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <strong>Important:</strong> Your source code is processed locally in
            your browser whenever possible. We do not permanently store your
            source code on our servers.
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection
        title="Data Protection & Security"
        icon={<Lock className="h-5 w-5" />}
      >
        <LegalSubsection title="Security Measures">
          <p>
            We implement industry-standard security measures to protect your
            data:
          </p>
          <LegalList
            items={[
              "End-to-end encryption for data transmission",
              "Secure browser-based processing when possible",
              "Regular security audits and vulnerability assessments",
              "Access controls and authentication mechanisms",
              "Secure data storage with encryption at rest",
            ]}
          />
        </LegalSubsection>
      </LegalSection>

      <LegalSection
        title="Data Retention and Deletion"
        icon={<Database className="h-5 w-5" />}
      >
        <LegalSubsection title="Retention Windows">
          <LegalList
            items={[
              "Analysis history and user telemetry are retained for limited operational periods and purged on schedule.",
              "Push subscription endpoints are removed after prolonged inactivity.",
              "Public analysis artifacts are retained for collaboration and may be refreshed or removed as project policy evolves.",
            ]}
          />
        </LegalSubsection>
        <LegalSubsection title="Deletion Requests">
          <p>
            You may request account data deletion through support channels. We
            verify ownership, process deletion across owner-bound collections,
            and retain a minimal audit marker for compliance and
            incident-forensics integrity.
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection
        title="Your Privacy Rights"
        icon={<Eye className="h-5 w-5" />}
      >
        <LegalSubsection title="Regional Rights (GDPR/CCPA-aligned)">
          <LegalList
            items={[
              "Access: Request a copy of your account and analysis metadata.",
              "Correction: Request updates for inaccurate profile information.",
              "Deletion: Request removal of eligible personal data.",
              "Restriction/Objection: Request limitations on processing where legally applicable.",
            ]}
          />
        </LegalSubsection>
      </LegalSection>
    </div>
  );
};

export default PrivacySection;
