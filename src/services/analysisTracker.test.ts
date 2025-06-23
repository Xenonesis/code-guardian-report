import {
  trackFileAnalysis,
  getTotalFilesAnalyzed,
  getUserAnalysis,
  getAllUserAnalytics,
  resetAnalysisCache
} from './analysisTracker';

beforeEach(() => {
  resetAnalysisCache();
});

test('tracks file analysis for multiple users', () => {
  trackFileAnalysis('user1');
  trackFileAnalysis('user2');
  trackFileAnalysis('user1');

  expect(getTotalFilesAnalyzed()).toBe(3);
  
  const user1 = getUserAnalysis('user1');
  expect(user1?.filesAnalyzed).toBe(2);
  expect(user1?.analysisHistory.length).toBe(2);
  
  const user2 = getUserAnalysis('user2');
  expect(user2?.filesAnalyzed).toBe(1);
  expect(user2?.analysisHistory.length).toBe(1);
});

test('handles basic functionality with fresh cache', () => {
  trackFileAnalysis('user1');
  const user1 = getUserAnalysis('user1');
  
  expect(user1?.filesAnalyzed).toBe(1);
  expect(getTotalFilesAnalyzed()).toBe(1);
});

test('returns all user analytics', () => {
  trackFileAnalysis('user1');
  trackFileAnalysis('user2');
  
  const analytics = getAllUserAnalytics();
  expect(analytics.length).toBe(2);
  expect(analytics[0].userId).toBe('user1');
  expect(analytics[1].userId).toBe('user2');
});