/**
 * SESC-MCP Risk Optimization Agent
 * Solves the patch ordering problem:  min(Rs + Cp)
 *   Rs = residual security risk after applying patches
 *   Cp = patch instability cost
 */

import type {
  Vulnerability,
  RiskScore,
  OptimizationResult,
  SeverityLevel,
} from "../../shared/types.js";

// ---------------------------------------------------------------------------
// CVSS-like severity weights
// ---------------------------------------------------------------------------

const SEVERITY_CVSS: Record<SeverityLevel, number> = {
  critical: 9.5,
  high: 7.5,
  medium: 5.0,
  low: 2.5,
  info: 0.5,
};

// ---------------------------------------------------------------------------
// Risk score calculation
// ---------------------------------------------------------------------------

/**
 * Computes a CVSS-like risk score for each vulnerability.
 */
export function computeRiskScores(
  vulnerabilities: Vulnerability[],
  appliedPatchIds: string[],
  patchVulnMap: Record<string, string>
): RiskScore[] {
  const patchedVulnIds = new Set(
    appliedPatchIds.map((pid) => patchVulnMap[pid]).filter(Boolean)
  );

  return vulnerabilities.map((v) => {
    const isPatched = patchedVulnIds.has(v.id);
    const baseCvss = SEVERITY_CVSS[v.severity] ?? 5.0;

    // If already patched, residual risk is near zero
    const residualRisk = isPatched ? baseCvss * 0.05 : baseCvss;

    // Exploit probability from severity
    const exploitProbability = isPatched
      ? 0.02
      : v.severity === "critical"
        ? 0.9
        : v.severity === "high"
          ? 0.7
          : v.severity === "medium"
            ? 0.4
            : v.severity === "low"
              ? 0.2
              : 0.05;

    const impact =
      v.severity === "critical"
        ? 1.0
        : v.severity === "high"
          ? 0.75
          : v.severity === "medium"
            ? 0.5
            : v.severity === "low"
              ? 0.25
              : 0.05;

    return {
      vulnerabilityId: v.id,
      residualRisk: Math.round(residualRisk * 100) / 100,
      exploitProbability,
      impact,
      cvssLike: Math.round(baseCvss * 10) / 10,
    };
  });
}

// ---------------------------------------------------------------------------
// Patch optimization: min(Rs + Cp)
// ---------------------------------------------------------------------------

interface PatchOption {
  id: string;
  vulnerabilityId: string;
  confidence: number;
  instabilityCost: number;
  strategy: string;
}

/**
 * Greedy optimization: orders patches to minimize total Rs + Cp.
 *
 * Objective: min Σ(residualRisk_i × (1 - applied_i)) + Σ(instabilityCost_j × applied_j)
 *
 * Greedy heuristic: at each step, apply the patch with highest (Rs_reduction / Cp) ratio.
 */
export function optimizePatches(
  patches: PatchOption[],
  vulnerabilities: Vulnerability[]
): OptimizationResult {
  const vulnMap = new Map<string, Vulnerability>();
  for (const v of vulnerabilities) vulnMap.set(v.id, v);

  const riskMap = new Map<string, number>();
  for (const v of vulnerabilities) {
    riskMap.set(v.id, SEVERITY_CVSS[v.severity] ?? 5.0);
  }

  // Calculate value score for each patch:
  // value = (risk_reduction) / (instability_cost)
  const scored = patches.map((p) => {
    const riskReduction = riskMap.get(p.vulnerabilityId) ?? 0;
    const cost = Math.max(0.01, p.instabilityCost); // avoid div by zero
    const value = (riskReduction * p.confidence) / cost;
    return { ...p, riskReduction, value };
  });

  // Sort by value descending
  scored.sort((a, b) => b.value - a.value);

  const orderedPatchIds = scored.map((p) => p.id);

  // Calculate totals
  const totalResidualRisk = vulnerabilities.reduce((sum, v) => {
    const covered = scored.some((p) => p.vulnerabilityId === v.id);
    const base = SEVERITY_CVSS[v.severity] ?? 5.0;
    return sum + (covered ? base * 0.05 : base);
  }, 0);

  const totalInstabilityCost = scored.reduce(
    (sum, p) => sum + p.instabilityCost,
    0
  );

  const objectiveValue =
    Math.round((totalResidualRisk + totalInstabilityCost) * 100) / 100;

  const explanation = [
    `Optimized ${patches.length} patches using greedy risk/cost heuristic.`,
    `Total residual security risk: ${totalResidualRisk.toFixed(2)}`,
    `Total patch instability cost: ${totalInstabilityCost.toFixed(2)}`,
    `Combined objective value (Rs + Cp): ${objectiveValue}`,
    "Apply patches in the returned order for maximum risk reduction per unit of instability.",
    "",
    "Patch priority breakdown:",
    ...scored.map(
      (p, i) =>
        `  ${i + 1}. ${p.id} (vuln: ${p.vulnerabilityId}) – ` +
        `risk reduction: ${p.riskReduction.toFixed(1)}, ` +
        `cost: ${p.instabilityCost.toFixed(2)}, ` +
        `value ratio: ${p.value.toFixed(2)}`
    ),
  ].join("\n");

  return {
    orderedPatches: orderedPatchIds,
    totalResidualRisk: Math.round(totalResidualRisk * 100) / 100,
    totalInstabilityCost: Math.round(totalInstabilityCost * 100) / 100,
    objectiveValue,
    explanation,
  };
}

export type { PatchOption };
