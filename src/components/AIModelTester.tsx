import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Zap } from 'lucide-react';
import { AIService } from '@/services/aiService';

interface TestResult {
  provider: string;
  success: boolean;
  response?: string;
  error?: string;
  duration?: number;
}

export const AIModelTester: React.FC = () => {
  const [testApiKey, setTestApiKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const providers = [
    { id: 'openai', name: 'OpenAI GPT-4o-mini', placeholder: 'sk-...' },
    { id: 'gemini', name: 'Google Gemini 1.5 Flash', placeholder: 'AIza...' },
    { id: 'claude', name: 'Claude 3.5 Sonnet', placeholder: 'sk-ant-...' }
  ];

  const testModel = async () => {
    if (!testApiKey.trim()) {
      alert('Please enter an API key');
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      // Temporarily store the test key
      const existingKeys = localStorage.getItem('aiApiKeys');
      const testKeyData = [{
        id: Date.now().toString(),
        provider: selectedProvider,
        key: testApiKey.trim(),
        name: `Test ${selectedProvider}`
      }];
      
      localStorage.setItem('aiApiKeys', JSON.stringify(testKeyData));

      // Create AI service and test
      const aiService = new AIService();
      const testMessages = [
        {
          role: 'system' as const,
          content: 'You are a helpful assistant. Respond briefly and clearly.'
        },
        {
          role: 'user' as const,
          content: 'Hello! Please respond with "AI model test successful" if you can understand this message.'
        }
      ];

      const response = await aiService.generateResponse(testMessages);
      const duration = Date.now() - startTime;

      const result: TestResult = {
        provider: selectedProvider,
        success: true,
        response: response.substring(0, 200) + (response.length > 200 ? '...' : ''),
        duration
      };

      setTestResults(prev => [result, ...prev.slice(0, 4)]);

      // Restore original keys
      if (existingKeys) {
        localStorage.setItem('aiApiKeys', existingKeys);
      } else {
        localStorage.removeItem('aiApiKeys');
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      const result: TestResult = {
        provider: selectedProvider,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      };

      setTestResults(prev => [result, ...prev.slice(0, 4)]);

      // Restore original keys
      const existingKeys = localStorage.getItem('aiApiKeys');
      if (existingKeys) {
        localStorage.setItem('aiApiKeys', existingKeys);
      } else {
        localStorage.removeItem('aiApiKeys');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          AI Model Tester
        </CardTitle>
        <CardDescription>
          Test AI model connectivity and verify the latest model updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Configuration */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="provider-select">AI Provider</Label>
            <select
              id="provider-select"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
            >
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="api-key">API Key (temporary test)</Label>
            <Input
              id="api-key"
              type="password"
              placeholder={providers.find(p => p.id === selectedProvider)?.placeholder}
              value={testApiKey}
              onChange={(e) => setTestApiKey(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              This key is used only for testing and is not permanently stored
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={testModel} 
              disabled={isLoading || !testApiKey.trim()}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {isLoading ? 'Testing...' : 'Test Model'}
            </Button>
            
            {testResults.length > 0 && (
              <Button variant="outline" onClick={clearResults}>
                Clear Results
              </Button>
            )}
          </div>
        </div>

        {/* Model Information */}
        <Alert>
          <AlertDescription>
            <strong>Current Model Versions:</strong>
            <ul className="mt-2 space-y-1">
              <li>• <strong>Gemini:</strong> gemini-1.5-flash (Updated from deprecated gemini-pro)</li>
              <li>• <strong>OpenAI:</strong> gpt-4o-mini</li>
              <li>• <strong>Claude:</strong> claude-3-5-sonnet-20241022</li>
              <li>• <strong>Token Limit:</strong> 2048 tokens (increased from 1000)</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Results</h3>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${
                    result.success 
                      ? 'border-green-200 bg-green-50 dark:bg-green-950/20' 
                      : 'border-red-200 bg-red-50 dark:bg-red-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-medium">
                        {providers.find(p => p.id === result.provider)?.name}
                      </span>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {result.duration}ms
                    </span>
                  </div>
                  
                  {result.success && result.response && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Response:</strong> {result.response}
                      </p>
                    </div>
                  )}
                  
                  {!result.success && result.error && (
                    <div className="mt-2">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        <strong>Error:</strong> {result.error}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <Alert>
          <AlertDescription>
            <strong>How to test:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Select an AI provider from the dropdown</li>
              <li>Enter a valid API key for that provider</li>
              <li>Click "Test Model" to verify connectivity</li>
              <li>Check the results to confirm the model is working</li>
            </ol>
            <p className="mt-2 text-sm">
              <strong>Note:</strong> If you see "gemini-pro not found" errors, this test will verify 
              that the fix to use "gemini-1.5-flash" is working correctly.
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
