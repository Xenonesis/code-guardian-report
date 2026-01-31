import { SecurityIssue, AnalysisResults } from "@/hooks/useAnalysis";
import { secureStorage, StoredAPIKey } from "@/utils/secureStorage";
import { logger } from "@/utils/logger";

interface AIProvider {
  id: string;
  name: string;
  apiKey: string;
  model?: string;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Rate limiting configuration
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitState {
  requests: number[];
  lastReset: number;
}

// AnalysisResults is imported from @/hooks/useAnalysis - no need to redefine

export class AIService {
  private rateLimitState: Map<string, RateLimitState> = new Map();
  private rateLimitConfig: RateLimitConfig = {
    maxRequests: 10, // 10 requests per minute per provider
    windowMs: 60000, // 1 minute window
  };

  /**
   * Check and enforce rate limiting
   */
  private checkRateLimit(providerId: string): void {
    const now = Date.now();
    let state = this.rateLimitState.get(providerId);

    if (!state) {
      state = { requests: [], lastReset: now };
      this.rateLimitState.set(providerId, state);
    }

    // Remove old requests outside the window
    state.requests = state.requests.filter(
      (time) => now - time < this.rateLimitConfig.windowMs
    );

    if (state.requests.length >= this.rateLimitConfig.maxRequests) {
      const oldestRequest = state.requests[0];
      const waitTime = Math.ceil(
        (this.rateLimitConfig.windowMs - (now - oldestRequest)) / 1000
      );
      throw new Error(
        `Rate limit exceeded for ${providerId}. Please wait ${waitTime} seconds before trying again.`
      );
    }

    // Add current request
    state.requests.push(now);
  }

  /**
   * Get stored API keys using secure storage
   */
  private async getStoredAPIKeysAsync(): Promise<AIProvider[]> {
    try {
      const storedKeys = await secureStorage.getAPIKeys();

      // Convert stored format to expected format
      return storedKeys.map((key) => ({
        id: key.provider,
        name: key.name,
        apiKey: key.key,
        model: key.model || this.getDefaultModel(key.provider),
      }));
    } catch (error) {
      logger.error("Error retrieving stored API keys:", error);
      return [];
    }
  }

  /**
   * Legacy sync method for backward compatibility
   * @deprecated Use getStoredAPIKeysAsync instead
   */
  private getStoredAPIKeys(): AIProvider[] {
    try {
      // First try secure storage (sync fallback)
      const secureKeys = localStorage.getItem("cg_secure_api_keys");
      if (secureKeys) {
        // Keys are encrypted, return empty and let async method handle it
        logger.debug("Secure keys found, use async method for decryption");
        return [];
      }

      // Fallback to legacy unencrypted storage
      const keys = localStorage.getItem("aiApiKeys");
      const storedKeys: StoredAPIKey[] = keys ? JSON.parse(keys) : [];

      // Convert stored format to expected format
      return storedKeys.map((key) => ({
        id: key.provider,
        name: key.name,
        apiKey: key.key,
        model: key.model || this.getDefaultModel(key.provider),
      }));
    } catch (error) {
      logger.error("Error parsing stored API keys:", error);
      return [];
    }
  }

  private getDefaultModel(provider: string): string {
    switch (provider) {
      case "openai":
        return "gpt-4o-mini";
      case "gemini":
        return "gemini-1.5-flash";
      case "claude":
        return "claude-3-5-sonnet-20241022";
      default:
        return "";
    }
  }

