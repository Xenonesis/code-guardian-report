import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import MultiLanguageSupportDisplay from '@/components/language/MultiLanguageSupportDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code2, Upload, FileCode, CheckCircle2 } from 'lucide-react';

const CODE_EXAMPLES = {
  javascript: '// JavaScript example code',
  python: '# Python example code',
  java: '// Java example code',
  cpp: '// C++ example code',
  go: '// Go example code',
  rust: '// Rust example code',
  php: '// PHP example code',
  csharp: '// C# example code'
};

const MultiLanguagePage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const languageStats = [
    { language: 'JavaScript', fileCount: 45, lineCount: 3200, percentage: 35, securityIssues: 12, ruleCount: 15 },
    { language: 'TypeScript', fileCount: 38, lineCount: 2800, percentage: 30, securityIssues: 8, ruleCount: 15 },
    { language: 'Python', fileCount: 20, lineCount: 1500, percentage: 15, securityIssues: 6, ruleCount: 12 }
  ];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Multi-Language Security Analysis
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive security scanning across 10+ programming languages
          </p>
        </div>

        <MultiLanguageSupportDisplay 
          languageStats={languageStats}
          totalFiles={125}
          totalLines={9700}
          showFeatures={true}
        />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Interactive Examples</CardTitle>
            <CardDescription>Security vulnerability detection demos</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <TabsList>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="java">Java</TabsTrigger>
              </TabsList>
              {Object.entries(CODE_EXAMPLES).map(([lang, code]) => (
                <TabsContent key={lang} value={lang}>
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg">
                    <code>{code}</code>
                  </pre>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default MultiLanguagePage;
