/**
 * Custom Rules Engine
 * Allows users to define and apply custom security rules
 */

import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { enhancedNotifications } from "@/utils/enhancedToastNotifications";

import { logger } from "@/utils/logger";
export type RuleType = "pattern" | "ast" | "regex" | "esquery";
export type RuleSeverity = "Critical" | "High" | "Medium" | "Low";
export type RuleLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "go"
  | "rust"
  | "php"
  | "ruby"
  | "all";

export interface CustomRule {
  id?: string;
  userId: string;
  name: string;
  description: string;
  category: string; // e.g., "Security", "Performance", "Best Practices"
  language: RuleLanguage;
  severity: RuleSeverity;
  type: RuleType;

  // Rule definition based on type
  pattern?: {
    search: string; // Pattern to search for
    flags?: string; // Regex flags (g, i, m, etc.)
    context?: string; // Additional context requirements
  };

  astQuery?: {
    selector: string; // ESQuery selector
    conditions?: Record<string, any>; // Additional conditions
  };

  regex?: {
    pattern: string;
    flags?: string;
    multiline?: boolean;
  };

  // Metadata
  message: string; // Message to show when rule matches
  recommendation: string; // How to fix the issue
  references?: string[]; // URLs to documentation
  tags: string[];

  // CWE/OWASP mappings
  cwe?: string;
  owasp?: string;

  // Rule behavior
  enabled: boolean;
  autoFix?: {
    enabled: boolean;
    replacement: string;
  };

  // Statistics
  matchCount?: number;
  lastMatched?: number;

  // Sharing
  isPublic: boolean;
  sharedWith?: string[]; // User IDs

  createdAt: number;
  updatedAt: number;
}

export interface RuleMatch {
  ruleId: string;
  ruleName: string;
  file: string;
  line: number;
  column: number;
  matchedText: string;
  severity: RuleSeverity;
  message: string;
  recommendation: string;
  autoFix?: {
    available: boolean;
    replacement: string;
  };
}

export interface RuleCategory {
  name: string;
  description: string;
  icon: string;
  ruleCount: number;
}

export interface RuleTemplate {
  name: string;
  description: string;
  category: string;
  language: RuleLanguage;
  severity: RuleSeverity;
  type: RuleType;
  template: Partial<CustomRule>;
}

class CustomRulesEngineClass {
  private rulesCollection = "customRules";
  private ruleMatchesCollection = "ruleMatches";

  /**
   * Predefined rule templates
   */
  private templates: RuleTemplate[] = [
    {
      name: "Hardcoded API Keys",
      description: "Detect hardcoded API keys and secrets",
      category: "Security",
      language: "all",
      severity: "Critical",
      type: "regex",
      template: {
        regex: {
          pattern:
            "(api[_-]?key|api[_-]?secret|access[_-]?token)\\s*[=:]\\s*[\"']([a-zA-Z0-9_-]{20,})[\"']",
          flags: "gi",
        },
        message: "Hardcoded API key or secret detected",
        recommendation:
          "Store sensitive credentials in environment variables or a secure vault",
        cwe: "CWE-798",
        owasp: "A02:2021",
      },
    },
    {
      name: "SQL Injection Risk",
      description: "Detect potential SQL injection vulnerabilities",
      category: "Security",
      language: "all",
      severity: "Critical",
      type: "pattern",
      template: {
        pattern: {
          search: "execute.*\\+.*\\+",
          flags: "gi",
        },
        message: "Potential SQL injection - string concatenation in query",
        recommendation: "Use parameterized queries or prepared statements",
        cwe: "CWE-89",
        owasp: "A03:2021",
      },
    },
    {
      name: "Console.log in Production",
      description: "Detect console.log statements that should be removed",
      category: "Best Practices",
      language: "javascript",
      severity: "Low",
      type: "pattern",
      template: {
        pattern: {
          search: "console\\.log",
          flags: "g",
        },
        message:
          "console.log statement found - should be removed in production",
        recommendation:
          "Use a proper logging framework or remove debug statements",
        autoFix: {
          enabled: true,
          replacement: "// console.log",
        },
      },
    },
    {
      name: "Deprecated Function Usage",
      description: "Detect usage of deprecated functions",
      category: "Best Practices",
      language: "javascript",
      severity: "Medium",
      type: "pattern",
      template: {
        pattern: {
          search:
            "componentWillMount|componentWillReceiveProps|componentWillUpdate",
          flags: "g",
        },
        message: "Deprecated React lifecycle method",
        recommendation: "Use modern lifecycle methods or hooks",
      },
    },
    {
      name: "Missing Error Handling",
      description: "Detect async functions without try-catch",
      category: "Best Practices",
      language: "javascript",
      severity: "Medium",
      type: "ast",
      template: {
        astQuery: {
          selector: "FunctionDeclaration[async=true]:not(:has(TryStatement))",
        },
        message: "Async function missing error handling",
        recommendation: "Add try-catch block or .catch() handler",
      },
    },
  ];

