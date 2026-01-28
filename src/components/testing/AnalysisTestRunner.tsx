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
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            Analysis Accuracy Test Suite
          </CardTitle>
          <p className="text-muted-foreground text-sm">
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-900/20">
                  <div className="text-3xl font-bold text-blue-600">
                    {results.total}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Total Tests
                  </div>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
                  <div className="text-3xl font-bold text-green-600">
                    {results.passed}
                  </div>
                  <div className="text-muted-foreground text-sm">Passed</div>
                </div>
                <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
                  <div className="text-3xl font-bold text-red-600">
                    {results.failed}
                  </div>
                  <div className="text-muted-foreground text-sm">Failed</div>
                </div>
                <div className="rounded-lg bg-purple-50 p-4 text-center dark:bg-purple-900/20">
                  <div className="text-3xl font-bold text-purple-600">
                    {getSuccessRate()}%
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Success Rate
                  </div>
                </div>
              </div>

              {results.passed === results.total ? (
                <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />
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
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                  <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
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
                    className={`rounded-lg border p-4 ${
                      detail.status === "PASS"
                        ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10"
                        : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10"
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
                        <p className="text-muted-foreground mt-1 text-sm">
                          {detail.message}
                        </p>
                        {detail.actualIssues !== undefined && (
                          <div className="text-muted-foreground mt-2 text-xs">
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
