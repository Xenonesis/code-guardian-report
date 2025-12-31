"use client";

import React from 'react';
import { LegalSection, LegalSubsection, LegalList } from '@/components/legal/LegalSection';
import { AnimatedBackground } from '@/components/pages/about/AnimatedBackground';
import { Shield, FileText, Scale, AlertTriangle, Users, Mail, Globe } from 'lucide-react';

export const TermsSection: React.FC = () => {
  return (
    <section id="terms" className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <div className="pt-12 sm:pt-16 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto">
            {/* Terms Header */}
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4 sm:mb-6">
                <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 px-4">
                Terms of Service
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 px-4">
                Please read these terms carefully before using Code Guardian.
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mt-2">
                Last updated: November 28, 2025
              </p>
            </div>

            {/* Terms Content */}
            <div className="space-y-8 sm:space-y-10 lg:space-y-12">
              <LegalSection title="Agreement to Terms" icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5" />}>
                <p>
                  Welcome to Code Guardian, an AI-powered code security analysis platform. These Terms of Service ("Terms") govern your use of our website and services. By accessing or using Code Guardian, you agree to be bound by these Terms.
                </p>
                <p>
                  If you do not agree to these Terms, please do not use our service. We may update these Terms from time to time, and your continued use constitutes acceptance of any changes.
                </p>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    <strong>Important:</strong> Code Guardian is provided as a free service for educational and professional use. Commercial use may require additional agreements.
                  </p>
                </div>
              </LegalSection>

              <LegalSection title="Service Description" icon={<Shield className="h-5 w-5" />}>
                <LegalSubsection title="What We Provide">
                  <p>Code Guardian offers the following services:</p>
                  <LegalList items={[
                    'AI-powered code security analysis and vulnerability detection',
                    'Static code analysis for multiple programming languages',
                    'Integration with popular AI services (OpenAI, Anthropic)',
                    'Real-time analysis results and recommendations',
                    'Export capabilities for analysis reports',
                    'Educational resources and security best practices'
                  ]} />
                </LegalSubsection>
              </LegalSection>

              <LegalSection title="User Responsibilities" icon={<Users className="h-5 w-5" />}>
                <LegalSubsection title="Acceptable Use">
                  <p>When using Code Guardian, you agree to:</p>
                  <LegalList items={[
                    'Use the service only for lawful purposes',
                    'Respect intellectual property rights',
                    'Not attempt to reverse engineer or hack the platform',
                    'Not upload malicious code or content',
                    'Comply with all applicable laws and regulations',
                    'Use your own API keys for third-party AI services'
                  ]} />
                </LegalSubsection>
              </LegalSection>

              <LegalSection title="Disclaimers & Limitations" icon={<AlertTriangle className="h-5 w-5" />}>
                <LegalSubsection title="Service Disclaimers">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-4">
                    <p className="font-medium text-yellow-900 dark:text-yellow-100">
                      <strong>Important:</strong> Code Guardian is provided "as is" without warranties of any kind.
                    </p>
                  </div>
                  <LegalList items={[
                    'We do not guarantee the accuracy of security analysis results',
                    'Analysis results should not be the sole basis for security decisions',
                    'We are not responsible for decisions made based on our analysis',
                    'Third-party AI services have their own limitations and terms',
                    'No warranty of merchantability or fitness for a particular purpose'
                  ]} />
                </LegalSubsection>
              </LegalSection>

              <LegalSection title="Contact Information" icon={<Mail className="h-5 w-5" />}>
                <p>If you have questions about these Terms of Service, please contact us:</p>
                <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Email: itisaddy7@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Website: Code Guardian Platform</span>
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

export default TermsSection;