  /**
   * Create a new custom rule
   */
  async createRule(
    rule: Omit<CustomRule, "id" | "createdAt" | "updatedAt" | "matchCount">
  ): Promise<CustomRule> {
    try {
      const now = Date.now();
      const ruleData: Omit<CustomRule, "id"> = {
        ...rule,
        matchCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(
        collection(db, this.rulesCollection),
        ruleData
      );

      const customRule: CustomRule = {
        ...ruleData,
        id: docRef.id,
      };

      enhancedNotifications.success("Custom Rule Created", {
        message: `Rule "${rule.name}" has been created`,
        category: "system",
        priority: "normal",
      });

      return customRule;
    } catch (error) {
      logger.error("Failed to create custom rule:", error);
      enhancedNotifications.error("Rule Creation Failed", {
        message: error instanceof Error ? error.message : "Unknown error",
        category: "system",
        priority: "high",
      });
      throw error;
    }
  }

  /**
   * Get custom rules for a user
   */
  async getRules(
    userId: string,
    options?: {
      language?: RuleLanguage;
      category?: string;
      enabled?: boolean;
    }
  ): Promise<CustomRule[]> {
    try {
      let q = query(
        collection(db, this.rulesCollection),
        where("userId", "==", userId)
      );

      const snapshot = await getDocs(q);
      let rules = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as CustomRule
      );

      // Apply filters
      if (options?.language && options.language !== "all") {
        rules = rules.filter(
          (r) => r.language === options.language || r.language === "all"
        );
      }
      if (options?.category) {
        rules = rules.filter((r) => r.category === options.category);
      }
      if (options?.enabled !== undefined) {
        rules = rules.filter((r) => r.enabled === options.enabled);
      }

      return rules;
    } catch (error) {
      logger.error("Failed to get custom rules:", error);
      return [];
    }
  }

