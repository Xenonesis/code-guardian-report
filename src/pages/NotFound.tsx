import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/layouts/PageLayout";
import { useDarkMode } from "@/hooks/useDarkMode";

const NotFound = () => {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} showNavigation={false}>
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card className="w-full max-w-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-0 shadow-2xl animate-fade-in">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-fit animate-bounce-in">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <CardTitle className="text-6xl sm:text-8xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            404
          </CardTitle>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">What you can do:</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                Check the URL for any typos
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                Go back to the previous page
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                Return to the homepage to start fresh
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                Use the navigation to find what you need
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              asChild
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus-ring"
            >
              <Link to="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex items-center gap-2 focus-ring"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
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
