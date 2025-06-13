


interface AIProvider {
  id: string;
  name: string;
  apiKey: string;
}

// Interface for the actual stored API key format
interface StoredAPIKey {
  id: string;
  provider: string;
  key: string;
  name: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AnalysisIssue {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  type: string;
  message: string;
  filename: string;
  line: number;
  column?: number;
  owaspCategory?: string;
  cweId?: string;
  cvssScore?: number;
  riskRating?: string;
  confidence?: number;
  remediation?: {
    effort: 'Low' | 'Medium' | 'High';
    description: string;
  };
}

interface AnalysisSummary {
  securityScore?: number;
  qualityScore?: number;
  criticalIssues?: number;
  highIssues?: number;
  mediumIssues?: number;
  lowIssues?: number;
}

interface AnalysisMetrics {
  vulnerabilityDensity?: number;
  technicalDebt?: string;
}

interface AnalysisDependencies {
  total: number;
  vulnerable: number;
  outdated: number;
}

interface AnalysisResults {
  issues: AnalysisIssue[];
  totalFiles: number;
  summary?: AnalysisSummary;
  metrics?: AnalysisMetrics;
  dependencies?: AnalysisDependencies;
}

export class AIService {
  private getStoredAPIKeys(): AIProvider[] {
    try {
      const keys = localStorage.getItem('aiApiKeys');
      const storedKeys: StoredAPIKey[] = keys ? JSON.parse(keys) : [];

      // Convert stored format to expected format
      return storedKeys.map(key => ({
        id: key.provider,
        name: key.name,
        apiKey: key.key
      }));
    } catch (error) {
      console.error('Error parsing stored API keys:', error);
      return [];
    }
  }

  private async callOpenAI(apiKey: string, messages: ChatMessage[]): Promise<string> {
    console.log('Calling OpenAI API...');
    
    if (!apiKey || !apiKey.startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key format. Key should start with "sk-"');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      console.log('OpenAI Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API Error Response:', errorText);
        
        let errorMessage = `OpenAI API error (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch (e) {
          errorMessage = errorText || response.statusText;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('OpenAI API Response:', data);
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI - no content found');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }

  private async callGemini(apiKey: string, messages: ChatMessage[]): Promise<string> {
    console.log('Calling Gemini API...');
    
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }

    try {
      // Convert messages to Gemini format
      const systemMessage = messages.find(m => m.role === 'system');
      const userMessages = messages.filter(m => m.role !== 'system');
      
      let prompt = '';
      if (systemMessage) {
        prompt += `System: ${systemMessage.content}\n\n`;
      }
      prompt += userMessages.map(m => `${m.role}: ${m.content}`).join('\n');

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            topP: 0.8,
            topK: 40
          }
        }),
      });

      console.log('Gemini Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error Response:', errorText);
        
        let errorMessage = `Gemini API error (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch (e) {
          errorMessage = errorText || response.statusText;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Gemini API Response:', data);
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Gemini - no content found');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw error;
    }
  }

  private async callClaude(apiKey: string, messages: ChatMessage[]): Promise<string> {
    console.log('Calling Claude API...');
    
    if (!apiKey) {
      throw new Error('Claude API key is required');
    }

    try {
      const systemMessage = messages.find(m => m.role === 'system');
      const userMessages = messages.filter(m => m.role !== 'system');

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          messages: userMessages,
          system: systemMessage?.content,
        }),
      });

      console.log('Claude Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API Error Response:', errorText);
        
