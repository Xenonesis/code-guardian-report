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

// Using in-memory cache instead of localStorage
const analysisCache: AnalysisData = {
  totalFilesAnalyzed: 0,
  users: {}
};

export function trackFileAnalysis(userId: string): void {
  const timestamp = new Date().toISOString();

  // Initialize user if not exists
  if (!analysisCache.users[userId]) {
    analysisCache.users[userId] = {
      userId,
      filesAnalyzed: 0,
      analysisHistory: []
    };
  }

  // Update counts and history
  const user = analysisCache.users[userId];
  user.filesAnalyzed += 1;
  user.lastAnalysis = timestamp;
  user.analysisHistory.push({
    timestamp,
    filesAnalyzed: user.filesAnalyzed
  });
  analysisCache.totalFilesAnalyzed += 1;
}

export function getTotalFilesAnalyzed(): number {
  return analysisCache.totalFilesAnalyzed;
}

export function getUserAnalysis(userId: string): UserAnalysis | null {
  return analysisCache.users[userId] || null;
}

export function getAllUserAnalytics(): UserAnalysis[] {
  return Object.values(analysisCache.users);
}

export function resetAnalysisCache(): void {
  analysisCache.totalFilesAnalyzed = 0;
  analysisCache.users = {};
}