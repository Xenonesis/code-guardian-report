import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface FileComplexityData {
  file: string;
  fullFile: string;
  issues: number;
  linesAffected: number;
  complexity: number;
  riskScore: number;
}

interface FileComplexityChartProps {
  data: FileComplexityData[];
}

export const FileComplexityChart: React.FC<FileComplexityChartProps> = ({ data }) => {
  return (
    <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          File Complexity Analysis
        </CardTitle>
        <CardDescription>Files ranked by issue complexity and risk</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="file" type="category" width={120} />
            <Tooltip />
            <Legend />
            <Bar dataKey="riskScore" fill="#ef4444" name="Risk Score" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};