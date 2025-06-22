interface UserAnalysis {
  userId: string;
  filesAnalyzed: number;
}

const STORAGE_KEY = 'userAnalysisData';

export function trackFileAnalysis(userId: string): void {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"totalFilesAnalyzed":0,"users":{}}');
  
  // Initialize user if not exists
  if (!data.users[userId]) {
    data.users[userId] = { filesAnalyzed: 0 };
  }
  
  // Update counts
  data.users[userId].filesAnalyzed += 1;
  data.totalFilesAnalyzed += 1;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getTotalFilesAnalyzed(): number {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"totalFilesAnalyzed":0}');
  return data.totalFilesAnalyzed;
}