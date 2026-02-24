import { AnalysisResults } from "@/hooks/useAnalysis";
import type { jsPDF } from "jspdf";

import { logger } from "@/utils/logger";

export interface PDFReportOptions {
  includeCharts?: boolean;
  includeCodeSnippets?: boolean;
  includeAIInsights?: boolean;
  customTitle?: string;
  chartSelectors?: string[];
}

export class PDFExportService {
  private doc: jsPDF | null = null;
  private currentY: number = 20;
  private pageWidth: number = 210;
  private pageHeight: number = 297;
  private margin: number = 20;

  async generateReport(
    results: AnalysisResults,
    options: PDFReportOptions = {}
  ): Promise<Blob> {
    try {
      const { jsPDF } = await import("jspdf");

      this.doc = new jsPDF();

      // Reset cursor
      this.currentY = 20;

      // Set up document
      this.doc.setFont("helvetica");
      this.doc.setFontSize(20);

      // Title
      const title = options.customTitle || "Code Guardian Security Report";
      this.doc.text(title, this.pageWidth / 2, this.currentY, {
        align: "center",
      });
      this.currentY += 15;

      // Metadata
      this.addMetadata(results);

      // Executive Summary
      this.addExecutiveSummary(results);

      // Security Issues
      this.addSecurityIssues(results, options);

      // Metrics
      this.addMetrics(results);

      // Chart snapshots from the current dashboard view
      if (options.includeCharts) {
        await this.addCharts(options.chartSelectors);
      }

      // Language Detection
      if (results.languageDetection) {
        this.addLanguageDetection(results.languageDetection);
      }

      // Generate PDF blob
      const pdfBlob = this.doc.output("blob");
      return pdfBlob;
    } catch (error) {
      logger.error("Error generating PDF report:", error);
      throw new Error("Failed to generate PDF report");
    }
  }

  private addMetadata(results: AnalysisResults): void {
    if (!this.doc) return;

    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Report Metadata", this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);

    const metadata = [
      `Analysis Date: ${new Date().toLocaleDateString()}`,
      `Analysis Time: ${results.analysisTime}`,
      `Total Files Analyzed: ${results.totalFiles}`,
      `Lines of Code: ${results.summary.linesAnalyzed.toLocaleString()}`,
      `Coverage: ${results.summary.coveragePercentage.toFixed(1)}%`,
    ];

    metadata.forEach((item) => {
      if (!this.doc) return;
      this.doc.text(item, this.margin + 5, this.currentY);
      this.currentY += 5;
    });

    this.currentY += 10;
  }

  private addExecutiveSummary(results: AnalysisResults): void {
    if (!this.doc) return;

    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Executive Summary", this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);

    const summary = [
      `Security Score: ${results.summary.securityScore}/100`,
      `Quality Score: ${results.summary.qualityScore}/100`,
      `Critical Issues: ${results.summary.criticalIssues}`,
      `High Issues: ${results.summary.highIssues}`,
      `Medium Issues: ${results.summary.mediumIssues}`,
      `Low Issues: ${results.summary.lowIssues}`,
    ];

    summary.forEach((item) => {
      if (!this.doc) return;
      this.doc.text(item, this.margin + 5, this.currentY);
      this.currentY += 5;
    });

    this.currentY += 10;
  }

