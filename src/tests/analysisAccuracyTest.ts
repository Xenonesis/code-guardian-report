/**
 * Analysis Accuracy Test Suite
 * Verifies that all analysis results are accurate and not mock/fake data
 */

import { EnhancedAnalysisEngine } from '../services/enhancedAnalysisEngine';
import JSZip from 'jszip';

import { logger } from '@/utils/logger';
interface TestCase {
  name: string;
  description: string;
  code: string;
  filename: string;
  expectedIssues: {
    minCount: number;
    types: string[];
    severities: string[];
  };
}

export class AnalysisAccuracyTester {
  private engine: EnhancedAnalysisEngine;
  private results: {
    passed: number;
    failed: number;
    total: number;
    errors: string[];
    details: Array<{
      testName: string;
      status: 'PASS' | 'FAIL';
      message: string;
      actualIssues?: number;
      expectedMin?: number;
    }>;
  };

  constructor() {
    this.engine = new EnhancedAnalysisEngine();
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      errors: [],
      details: []
    };
  }

  /**
   * Test Cases: Real vulnerabilities that MUST be detected
   */
  private getTestCases(): TestCase[] {
    return [
      {
        name: 'SQL Injection Detection',
        description: 'Should detect SQL injection vulnerabilities',
        filename: 'test_sql.js',
        code: `
const express = require('express');
const mysql = require('mysql');

app.get('/user', (req, res) => {
  const userId = req.query.id;
  const query = "SELECT * FROM users WHERE id = '" + userId + "'";
  connection.query(query, (err, results) => {
    res.json(results);
  });
});
        `,
        expectedIssues: {
          minCount: 1,
          types: ['SQL Injection', 'sql_injection'],
          severities: ['Critical', 'High']
        }
      },
      {
        name: 'Hardcoded Credentials Detection',
        description: 'Should detect hardcoded passwords and API keys',
        filename: 'test_secrets.js',
        code: `
const config = {
  apiKey: 'sk-1234567890abcdef1234567890abcdef',
  password: 'MySecretPassword123!',
  dbUrl: 'mongodb://admin:password123@localhost:27017',
  awsAccessKey: 'AKIAIOSFODNN7EXAMPLE',
  githubToken: 'ghp_1234567890abcdefghijklmnopqrstuvwxyz'
};
        `,
        expectedIssues: {
          minCount: 3,
          types: ['Secret', 'Hardcoded', 'API Key', 'Password'],
          severities: ['Critical', 'High']
        }
      },
      {
        name: 'XSS Vulnerability Detection',
        description: 'Should detect Cross-Site Scripting vulnerabilities',
        filename: 'test_xss.jsx',
        code: `
import React from 'react';

function UserProfile({ userInput }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: userInput }} />
  );
}

function UnsafeComponent({ data }) {
  document.getElementById('output').innerHTML = data;
  return <div>{data}</div>;
}
        `,
        expectedIssues: {
          minCount: 2,
          types: ['XSS', 'Direct innerHTML', 'dangerouslySetInnerHTML'],
          severities: ['Critical', 'High']
        }
      },
      {
        name: 'Command Injection Detection',
        description: 'Should detect command injection vulnerabilities',
        filename: 'test_command.js',
        code: `
const { exec } = require('child_process');

app.post('/run', (req, res) => {
  const command = req.body.cmd;
  exec('ls ' + command, (err, stdout) => {
    res.send(stdout);
  });
});

const userInput = process.argv[2];
exec(\`git clone \${userInput}\`);
        `,
        expectedIssues: {
          minCount: 2,
          types: ['Command Injection', 'Shell Injection'],
          severities: ['Critical', 'High']
        }
      },
      {
        name: 'Eval Usage Detection',
        description: 'Should detect dangerous eval() usage',
        filename: 'test_eval.js',
        code: `
function processUserCode(userCode) {
  const result = eval(userCode);
  return result;
}

const data = req.body.expression;
const value = eval(data);
new Function('return ' + userInput)();
        `,
        expectedIssues: {
          minCount: 3,
          types: ['Security', 'Code Injection', 'eval'],
          severities: ['Critical', 'High']
        }
      },
      {
        name: 'Path Traversal Detection',
        description: 'Should detect path traversal vulnerabilities',
        filename: 'test_path.js',
        code: `
const fs = require('fs');
const path = require('path');

app.get('/file', (req, res) => {
  const filename = req.query.name;
  const filepath = './uploads/' + filename;
  fs.readFile(filepath, (err, data) => {
    res.send(data);
  });
});
        `,
        expectedIssues: {
          minCount: 1,
          types: ['Path Traversal', 'File Access'],
          severities: ['High', 'Medium']
        }
      },
      {
        name: 'Insecure Crypto Detection',
        description: 'Should detect weak cryptographic practices',
        filename: 'test_crypto.js',
        code: `
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

const cipher = crypto.createCipher('des', 'password');
Math.random() * 1000000; // Insecure random for security
        `,
        expectedIssues: {
          minCount: 2,
          types: ['Weak Crypto', 'Insecure Hash', 'Insecure Random'],
          severities: ['High', 'Medium']
        }
      },
      {
        name: 'Python Security Issues',
        description: 'Should detect Python-specific vulnerabilities',
        filename: 'test_python.py',
        code: `
import os
import pickle
import yaml

user_input = request.args.get('cmd')
os.system(user_input)

data = request.get_data()
pickle.loads(data)

config = yaml.load(open('config.yaml'))

password = "hardcoded_password_123"
api_key = "sk-1234567890abcdefghijklmnopqrstuvwx"
        `,
        expectedIssues: {
          minCount: 4,
          types: ['Command Injection', 'Deserialization', 'Secret', 'Hardcoded'],
          severities: ['Critical', 'High']
        }
      }
    ];
  }

  /**
   * Create a test ZIP file with the given code
   */
  private async createTestZip(filename: string, code: string): Promise<Blob> {
    const zip = new JSZip();
    zip.file(filename, code);
    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Run a single test case
   */
  private async runTestCase(testCase: TestCase): Promise<void> {
    logger.group(`🧪 ${testCase.name}`);
    logger.debug(`📝 ${testCase.description}`);
    logger.debug(`📄 Filename: ${testCase.filename}`);
    logger.debug(`📋 Test Code:\n${testCase.code}`);

    try {
      // Create test ZIP
      const zipBlob = await this.createTestZip(testCase.filename, testCase.code);
      logger.debug(`📦 Created ZIP blob: ${zipBlob.size} bytes`);
      
      // Run analysis
      logger.debug(`⚙️  Running analysis...`);
      const results = await this.engine.analyzeCodebase(zipBlob as any);

      logger.debug(`� Analysis Complete:`);
      logger.debug(`   Total Issues: ${results.issues.length}`);
      logger.debug(`   Total Files: ${results.totalFiles}`);
      logger.debug(`   Analysis Time: ${results.analysisTime}`);
      logger.debug(`   Security Score: ${results.summary?.securityScore}`);
      
      if (results.issues.length > 0) {
        logger.debug(`   Issues Details:`);
        for (const issue of results.issues) {
          logger.debug(`      - ${issue.type} (${issue.severity}): ${issue.message}`);
        }
      } else {
        logger.warn(`   ⚠️  NO ISSUES DETECTED!`);
      }

      // Verify results are real (not mock)
      if (this.isResultMock(results)) {
        this.results.failed++;
        this.results.details.push({
          testName: testCase.name,
          status: 'FAIL',
          message: '❌ MOCK DATA DETECTED - Results appear to be fake/hardcoded'
        });
        this.results.errors.push(`${testCase.name}: Mock data detected`);
        return;
      }

      // Verify issues were found
      const issueCount = results.issues.length;
      const foundTypes = new Set(results.issues.map(i => i.type));
      const foundSeverities = new Set(results.issues.map(i => i.severity));

      logger.debug(`   Found ${issueCount} issues`);
      logger.debug(`   Types: ${Array.from(foundTypes).join(', ')}`);
      logger.debug(`   Severities: ${Array.from(foundSeverities).join(', ')}`);

      // Check if minimum issues found
      if (issueCount < testCase.expectedIssues.minCount) {
        this.results.failed++;
        this.results.details.push({
          testName: testCase.name,
          status: 'FAIL',
          message: `❌ INSUFFICIENT DETECTION - Expected at least ${testCase.expectedIssues.minCount} issues, found ${issueCount}`,
          actualIssues: issueCount,
          expectedMin: testCase.expectedIssues.minCount
        });
        this.results.errors.push(`${testCase.name}: Expected ${testCase.expectedIssues.minCount}+, got ${issueCount}`);
        return;
      }

      // Check if expected issue types were found
      const foundExpectedType = testCase.expectedIssues.types.some(expectedType =>
        Array.from(foundTypes).some(foundType =>
          foundType.toLowerCase().includes(expectedType.toLowerCase()) ||
          expectedType.toLowerCase().includes(foundType.toLowerCase())
        )
      );

      if (!foundExpectedType) {
        this.results.failed++;
        this.results.details.push({
          testName: testCase.name,
          status: 'FAIL',
          message: `⚠️ WRONG ISSUE TYPES - Expected one of [${testCase.expectedIssues.types.join(', ')}], found [${Array.from(foundTypes).join(', ')}]`,
          actualIssues: issueCount
        });
        this.results.errors.push(`${testCase.name}: Wrong issue types detected`);
        return;
      }

      // Check severity levels
      const hasExpectedSeverity = testCase.expectedIssues.severities.some(sev =>
        foundSeverities.has(sev as any)
      );

      if (!hasExpectedSeverity) {
        logger.debug(`   ⚠️ Warning: Expected severities not found`);
      }

      // Test PASSED
      this.results.passed++;
      this.results.details.push({
        testName: testCase.name,
        status: 'PASS',
        message: `✅ ACCURATE DETECTION - Found ${issueCount} real issues with correct types`,
        actualIssues: issueCount,
        expectedMin: testCase.expectedIssues.minCount
      });
      logger.debug(`   ✅ Test PASSED`);
      logger.groupEnd();

    } catch (error) {
      this.results.failed++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.results.details.push({
        testName: testCase.name,
        status: 'FAIL',
        message: `❌ ERROR: ${errorMsg}`
      });
      this.results.errors.push(`${testCase.name}: ${errorMsg}`);
      logger.error(`   ❌ Test FAILED:`, errorMsg);
      logger.groupEnd();
    }
  }

  /**
   * Check if results appear to be mock/fake data
   */
  private isResultMock(results: any): boolean {
    // Check for suspiciously perfect scores with issues (contradictory)
    if (results.summary?.securityScore === 100 && results.issues.length > 0) {
      return true;
    }

    // Check if all issues have identical properties AND identical messages (sign of mock data)
    // Only flag as mock if they're truly identical (same line, message, everything)
    if (results.issues.length > 2) {
      const firstIssue = results.issues[0];
      const allIdentical = results.issues.every((issue: any) =>
        issue.severity === firstIssue.severity &&
        issue.type === firstIssue.type &&
        issue.line === firstIssue.line &&
        issue.message === firstIssue.message &&
        issue.file === firstIssue.file
      );
      if (allIdentical) {
        return true;
      }
    }

    return false;
  }

  /**
   * Run all tests
   */
  public async runAllTests(): Promise<void> {
    logger.debug('🔬 ANALYSIS ACCURACY TEST SUITE');
    logger.debug('================================\n');
    logger.debug('Testing real vulnerability detection...\n');

    const testCases = this.getTestCases();
    this.results.total = testCases.length;

    for (const testCase of testCases) {
      await this.runTestCase(testCase);
    }

    this.printResults();
  }

  /**
   * Print test results summary
   */
  private printResults(): void {
    logger.debug('\n\n📊 TEST RESULTS SUMMARY');
    logger.debug('================================');
    logger.debug(`Total Tests: ${this.results.total}`);
    logger.debug(`✅ Passed: ${this.results.passed}`);
    logger.debug(`❌ Failed: ${this.results.failed}`);
    logger.debug(`📈 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);

    if (this.results.failed > 0) {
      logger.debug('\n❌ FAILED TESTS:');
      this.results.details
        .filter(d => d.status === 'FAIL')
        .forEach((detail, index) => {
          logger.debug(`\n${index + 1}. ${detail.testName}`);
          logger.debug(`   ${detail.message}`);
        });
    }

    if (this.results.passed === this.results.total) {
      logger.debug('\n🎉 ALL TESTS PASSED!');
      logger.debug('✅ Analysis engine is providing accurate, real results');
      logger.debug('✅ No mock or fake data detected');
      logger.debug('✅ Vulnerability detection is working correctly');
    } else {
      logger.debug('\n⚠️ SOME TESTS FAILED');
      logger.debug('The analysis engine may not be detecting all vulnerabilities correctly.');
      logger.debug('Review the failed tests above for details.');
    }

    logger.debug('\n================================\n');
  }

  /**
   * Get detailed results
   */
  public getResults() {
    return this.results;
  }
}

/**
 * Run tests
 */
export async function runAnalysisAccuracyTests(): Promise<{
  passed: number;
  failed: number;
  total: number;
  errors: string[];
  details: Array<{
    testName: string;
    status: 'PASS' | 'FAIL';
    message: string;
    actualIssues?: number;
    expectedMin?: number;
  }>;
}> {
  const tester = new AnalysisAccuracyTester();
  await tester.runAllTests();
  return tester.getResults();
}

// Auto-run if called directly
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).runAnalysisAccuracyTests = runAnalysisAccuracyTests;
  (window as unknown as Record<string, unknown>).AnalysisAccuracyTester = AnalysisAccuracyTester;
}
