import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { AnalysisResults } from "@/hooks/useAnalysis";

import { logger } from "@/utils/logger";
export interface PDFReportOptions {
  includeCharts?: boolean;
  includeCodeSnippets?: boolean;
  includeAIInsights?: boolean;
  customTitle?: string;
}

export class PDFExportService {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageWidth: number = 210;
  private pageHeight: number = 297;
  private margin: number = 20;
  private lineHeight: number = 7;

  constructor() {
    this.doc = new jsPDF();
  }

  async generateReport(
    results: AnalysisResults,
    options: PDFReportOptions = {}
  ): Promise<Blob> {
    try {
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
      this.addSecurityIssues(results);

      // Metrics
      this.addMetrics(results);

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
      this.doc.text(item, this.margin + 5, this.currentY);
      this.currentY += 5;
    });

    this.currentY += 10;
  }

  private addExecutiveSummary(results: AnalysisResults): void {
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
      this.doc.text(item, this.margin + 5, this.currentY);
      this.currentY += 5;
    });

    this.currentY += 10;
  }

  private addSecurityIssues(results: AnalysisResults): void {
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

      this.currentY += 8;
    });
  }

  private addMetrics(results: AnalysisResults): void {
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
      this.doc.text(item, this.margin + 5, this.currentY);
      this.currentY += 5;
    });

    this.currentY += 10;
  }

  private addLanguageDetection(detection: any): void {
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
