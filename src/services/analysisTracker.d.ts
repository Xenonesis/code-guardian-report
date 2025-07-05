interface UserAnalysis {
  userId: string;
  filesAnalyzed: number;
  lastAnalysis?: string;
  analysisHistory: {
    timestamp: string;
    filesAnalyzed: number;
  }[];
}

interface AnalysisData {
  totalFilesAnalyzed: number;
  users: Record<string, UserAnalysis>;
}

declare module 'analysisTracker' {
  export function trackFileAnalysis(userId: string): void;
  export function getTotalFilesAnalyzed(): number;
  export function getUserAnalysis(userId: string): UserAnalysis | null;
  export function getAllUserAnalytics(): UserAnalysis[];
}