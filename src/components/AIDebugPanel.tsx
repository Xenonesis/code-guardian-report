import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  debugAIConfiguration, 
  testAPIKeyStorage, 
  debugLog, 
  debugComponentState 
} from '@/utils/debugAI';
import { 
  hasConfiguredApiKeys, 
  getConfiguredProviders, 
  getAIFeatureStatus 
} from '@/utils/aiUtils';
import { AIService } from '@/services/aiService';

interface DebugInfo {
  hasKeys: boolean;
  providers: Array<{
    id: string;
    name: string;
    apiKey: string;
  }>;
  featureStatus: {
    enabled: boolean;
    reason: string;
  };
}

export const AIDebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    hasKeys: false,
    providers: [],
    featureStatus: { enabled: false, reason: '' }
  });
  const [testResults, setTestResults] = useState<string[]>([]);

  const runDiagnostics = () => {
    const results: string[] = [];
    
    try {
      // Test 1: Check localStorage directly
      const rawKeys = localStorage.getItem('aiApiKeys');
      results.push(`✅ localStorage access: ${rawKeys ? 'Found data' : 'No data'}`);
      
      // Test 2: Check utility functions
      const hasKeys = hasConfiguredApiKeys();
      results.push(`${hasKeys ? '✅' : '❌'} hasConfiguredApiKeys(): ${hasKeys}`);
      
      // Test 3: Get providers
      const providers = getConfiguredProviders();
      results.push(`✅ getConfiguredProviders(): ${providers.length} providers`);
      
      // Test 4: Get feature status
      const status = getAIFeatureStatus();
      results.push(`✅ getAIFeatureStatus(): ${JSON.stringify(status)}`);
      
      // Test 5: AI Service instantiation
      try {
        const aiService = new AIService();
        results.push('✅ AIService instantiation: Success');
      } catch (error) {
        results.push(`❌ AIService instantiation: ${error}`);
      }
      
      // Test 6: Storage test
      try {
        testAPIKeyStorage();
        results.push('✅ API key storage test: Passed');
      } catch (error) {
        results.push(`❌ API key storage test: ${error}`);
      }
      
    } catch (error) {
      results.push(`❌ Diagnostics failed: ${error}`);
    }
    
    setTestResults(results);
    
    // Update debug info
    setDebugInfo({
      timestamp: new Date().toISOString(),
      localStorage: localStorage.getItem('aiApiKeys'),
      hasKeys: hasConfiguredApiKeys(),
      providers: getConfiguredProviders(),
      featureStatus: getAIFeatureStatus()
    });
  };

  const clearAPIKeys = () => {
    localStorage.removeItem('aiApiKeys');
    window.dispatchEvent(new CustomEvent('aiApiKeysChanged'));
    runDiagnostics();
  };

  const addTestAPIKey = () => {
    const testKey = {
      id: 'openai',
      name: 'OpenAI (Test)',
      apiKey: 'sk-test1234567890abcdefghijklmnopqrstuvwxyz'
    };
    
    localStorage.setItem('aiApiKeys', JSON.stringify([testKey]));
    window.dispatchEvent(new CustomEvent('aiApiKeysChanged'));
    runDiagnostics();
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>AI Debug Panel</CardTitle>
        <CardDescription>
          Diagnostic tools for AI functionality debugging
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Control Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={runDiagnostics} variant="outline">
            Run Diagnostics
          </Button>
          <Button onClick={debugAIConfiguration} variant="outline">
            Debug Console
          </Button>
          <Button onClick={addTestAPIKey} variant="outline">
            Add Test Key
          </Button>
          <Button onClick={clearAPIKeys} variant="destructive">
            Clear API Keys
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Diagnostic Results</h3>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="font-mono text-sm p-2 bg-slate-100 dark:bg-slate-800 rounded">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Information */}
        {debugInfo.timestamp && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Debug Information</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Feature Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-600">Supported:</span>
                    <Badge variant={debugInfo.featureStatus?.isSupported ? "default" : "destructive"}>
                      {debugInfo.featureStatus?.isSupported ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Has API Keys:</span>
                    <Badge variant={debugInfo.featureStatus?.hasApiKeys ? "default" : "destructive"}>
                      {debugInfo.featureStatus?.hasApiKeys ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Primary Provider:</span>
                    <Badge variant="outline">
                      {debugInfo.featureStatus?.primaryProvider || 'None'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Message:</span>
                    <span className="text-sm">{debugInfo.featureStatus?.message}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Configured Providers ({debugInfo.providers?.length || 0})</h4>
                {debugInfo.providers?.length > 0 ? (
                  <div className="space-y-2">
                    {debugInfo.providers.map((provider, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div><strong>ID:</strong> {provider.id}</div>
                          <div><strong>Name:</strong> {provider.name}</div>
                          <div><strong>Key Length:</strong> {provider.apiKey?.length || 0}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>No providers configured</AlertDescription>
                  </Alert>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Raw localStorage Data</h4>
                <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-x-auto">
                  {debugInfo.localStorage || 'null'}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">Timestamp</h4>
                <span className="text-sm text-slate-600">{debugInfo.timestamp}</span>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <Alert>
          <AlertDescription>
            <strong>How to use:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Click "Run Diagnostics" to check current AI configuration status</li>
              <li>Click "Add Test Key" to add a test API key for debugging</li>
              <li>Click "Debug Console" to see detailed logs in browser console</li>
              <li>Click "Clear API Keys" to remove all stored API keys</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
