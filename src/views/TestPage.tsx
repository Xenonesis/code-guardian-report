/**
 * Test Page for Firebase Integration
 * Accessible via URL parameter: ?test=firebase
 * DEVELOPMENT ONLY - Not available in production
 */

import { useEffect } from "react";
import { logger } from "@/utils/logger";
// import { FirebaseTestPanel } from '@/components/FirebaseTestPanel'; // Not available
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TestTube } from "lucide-react";

interface TestPageProps {
  onBack?: () => void;
}

export const TestPage = ({ onBack }: TestPageProps) => {
  // Prevent access in production
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      logger.warn("Test pages are not available in production");
      window.location.href = "/";
    }
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center gap-4">
            {onBack && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to App
              </Button>
            )}
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                <TestTube className="h-8 w-8" />
                Firebase Integration Tests
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Test and verify Firebase storage functionality
              </p>
            </div>
          </div>
        </div>

        {/* Test Panel */}
        <div className="p-8 text-center">Firebase Test Panel Not Available</div>

        {/* Additional Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Development Information</CardTitle>
            <CardDescription>
              Technical details about the Firebase integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-semibold">Integration Features</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Dual storage (Local + Firebase)</li>
                  <li>• Automatic fallback mechanisms</li>
                  <li>• Real-time synchronization</li>
                  <li>• User-based data isolation</li>
                  <li>• Data compression for large results</li>
                  <li>• Offline support with sync queue</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Test Coverage</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Firebase connection & configuration</li>
                  <li>• Local storage functionality</li>
                  <li>• Cloud storage operations</li>
                  <li>• Data retrieval and caching</li>
                  <li>• Integration service methods</li>
                  <li>• Error handling and recovery</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-900/20">
              <h4 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
                Access this page anytime:
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Add{" "}
                <code className="rounded bg-blue-100 px-1 dark:bg-blue-800">
                  ?test=firebase
                </code>{" "}
                to the URL to access these tests
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
