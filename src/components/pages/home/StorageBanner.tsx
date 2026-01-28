import {
  type StoredAnalysisData,
  type StorageStats,
} from "../../../services/storage/analysisStorage";

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
  onToggleStorageStatus,
}: StorageBannerProps) => {
  if (!hasStoredData && storageStats.usagePercentage <= 70) {
    return null;
  }

  return (
    <div className="mx-auto mb-6 max-w-6xl">
      <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {hasStoredData
                ? storedAnalysis
                  ? `Previous analysis for "${storedAnalysis.fileName}" is available${!isNewFile ? " (same file detected)" : ""}`
                  : "Analysis data stored"
                : `Storage ${storageStats.usagePercentage.toFixed(0)}% full`}
            </span>
          </div>
          <button
            onClick={onToggleStorageStatus}
            className="text-sm text-blue-700 underline hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
          >
            {showStorageStatus ? "Hide Details" : "View Details"}
          </button>
        </div>
      </div>
    </div>
  );
};
