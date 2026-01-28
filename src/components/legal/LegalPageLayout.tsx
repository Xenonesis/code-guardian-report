import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { HeroSection } from "@/components/layout/HeroSection";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Shield, Scale, Calendar, Mail, Globe } from "lucide-react";
import { APP_VERSION_WITH_PREFIX } from "@/utils/version";

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
  icon = <Scale className="h-8 w-8" />,
}) => {
  const { theme, setTheme } = useDarkMode();

  return (
    <PageLayout theme={theme} onThemeChange={setTheme}>
      {/* Enhanced Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="float-animation absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl"></div>
        <div className="float-animation delay-2s absolute right-1/4 bottom-1/4 h-48 w-48 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-2xl"></div>
      </div>

      <div className="relative z-10">
        {/* Enhanced Hero Section */}
        <HeroSection
          title={title}
          subtitle={subtitle}
          variant="gradient"
          className="py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-4xl">
            {/* Legal Info Card */}
            <div className="glass-card-ultra enhanced-card-hover mb-8 p-6 sm:p-8">
              <div className="flex flex-col items-center justify-center gap-6 text-center sm:flex-row sm:text-left">
                <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                  {icon}
                  <div className="text-lg font-bold text-white">Legal</div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">
                        Last Updated: {lastUpdated}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Globe className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Effective Globally</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Shield className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">
                        Code Guardian {APP_VERSION_WITH_PREFIX}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Mail className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">
                        Contact: itisaddy7@gmail.com
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </HeroSection>

        {/* Legal Content */}
        <div className="container mx-auto px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <div className="mx-auto max-w-4xl">
            <div className="glass-card-ultra enhanced-card-hover p-8 sm:p-12">
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
