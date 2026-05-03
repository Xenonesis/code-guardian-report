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
import { logger } from "@/utils/logger";

const NotFound = () => {
  useEffect(() => {
    logger.error(
      "404 Error: User attempted to access non-existent route:",
      window.location.pathname
    );
  }, []);

  return (
    <PageLayout showNavigation={false}>
      <div className="flex min-h-[80vh] items-center justify-center">
        <Card className="animate-fade-in bg-card/95 text-foreground backdrop-blur-sm/95 w-full max-w-2xl border-0 shadow-2xl">
          <CardHeader className="pb-6 text-center">
            <div className="animate-bounce-in bg-primary mx-auto mb-6 w-fit rounded-full p-4">
              <Shield className="text-primary-foreground h-12 w-12" />
            </div>
            <CardTitle className="mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-6xl font-bold text-transparent sm:text-8xl">
              404
            </CardTitle>
            <CardTitle className="text-foreground mb-2 text-2xl font-bold sm:text-3xl">
              Page Not Found
            </CardTitle>
            <CardDescription className="text-muted-foreground text-lg">
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-foreground font-semibold">
                What you can do:
              </h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary dark:text-primary mt-1">•</span>
                  Check the URL for any typos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary dark:text-primary mt-1">•</span>
                  Go back to the previous page
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary dark:text-primary mt-1">•</span>
                  Return to the homepage to start fresh
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary dark:text-primary mt-1">•</span>
                  Use the navigation to find what you need
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <Button
                onClick={() => (window.location.href = "/")}
                className="focus-ring bg-primary hover:bg-primary/90 flex items-center gap-2"
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

            <div className="border-border border-t pt-6">
              <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
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
