import { AnalysisResults } from "@/types/security-types";
import type jsPDF from "jspdf";

import { logger } from "@/utils/logger";

export interface PDFReportOptions {
  includeCharts?: boolean;
  includeCodeSnippets?: boolean;
  includeAIInsights?: boolean;
  customTitle?: string;
  chartSelectors?: string[];
}

export class PDFExportService {
  async generateReport(
    results: AnalysisResults,
    options: PDFReportOptions = {}
  ): Promise<Blob> {
    try {
      const jsPDFModule = await import("jspdf");
      const jsPDFClass = jsPDFModule.default;

      const doc = new jsPDFClass();
      let currentY = 20;
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;

      // Set up document
      doc.setFont("helvetica");
      doc.setFontSize(20);

      // Title
      const title = options.customTitle || "Code Guardian Security Report";
      doc.text(title, pageWidth / 2, currentY, {
        align: "center",
      });
      currentY += 15;

      // Metadata
      currentY = this.addMetadata(doc, results, currentY, margin);

      // Executive Summary
      currentY = this.addExecutiveSummary(doc, results, currentY, margin);

      // Security Issues
      currentY = this.addSecurityIssues(
        doc,
        results,
        options,
        currentY,
        pageWidth,
        pageHeight,
        margin
      );

      // Metrics
      currentY = this.addMetrics(doc, results, currentY, margin);

      // Chart snapshots from the current dashboard view
      if (options.includeCharts) {
        currentY = await this.addCharts(
          doc,
          options.chartSelectors,
          currentY,
          pageWidth,
          pageHeight,
          margin
        );
      }

      // Language Detection
      if (results.languageDetection) {
        currentY = this.addLanguageDetection(
          doc,
          results.languageDetection,
          currentY,
          margin
        );
      }

      // Generate PDF blob
      const pdfBlob = doc.output("blob");
      return pdfBlob;
    } catch (error) {
      logger.error("Error generating PDF report:", error);
      throw new Error("Failed to generate PDF report");
    }
  }

  private addMetadata(
    doc: jsPDF,
    results: AnalysisResults,
    currentY: number,
    margin: number
  ): number {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Report Metadata", margin, currentY);
    currentY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const metadata = [
      `Analysis Date: ${new Date().toLocaleDateString()}`,
      `Analysis Time: ${results.analysisTime}`,
      `Total Files Analyzed: ${results.totalFiles}`,
      `Lines of Code: ${results.summary.linesAnalyzed.toLocaleString()}`,
      `Coverage: ${results.summary.coveragePercentage.toFixed(1)}%`,
    ];

    metadata.forEach((item) => {
      doc.text(item, margin + 5, currentY);
      currentY += 5;
    });

    currentY += 10;
    return currentY;
  }

  private addExecutiveSummary(
    doc: jsPDF,
    results: AnalysisResults,
    currentY: number,
    margin: number
  ): number {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", margin, currentY);
    currentY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const summary = [
      `Security Score: ${results.summary.securityScore}/100`,
      `Quality Score: ${results.summary.qualityScore}/100`,
      `Critical Issues: ${results.summary.criticalIssues}`,
      `High Issues: ${results.summary.highIssues}`,
      `Medium Issues: ${results.summary.mediumIssues}`,
      `Low Issues: ${results.summary.lowIssues}`,
    ];

    summary.forEach((item) => {
      doc.text(item, margin + 5, currentY);
      currentY += 5;
    });

    currentY += 10;
    return currentY;
  }

  private addSecurityIssues(
    doc: jsPDF,
    results: AnalysisResults,
    options: PDFReportOptions,
    currentY: number,
    pageWidth: number,
    pageHeight: number,
    margin: number
  ): number {
    if (results.issues.length === 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Security Issues", margin, currentY);
      currentY += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("No security issues found.", margin + 5, currentY);
      currentY += 15;
      return currentY;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Security Issues (${results.issues.length} found)`,
      margin,
      currentY
    );
    currentY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    results.issues.forEach((issue, index) => {
      if (currentY > pageHeight - 50) {
        doc.addPage();
        currentY = 20;
      }

      // Issue header
      doc.setFont("helvetica", "bold");
      doc.text(
        `${index + 1}. ${issue.severity} - ${issue.type}`,
        margin,
        currentY
      );
      currentY += 5;

      // Issue details
      doc.setFont("helvetica", "normal");
      doc.text(`File: ${issue.filename}`, margin + 5, currentY);
      currentY += 4;

      if (issue.line) {
        doc.text(`Line: ${issue.line}`, margin + 5, currentY);
        currentY += 4;
      }

      doc.text(`Message: ${issue.message}`, margin + 5, currentY);
      currentY += 4;

      if (issue.recommendation) {
        doc.text(
          `Recommendation: ${issue.recommendation}`,
          margin + 5,
          currentY
        );
        currentY += 4;
      }

      if (options.includeCodeSnippets && issue.codeSnippet) {
        const snippetLines = doc.splitTextToSize(
          `Snippet: ${issue.codeSnippet}`,
          pageWidth - margin * 2 - 10
        );

        doc.setFont("courier", "normal");
        doc.text(snippetLines, margin + 5, currentY);
        currentY += snippetLines.length * 4;
        doc.setFont("helvetica", "normal");
      }

      currentY += 8;
    });

    return currentY;
  }

  private async addCharts(
    doc: jsPDF,
    chartSelectors?: string[],
    currentY = 20,
    pageWidth = 210,
    pageHeight = 297,
    margin = 20
  ): Promise<number> {
    if (typeof document === "undefined") {
      return currentY;
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
      return currentY;
    }

    if (currentY > pageHeight - 110) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Chart Snapshots", margin, currentY);
    currentY += 8;

    for (const [index, element] of chartElements.entries()) {
      if (currentY > pageHeight - 95) {
        doc.addPage();
        currentY = 20;
      }

      const imageData = await this.captureElementAsImage(element);
      const targetWidth = pageWidth - margin * 2;
      const targetHeight = 70;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Chart ${index + 1}`, margin, currentY);
      currentY += 4;

      doc.addImage(
        imageData,
        "PNG",
        margin,
        currentY,
        targetWidth,
        targetHeight,
        undefined,
        "FAST"
      );
      currentY += targetHeight + 8;
    }

    return currentY;
  }

  private addMetrics(
    doc: jsPDF,
    results: AnalysisResults,
    currentY: number,
    margin: number
  ): number {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Quality Metrics", margin, currentY);
    currentY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

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
      doc.text(item, margin + 5, currentY);
      currentY += 5;
    });

    currentY += 10;
    return currentY;
  }

  private addLanguageDetection(
    doc: jsPDF,
    detection: any,
    currentY: number,
    margin: number
  ): number {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Language Detection", margin, currentY);
    currentY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    if (detection.primaryLanguage) {
      doc.text(
        `Primary Language: ${detection.primaryLanguage.name}`,
        margin + 5,
        currentY
      );
      currentY += 5;
    }

    if (detection.frameworks && detection.frameworks.length > 0) {
      doc.text(
        `Frameworks: ${detection.frameworks.map((f: any) => f.name).join(", ")}`,
        margin + 5,
        currentY
      );
      currentY += 5;
    }

    currentY += 10;
    return currentY;
  }

  async captureElementAsImage(element: HTMLElement): Promise<string> {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      } as Parameters<typeof html2canvas>[1]);
      return canvas.toDataURL("image/png");
    } catch (error) {
      logger.error("Error capturing element:", error);
      throw new Error("Failed to capture element as image");
    }
  }
}

export const pdfExportService = new PDFExportService();
