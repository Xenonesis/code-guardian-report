/**
 * SESC-MCP Orchestrator Tool
 * Registers the full_security_pipeline tool – a single end-to-end tool that
 * runs all 5 agents in sequence: scan → exploit sim → patch gen → validate → optimize.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FullPipelineInputSchema } from "../shared/zod-schemas.js";
import type { MemoryDatabase } from "../memory/database.js";
import { enrichFiles, toJsonString } from "../shared/utils.js";
import { scanCodebase, calculateMetrics } from "../agents/scanner/index.js";
import { buildExploitGraph } from "../agents/exploit-sim/index.js";
import { generatePatch } from "../agents/patch-gen/index.js";
import { validatePatch } from "../agents/validation/index.js";
import {
  optimizePatches,
  computeRiskScores,
} from "../agents/risk-optimizer/index.js";
import type {
  Vulnerability,
  Patch,
  ValidationResult,
  RiskScore,
  AttackPath,
  ExploitGraph,
  PipelineResult,
  PipelineSummary,
} from "../shared/types.js";

type PipelineInput = z.infer<typeof FullPipelineInputSchema>;

type EnrichedFile = { name: string; content: string; language: string };

export function registerOrchestratorTools(
  server: McpServer,
  db: MemoryDatabase,
  confidenceThreshold: number
): void {
  server.registerTool(
    "full_security_pipeline",
    {
      description:
        "Run the complete SESC-MCP self-evolving security pipeline end-to-end:\n" +
        "1. Scanner Agent: scan all files for vulnerabilities\n" +
        "2. Exploit Simulation Agent: build exploit graph and rank attack paths\n" +
        "3. Patch Generation Agent: generate fixes for each vulnerability\n" +
        "4. Validation Agent: verify each patch resolves the issue safely\n" +
        "5. Risk Optimization Agent: order patches by min(Rs + Cp)\n" +
        "6. Memory Module: record results for adaptive learning\n" +
        "Returns a complete remediation report with all findings, patches, and risk analysis.",
      inputSchema: FullPipelineInputSchema.shape,
    },
    async ({
      files,
      severityThreshold,
      maxAttackPaths,
      confidenceThreshold: ctArg,
    }: PipelineInput) => {
      const ct = ctArg ?? confidenceThreshold;
      const enriched: EnrichedFile[] = enrichFiles(
        files.map(
          (f: { name: string; content: string; language?: string }) => ({
            name: f.name,
            content: f.content,
            language: f.language ?? undefined,
          })
        )
      ) as EnrichedFile[];

      const SEVERITY_ORDER = ["info", "low", "medium", "high", "critical"];
      const thresholdIndex = SEVERITY_ORDER.indexOf(severityThreshold ?? "low");

      // -----------------------------------------------------------------------
      // Stage 1: Scan
      // -----------------------------------------------------------------------
      const scanResult = scanCodebase(enriched) as {
        vulnerabilities: Vulnerability[];
        filesScanned: number;
        linesScanned: number;
      };
      const vulnerabilities: Vulnerability[] =
        scanResult.vulnerabilities.filter(
          (v: Vulnerability) =>
            SEVERITY_ORDER.indexOf(v.severity) >= thresholdIndex
        );

      // -----------------------------------------------------------------------
      // Stage 2: Exploit Graph
      // -----------------------------------------------------------------------
      const exploitGraph = buildExploitGraph(
        enriched,
        vulnerabilities
      ) as ExploitGraph;

      // -----------------------------------------------------------------------
      // Stage 3: Patch Generation
      // -----------------------------------------------------------------------
      const patches: Patch[] = [];
      for (const vuln of vulnerabilities) {
        if (!vuln.file) continue;
        const fileObj = enriched.find(
          (f: EnrichedFile) => f.name === vuln.file
        );
        if (!fileObj) continue;

        const memoryStrategy = db.getBestStrategy(vuln.type, fileObj.language);
        const patch = generatePatch(
          vuln,
          fileObj.content,
          undefined,
          memoryStrategy
        ) as Patch;
        patches.push(patch);
      }

      // -----------------------------------------------------------------------
      // Stage 4: Validation
      // -----------------------------------------------------------------------
      const validations: ValidationResult[] = [];
      for (const patch of patches) {
        const vuln = vulnerabilities.find(
          (v: Vulnerability) => v.id === patch.vulnerabilityId
        );
        const result = validatePatch({
          originalContent: patch.originalContent,
          patchedContent: patch.patchedContent,
          filename: patch.file,
          vulnerability: vuln,
          patchStrategy: patch.strategy,
          confidenceThreshold: ct,
        }) as ValidationResult;
        validations.push(result);

        // Record in memory
        db.record({
          issueType: vuln?.type ?? "vulnerability",
          cwe: vuln?.cwe,
          language: enriched.find((f: EnrichedFile) => f.name === patch.file)
            ?.language,
          patchStrategy: patch.strategy,
          validationSuccess:
            result.vulnerabilityResolved && !result.rollbackRecommended,
          rolledBack: result.rollbackRecommended,
          confidenceScore: result.confidenceScore,
        });
      }

      // -----------------------------------------------------------------------
      // Stage 5: Risk Optimization
      // -----------------------------------------------------------------------
      const patchOptions = patches.map((p: Patch, i: number) => ({
        id: p.id,
        vulnerabilityId: p.vulnerabilityId,
        confidence: validations[i]?.confidenceScore ?? p.confidence,
        instabilityCost: p.instabilityCost,
        strategy: p.strategy,
      }));

      const patchVulnMap: Record<string, string> = {};
      for (const p of patches) patchVulnMap[p.id] = p.vulnerabilityId;

      const optimizationResult =
        patchOptions.length > 0
          ? (optimizePatches(patchOptions, vulnerabilities) as {
              orderedPatches: string[];
              totalResidualRisk: number;
              totalInstabilityCost: number;
              objectiveValue: number;
              explanation: string;
            })
          : {
              orderedPatches: [] as string[],
              totalResidualRisk: 0,
              totalInstabilityCost: 0,
              objectiveValue: 0,
              explanation: "No patches generated.",
            };

      const riskScores: RiskScore[] = computeRiskScores(
        vulnerabilities,
        patches
          .filter(
            (_: Patch, i: number) =>
              validations[i] && !validations[i]?.rollbackRecommended
          )
          .map((p: Patch) => p.id),
        patchVulnMap
      ) as RiskScore[];

      const totalResidualRisk = riskScores.reduce(
        (s: number, r: RiskScore) => s + r.residualRisk,
        0
      );
      const metrics = calculateMetrics(vulnerabilities) as {
        criticalCount: number;
        highCount: number;
        mediumCount: number;
        lowCount: number;
        securityScore: number;
      };

      // -----------------------------------------------------------------------
      // Summary
      // -----------------------------------------------------------------------
      const acceptedPatches = validations.filter(
        (v: ValidationResult) => !v.rollbackRecommended
      ).length;
      const summary: PipelineSummary = {
        totalVulnerabilities: vulnerabilities.length,
        criticalCount: metrics.criticalCount,
        highCount: metrics.highCount,
        mediumCount: metrics.mediumCount,
        lowCount: metrics.lowCount,
        patchesGenerated: patches.length,
        patchesValidated: acceptedPatches,
        overallRiskScore: Math.round(totalResidualRisk * 100) / 100,
        remediationCoverage:
          vulnerabilities.length > 0
            ? Math.round((acceptedPatches / vulnerabilities.length) * 100)
            : 100,
      };

      const result: PipelineResult = {
        scanResults: vulnerabilities,
        exploitGraph,
        patches,
        validations,
        optimizationResult,
        summary,
      };

      return {
        content: [
          {
            type: "text" as const,
            text: toJsonString({
              pipeline: "SESC-MCP Full Security Pipeline",
              stages: {
                "1_scan": {
                  filesScanned: scanResult.filesScanned,
                  linesScanned: scanResult.linesScanned,
                  vulnerabilitiesFound: vulnerabilities.length,
                  securityScore: metrics.securityScore,
                },
                "2_exploit_sim": {
                  graphNodes: exploitGraph.nodes.length,
                  graphEdges: exploitGraph.edges.length,
                  attackPaths: exploitGraph.attackPaths
                    .slice(0, maxAttackPaths ?? 5)
                    .map((p: AttackPath) => ({
                      id: p.id,
                      riskScore: p.riskScore,
                      narrative: p.narrative,
                    })),
                },
                "3_patch_gen": {
                  patchesGenerated: patches.length,
                  strategiesUsed: [
                    ...new Set(patches.map((p: Patch) => p.strategy)),
                  ],
                },
                "4_validation": {
                  patchesValidated: validations.length,
                  accepted: acceptedPatches,
                  rolledBack: validations.filter(
                    (v: ValidationResult) => v.rollbackRecommended
                  ).length,
                  avgConfidence:
                    validations.length > 0
                      ? Math.round(
                          (validations.reduce(
                            (s: number, v: ValidationResult) =>
                              s + v.confidenceScore,
                            0
                          ) /
                            validations.length) *
                            100
                        ) / 100
                      : 0,
                },
                "5_risk_optimization": {
                  objectiveValue: optimizationResult.objectiveValue,
                  totalResidualRisk: optimizationResult.totalResidualRisk,
                  orderedPatchIds: optimizationResult.orderedPatches,
                },
              },
              summary,
              fullResults: result,
            }),
          },
        ],
      };
    }
  );
}
