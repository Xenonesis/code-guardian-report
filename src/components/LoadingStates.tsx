import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const FeatureCardSkeleton: React.FC = () => (
  <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
    <div className="h-2 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600"></div>
    <CardHeader className="pb-4">
      <div className="mb-3">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </CardContent>
  </Card>
);

export const SummaryCardSkeleton: React.FC = () => (
  <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
    <CardContent className="p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-6 sm:h-8 w-16 mb-1" />
          <Skeleton className="h-3 sm:h-4 w-20" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const TableRowSkeleton: React.FC = () => (
  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
    <td className="p-4">
      <Skeleton className="h-4 w-4" />
    </td>
    <td className="p-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>
    </td>
    <td className="p-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </td>
    <td className="p-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
    </td>
    <td className="p-4">
      <Skeleton className="h-4 w-24" />
    </td>
    <td className="p-4">
      <Skeleton className="h-4 w-16" />
    </td>
    <td className="p-4">
      <Skeleton className="h-8 w-8 rounded" />
    </td>
  </tr>
);

export const ChatMessageSkeleton: React.FC<{ isUser?: boolean }> = ({ isUser = false }) => (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
    <div className={`max-w-[80%] rounded-lg p-3 ${
      isUser 
        ? 'bg-blue-600' 
        : 'bg-slate-100 dark:bg-slate-800'
    }`}>
      <div className="space-y-2">
        <Skeleton className={`h-4 w-32 ${isUser ? 'bg-blue-500' : ''}`} />
        <Skeleton className={`h-4 w-24 ${isUser ? 'bg-blue-500' : ''}`} />
        <Skeleton className={`h-3 w-16 ${isUser ? 'bg-blue-500' : ''}`} />
      </div>
    </div>
  </div>
);

export const AnalyticsDashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Summary Cards Skeleton */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SummaryCardSkeleton key={i} />
      ))}
    </div>

    {/* Charts Grid Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export const UploadFormSkeleton: React.FC = () => (
  <Card className="w-full max-w-4xl mx-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-0 shadow-2xl">
    <CardHeader className="text-center pb-6 sm:pb-8">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl" />
        <Skeleton className="h-8 w-48" />
      </div>
      <Skeleton className="h-6 w-96 mx-auto mt-4" />
    </CardHeader>
    <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6">
      <div className="border-3 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-6 sm:p-8 lg:p-12 text-center">
        <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-6 rounded-full" />
        <Skeleton className="h-8 w-64 mx-auto mb-4" />
        <Skeleton className="h-12 w-32 mx-auto rounded-lg" />
        <div className="mt-6 space-y-2">
          <Skeleton className="h-4 w-48 mx-auto" />
          <Skeleton className="h-4 w-56 mx-auto" />
        </div>
      </div>
    </CardContent>
  </Card>
);

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  text
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-label={text || "Loading"}
    >
      <div
        className={`animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 ${sizeClasses[size]}`}
        aria-hidden="true"
      />
      {text && (
        <p className="text-sm text-slate-600 dark:text-slate-400 animate-pulse">
          {text}
        </p>
      )}
      <span className="sr-only">{text || "Loading content, please wait"}</span>
    </div>
  );
};

export const PageLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
    <div className="container mx-auto px-4 py-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>

      {/* Hero Section Skeleton */}
      <div className="text-center mb-12">
        <Skeleton className="h-16 w-96 mx-auto mb-6" />
        <Skeleton className="h-6 w-[600px] mx-auto mb-8" />
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-48 rounded-full" />
          ))}
        </div>
      </div>

      {/* Features Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <FeatureCardSkeleton key={i} />
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-3 mb-8 bg-white/80 dark:bg-slate-800/80 rounded-lg p-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-md" />
          ))}
        </div>
        <UploadFormSkeleton />
      </div>
    </div>
  </div>
);
