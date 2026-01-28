import { useEffect } from "react";
import { Home, ArrowLeft, Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageLayout } from "@/components/layout/PageLayout";
import { useDarkMode } from "@/hooks/useDarkMode";

import { logger } from "@/utils/logger";
const NotFound = () => {
  const { theme, setTheme } = useDarkMode();

  useEffect(() => {
    logger.error(
      "404 Error: User attempted to access non-existent route:",
      window.location.pathname
    );
  }, []);

  return (
    <PageLayout theme={theme} onThemeChange={setTheme} showNavigation={false}>
      <div className="flex min-h-[80vh] items-center justify-center">
        <Card className="animate-fade-in w-full max-w-2xl border-0 bg-white/95 shadow-2xl backdrop-blur-sm dark:bg-slate-800/95">
          <CardHeader className="pb-6 text-center">
            <div className="animate-bounce-in mx-auto mb-6 w-fit rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
              <Shield className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-6xl font-bold text-transparent sm:text-8xl">
              404
            </CardTitle>
            <CardTitle className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
              Page Not Found
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                What you can do:
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-blue-600 dark:text-blue-400">
                    •
                  </span>
                  Check the URL for any typos
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-blue-600 dark:text-blue-400">
                    •
                  </span>
                  Go back to the previous page
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-blue-600 dark:text-blue-400">
                    •
                  </span>
                  Return to the homepage to start fresh
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-blue-600 dark:text-blue-400">
                    •
                  </span>
                  Use the navigation to find what you need
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <Button
                onClick={() => (window.location.href = "/")}
                className="focus-ring flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="focus-ring flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </div>

            <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Search className="h-4 w-4" />
                <span>Looking for code analysis? Head to the homepage!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default NotFound;
