import React from 'react';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { LegalSection, LegalSubsection, LegalList } from '@/components/legal/LegalSection';
import { LegalNavigation } from '@/components/legal/LegalNavigation';
import { Scale, FileText, Shield, AlertTriangle, Users, Gavel, Globe, Mail } from 'lucide-react';

export const Terms: React.FC = () => {
  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="Please read these terms carefully before using Code Guardian."
      lastUpdated="July 17, 2025"
      icon={<Scale className="h-8 w-8" />}
    >
      {/* Introduction */}
      <LegalSection title="Agreement to Terms" icon={<FileText className="h-5 w-5" />}>
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

      {/* Service Description */}
      <LegalSection title="Service Description" icon={<Shield className="h-5 w-5" />}>
        <LegalSubsection title="What We Provide">
          <p>Code Guardian offers the following services:</p>
          <LegalList items={[
            "AI-powered code security analysis and vulnerability detection",
            "Static code analysis for multiple programming languages",
            "Integration with popular AI services (OpenAI, Anthropic)",
            "Real-time analysis results and recommendations",
            "Export capabilities for analysis reports",
            "Educational resources and security best practices"
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Service Availability">
          <p>We strive to provide reliable service, but please note:</p>
          <LegalList items={[
            "Service availability is not guaranteed 24/7",
            "We may perform maintenance that temporarily interrupts service",
            "Third-party AI services may have their own availability limitations",
            "We reserve the right to modify or discontinue features"
          ]} />
        </LegalSubsection>
      </LegalSection>

      {/* User Responsibilities */}
      <LegalSection title="User Responsibilities" icon={<Users className="h-5 w-5" />}>
        <LegalSubsection title="Acceptable Use">
          <p>When using Code Guardian, you agree to:</p>
          <LegalList items={[
            "Use the service only for lawful purposes",
            "Respect intellectual property rights",
            "Not attempt to reverse engineer or hack the platform",
            "Not upload malicious code or content",
            "Comply with all applicable laws and regulations",
            "Use your own API keys for third-party AI services"
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Prohibited Activities">
          <p>You must not:</p>
          <LegalList items={[
            "Upload code that violates others' intellectual property",
            "Attempt to gain unauthorized access to our systems",
            "Use the service to develop malicious software",
            "Share or distribute others' private code without permission",
            "Overload our systems with excessive requests",
            "Violate any applicable laws or regulations"
          ]} />
        </LegalSubsection>

        <LegalSubsection title="API Key Management">
          <p>For AI-powered features:</p>
          <LegalList items={[
            "You are responsible for obtaining and managing your own API keys",
            "Keep your API keys secure and confidential",
            "Monitor your API usage and associated costs",
            "Comply with third-party AI service terms",
            "Report any unauthorized use immediately"
          ]} />
        </LegalSubsection>
      </LegalSection>

      {/* Intellectual Property */}
      <LegalSection title="Intellectual Property" icon={<Shield className="h-5 w-5" />}>
        <LegalSubsection title="Your Code">
          <p>You retain all rights to your source code:</p>
          <LegalList items={[
            "You own all intellectual property rights in your code",
            "We do not claim ownership of code you upload",
            "You grant us limited rights to process your code for analysis",
            "We do not permanently store your source code",
            "Analysis results belong to you"
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Our Platform">
          <p>Code Guardian platform and its components are protected:</p>
          <LegalList items={[
            "All platform code, algorithms, and designs are our property",
            "You may not copy, modify, or distribute our platform",
            "Our trademarks and branding are protected",
            "Analysis algorithms and methodologies are proprietary"
          ]} />
        </LegalSubsection>
      </LegalSection>

      {/* Disclaimers */}
      <LegalSection title="Disclaimers & Limitations" icon={<AlertTriangle className="h-5 w-5" />}>
        <LegalSubsection title="Service Disclaimers">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-4">
            <p className="font-medium text-yellow-900 dark:text-yellow-100">
              <strong>Important:</strong> Code Guardian is provided "as is" without warranties of any kind.
            </p>
          </div>
          <LegalList items={[
            "We do not guarantee the accuracy of security analysis results",
            "Analysis results should not be the sole basis for security decisions",
            "We are not responsible for decisions made based on our analysis",
            "Third-party AI services have their own limitations and terms",
            "No warranty of merchantability or fitness for a particular purpose"
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Limitation of Liability">
          <p>To the maximum extent permitted by law:</p>
          <LegalList items={[
            "We are not liable for any indirect, incidental, or consequential damages",
            "Our total liability is limited to the amount you paid for the service (if any)",
            "We are not responsible for data loss or security breaches on your end",
            "You use the service at your own risk",
            "We are not liable for third-party AI service issues or costs"
          ]} />
        </LegalSubsection>
      </LegalSection>

      {/* Privacy & Data */}
      <LegalSection title="Privacy & Data Handling" icon={<Shield className="h-5 w-5" />}>
        <p>Your privacy is important to us. Please review our Privacy Policy for detailed information about how we collect, use, and protect your data.</p>

        <LegalSubsection title="Data Processing">
          <LegalList items={[
            "Code analysis is performed locally in your browser when possible",
            "We do not permanently store your source code",
            "Analysis results are stored locally in your browser",
            "Usage data is collected for service improvement",
            "We comply with applicable privacy laws (GDPR, CCPA)"
          ]} />
        </LegalSubsection>
      </LegalSection>

      {/* Termination */}
      <LegalSection title="Termination" icon={<Gavel className="h-5 w-5" />}>
        <LegalSubsection title="Termination by You">
          <p>You may stop using our service at any time:</p>
          <LegalList items={[
            "Simply stop accessing the platform",
            "Clear your browser data to remove stored information",
            "Contact us to request data deletion",
            "No formal termination process required"
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Termination by Us">
          <p>We may restrict or terminate access if:</p>
          <LegalList items={[
            "You violate these Terms of Service",
            "You engage in prohibited activities",
            "We suspect fraudulent or malicious use",
            "Required by law or legal process",
            "We discontinue the service"
          ]} />
        </LegalSubsection>
      </LegalSection>

      {/* Governing Law */}
      <LegalSection title="Governing Law & Disputes" icon={<Globe className="h-5 w-5" />}>
        <LegalSubsection title="Applicable Law">
          <p>These Terms are governed by and construed in accordance with applicable laws. Any disputes will be resolved through:</p>
          <LegalList items={[
            "Good faith negotiation as the first step",
            "Mediation if negotiation fails",
            "Arbitration for unresolved disputes",
            "Applicable jurisdiction for legal proceedings"
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Severability">
          <p>If any provision of these Terms is found to be unenforceable:</p>
          <LegalList items={[
            "The unenforceable provision will be modified to be enforceable",
            "The remainder of the Terms will remain in full effect",
            "The overall intent of the Terms will be preserved"
          ]} />
        </LegalSubsection>
      </LegalSection>

      {/* Contact Information */}
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
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Response Time: Within 30 days</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          These Terms of Service are effective as of January 15, 2025. We reserve the right to update these Terms at any time. Continued use of the service after changes constitutes acceptance of the new Terms.
        </p>
      </LegalSection>

      {/* Legal Navigation */}
      <LegalNavigation />
    </LegalPageLayout>
  );
};

export default Terms;
