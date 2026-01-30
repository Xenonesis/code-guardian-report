"use client";

import React from "react";
import {
  LegalSection,
  LegalSubsection,
  LegalList,
} from "@/components/legal/LegalSection";
import { AnimatedBackground } from "@/components/pages/about/AnimatedBackground";
import { Shield, Eye, Database, Lock, Mail, Globe } from "lucide-react";

export const PrivacySection: React.FC = () => {
  return (
    <section id="privacy" className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 pt-12 sm:pt-16">
        <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-4xl">
            {/* Privacy Header */}
            <div className="mb-8 text-center sm:mb-12 lg:mb-16">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 sm:mb-6 sm:h-16 sm:w-16 dark:bg-blue-900/30">
                <Shield className="h-6 w-6 text-blue-600 sm:h-8 sm:w-8 dark:text-blue-400" />
              </div>
              <h1 className="text-foreground mb-3 px-4 text-2xl font-bold sm:mb-4 sm:text-3xl lg:text-4xl">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground px-4 text-base sm:text-lg lg:text-xl">
                Your privacy is our priority. Learn how we protect and handle
                your data.
              </p>
              <p className="text-muted-foreground/70 mt-2 text-xs sm:text-sm">
                Last updated: November 28, 2025
              </p>
            </div>

            {/* Privacy Content */}
            <div className="space-y-8 sm:space-y-10 lg:space-y-12">
              <LegalSection
                title="Introduction"
                icon={<Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
              >
                <p>
                  Welcome to Code Guardian, an AI-powered code security analysis
                  platform. This Privacy Policy explains how we collect, use,
                  protect, and share information about you when you use our
                  service. We are committed to protecting your privacy and
                  ensuring transparency about our data practices.
                </p>
                <p>
                  Code Guardian is designed with privacy in mind. We process
                  your code locally in your browser whenever possible and only
                  collect the minimum data necessary to provide our services
                  effectively.
                </p>
              </LegalSection>

              <LegalSection
                title="Information We Collect"
                icon={<Database className="h-5 w-5" />}
              >
                <LegalSubsection title="Code Analysis Data">
                  <p>
                    When you use our code analysis features, we may temporarily
                    process:
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
                    <strong>Important:</strong> Your source code is processed
                    locally in your browser whenever possible. We do not
                    permanently store your source code on our servers.
                  </p>
                </LegalSubsection>
              </LegalSection>

              <LegalSection
                title="Data Protection & Security"
                icon={<Lock className="h-5 w-5" />}
              >
                <LegalSubsection title="Security Measures">
                  <p>
                    We implement industry-standard security measures to protect
                    your data:
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
                title="Contact Us"
                icon={<Mail className="h-5 w-5" />}
              >
                <p>
                  If you have questions about this Privacy Policy or our data
                  practices, please contact us:
                </p>
                <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">
                        Email: itisaddy7@gmail.com
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">
                        Website: Code Guardian Platform
                      </span>
                    </div>
                  </div>
                </div>
              </LegalSection>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacySection;
