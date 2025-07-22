import React from 'react';
import { PageLayout } from '@/components/layouts/PageLayout';
import { HeroSection } from '@/components/layouts/HeroSection';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Shield, Scale, FileText, Calendar, Mail, Globe } from 'lucide-react';
import { APP_VERSION_WITH_PREFIX } from '@/utils/version';

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  subtitle,
  lastUpdated,
  children,
  icon = <Scale className="h-8 w-8" />
}) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <PageLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
      {/* Enhanced Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-full blur-3xl float-animation"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl float-animation delay-2s"></div>
      </div>

      <div className="relative z-10">
        {/* Enhanced Hero Section */}
        <HeroSection
          title={title}
          subtitle={subtitle}
          variant="gradient"
          className="py-16 sm:py-20 lg:py-24"
        >
          <div className="max-w-4xl mx-auto">
            {/* Legal Info Card */}
            <div className="glass-card-ultra p-6 sm:p-8 mb-8 enhanced-card-hover">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center sm:text-left">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                  {icon}
                  <div className="text-white text-lg font-bold">Legal</div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Last Updated: {lastUpdated}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Globe className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Effective Globally</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Shield className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">Code Guardian {APP_VERSION_WITH_PREFIX}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Mail className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">Contact: itisaddy7@gmail.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </HeroSection>

        {/* Legal Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card-ultra p-8 sm:p-12 enhanced-card-hover">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default LegalPageLayout;
