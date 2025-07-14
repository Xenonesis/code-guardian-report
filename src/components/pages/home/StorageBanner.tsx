import { type StoredAnalysisData, type StorageStats } from '@/services/analysisStorage';

interface StorageBannerProps {
  hasStoredData: boolean;
  storedAnalysis: StoredAnalysisData | null;
  storageStats: StorageStats;
  isNewFile: boolean;
  showStorageStatus: boolean;
  onToggleStorageStatus: () => void;
}

export const StorageBanner = ({
  hasStoredData,
  storedAnalysis,
  storageStats,
  isNewFile,
  showStorageStatus,
  onToggleStorageStatus
}: StorageBannerProps) => {
  if (!hasStoredData && storageStats.usagePercentage <= 70) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto mb-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {hasStoredData ? (
                storedAnalysis ? (
                  `Previous analysis for "${storedAnalysis.fileName}" is available${!isNewFile ? ' (same file detected)' : ''}`
                ) : 'Analysis data stored'
              ) : (
                `Storage ${storageStats.usagePercentage.toFixed(0)}% full`
              )}
            </span>
          </div>
          <button
            onClick={onToggleStorageStatus}
            className="text-sm text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 underline"
          >
            {showStorageStatus ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
};