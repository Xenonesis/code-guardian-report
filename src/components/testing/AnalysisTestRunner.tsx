/**
 * Analysis Test Runner Component
 * UI for running and displaying analysis accuracy tests
 */

import React, { useState } from "react";
import { runAnalysisAccuracyTests } from "@/tests/analysisAccuracyTest";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  PlayCircle,
  Loader2,
} from "lucide-react";

import { logger } from "@/utils/logger";
interface TestResult {
  testName: string;
  status: "PASS" | "FAIL";
  message: string;
  actualIssues?: number;
  expectedMin?: number;
}

interface TestResults {
  passed: number;
  failed: number;
  total: number;
  errors: string[];
  details: TestResult[];
}

export function AnalysisTestRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResults | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      const testResults = await runAnalysisAccuracyTests();
      setResults(testResults);
    } catch (error) {
      logger.error("Test execution failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const getSuccessRate = () => {
    if (!results) return 0;
    return ((results.passed / results.total) * 100).toFixed(1);
  };

  const getStatusColor = (status: "PASS" | "FAIL") => {
    return status === "PASS" ? "text-green-600" : "text-red-600";
  };

  const getStatusIcon = (status: "PASS" | "FAIL") => {
    return status === "PASS" ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Analysis Accuracy Test Suite
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Verify that the analysis engine detects real vulnerabilities
            accurately and doesn't return mock/fake data
          </p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={runTests}
            disabled={isRunning}
            className="w-full sm:w-auto"
            size="lg"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 mr-2" />
                Run Analysis Tests
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <>
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {results.total}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Tests
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {results.passed}
                  </div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {results.failed}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {getSuccessRate()}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Success Rate
                  </div>
                </div>
              </div>

              {results.passed === results.total ? (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100">
                        🎉 All Tests Passed!
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm text-green-800 dark:text-green-200">
                        <li>
                          ✅ Analysis engine is providing accurate, real results
                        </li>
                        <li>✅ No mock or fake data detected</li>
                        <li>✅ Vulnerability detection is working correctly</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100">
                        Some Tests Failed
                      </h3>
                      <p className="mt-1 text-sm text-red-800 dark:text-red-200">
                        The analysis engine may not be detecting all
                        vulnerabilities correctly. Review the failed tests below
                        for details.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.details.map((detail) => (
                  <div
                    key={`${detail.testName}-${detail.status}`}
                    className={`p-4 border rounded-lg ${
                      detail.status === "PASS"
                        ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(detail.status)}
                      <div className="flex-1">
                        <h4
                          className={`font-semibold ${getStatusColor(detail.status)}`}
                        >
                          {detail.testName}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {detail.message}
                        </p>
                        {detail.actualIssues !== undefined && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Issues found: {detail.actualIssues}
                            {detail.expectedMin &&
                              ` (expected: ${detail.expectedMin}+)`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