  private addSecurityIssues(
    results: AnalysisResults,
    options: PDFReportOptions
  ): void {
    if (!this.doc) return;

    if (results.issues.length === 0) {
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "bold");
      this.doc.text("Security Issues", this.margin, this.currentY);
      this.currentY += 8;

      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(10);
      this.doc.text(
        "No security issues found.",
        this.margin + 5,
        this.currentY
      );
      this.currentY += 15;
      return;
    }

    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(
      `Security Issues (${results.issues.length} found)`,
      this.margin,
      this.currentY
    );
    this.currentY += 8;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);

    results.issues.forEach((issue, index) => {
      if (!this.doc) return;
      if (this.currentY > this.pageHeight - 50) {
        this.doc.addPage();
        this.currentY = 20;
      }

      // Issue header
      this.doc.setFont("helvetica", "bold");
      this.doc.text(
        `${index + 1}. ${issue.severity} - ${issue.type}`,
        this.margin,
        this.currentY
      );
      this.currentY += 5;

      // Issue details
      this.doc.setFont("helvetica", "normal");
      this.doc.text(`File: ${issue.filename}`, this.margin + 5, this.currentY);
      this.currentY += 4;

      if (issue.line) {
        this.doc.text(`Line: ${issue.line}`, this.margin + 5, this.currentY);
        this.currentY += 4;
      }

      this.doc.text(
        `Message: ${issue.message}`,
        this.margin + 5,
        this.currentY
      );
      this.currentY += 4;

      if (issue.recommendation) {
        this.doc.text(
          `Recommendation: ${issue.recommendation}`,
          this.margin + 5,
          this.currentY
        );
        this.currentY += 4;
      }

      if (options.includeCodeSnippets && issue.codeSnippet) {
        const snippetLines = this.doc.splitTextToSize(
          `Snippet: ${issue.codeSnippet}`,
          this.pageWidth - this.margin * 2 - 10
        );

        this.doc.setFont("courier", "normal");
        this.doc.text(snippetLines, this.margin + 5, this.currentY);
        this.currentY += snippetLines.length * 4;
        this.doc.setFont("helvetica", "normal");
      }

      this.currentY += 8;
    });
  }

  private async addCharts(chartSelectors?: string[]): Promise<void> {
    if (!this.doc || typeof document === "undefined") {
      return;
    }

    const selectors =
      chartSelectors && chartSelectors.length > 0
        ? chartSelectors
        : ["[data-chart-export='true']", ".recharts-wrapper"];

    const chartElements: HTMLElement[] = [];
    for (const selector of selectors) {
      document.querySelectorAll(selector).forEach((node) => {
        if (
          node instanceof HTMLElement &&
          !chartElements.includes(node) &&
          chartElements.length < 3
        ) {
          chartElements.push(node);
        }
      });
      if (chartElements.length >= 3) {
        break;
      }
    }

    if (chartElements.length === 0) {
      return;
    }

    if (this.currentY > this.pageHeight - 110) {
      this.doc.addPage();
      this.currentY = 20;
    }

    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Chart Snapshots", this.margin, this.currentY);
    this.currentY += 8;

    for (const [index, element] of chartElements.entries()) {
      if (this.currentY > this.pageHeight - 95) {
        this.doc.addPage();
        this.currentY = 20;
      }

      const imageData = await this.captureElementAsImage(element);
      const targetWidth = this.pageWidth - this.margin * 2;
      const targetHeight = 70;

      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(`Chart ${index + 1}`, this.margin, this.currentY);
      this.currentY += 4;

      this.doc.addImage(
        imageData,
        "PNG",
        this.margin,
        this.currentY,
        targetWidth,
        targetHeight,
        undefined,
        "FAST"
      );
      this.currentY += targetHeight + 8;
    }
  }

  private addMetrics(results: AnalysisResults): void {
    if (!this.doc) return;

    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Quality Metrics", this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);

    const metrics = [
      `Vulnerability Density: ${results.metrics.vulnerabilityDensity.toFixed(2)}`,
      `Technical Debt: ${results.metrics.technicalDebt}`,
      `Maintainability Index: ${results.metrics.maintainabilityIndex}`,
      `Duplicated Lines: ${results.metrics.duplicatedLines}`,
    ];

    if (results.metrics.testCoverage) {
      metrics.push(`Test Coverage: ${results.metrics.testCoverage}%`);
    }

    metrics.forEach((item) => {
      if (!this.doc) return;
      this.doc.text(item, this.margin + 5, this.currentY);
      this.currentY += 5;
    });

    this.currentY += 10;
  }

  private addLanguageDetection(detection: any): void {
    if (!this.doc) return;

    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Language Detection", this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);

    if (detection.primaryLanguage) {
      this.doc.text(
        `Primary Language: ${detection.primaryLanguage.name}`,
        this.margin + 5,
        this.currentY
      );
      this.currentY += 5;
    }

    if (detection.frameworks && detection.frameworks.length > 0) {
      this.doc.text(
        `Frameworks: ${detection.frameworks.map((f: any) => f.name).join(", ")}`,
        this.margin + 5,
        this.currentY
      );
      this.currentY += 5;
    }

    this.currentY += 10;
  }

  async captureElementAsImage(element: HTMLElement): Promise<string> {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });
      return canvas.toDataURL("image/png");
    } catch (error) {
      logger.error("Error capturing element:", error);
      throw new Error("Failed to capture element as image");
    }
  }
}

export const pdfExportService = new PDFExportService();
