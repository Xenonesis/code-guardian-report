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

function getInitialData(): AnalysisData {
  return analysisCache;
}

function validateAnalysisData(data: unknown): AnalysisData {
  try {
    // If data is null or undefined, return initial data
    if (data === null || data === undefined) {
      return getInitialData();
    }

    let parsed: Partial<AnalysisData>;
    if (typeof data === 'string') {
      try {
        parsed = JSON.parse(data) as Partial<AnalysisData>;
      } catch {
        return getInitialData();
      }
    } else if (typeof data === 'object') {
      parsed = data as Partial<AnalysisData>;
    } else {
      return getInitialData();
    }

    // Create a new object to avoid mutation issues
    const validated: AnalysisData = {
      totalFilesAnalyzed: Number(parsed.totalFilesAnalyzed) || 0,
      users: {}
    };

    // Validate and normalize user data
    if (parsed.users && typeof parsed.users === 'object') {
      for (const [userId, userData] of Object.entries(parsed.users)) {
        if (userData && typeof userData === 'object') {
          validated.users[userId] = {
            userId,
            filesAnalyzed: Number(userData.filesAnalyzed) || 0,
            analysisHistory: Array.isArray(userData.analysisHistory) ?
              userData.analysisHistory.filter((h: { timestamp?: string; filesAnalyzed?: number }) =>
                h && typeof h === 'object' &&
                typeof h.timestamp === 'string' &&
                typeof h.filesAnalyzed === 'number'
              ) : [],
            lastAnalysis: typeof userData.lastAnalysis === 'string' ?
              userData.lastAnalysis : undefined
          };
        }
      }
    }

    return validated;
  } catch (error) {
    console.error('Failed to validate analysis data:', error);
    return getInitialData();
  }
}

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

// Export function to reset cache for testing
export function resetAnalysisCache(): void {
  analysisCache.totalFilesAnalyzed = 0;
  analysisCache.users = {};
}