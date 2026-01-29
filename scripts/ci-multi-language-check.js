/**
 * CI/CD Multi-Language Check Script
 * Validates that all language parsers and security rules are working
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("CI/CD Multi-Language Validation\n");

// Configuration
const config = {
  parserFile: "src/services/analysis/MultiLanguageParser.ts",
  analyzerFile: "src/services/analysis/MultiLanguageSecurityAnalyzer.ts",
  requiredLanguages: [
    "javascript",
    "typescript",
    "python",
    "java",
    "cpp",
    "c",
    "go",
    "rust",
    "php",
    "csharp",
    "ruby",
    "swift",
    "kotlin",
  ],
  minRulesPerLanguage: 3,
};

let allChecksPassed = true;

// Check 1: Parser file exists
console.log("Checking parser file...");
if (!fs.existsSync(config.parserFile)) {
  console.error(`  Parser file not found: ${config.parserFile}`);
  allChecksPassed = false;
} else {
  console.log("  Parser file exists");
}

// Check 2: Analyzer file exists
console.log("Checking analyzer file...");
if (!fs.existsSync(config.analyzerFile)) {
  console.error(`  Analyzer file not found: ${config.analyzerFile}`);
  allChecksPassed = false;
} else {
  console.log("  Analyzer file exists");
}

// Check 3: All languages are defined
console.log("Checking language support...");
const parserContent = fs.readFileSync(config.parserFile, "utf8");
const analyzerContent = fs.readFileSync(config.analyzerFile, "utf8");

config.requiredLanguages.forEach((lang) => {
  const inParser = parserContent.includes(`'${lang}'`);
  const inAnalyzer = analyzerContent.includes(`'${lang}'`);

  if (!inParser || !inAnalyzer) {
    console.error(`  Language '${lang}' not properly configured`);
    allChecksPassed = false;
  } else {
    console.log(`  ${lang} configured`);
  }
});

// Check 4: Security rules exist
console.log("Checking security rules...");
const rulePattern = /id:\s*'(\w+-\w+-\w+)'/g;
const rules = [...analyzerContent.matchAll(rulePattern)];
console.log(`  Found ${rules.length} security rules`);

// Check 5: Each language has minimum rules
console.log("Checking rules per language...");
config.requiredLanguages.forEach((lang) => {
  const langRulePattern = new RegExp(
    `languages:\\s*\\[([^\\]])*'${lang}'`,
    "g"
  );
  const langRules = [...analyzerContent.matchAll(langRulePattern)];

  if (langRules.length < config.minRulesPerLanguage) {
    console.warn(
      `  ${lang} has only ${langRules.length} rules (minimum: ${config.minRulesPerLanguage})`
    );
  } else {
    console.log(`  ${lang}: ${langRules.length} rules`);
  }
});

// Check 6: UI components updated
console.log("Checking UI components...");
const displayFile = "src/components/language/MultiLanguageSupportDisplay.tsx";
if (fs.existsSync(displayFile)) {
  const displayContent = fs.readFileSync(displayFile, "utf8");
  const languageCount = (displayContent.match(/name:\s*'/g) || []).length;
  console.log(`  UI component has ${languageCount} languages configured`);

  if (languageCount < config.requiredLanguages.length) {
    console.warn(
      `  UI might not show all languages (found ${languageCount}, expected ${config.requiredLanguages.length})`
    );
  }
} else {
  console.warn("  UI component file not found");
}

// Check 7: Test file exists
console.log("Checking test files...");
const testFile = "src/tests/multiLanguageAnalysis.test.ts";
if (fs.existsSync(testFile)) {
  console.log("  Test file exists");
} else {
  console.warn(`  Test file not found: ${testFile}`);
}

// Final summary
console.log("\n" + "=".repeat(60));
if (allChecksPassed) {
  console.log(
    "All checks passed! Multi-language support is properly configured.\n"
  );
  process.exit(0);
} else {
  console.log("Some checks failed. Please review the output above.\n");
  process.exit(1);
}
