/**
 * Type definitions for the About page components
 * Centralized type definitions for better type safety and maintainability
 */

import { ReactNode } from "react";

// Common types
export interface BaseSectionProps {
  className?: string;
}

// Stats grid types
export interface Stat {
  icon: ReactNode;
  label: string;
  value: string;
}

export interface StatsGridProps extends BaseSectionProps {}

// Version info types
export interface TechStackItem {
  name: string;
  icon: ReactNode;
  color: string;
}

// Feature types
export interface Feature {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  benefits: string[];
  color: string;
  gradient: string;
}

// Tool types
export interface Tool {
  name: string;
  language: string;
  type: string;
  gradient: string;
  description: string;
  features: string[];
  rating: number;
  downloads: string;
  installed?: boolean;
  version?: string;
}

export interface ToolCardProps {
  tool: Tool;
  index: number;
  viewMode?: "grid" | "list";
}

// Step types for HowToUseSection
export interface StepDetail {
  name: string;
  time: string;
  icon: ReactNode;
}

export interface SeverityLevel {
  level: string;
  color: string;
  description: string;
}

export interface ExportFormat {
  format: string;
  description: string;
}

export interface Step {
  id: number;
  title: string;
  icon: ReactNode;
  description: string;
  details: string[];
  supportedFormats?: string[];
  analysisTypes?: StepDetail[];
  severityLevels?: SeverityLevel[];
  promptTypes?: string[];
  exportFormats?: ExportFormat[];
  tips: string[];
}

// Analysis step types for HowItWorksSection
export interface AnalysisStep {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  details: string[];
  metrics: string[];
  color: string;
}

// Team member types
export interface TeamMember {
  name: string;
  role: string;
  icon: ReactNode;
  description: string;
  expertise: string[];
}

// Project highlight types
export interface ProjectHighlight {
  icon: ReactNode;
  title: string;
  description: string;
}

// Trust indicator types
export interface TrustIndicator {
  label: string;
  color: string;
  delay: string;
}

// Capability types
export interface Capability {
  icon: ReactNode;
  title: string;
  description: string;
}

// Feature item types
export interface FeatureItem {
  title: string;
  description: string;
  icon: ReactNode;
}

// Advanced metric types
export interface AdvancedMetric {
  category: string;
  icon: ReactNode;
  items: string[];
}
