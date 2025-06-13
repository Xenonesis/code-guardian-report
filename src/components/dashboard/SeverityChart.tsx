import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface SeverityData {
  name: string;
  value: number;
  color: string;
}

interface SeverityChartProps {
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  className?: string;
}

export const SeverityChart: React.FC<SeverityChartProps> = ({
  criticalIssues,
  highIssues,
  mediumIssues,
  lowIssues,
  className = ''
}) => {
  const severityData: SeverityData[] = [
    { name: 'Critical', value: criticalIssues, color: '#8B5CF6' },
    { name: 'High', value: highIssues, color: '#EF4444' },
    { name: 'Medium', value: mediumIssues, color: '#F59E0B' },
    { name: 'Low', value: lowIssues, color: '#3B82F6' }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Issue Severity Distribution
        </CardTitle>
        <CardDescription>
          Breakdown of security issues by severity level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {severityData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
