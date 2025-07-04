import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

interface PerformanceData {
  metric: string;
  value: number;
  target: number;
}

interface PerformanceMetricsProps {
  data: PerformanceData[];
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ data }) => {
  return (
    <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          Performance Metrics
        </CardTitle>
        <CardDescription>Code quality and maintainability scores</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3b82f6" name="Current Score" />
            <Bar dataKey="target" fill="#10b981" name="Target Score" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};