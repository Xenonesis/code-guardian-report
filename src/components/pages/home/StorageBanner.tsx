import {
  type StoredAnalysisData,
  type StorageStats,
} from "../../../services/storage/analysisStorage";

interface StorageBannerProps {
  hasStoredData: boolean;
  storedAnalysis: StoredAnalysisData | null;
  storageStats: StorageStats;
  isNewFile: boolean;
  showStorageStatus?: boolean;
  onToggleStorageStatus?: () => void;
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
      <div className="glass-card-ultra flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary h-2 w-2 animate-pulse rounded-full"></div>
          <span className="text-foreground text-sm font-medium">
            {hasStoredData
              ? storedAnalysis
                ? `Previous analysis for "${storedAnalysis.fileName}" is available${!isNewFile ? " (same file detected)" : ""}`
                : "Analysis data stored"
              : `Storage ${storageStats.usagePercentage.toFixed(0)}% full`}
          </span>
        </div>
        {onToggleStorageStatus && (
          <button
            onClick={onToggleStorageStatus}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            {showStorageStatus ? "Hide Details" : "View Details"}
          </button>
        )}
      </div>
    </div>
  );
};