  private async callOpenAI(
    apiKey: string,
    messages: ChatMessage[],
    model?: string
  ): Promise<string> {
    logger.debug("Calling OpenAI API...");

    if (!apiKey || !apiKey.startsWith("sk-")) {
      throw new Error(
        'Invalid OpenAI API key format. Key should start with "sk-"'
      );
    }

    // Use provided model or default to gpt-4o-mini
    const modelToUse = model || "gpt-4o-mini";
    logger.debug("Using OpenAI model:", modelToUse);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelToUse,
            messages,
            temperature: 0.7,
            max_tokens: 2048,
          }),
        }
      );

      logger.debug("OpenAI Response Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("OpenAI API Error Response:", errorText);

        let errorMessage = `OpenAI API error (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch {
          errorMessage = errorText || response.statusText;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      logger.debug("OpenAI API Response:", data);

      if (!data.choices?.[0]?.message?.content) {
        throw new Error(
          "Invalid response format from OpenAI - no content found"
        );
      }

      return data.choices[0].message.content;
    } catch (error) {
      logger.error("OpenAI API call failed:", error);
      throw error;
    }
  }

  private async callGemini(
    apiKey: string,
    messages: ChatMessage[],
    model?: string
  ): Promise<string> {
    logger.debug("Calling Gemini API...");

    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }

    // Use provided model or default to gemini-1.5-flash
    const modelToUse = model || "gemini-1.5-flash";
    logger.debug("Using Gemini model:", modelToUse);

    try {
      // Convert messages to Gemini format
      const systemMessage = messages.find((m) => m.role === "system");
      const userMessages = messages.filter((m) => m.role !== "system");

      let prompt = "";
      if (systemMessage) {
        prompt += `System: ${systemMessage.content}\n\n`;
      }
      prompt += userMessages.map((m) => `${m.role}: ${m.content}`).join("\n");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
              topP: 0.8,
              topK: 40,
            },
          }),
        }
      );

      logger.debug("Gemini Response Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("Gemini API Error Response:", errorText);

        let errorMessage = `Gemini API error (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch {
          errorMessage = errorText || response.statusText;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      logger.debug("Gemini API Response:", data);

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error(
          "Invalid response format from Gemini - no content found"
        );
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      logger.error("Gemini API call failed:", error);
      throw error;
    }
  }

  private async callClaude(
    apiKey: string,
    messages: ChatMessage[],
    model?: string
  ): Promise<string> {
    logger.debug("Calling Claude API...");

    if (!apiKey) {
      throw new Error("Claude API key is required");
    }

    // Use provided model or default to claude-3-5-sonnet-20241022
    const modelToUse = model || "claude-3-5-sonnet-20241022";
    logger.debug("Using Claude model:", modelToUse);

    try {
      const systemMessage = messages.find((m) => m.role === "system");
      const userMessages = messages.filter((m) => m.role !== "system");

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: modelToUse,
          max_tokens: 2048,
          messages: userMessages,
          system: systemMessage?.content,
        }),
      });

      logger.debug("Claude Response Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("Claude API Error Response:", errorText);

        let errorMessage = `Claude API error (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch {
          errorMessage = errorText || response.statusText;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      logger.debug("Claude API Response:", data);

      if (!data.content?.[0]?.text) {
        throw new Error(
          "Invalid response format from Claude - no content found"
        );
      }

      return data.content[0].text;
    } catch (error) {
      logger.error("Claude API call failed:", error);
      throw error;
    }
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    // Try async secure storage first, fall back to sync method
    let apiKeys = await this.getStoredAPIKeysAsync();

    if (apiKeys.length === 0) {
      // Fallback to legacy sync method
      apiKeys = this.getStoredAPIKeys();
    }

    logger.debug(
      "Available API keys:",
      apiKeys.map((k) => ({ id: k.id, name: k.name, model: k.model }))
    );

    if (apiKeys.length === 0) {
      throw new Error(
        "No AI API keys configured. Please add an API key in the AI Configuration tab."
      );
    }

    const errors: string[] = [];

    // Try each API key until one works
    for (const provider of apiKeys) {
      try {
        // Check rate limit before making request
        this.checkRateLimit(provider.id);

        logger.debug(
          `Trying provider: ${provider.name} (${provider.id}) with model: ${provider.model || "default"}`
        );

        switch (provider.id) {
          case "openai":
            return await this.callOpenAI(
              provider.apiKey,
              messages,
              provider.model
            );
          case "gemini":
            return await this.callGemini(
              provider.apiKey,
              messages,
              provider.model
            );
          case "claude":
            return await this.callClaude(
              provider.apiKey,
              messages,
              provider.model
            );
          default:
            logger.warn(`Unsupported provider: ${provider.id}`);
            errors.push(`Unsupported provider: ${provider.id}`);
            continue;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logger.error(`Error with ${provider.name}:`, errorMessage);
        errors.push(`${provider.name}: ${errorMessage}`);
        continue;
      }
    }

    const detailedError =
      errors.length > 0 ? errors.join("; ") : "No errors captured";
    throw new Error(`All AI providers failed. Errors: ${detailedError}`);
  }

  async generateSummary(issues: SecurityIssue[]): Promise<string> {
    logger.debug(`Generating summary for ${issues.length} issues`);

    if (!issues || issues.length === 0) {
      throw new Error("No issues provided for summary generation");
    }

    const systemPrompt = {
      role: "system" as const,
      content: `You are a code security and quality expert. Analyze the provided code analysis results and generate a comprehensive summary including:
      1. Overall security posture
      2. Most critical issues to address
      3. Code quality assessment
      4. Recommendations for improvement
      5. Priority action items
      
      Keep the summary professional and actionable.`,
    };

    const userPrompt = {
      role: "user" as const,
      content: `Please analyze these code analysis results and provide a comprehensive summary:
      
      Total Issues: ${issues.length}
      High Severity: ${issues.filter((i) => i.severity === "High").length}
      Medium Severity: ${issues.filter((i) => i.severity === "Medium").length}
      Low Severity: ${issues.filter((i) => i.severity === "Low").length}
      
      Security Issues: ${issues.filter((i) => i.type?.toLowerCase() === "security").length}
      Bug Issues: ${issues.filter((i) => i.type?.toLowerCase() === "bug").length}
      Code Quality Issues: ${issues.filter((i) => i.type?.toLowerCase() === "code smell").length}
      
      Sample Issues:
      ${issues
        .slice(0, 10)
        .map(
          (issue) =>
            `- ${issue.severity} ${issue.type}: ${issue.message} (${issue.filename}:${issue.line})`
        )
        .join("\n")}
      
      ${issues.length > 10 ? `... and ${issues.length - 10} more issues` : ""}`,
    };

    try {
      return await this.generateResponse([systemPrompt, userPrompt]);
    } catch (error) {
      logger.error("Summary generation failed:", error);
      throw new Error(
        `Failed to generate AI summary: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async generateSecurityInsights(
    analysisResults: AnalysisResults
  ): Promise<string> {
    if (!analysisResults || !analysisResults.issues) {
      throw new Error(
        "No analysis results provided for security insights generation"
      );
    }

    const systemPrompt = {
      role: "system" as const,
      content: `You are a senior cybersecurity expert and code analysis specialist. Analyze the comprehensive security analysis results and provide detailed insights including:

1. **Overall Security Posture Assessment**: Evaluate the security score and overall risk level
2. **Critical Risk Analysis**: Identify immediate threats and business impact
3. **OWASP Top 10 Analysis**: Explain detected OWASP categories and their implications
4. **CVSS Score Interpretation**: Translate technical scores into business risk language
5. **Prioritized Remediation Strategy**: Actionable roadmap based on risk, effort, and business impact
6. **Compliance Considerations**: Relevant security standards and regulatory implications

Provide specific, actionable insights based on the actual findings, not generic advice. Use professional security terminology while remaining accessible to development teams.`,
    };

    const criticalIssues = analysisResults.issues.filter(
      (i: SecurityIssue) => i.severity === "Critical"
    );
    const highIssues = analysisResults.issues.filter(
      (i: SecurityIssue) => i.severity === "High"
    );
    const owaspCategories = [
      ...new Set(
        analysisResults.issues
          .map((i: SecurityIssue) => i.owaspCategory)
          .filter(Boolean)
      ),
    ];
    const avgCvssScore =
      analysisResults.issues
        .filter((i: SecurityIssue) => i.cvssScore)
        .reduce(
          (sum: number, i: SecurityIssue) => sum + (i.cvssScore || 0),
          0
        ) /
        analysisResults.issues.filter((i: SecurityIssue) => i.cvssScore)
          .length || 0;

    const userPrompt = {
      role: "user" as const,
      content: `Please provide comprehensive security insights for this codebase analysis:

**Security Metrics:**
- Security Score: ${analysisResults.summary?.securityScore || "N/A"}/100
- Quality Score: ${analysisResults.summary?.qualityScore || "N/A"}/100
- Vulnerability Density: ${analysisResults.metrics?.vulnerabilityDensity || "N/A"} per 1000 lines
- Technical Debt: ${analysisResults.metrics?.technicalDebt || "N/A"}
- Average CVSS Score: ${avgCvssScore.toFixed(1)}

**Issue Distribution:**
- Critical: ${analysisResults.summary?.criticalIssues || 0}
- High: ${analysisResults.summary?.highIssues || 0}
- Medium: ${analysisResults.summary?.mediumIssues || 0}
- Low: ${analysisResults.summary?.lowIssues || 0}

**OWASP Categories Detected:**
${owaspCategories.map((cat) => `- ${cat}`).join("\n")}

**Critical Issues Requiring Immediate Attention:**
${criticalIssues
  .slice(0, 3)
  .map(
    (issue: SecurityIssue) =>
      `- ${issue.message} (${issue.filename}:${issue.line}) - CVSS: ${issue.cvssScore?.toFixed(1) || "N/A"}, CWE: ${issue.cweId || "N/A"}`
  )
  .join("\n")}

**High-Priority Issues:**
${highIssues
  .slice(0, 5)
  .map(
    (issue: SecurityIssue) =>
      `- ${issue.message} (${issue.filename}:${issue.line}) - Risk: ${issue.riskRating}, Confidence: ${issue.confidence}%`
  )
  .join("\n")}

**Dependencies:**
${
  analysisResults.dependencies
    ? `
- Total: ${analysisResults.dependencies.total}
- Vulnerable: ${analysisResults.dependencies.vulnerable}
- Outdated: ${analysisResults.dependencies.outdated}`
    : "No dependency data available"
}

Please provide actionable insights that help prioritize security improvements and understand business impact.`,
    };

    try {
      const response = await this.generateResponse([systemPrompt, userPrompt]);
      return response;
    } catch (error) {
      throw new Error(
        `Failed to generate security insights: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async generateOwaspExplanation(
    owaspCategory: string,
    relatedIssues: SecurityIssue[]
  ): Promise<string> {
    logger.debug("Generating OWASP explanation for:", owaspCategory);

    const systemPrompt = {
      role: "system" as const,
      content: `You are a cybersecurity expert specializing in OWASP Top 10 vulnerabilities. Provide a comprehensive explanation of the specified OWASP category, including:

1. **What it is**: Clear definition and technical explanation
2. **Why it matters**: Business impact and real-world consequences
3. **How it manifests**: Common attack vectors and exploitation methods
4. **Detection in this codebase**: Specific findings and their implications
5. **Remediation strategy**: Prioritized steps to address the vulnerabilities
6. **Prevention measures**: Best practices to prevent future occurrences

Focus on the specific issues found in this codebase rather than generic information.`,
    };

    const userPrompt = {
      role: "user" as const,
      content: `Explain this OWASP category and its implications for our codebase:

**OWASP Category:** ${owaspCategory}

**Related Issues Found (${relatedIssues.length}):**
${relatedIssues
  .slice(0, 5)
  .map(
    (issue: SecurityIssue) =>
      `- ${issue.message} in ${issue.filename}:${issue.line}
    Severity: ${issue.severity}, CVSS: ${issue.cvssScore?.toFixed(1) || "N/A"}
    CWE: ${issue.cweId || "N/A"}, Confidence: ${issue.confidence}%
    Impact: ${issue.impact}`
  )
  .join("\n\n")}

${relatedIssues.length > 5 ? `... and ${relatedIssues.length - 5} more related issues` : ""}

Please provide specific guidance based on these actual findings in our codebase.`,
    };

    try {
      return await this.generateResponse([systemPrompt, userPrompt]);
    } catch (error) {
      logger.error("OWASP explanation generation failed:", error);
      throw new Error(
        `Failed to generate OWASP explanation: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async generateRemediationStrategy(
    analysisResults: AnalysisResults
  ): Promise<string> {
    logger.debug("Generating remediation strategy");

    const systemPrompt = {
      role: "system" as const,
      content: `You are a senior security consultant creating a prioritized remediation strategy. Analyze the security findings and create a comprehensive action plan including:

1. **Immediate Actions** (Critical/High severity issues)
2. **Short-term Goals** (Medium severity and quick wins)
3. **Long-term Improvements** (Low severity and architectural changes)
4. **Resource Planning** (Effort estimates and team allocation)
5. **Risk Mitigation** (Temporary measures while fixes are implemented)
6. **Success Metrics** (How to measure improvement)

Prioritize based on CVSS scores, business impact, and implementation effort.`,
    };

    const criticalHighIssues = analysisResults.issues.filter(
      (i: SecurityIssue) => i.severity === "Critical" || i.severity === "High"
    );

    const quickWins = analysisResults.issues.filter(
      (i: SecurityIssue) =>
        i.remediation?.effort === "Low" &&
        (i.severity === "Medium" || i.severity === "High")
    );

    const userPrompt = {
      role: "user" as const,
      content: `Create a prioritized remediation strategy for this security analysis:

**Current Security Posture:**
- Security Score: ${analysisResults.summary?.securityScore || "N/A"}/100
- Critical + High Issues: ${criticalHighIssues.length}
- Total Technical Debt: ${analysisResults.metrics?.technicalDebt || "N/A"}

**High-Priority Issues (${criticalHighIssues.length}):**
${criticalHighIssues
  .slice(0, 8)
  .map(
    (issue: SecurityIssue) =>
      `- ${issue.message} (${issue.filename})
    CVSS: ${issue.cvssScore?.toFixed(1) || "N/A"}, Effort: ${issue.remediation?.effort || "Unknown"}
    Priority: ${issue.remediation.priority}/5, CWE: ${issue.cweId || "N/A"}`
  )
  .join("\n\n")}

**Quick Wins (Low Effort, High Impact) - ${quickWins.length} issues:**
${quickWins
  .slice(0, 5)
  .map(
    (issue: SecurityIssue) =>
      `- ${issue.message} (${issue.filename}) - ${issue.severity} severity`
  )
  .join("\n")}

**Resource Constraints:**
- Development team capacity: Assume standard agile team
- Security expertise: Mixed levels
- Timeline: Flexible but business-driven priorities

Please provide a realistic, actionable remediation roadmap with specific timelines and success criteria.`,
    };

    try {
      return await this.generateResponse([systemPrompt, userPrompt]);
    } catch (error) {
      logger.error("Remediation strategy generation failed:", error);
      throw new Error(
        `Failed to generate remediation strategy: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async answerQuestion(
    question: string,
    analysisResults: AnalysisResults
  ): Promise<string> {
    logger.debug("Answering question:", question);

    if (!analysisResults || !analysisResults.issues) {
      throw new Error("No analysis results provided for question answering");
    }

    const systemPrompt = {
      role: "system" as const,
      content: `You are a helpful code analysis assistant. You have access to the results of a code analysis that found ${analysisResults.issues.length} issues across ${analysisResults.totalFiles} files. Answer user questions about the analysis results in a helpful and detailed way. Be specific and reference the actual findings when possible.`,
    };

    const contextPrompt = {
      role: "user" as const,
      content: `Analysis Context:
      Total Files Analyzed: ${analysisResults.totalFiles}
      Analysis Time: ${analysisResults.analysisTime}
      Total Issues Found: ${analysisResults.issues.length}

      Issue Breakdown:
      - Critical Severity: ${analysisResults.issues.filter((i: SecurityIssue) => i.severity === "Critical").length}
      - High Severity: ${analysisResults.issues.filter((i: SecurityIssue) => i.severity === "High").length}
      - Medium Severity: ${analysisResults.issues.filter((i: SecurityIssue) => i.severity === "Medium").length}
      - Low Severity: ${analysisResults.issues.filter((i: SecurityIssue) => i.severity === "Low").length}

      Issue Types:
      - Security: ${analysisResults.issues.filter((i: SecurityIssue) => i.type?.toLowerCase() === "security").length}
      - Bugs: ${analysisResults.issues.filter((i: SecurityIssue) => i.type?.toLowerCase() === "bug").length}
      - Code Quality: ${analysisResults.issues.filter((i: SecurityIssue) => i.type?.toLowerCase() === "code smell").length}

      Sample Issues:
      ${analysisResults.issues
        .slice(0, 5)
        .map(
          (issue: SecurityIssue) =>
            `- ${issue.severity} ${issue.type}: ${issue.message} in ${issue.filename}:${issue.line}`
        )
        .join("\n")}

      User Question: ${question}`,
    };

    try {
      return await this.generateResponse([systemPrompt, contextPrompt]);
    } catch (error) {
      logger.error("Question answering failed:", error);
      throw new Error(
        `Failed to answer question: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async generateThreatModeling(
    analysisResults: AnalysisResults
  ): Promise<string> {
    const systemPrompt = {
      role: "system" as const,
      content: `You are a cybersecurity threat modeling expert. Analyze the security findings and create a comprehensive threat model including:

1. **Attack Surface Analysis**: Identify entry points and potential attack vectors
2. **Threat Actor Profiling**: Categorize potential attackers and their capabilities
3. **Attack Tree Analysis**: Map potential attack paths and exploitation chains
4. **STRIDE Analysis**: Evaluate Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege threats
5. **Mitigation Strategies**: Specific countermeasures for identified threats
6. **Risk Prioritization**: Rank threats by likelihood and impact

Focus on actionable threat intelligence based on the actual security findings.`,
    };

    const criticalIssues = analysisResults.issues.filter(
      (i) => i.severity === "Critical" || i.severity === "High"
    );
    const attackVectors = [
      ...new Set(criticalIssues.map((i) => i.type)),
    ].filter(Boolean);

    const userPrompt = {
      role: "user" as const,
      content: `Generate a threat model for this application based on security analysis:

**Attack Surface:**
- ${analysisResults.totalFiles} files analyzed
- ${criticalIssues.length} critical/high severity vulnerabilities
- Attack vectors identified: ${attackVectors.join(", ")}

**Critical Vulnerabilities:**
${criticalIssues
  .slice(0, 8)
  .map(
    (issue) =>
      `- ${issue.type}: ${issue.message} (${issue.filename}:${issue.line})
    CVSS: ${issue.cvssScore?.toFixed(1) || "N/A"}, CWE: ${issue.cweId || "N/A"}`
  )
  .join("\n\n")}

**OWASP Categories Present:**
${[...new Set(analysisResults.issues.map((i) => i.owaspCategory).filter(Boolean))].map((cat) => `- ${cat}`).join("\n")}

Provide a detailed threat model with specific attack scenarios and mitigation strategies.`,
    };

    try {
      return await this.generateResponse([systemPrompt, userPrompt]);
    } catch (error) {
      throw new Error(
        `Failed to generate threat modeling: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async generateComplianceAnalysis(
    analysisResults: AnalysisResults
  ): Promise<string> {
    const systemPrompt = {
      role: "system" as const,
      content: `You are a compliance and regulatory expert specializing in cybersecurity standards. Analyze the security findings against major compliance frameworks:

1. **SOC 2 Type II**: Security, availability, processing integrity, confidentiality, privacy
2. **PCI DSS**: Payment card industry data security standards
3. **GDPR**: General Data Protection Regulation requirements
4. **HIPAA**: Healthcare information privacy and security
5. **ISO 27001**: Information security management systems
6. **NIST Cybersecurity Framework**: Identify, protect, detect, respond, recover
7. **CIS Controls**: Critical security controls implementation

Provide specific compliance gaps, remediation requirements, and audit readiness assessment.`,
    };

    const securityIssues = analysisResults.issues.filter((i) =>
      i.type?.toLowerCase().includes("security")
    );
    const dataIssues = analysisResults.issues.filter(
      (i) =>
        i.message.toLowerCase().includes("data") ||
        i.message.toLowerCase().includes("privacy") ||
        i.message.toLowerCase().includes("encryption")
    );

    const userPrompt = {
      role: "user" as const,
      content: `Assess compliance posture based on security analysis:

**Security Posture:**
- Security Score: ${analysisResults.summary?.securityScore || "N/A"}/100
- Security Issues: ${securityIssues.length}
- Data Protection Issues: ${dataIssues.length}
- Critical Vulnerabilities: ${analysisResults.summary?.criticalIssues || 0}

**Key Security Findings:**
${securityIssues
  .slice(0, 10)
  .map(
    (issue) =>
      `- ${issue.severity}: ${issue.message} (${issue.filename})
    OWASP: ${issue.owaspCategory || "N/A"}, CWE: ${issue.cweId || "N/A"}`
  )
  .join("\n\n")}

**Data Protection Concerns:**
${dataIssues
  .slice(0, 5)
  .map((issue) => `- ${issue.message} in ${issue.filename}:${issue.line}`)
  .join("\n")}

Provide compliance assessment with specific gaps, requirements, and remediation roadmap for major frameworks.`,
    };

    try {
      return await this.generateResponse([systemPrompt, userPrompt]);
    } catch (error) {
      throw new Error(
        `Failed to generate compliance analysis: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async generateRiskAssessment(
    analysisResults: AnalysisResults
  ): Promise<string> {
    const systemPrompt = {
      role: "system" as const,
      content: `You are a cybersecurity risk analyst. Perform quantitative risk assessment including:

1. **Risk Quantification**: Calculate risk scores using CVSS, business impact, and likelihood
2. **Business Impact Analysis**: Assess potential financial, operational, and reputational damage
3. **Risk Heat Map**: Categorize risks by probability and impact
4. **Risk Appetite Assessment**: Evaluate acceptable vs. unacceptable risk levels
5. **Cost-Benefit Analysis**: Compare remediation costs with potential losses
6. **Risk Treatment Options**: Accept, avoid, transfer, or mitigate strategies

Provide specific risk metrics and business-focused recommendations.`,
    };

    const avgCvss =
      analysisResults.issues
        .filter((i) => i.cvssScore)
        .reduce((sum, i) => sum + (i.cvssScore || 0), 0) /
        analysisResults.issues.filter((i) => i.cvssScore).length || 0;

    const riskDistribution = {
      critical: analysisResults.issues.filter((i) => i.severity === "Critical")
        .length,
      high: analysisResults.issues.filter((i) => i.severity === "High").length,
      medium: analysisResults.issues.filter((i) => i.severity === "Medium")
        .length,
      low: analysisResults.issues.filter((i) => i.severity === "Low").length,
    };

    const userPrompt = {
      role: "user" as const,
      content: `Perform quantitative risk assessment:

**Risk Metrics:**
- Average CVSS Score: ${avgCvss.toFixed(2)}
- Security Score: ${analysisResults.summary?.securityScore || "N/A"}/100
- Vulnerability Density: ${analysisResults.metrics?.vulnerabilityDensity || "N/A"} per 1000 lines
- Technical Debt: ${analysisResults.metrics?.technicalDebt || "N/A"}

**Risk Distribution:**
- Critical Risk: ${riskDistribution.critical} issues
- High Risk: ${riskDistribution.high} issues  
- Medium Risk: ${riskDistribution.medium} issues
- Low Risk: ${riskDistribution.low} issues

**High-Impact Vulnerabilities:**
${analysisResults.issues
  .filter((i) => (i.cvssScore || 0) >= 7.0)
  .slice(0, 8)
  .map(
    (issue) =>
      `- ${issue.message} (CVSS: ${issue.cvssScore?.toFixed(1)})
      File: ${issue.filename}, Impact: ${issue.riskRating || "High"}`
  )
  .join("\n\n")}

Provide detailed risk assessment with quantified business impact and treatment recommendations.`,
    };

    try {
      return await this.generateResponse([systemPrompt, userPrompt]);
    } catch (error) {
      throw new Error(
        `Failed to generate risk assessment: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async generatePerformanceImpact(
    analysisResults: AnalysisResults
  ): Promise<string> {
    const systemPrompt = {
      role: "system" as const,
      content: `You are a performance optimization expert analyzing the impact of security fixes on application performance. Evaluate:

1. **Security Overhead**: Performance cost of implementing security measures
2. **Optimization Opportunities**: Ways to minimize performance impact while maintaining security
3. **Resource Utilization**: CPU, memory, and I/O implications of security fixes
4. **Scalability Impact**: How security changes affect system scalability
5. **User Experience**: Impact on application responsiveness and user satisfaction
6. **Monitoring Requirements**: Performance metrics to track post-remediation

Provide specific performance optimization strategies for security implementations.`,
    };

    const performanceRelatedIssues = analysisResults.issues.filter(
      (i) =>
        i.message.toLowerCase().includes("performance") ||
        i.message.toLowerCase().includes("memory") ||
        i.message.toLowerCase().includes("cpu") ||
        i.message.toLowerCase().includes("timeout") ||
        i.message.toLowerCase().includes("resource")
    );

    const securityIssues = analysisResults.issues.filter((i) =>
      i.type?.toLowerCase().includes("security")
    );

    const userPrompt = {
      role: "user" as const,
      content: `Analyze performance impact of security remediation:

**Current Performance Issues:**
${performanceRelatedIssues
  .slice(0, 5)
  .map(
    (issue) =>
      `- ${issue.message} in ${issue.filename}:${issue.line}
    Severity: ${issue.severity}, Type: ${issue.type}`
  )
  .join("\n\n")}

**Security Issues Requiring Fixes:**
${securityIssues
  .slice(0, 8)
  .map(
    (issue) =>
      `- ${issue.message} (${issue.filename})
    Remediation Effort: ${issue.remediation?.effort || "Unknown"}`
  )
  .join("\n\n")}

**System Metrics:**
- Total Files: ${analysisResults.totalFiles}
- Technical Debt: ${analysisResults.metrics?.technicalDebt || "N/A"}
- Quality Score: ${analysisResults.summary?.qualityScore || "N/A"}/100

Analyze the performance implications of implementing security fixes and provide optimization strategies.`,
    };

    try {
      return await this.generateResponse([systemPrompt, userPrompt]);
    } catch (error) {
      throw new Error(
        `Failed to generate performance impact analysis: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async generateCodeQualityInsights(
    analysisResults: AnalysisResults
  ): Promise<string> {
    const systemPrompt = {
      role: "system" as const,
      content: `You are a senior software architect and code quality expert. Provide deep insights into:

1. **Code Maintainability**: Assess long-term maintenance challenges and opportunities
2. **Technical Debt Analysis**: Quantify and prioritize technical debt reduction
3. **Architecture Quality**: Evaluate design patterns, coupling, and cohesion
4. **Code Complexity**: Analyze cyclomatic complexity and cognitive load
5. **Refactoring Opportunities**: Identify high-impact refactoring candidates
6. **Quality Metrics Trends**: Predict quality trajectory and improvement strategies
7. **Developer Productivity**: Impact of code quality on development velocity

Focus on actionable insights that improve both security and maintainability.`,
    };

    const qualityIssues = analysisResults.issues.filter(
      (i) =>
        i.type?.toLowerCase().includes("smell") ||
        i.type?.toLowerCase().includes("quality") ||
        i.type?.toLowerCase().includes("maintainability")
    );

    const complexityIssues = analysisResults.issues.filter(
      (i) =>
        i.message.toLowerCase().includes("complex") ||
        i.message.toLowerCase().includes("duplicate") ||
        i.message.toLowerCase().includes("refactor")
    );

    const userPrompt = {
      role: "user" as const,
      content: `Analyze code quality and maintainability:

**Quality Metrics:**
- Quality Score: ${analysisResults.summary?.qualityScore || "N/A"}/100
- Security Score: ${analysisResults.summary?.securityScore || "N/A"}/100
- Technical Debt: ${analysisResults.metrics?.technicalDebt || "N/A"}
- Total Files Analyzed: ${analysisResults.totalFiles}

**Code Quality Issues (${qualityIssues.length}):**
${qualityIssues
  .slice(0, 8)
  .map(
    (issue) =>
      `- ${issue.message} in ${issue.filename}:${issue.line}
    Severity: ${issue.severity}, Effort: ${issue.remediation?.effort || "Unknown"}`
  )
  .join("\n\n")}

**Complexity Issues (${complexityIssues.length}):**
${complexityIssues
  .slice(0, 5)
  .map((issue) => `- ${issue.message} (${issue.filename})`)
  .join("\n")}

**Issue Distribution:**
- Critical: ${analysisResults.summary?.criticalIssues || 0}
- High: ${analysisResults.summary?.highIssues || 0}
- Medium: ${analysisResults.summary?.mediumIssues || 0}
- Low: ${analysisResults.summary?.lowIssues || 0}

Provide comprehensive code quality insights with specific improvement strategies and refactoring recommendations.`,
    };

    try {
      return await this.generateResponse([systemPrompt, userPrompt]);
    } catch (error) {
      throw new Error(
        `Failed to generate code quality insights: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async generateTrendsAnalysis(
    analysisResults: AnalysisResults
  ): Promise<string> {
    const systemPrompt = {
      role: "system" as const,
      content: `You are a cybersecurity trends analyst with expertise in emerging threats and industry patterns. Analyze:

1. **Emerging Threat Landscape**: Latest attack vectors and vulnerability trends
2. **Industry Benchmarking**: Compare findings against industry standards and peers
3. **Technology Evolution**: Impact of new technologies on security posture
4. **Regulatory Trends**: Evolving compliance requirements and standards
5. **Best Practice Evolution**: Latest security best practices and methodologies
6. **Future Risk Predictions**: Anticipated security challenges and opportunities
7. **Investment Priorities**: Strategic security investment recommendations

Provide forward-looking insights that help prepare for future security challenges.`,
    };

    const owaspCategories = [
      ...new Set(
        analysisResults.issues.map((i) => i.owaspCategory).filter(Boolean)
      ),
    ];
    const vulnerabilityTypes = [
      ...new Set(analysisResults.issues.map((i) => i.type).filter(Boolean)),
    ];
    const avgCvss =
      analysisResults.issues
        .filter((i) => i.cvssScore)
        .reduce((sum, i) => sum + (i.cvssScore || 0), 0) /
        analysisResults.issues.filter((i) => i.cvssScore).length || 0;

    const userPrompt = {
      role: "user" as const,
      content: `Analyze security trends and provide strategic insights:

**Current Security Profile:**
- Security Score: ${analysisResults.summary?.securityScore || "N/A"}/100
- Average CVSS Score: ${avgCvss.toFixed(2)}
- Total Vulnerabilities: ${analysisResults.issues.length}
- Vulnerability Density: ${analysisResults.metrics?.vulnerabilityDensity || "N/A"} per 1000 lines

**OWASP Categories Present:**
${owaspCategories.map((cat) => `- ${cat}`).join("\n")}

**Vulnerability Types Detected:**
${vulnerabilityTypes.map((type) => `- ${type}`).join("\n")}

**Critical Security Issues:**
${analysisResults.issues
  .filter((i) => i.severity === "Critical")
  .slice(0, 5)
  .map(
    (issue) =>
      `- ${issue.message} (${issue.filename})\n  CWE: ${issue.cweId || "N/A"}, CVSS: ${issue.cvssScore?.toFixed(1) || "N/A"}`
  )
  .join("\n\n")}

**Dependencies:**
${
  analysisResults.dependencies
    ? `
- Total: ${analysisResults.dependencies.total}
- Vulnerable: ${analysisResults.dependencies.vulnerable}
- Outdated: ${analysisResults.dependencies.outdated}`
    : "No dependency data available"
}

Provide strategic security trends analysis with industry benchmarking, emerging threats assessment, and future-focused recommendations.`,
    };

    try {
      return await this.generateResponse([systemPrompt, userPrompt]);
    } catch (error) {
      throw new Error(
        `Failed to generate trends analysis: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