  /**
   * Get public rules (shared by other users)
   */
  async getPublicRules(options?: {
    language?: RuleLanguage;
    category?: string;
  }): Promise<CustomRule[]> {
    try {
      const q = query(
        collection(db, this.rulesCollection),
        where("isPublic", "==", true)
      );

      const snapshot = await getDocs(q);
      let rules = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as CustomRule
      );

      // Apply filters
      if (options?.language && options.language !== "all") {
        rules = rules.filter(
          (r) => r.language === options.language || r.language === "all"
        );
      }
      if (options?.category) {
        rules = rules.filter((r) => r.category === options.category);
      }

      return rules;
    } catch (error) {
      logger.error("Failed to get public rules:", error);
      return [];
    }
  }

  /**
   * Update custom rule
   */
  async updateRule(
    ruleId: string,
    updates: Partial<CustomRule>
  ): Promise<void> {
    try {
      const ruleRef = doc(db, this.rulesCollection, ruleId);
      await updateDoc(ruleRef, {
        ...updates,
        updatedAt: Date.now(),
      });

      enhancedNotifications.success("Rule Updated", {
        category: "system",
        priority: "low",
      });
    } catch (error) {
      logger.error("Failed to update rule:", error);
      enhancedNotifications.error("Rule Update Failed", {
        category: "system",
        priority: "high",
      });
      throw error;
    }
  }

  /**
   * Delete custom rule
   */
  async deleteRule(ruleId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.rulesCollection, ruleId));

      enhancedNotifications.success("Rule Deleted", {
        category: "system",
        priority: "low",
      });
    } catch (error) {
      logger.error("Failed to delete rule:", error);
      enhancedNotifications.error("Rule Deletion Failed", {
        category: "system",
        priority: "high",
      });
      throw error;
    }
  }

  /**
   * Apply custom rules to code
   */
  async applyRules(
    code: string,
    filename: string,
    rules: CustomRule[]
  ): Promise<RuleMatch[]> {
    const matches: RuleMatch[] = [];

    for (const rule of rules) {
      if (!rule.enabled) continue;

      try {
        const ruleMatches = await this.applyRule(code, filename, rule);
        matches.push(...ruleMatches);

        // Update match count
        if (ruleMatches.length > 0 && rule.id) {
          await this.updateMatchCount(rule.id, ruleMatches.length);
        }
      } catch (error) {
        logger.error(`Failed to apply rule ${rule.name}:`, error);
      }
    }

    return matches;
  }

  /**
   * Apply a single rule to code
   */
  private async applyRule(
    code: string,
    filename: string,
    rule: CustomRule
  ): Promise<RuleMatch[]> {
    const matches: RuleMatch[] = [];

    switch (rule.type) {
      case "regex":
        if (rule.regex) {
          matches.push(...this.applyRegexRule(code, filename, rule));
        }
        break;

      case "pattern":
        if (rule.pattern) {
          matches.push(...this.applyPatternRule(code, filename, rule));
        }
        break;

      case "ast":
        // AST-based rules would require parsing
        // This is a placeholder for AST analysis
        break;
    }

    return matches;
  }

  /**
   * Apply regex-based rule
   */
  private applyRegexRule(
    code: string,
    filename: string,
    rule: CustomRule
  ): RuleMatch[] {
    const matches: RuleMatch[] = [];

    if (!rule.regex) return matches;

    try {
      const regex = new RegExp(rule.regex.pattern, rule.regex.flags || "g");
      const lines = code.split("\n");

      lines.forEach((line, lineIndex) => {
        let match;
        while ((match = regex.exec(line)) !== null) {
          matches.push({
            ruleId: rule.id || "unknown",
            ruleName: rule.name,
            file: filename,
            line: lineIndex + 1,
            column: match.index,
            matchedText: match[0],
            severity: rule.severity,
            message: rule.message,
            recommendation: rule.recommendation,
            autoFix: rule.autoFix?.enabled
              ? {
                  available: true,
                  replacement: rule.autoFix.replacement,
                }
              : undefined,
          });
        }
      });
    } catch (error) {
      logger.error("Regex rule error:", error);
    }

    return matches;
  }

  /**
   * Apply pattern-based rule
   */
  private applyPatternRule(
    code: string,
    filename: string,
    rule: CustomRule
  ): RuleMatch[] {
    const matches: RuleMatch[] = [];

    if (!rule.pattern) return matches;

    try {
      const regex = new RegExp(rule.pattern.search, rule.pattern.flags || "g");
      const lines = code.split("\n");

      lines.forEach((line, lineIndex) => {
        let match;
        while ((match = regex.exec(line)) !== null) {
          matches.push({
            ruleId: rule.id || "unknown",
            ruleName: rule.name,
            file: filename,
            line: lineIndex + 1,
            column: match.index,
            matchedText: match[0],
            severity: rule.severity,
            message: rule.message,
            recommendation: rule.recommendation,
            autoFix: rule.autoFix?.enabled
              ? {
                  available: true,
                  replacement: rule.autoFix.replacement,
                }
              : undefined,
          });
        }
      });
    } catch (error) {
      logger.error("Pattern rule error:", error);
    }

    return matches;
  }

  /**
   * Update rule match count
   */
  private async updateMatchCount(
    ruleId: string,
    additionalMatches: number
  ): Promise<void> {
    try {
      const ruleRef = doc(db, this.rulesCollection, ruleId);
      const ruleDoc = await getDocs(
        query(
          collection(db, this.rulesCollection),
          where("__name__", "==", ruleId)
        )
      );

      if (!ruleDoc.empty) {
        const currentCount = ruleDoc.docs[0].data().matchCount || 0;
        await updateDoc(ruleRef, {
          matchCount: currentCount + additionalMatches,
          lastMatched: Date.now(),
        });
      }
    } catch (error) {
      logger.error("Failed to update match count:", error);
    }
  }

  /**
   * Get rule templates
   */
  getTemplates(options?: {
    category?: string;
    language?: RuleLanguage;
  }): RuleTemplate[] {
    let templates = this.templates;

    if (options?.category) {
      templates = templates.filter((t) => t.category === options.category);
    }
    if (options?.language && options.language !== "all") {
      templates = templates.filter(
        (t) => t.language === options.language || t.language === "all"
      );
    }

    return templates;
  }

  /**
   * Create rule from template
   */
  async createFromTemplate(
    userId: string,
    templateName: string,
    customizations?: Partial<CustomRule>
  ): Promise<CustomRule> {
    const template = this.templates.find((t) => t.name === templateName);
    if (!template) {
      throw new Error("Template not found");
    }

    const rule: Omit<
      CustomRule,
      "id" | "createdAt" | "updatedAt" | "matchCount"
    > = {
      userId,
      name: template.name,
      description: template.description,
      category: template.category,
      language: template.language,
      severity: template.severity,
      type: template.type,
      message: "",
      recommendation: "",
      tags: [template.category.toLowerCase()],
      enabled: true,
      isPublic: false,
      ...template.template,
      ...customizations,
    };

    return this.createRule(rule);
  }

  /**
   * Get rule categories with counts
   */
  async getRuleCategories(userId: string): Promise<RuleCategory[]> {
    const rules = await this.getRules(userId);
    const categoriesMap = new Map<string, number>();

    rules.forEach((rule) => {
      categoriesMap.set(
        rule.category,
        (categoriesMap.get(rule.category) || 0) + 1
      );
    });

    const categories: RuleCategory[] = Array.from(categoriesMap.entries()).map(
      ([name, count]) => ({
        name,
        description: this.getCategoryDescription(name),
        icon: this.getCategoryIcon(name),
        ruleCount: count,
      })
    );

    return categories.sort((a, b) => b.ruleCount - a.ruleCount);
  }

  /**
   * Get category description
   */
  private getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      Security: "Rules that detect security vulnerabilities and risks",
      Performance: "Rules that identify performance bottlenecks",
      "Best Practices": "Rules that enforce coding standards and conventions",
      Maintainability: "Rules that improve code maintainability",
      Accessibility: "Rules that ensure accessibility compliance",
      Testing: "Rules related to test coverage and quality",
    };
    return descriptions[category] || "Custom rule category";
  }

  /**
   * Get category icon
   */
  private getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      Security: "🔒",
      Performance: "⚡",
      "Best Practices": "✨",
      Maintainability: "🔧",
      Accessibility: "♿",
      Testing: "🧪",
    };
    return icons[category] || "📋";
  }

  /**
   * Validate rule syntax
   */
  validateRule(rule: Partial<CustomRule>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!rule.name || rule.name.trim().length === 0) {
      errors.push("Rule name is required");
    }

    if (!rule.severity) {
      errors.push("Severity is required");
    }

    if (!rule.type) {
      errors.push("Rule type is required");
    }

    // Type-specific validation
    if (rule.type === "regex" && !rule.regex?.pattern) {
      errors.push("Regex pattern is required for regex rules");
    }

    if (rule.type === "pattern" && !rule.pattern?.search) {
      errors.push("Search pattern is required for pattern rules");
    }

    if (rule.type === "ast" && !rule.astQuery?.selector) {
      errors.push("AST selector is required for AST rules");
    }

    // Validate regex syntax
    if (rule.regex?.pattern) {
      try {
        new RegExp(rule.regex.pattern, rule.regex.flags);
      } catch (e) {
        errors.push("Invalid regex pattern syntax");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Export rules to JSON
   */
  async exportRules(userId: string): Promise<string> {
    const rules = await this.getRules(userId);
    return JSON.stringify(rules, null, 2);
  }

  /**
   * Import rules from JSON
   */
  async importRules(
    userId: string,
    json: string
  ): Promise<{
    imported: number;
    failed: number;
    errors: string[];
  }> {
    const result = {
      imported: 0,
      failed: 0,
      errors: [] as string[],
    };

    try {
      const rules: CustomRule[] = JSON.parse(json);

      for (const rule of rules) {
        try {
          // Remove ID to create new rule
          const { id, createdAt, updatedAt, matchCount, ...ruleData } = rule;

          await this.createRule({
            ...ruleData,
            userId,
          });

          result.imported++;
        } catch (error) {
          result.failed++;
          result.errors.push(
            `Failed to import rule "${rule.name}": ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }
    } catch (error) {
      result.errors.push("Invalid JSON format");
    }

    return result;
  }
}

export const CustomRulesEngine = new CustomRulesEngineClass();
