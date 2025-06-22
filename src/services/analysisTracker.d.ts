declare module 'analysisTracker' {
  export function trackFileAnalysis(userId: string): void;
  export function getTotalFilesAnalyzed(): number;
}