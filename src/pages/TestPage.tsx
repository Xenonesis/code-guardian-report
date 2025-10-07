/**
 * Test Page for Firebase Integration
 * Accessible via URL parameter: ?test=firebase
 */

import { FirebaseTestPanel } from '@/components/FirebaseTestPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TestTube } from 'lucide-react';

interface TestPageProps {
  onBack?: () => void;
}

export const TestPage = ({ onBack }: TestPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <TestTube className="h-8 w-8" />
                Firebase Integration Tests
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Test and verify Firebase storage functionality
              </p>
            </div>
          </div>
        </div>

        {/* Test Panel */}
        <FirebaseTestPanel />

        {/* Additional Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Development Information</CardTitle>
            <CardDescription>
              Technical details about the Firebase integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Integration Features</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Dual storage (Local + Firebase)</li>
                  <li>• Automatic fallback mechanisms</li>
                  <li>• Real-time synchronization</li>
                  <li>• User-based data isolation</li>
                  <li>• Data compression for large results</li>
                  <li>• Offline support with sync queue</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Test Coverage</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Firebase connection & configuration</li>
                  <li>• Local storage functionality</li>
                  <li>• Cloud storage operations</li>
                  <li>• Data retrieval and caching</li>
                  <li>• Integration service methods</li>
                  <li>• Error handling and recovery</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border">
              <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                Access this page anytime:
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Add <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">?test=firebase</code> to the URL to access these tests
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
