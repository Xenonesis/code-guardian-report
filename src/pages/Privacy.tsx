import React from 'react';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { LegalSection, LegalSubsection, LegalList } from '@/components/legal/LegalSection';
import { LegalNavigation } from '@/components/legal/LegalNavigation';
import { Shield, Eye, Database, Lock, Users, Globe, Mail, FileText } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="Your privacy is our priority. Learn how we protect and handle your data."
      lastUpdated="July 17, 2025"
      icon={<Shield className="h-8 w-8" />}
    >
      {/* Introduction */}
      <LegalSection title="Introduction" icon={<Eye className="h-5 w-5" />}>
        <p>
          Welcome to Code Guardian, an AI-powered code security analysis platform. This Privacy Policy explains how we collect, use, protect, and share information about you when you use our service. We are committed to protecting your privacy and ensuring transparency about our data practices.
        </p>
        <p>
          Code Guardian is designed with privacy in mind. We process your code locally in your browser whenever possible and only collect the minimum data necessary to provide our services effectively.
        </p>
      </LegalSection>

      {/* Information We Collect */}
      <LegalSection title="Information We Collect" icon={<Database className="h-5 w-5" />}>
        <LegalSubsection title="Code Analysis Data">
          <p>When you use our code analysis features, we may temporarily process:</p>
          <LegalList items={[
            "Source code files you upload for analysis",
            "Analysis results and security findings",
            "File metadata (names, sizes, types)",
            "Analysis preferences and settings"
          ]} />
          <p className="mt-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <strong>Important:</strong> Your source code is processed locally in your browser whenever possible. We do not permanently store your source code on our servers.
          </p>
        </LegalSubsection>

        <LegalSubsection title="Usage Information">
          <p>We automatically collect certain information about your use of our service:</p>
          <LegalList items={[
            "Browser type, version, and operating system",
            "IP address and general location information",
            "Pages visited and features used",
            "Time spent on the platform",
            "Error logs and performance metrics"
          ]} />
        </LegalSubsection>

        <LegalSubsection title="AI Integration Data">
          <p>When using AI-powered features with external providers:</p>
          <LegalList items={[
            "API keys you provide (stored locally in your browser)",
            "Anonymized code snippets for AI analysis",
            "AI interaction logs for service improvement",
            "Usage patterns for AI features"
          ]} />
        </LegalSubsection>
      </LegalSection>

      {/* How We Use Information */}
      <LegalSection title="How We Use Your Information" icon={<FileText className="h-5 w-5" />}>
        <p>We use the information we collect for the following purposes:</p>
        
        <LegalSubsection title="Service Provision">
          <LegalList items={[
            "Perform code security analysis and vulnerability detection",
            "Generate reports and recommendations",
            "Provide AI-powered insights and suggestions",
            "Maintain analysis history and preferences"
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Service Improvement">
          <LegalList items={[
            "Analyze usage patterns to improve our algorithms",
            "Debug issues and optimize performance",
            "Develop new features and capabilities",
            "Enhance user experience and interface design"
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Communication">
          <LegalList items={[
            "Send important service updates and notifications",
            "Respond to your inquiries and support requests",
            "Provide technical assistance when needed"
          ]} />
        </LegalSubsection>
      </LegalSection>

      {/* Data Protection */}
      <LegalSection title="Data Protection & Security" icon={<Lock className="h-5 w-5" />}>
        <LegalSubsection title="Security Measures">
          <p>We implement industry-standard security measures to protect your data:</p>
          <LegalList items={[
            "End-to-end encryption for data transmission",
            "Secure browser-based processing when possible",
            "Regular security audits and vulnerability assessments",
            "Access controls and authentication mechanisms",
            "Secure data storage with encryption at rest"
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Data Retention">
          <p>We retain your information only as long as necessary:</p>
          <LegalList items={[
            "Source code: Not permanently stored (processed locally)",
            "Analysis results: Stored locally in your browser",
            "Usage data: Retained for up to 2 years for service improvement",
            "Support communications: Retained for up to 3 years"
          ]} />
        </LegalSubsection>
      </LegalSection>

      {/* Information Sharing */}
      <LegalSection title="Information Sharing" icon={<Users className="h-5 w-5" />}>
        <p>We do not sell, trade, or rent your personal information. We may share information only in the following limited circumstances:</p>

        <LegalSubsection title="Third-Party Services">
          <LegalList items={[
            "AI providers (OpenAI, Anthropic) when you use AI features with your own API keys",
            "Analytics services for usage statistics (anonymized data only)",
            "Cloud infrastructure providers for service hosting",
            "Security services for threat detection and prevention"
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Legal Requirements">
          <p>We may disclose information if required by law or to:</p>
          <LegalList items={[
            "Comply with legal processes or government requests",
            "Protect our rights, property, or safety",
            "Prevent fraud or security threats",
            "Enforce our Terms of Service"
          ]} />
        </LegalSubsection>
      </LegalSection>

      {/* Your Rights */}
      <LegalSection title="Your Privacy Rights" icon={<Shield className="h-5 w-5" />}>
        <p>You have the following rights regarding your personal information:</p>

        <LegalSubsection title="Access and Control">
          <LegalList items={[
            "Access: Request a copy of your personal data",
            "Correction: Update or correct inaccurate information",
            "Deletion: Request deletion of your personal data",
            "Portability: Export your data in a machine-readable format",
            "Restriction: Limit how we process your information"
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Browser Controls">
          <p>You can control your privacy through browser settings:</p>
          <LegalList items={[
            "Clear local storage and analysis history",
            "Disable cookies and tracking",
            "Use private/incognito browsing mode",
            "Configure browser security settings"
          ]} />
        </LegalSubsection>
      </LegalSection>

      {/* International Users */}
      <LegalSection title="International Users" icon={<Globe className="h-5 w-5" />}>
        <LegalSubsection title="GDPR Compliance (EU Users)">
          <p>For users in the European Union, we comply with GDPR requirements:</p>
          <LegalList items={[
            "Lawful basis for processing your data",
            "Right to data portability and erasure",
            "Data Protection Officer contact available",
            "Privacy by design and default principles"
          ]} />
        </LegalSubsection>

        <LegalSubsection title="CCPA Compliance (California Users)">
          <p>For California residents, we provide additional rights under CCPA:</p>
          <LegalList items={[
            "Right to know what personal information is collected",
            "Right to delete personal information",
            "Right to opt-out of sale (we don't sell data)",
            "Right to non-discrimination for exercising privacy rights"
          ]} />
        </LegalSubsection>
      </LegalSection>

      {/* Contact Information */}
      <LegalSection title="Contact Us" icon={<Mail className="h-5 w-5" />}>
        <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>

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
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Response Time: Within 30 days</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          This Privacy Policy is effective as of January 15, 2025, and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page.
        </p>
      </LegalSection>

      {/* Legal Navigation */}
      <LegalNavigation />
    </LegalPageLayout>
  );
};

export default Privacy;