        let errorMessage = `Claude API error (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch (e) {
          errorMessage = errorText || response.statusText;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Claude API Response:', data);
      
      if (!data.content?.[0]?.text) {
        throw new Error('Invalid response format from Claude - no content found');
      }

      return data.content[0].text;
    } catch (error) {
      console.error('Claude API call failed:', error);
      throw error;
    }
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    const apiKeys = this.getStoredAPIKeys();
    console.log('Available API keys:', apiKeys.map(k => ({ id: k.id, name: k.name })));
    
    if (apiKeys.length === 0) {
      throw new Error('No AI API keys configured. Please add an API key in the AI Configuration tab.');
    }

    const errors: string[] = [];

    // Try each API key until one works
    for (const provider of apiKeys) {
      try {
        console.log(`Trying provider: ${provider.name} (${provider.id})`);
        
        switch (provider.id) {
          case 'openai':
            return await this.callOpenAI(provider.apiKey, messages);
          case 'gemini':
            return await this.callGemini(provider.apiKey, messages);
          case 'claude':
            return await this.callClaude(provider.apiKey, messages);
          default:
            console.warn(`Unsupported provider: ${provider.id}`);
            errors.push(`Unsupported provider: ${provider.id}`);
            continue;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error with ${provider.name}:`, errorMessage);
        errors.push(`${provider.name}: ${errorMessage}`);
        continue;
      }
    }

    const detailedError = errors.length > 0 ? errors.join('; ') : 'No errors captured';
    throw new Error(`All AI providers failed. Errors: ${detailedError}`);
  }

  async generateSummary(issues: AnalysisIssue[]): Promise<string> {
    console.log('Generating summary for', issues.length, 'issues');
    
    if (!issues || issues.length === 0) {
      throw new Error('No issues provided for summary generation');
    }

    const systemPrompt = {
      role: 'system' as const,
      content: `You are a code security and quality expert. Analyze the provided code analysis results and generate a comprehensive summary including:
      1. Overall security posture
      2. Most critical issues to address
      3. Code quality assessment
      4. Recommendations for improvement
      5. Priority action items
      
      Keep the summary professional and actionable.`
    };

    const userPrompt = {
      role: 'user' as const,
      content: `Please analyze these code analysis results and provide a comprehensive summary:
      
      Total Issues: ${issues.length}
      High Severity: ${issues.filter(i => i.severity === 'High').length}
      Medium Severity: ${issues.filter(i => i.severity === 'Medium').length}
      Low Severity: ${issues.filter(i => i.severity === 'Low').length}
      
      Security Issues: ${issues.filter(i => i.type?.toLowerCase() === 'security').length}
      Bug Issues: ${issues.filter(i => i.type?.toLowerCase() === 'bug').length}
      Code Quality Issues: ${issues.filter(i => i.type?.toLowerCase() === 'code smell').length}
      
      Sample Issues:
      ${issues.slice(0, 10).map(issue => `- ${issue.severity} ${issue.type}: ${issue.message} (${issue.filename}:${issue.line})`).join('\n')}
      
      ${issues.length > 10 ? `... and ${issues.length - 10} more issues` : ''}`
    };

    try {
      return await this.generateResponse([systemPrompt, userPrompt]);
    } catch (error) {
      console.error('Summary generation failed:', error);
      throw new Error(`Failed to generate AI summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateSecurityInsights(analysisResults: AnalysisResults): Promise<string> {
    if (!analysisResults || !analysisResults.issues) {
      throw new Error('No analysis results provided for security insights generation');
    }

    const systemPrompt = {
      role: 'system' as const,
      content: `You are a senior cybersecurity expert and code analysis specialist. Analyze the comprehensive security analysis results and provide detailed insights including:

1. **Overall Security Posture Assessment**: Evaluate the security score and overall risk level
2. **Critical Risk Analysis**: Identify immediate threats and business impact
3. **OWASP Top 10 Analysis**: Explain detected OWASP categories and their implications
4. **CVSS Score Interpretation**: Translate technical scores into business risk language
5. **Prioritized Remediation Strategy**: Actionable roadmap based on risk, effort, and business impact
6. **Compliance Considerations**: Relevant security standards and regulatory implications

Provide specific, actionable insights based on the actual findings, not generic advice. Use professional security terminology while remaining accessible to development teams.`
    };

    const criticalIssues = analysisResults.issues.filter((i: AnalysisIssue) => i.severity === 'Critical');
    const highIssues = analysisResults.issues.filter((i: AnalysisIssue) => i.severity === 'High');
    const owaspCategories = [...new Set(analysisResults.issues.map((i: AnalysisIssue) => i.owaspCategory).filter(Boolean))];
    const avgCvssScore = analysisResults.issues
      .filter((i: AnalysisIssue) => i.cvssScore)
      .reduce((sum: number, i: AnalysisIssue) => sum + (i.cvssScore || 0), 0) /
      analysisResults.issues.filter((i: AnalysisIssue) => i.cvssScore).length || 0;

    const userPrompt = {
      role: 'user' as const,
      content: `Please provide comprehensive security insights for this codebase analysis:

**Security Metrics:**
- Security Score: ${analysisResults.summary?.securityScore || 'N/A'}/100
- Quality Score: ${analysisResults.summary?.qualityScore || 'N/A'}/100
- Vulnerability Density: ${analysisResults.metrics?.vulnerabilityDensity || 'N/A'} per 1000 lines
- Technical Debt: ${analysisResults.metrics?.technicalDebt || 'N/A'}
- Average CVSS Score: ${avgCvssScore.toFixed(1)}

**Issue Distribution:**
- Critical: ${analysisResults.summary?.criticalIssues || 0}
- High: ${analysisResults.summary?.highIssues || 0}
- Medium: ${analysisResults.summary?.mediumIssues || 0}
- Low: ${analysisResults.summary?.lowIssues || 0}

**OWASP Categories Detected:**
${owaspCategories.map(cat => `- ${cat}`).join('\n')}

**Critical Issues Requiring Immediate Attention:**
${criticalIssues.slice(0, 3).map((issue: AnalysisIssue) =>
  `- ${issue.message} (${issue.filename}:${issue.line}) - CVSS: ${issue.cvssScore?.toFixed(1) || 'N/A'}, CWE: ${issue.cweId || 'N/A'}`
).join('\n')}

**High-Priority Issues:**
${highIssues.slice(0, 5).map((issue: AnalysisIssue) =>
  `- ${issue.message} (${issue.filename}:${issue.line}) - Risk: ${issue.riskRating}, Confidence: ${issue.confidence}%`
).join('\n')}

**Dependencies:**
${analysisResults.dependencies ? `
- Total: ${analysisResults.dependencies.total}
- Vulnerable: ${analysisResults.dependencies.vulnerable}
- Outdated: ${analysisResults.dependencies.outdated}` : 'No dependency data available'}

Please provide actionable insights that help prioritize security improvements and understand business impact.`
    };

    try {
      const response = await this.generateResponse([systemPrompt, userPrompt]);
      return response;
    } catch (error) {
      throw new Error(`Failed to generate security insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateOwaspExplanation(owaspCategory: string, relatedIssues: AnalysisIssue[]): Promise<string> {
    console.log('Generating OWASP explanation for:', owaspCategory);

    const systemPrompt = {
      role: 'system' as const,
      content: `You are a cybersecurity expert specializing in OWASP Top 10 vulnerabilities. Provide a comprehensive explanation of the specified OWASP category, including:

1. **What it is**: Clear definition and technical explanation
2. **Why it matters**: Business impact and real-world consequences
3. **How it manifests**: Common attack vectors and exploitation methods
4. **Detection in this codebase**: Specific findings and their implications
5. **Remediation strategy**: Prioritized steps to address the vulnerabilities
6. **Prevention measures**: Best practices to prevent future occurrences

Focus on the specific issues found in this codebase rather than generic information.`
    };

    const userPrompt = {
      role: 'user' as const,
      content: `Explain this OWASP category and its implications for our codebase:

**OWASP Category:** ${owaspCategory}

**Related Issues Found (${relatedIssues.length}):**
${relatedIssues.slice(0, 5).map((issue: AnalysisIssue) =>
  `- ${issue.message} in ${issue.filename}:${issue.line}
    Severity: ${issue.severity}, CVSS: ${issue.cvssScore?.toFixed(1) || 'N/A'}
    CWE: ${issue.cweId || 'N/A'}, Confidence: ${issue.confidence}%
    Impact: ${issue.impact || 'Not specified'}`
).join('\n\n')}

${relatedIssues.length > 5 ? `... and ${relatedIssues.length - 5} more related issues` : ''}

Please provide specific guidance based on these actual findings in our codebase.`
    };

    try {
      return await this.generateResponse([systemPrompt, userPrompt]);
    } catch (error) {
      console.error('OWASP explanation generation failed:', error);
      throw new Error(`Failed to generate OWASP explanation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateRemediationStrategy(analysisResults: AnalysisResults): Promise<string> {
    console.log('Generating remediation strategy');

    const systemPrompt = {
      role: 'system' as const,
      content: `You are a senior security consultant creating a prioritized remediation strategy. Analyze the security findings and create a comprehensive action plan including:

1. **Immediate Actions** (Critical/High severity issues)
2. **Short-term Goals** (Medium severity and quick wins)
3. **Long-term Improvements** (Low severity and architectural changes)
4. **Resource Planning** (Effort estimates and team allocation)
5. **Risk Mitigation** (Temporary measures while fixes are implemented)
6. **Success Metrics** (How to measure improvement)

Prioritize based on CVSS scores, business impact, and implementation effort.`
    };

    const criticalHighIssues = analysisResults.issues.filter((i: AnalysisIssue) =>
      i.severity === 'Critical' || i.severity === 'High'
    );

    const quickWins = analysisResults.issues.filter((i: AnalysisIssue) =>
      i.remediation?.effort === 'Low' && (i.severity === 'Medium' || i.severity === 'High')
    );

    const userPrompt = {
      role: 'user' as const,
      content: `Create a prioritized remediation strategy for this security analysis:

**Current Security Posture:**
- Security Score: ${analysisResults.summary?.securityScore || 'N/A'}/100
- Critical + High Issues: ${criticalHighIssues.length}
- Total Technical Debt: ${analysisResults.metrics?.technicalDebt || 'N/A'}

**High-Priority Issues (${criticalHighIssues.length}):**
${criticalHighIssues.slice(0, 8).map((issue: AnalysisIssue) =>
  `- ${issue.message} (${issue.filename})
    CVSS: ${issue.cvssScore?.toFixed(1) || 'N/A'}, Effort: ${issue.remediation?.effort || 'Unknown'}
    Priority: ${issue.remediation?.priority || 'N/A'}/5, CWE: ${issue.cweId || 'N/A'}`
).join('\n\n')}

**Quick Wins (Low Effort, High Impact) - ${quickWins.length} issues:**
${quickWins.slice(0, 5).map((issue: AnalysisIssue) =>
  `- ${issue.message} (${issue.filename}) - ${issue.severity} severity`
).join('\n')}

**Resource Constraints:**
- Development team capacity: Assume standard agile team
- Security expertise: Mixed levels
- Timeline: Flexible but business-driven priorities

Please provide a realistic, actionable remediation roadmap with specific timelines and success criteria.`
    };

    try {
      return await this.generateResponse([systemPrompt, userPrompt]);
    } catch (error) {
      console.error('Remediation strategy generation failed:', error);
      throw new Error(`Failed to generate remediation strategy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async answerQuestion(question: string, analysisResults: AnalysisResults): Promise<string> {
    console.log('Answering question:', question);

    if (!analysisResults || !analysisResults.issues) {
      throw new Error('No analysis results provided for question answering');
    }

    const systemPrompt = {
      role: 'system' as const,
      content: `You are a helpful code analysis assistant. You have access to the results of a code analysis that found ${analysisResults.issues.length} issues across ${analysisResults.totalFiles} files. Answer user questions about the analysis results in a helpful and detailed way. Be specific and reference the actual findings when possible.`
    };

    const contextPrompt = {
      role: 'user' as const,
      content: `Analysis Context:
      Total Files Analyzed: ${analysisResults.totalFiles}
      Analysis Time: ${analysisResults.analysisTime}
      Total Issues Found: ${analysisResults.issues.length}

      Issue Breakdown:
      - Critical Severity: ${analysisResults.issues.filter((i: AnalysisIssue) => i.severity === 'Critical').length}
      - High Severity: ${analysisResults.issues.filter((i: AnalysisIssue) => i.severity === 'High').length}
      - Medium Severity: ${analysisResults.issues.filter((i: AnalysisIssue) => i.severity === 'Medium').length}
      - Low Severity: ${analysisResults.issues.filter((i: AnalysisIssue) => i.severity === 'Low').length}

      Issue Types:
      - Security: ${analysisResults.issues.filter((i: AnalysisIssue) => i.type?.toLowerCase() === 'security').length}
      - Bugs: ${analysisResults.issues.filter((i: AnalysisIssue) => i.type?.toLowerCase() === 'bug').length}
      - Code Quality: ${analysisResults.issues.filter((i: AnalysisIssue) => i.type?.toLowerCase() === 'code smell').length}

      Sample Issues:
      ${analysisResults.issues.slice(0, 5).map((issue: AnalysisIssue) => `- ${issue.severity} ${issue.type}: ${issue.message} in ${issue.filename}:${issue.line}`).join('\n')}

      User Question: ${question}`
    };

    try {
      return await this.generateResponse([systemPrompt, contextPrompt]);
    } catch (error) {
      console.error('Question answering failed:', error);
      throw new Error(`Failed to answer question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
