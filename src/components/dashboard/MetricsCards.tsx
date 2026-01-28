import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Shield, Bug, Code } from "lucide-react";

interface MetricsCardsProps {
  totalIssues: number;
  criticalIssues: number;
  securityIssues: number;
  codeQuality: number;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  totalIssues,
  criticalIssues,
  securityIssues,
  codeQuality,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <Card className="card-hover border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-blue-800 sm:text-2xl dark:text-blue-200">
                {totalIssues}
              </p>
              <p className="text-xs text-blue-600 sm:text-sm dark:text-blue-400">
                Total Issues
              </p>
            </div>
            <AlertTriangle className="h-6 w-6 text-blue-600 sm:h-8 sm:w-8 dark:text-blue-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover border-red-200 bg-gradient-to-br from-red-50 to-pink-50 dark:border-red-800 dark:from-red-950/20 dark:to-pink-950/20">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-red-800 sm:text-2xl dark:text-red-200">
                {criticalIssues}
              </p>
              <p className="text-xs text-red-600 sm:text-sm dark:text-red-400">
                Critical
              </p>
            </div>
            <Shield className="h-6 w-6 text-red-600 sm:h-8 sm:w-8 dark:text-red-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-950/20 dark:to-orange-950/20">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-amber-800 sm:text-2xl dark:text-amber-200">
                {securityIssues}
              </p>
              <p className="text-xs text-amber-600 sm:text-sm dark:text-amber-400">
                Security
              </p>
            </div>
            <Bug className="h-6 w-6 text-amber-600 sm:h-8 sm:w-8 dark:text-amber-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-green-800 sm:text-2xl dark:text-green-200">
                {codeQuality}%
              </p>
              <p className="text-xs text-green-600 sm:text-sm dark:text-green-400">
                Quality
              </p>
            </div>
            <Code className="h-6 w-6 text-green-600 sm:h-8 sm:w-8 dark:text-green-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
