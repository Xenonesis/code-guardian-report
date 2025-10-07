/**
 * Firebase Test Panel
 * Interactive component to test Firebase integration
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Database, 
  Cloud,
  Zap,
  AlertCircle
} from 'lucide-react';
import { testFirebaseIntegration, testFirebaseConnection } from '@/tests/firebaseIntegrationTest';

interface TestResult {
  success: boolean;
  results: {
    total: number;
    passed: number;
    failed: number;
    errors: string[];
  };
  timestamp: string;
}

export const FirebaseTestPanel = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);

  const runConnectionTest = async () => {
    setConnectionStatus(null);
    try {
      const result = await testFirebaseConnection();
      setConnectionStatus(result);
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionStatus(false);
    }
  };

  const runIntegrationTests = async () => {
    setIsRunning(true);
    setTestResult(null);
    
    try {
      console.log('🚀 Starting Firebase integration tests...');
      const result = await testFirebaseIntegration();
      setTestResult(result);
    } catch (error) {
      console.error('Test execution error:', error);
      setTestResult({
        success: false,
        results: {
          total: 1,
          passed: 0,
          failed: 1,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        },
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <Clock className="h-4 w-4 text-gray-500" />;
    if (status) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = (status: boolean | null) => {
    if (status === null) return 'Not tested';
    if (status) return 'Connected';
    return 'Failed';
  };

  const getStatusBadgeVariant = (status: boolean | null) => {
    if (status === null) return 'outline';
    if (status) return 'default';
    return 'destructive';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Firebase Integration Test Panel
          </CardTitle>
          <CardDescription>
            Test and verify Firebase storage functionality for analysis results
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cloud className="h-5 w-5" />
            Firebase Connection Test
          </CardTitle>
          <CardDescription>
            Verify Firebase configuration and connectivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(connectionStatus)}
              <span className="font-medium">Connection Status:</span>
              <Badge variant={getStatusBadgeVariant(connectionStatus)}>
                {getStatusText(connectionStatus)}
              </Badge>
            </div>
            <Button 
              onClick={runConnectionTest}
              variant="outline"
              size="sm"
            >
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integration Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5" />
            Integration Tests
          </CardTitle>
          <CardDescription>
            Comprehensive tests for Firebase storage integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              onClick={runIntegrationTests}
              disabled={isRunning}
              className="min-w-[140px]"
            >
              {isRunning ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Tests
                </>
              )}
            </Button>
            
            {testResult && (
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  {testResult.success ? 'All tests passed!' : 'Some tests failed'}
                </span>
              </div>
            )}
          </div>

          {/* Test Results */}
          {testResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {testResult.results.total}
                  </div>
                  <div className="text-sm text-blue-700">Total Tests</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {testResult.results.passed}
                  </div>
                  <div className="text-sm text-green-700">Passed</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {testResult.results.failed}
                  </div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {((testResult.results.passed / testResult.results.total) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-700">Success Rate</div>
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">Progress</div>
                <Progress 
                  value={(testResult.results.passed / testResult.results.total) * 100} 
                  className="w-full"
                />
              </div>

              {testResult.results.errors.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-red-700">Test Errors</span>
                  </div>
                  <ul className="space-y-1">
                    {testResult.results.errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-600">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-xs text-gray-500">
                Test completed at: {new Date(testResult.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <p className="mb-2 font-medium">What these tests verify:</p>
            <ul className="space-y-1 ml-4 text-gray-600">
              <li>• <strong>Connection Test:</strong> Firebase configuration and connectivity</li>
              <li>• <strong>Storage Service:</strong> Initialization of storage services</li>
              <li>• <strong>Local Storage:</strong> Anonymous user data storage</li>
              <li>• <strong>Firebase Storage:</strong> Authenticated user cloud storage</li>
              <li>• <strong>Data Retrieval:</strong> Reading stored analysis results</li>
              <li>• <strong>Integration Methods:</strong> Service methods and utilities</li>
            </ul>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm">
              <p className="font-medium text-blue-700 mb-1">Note:</p>
              <p className="text-blue-600">
                Firebase tests may show warnings if authentication isn't configured. 
                Local storage tests should pass regardless.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
