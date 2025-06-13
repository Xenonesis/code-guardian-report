import React from 'react';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { SecurityIssue } from '@/hooks/useAnalysis';

interface OwaspChartProps {
  issues: SecurityIssue[];
  className?: string;
}

export const OwaspChart: React.FC<OwaspChartProps> = ({ issues, className = '' }) => {
  const owaspData = issues.reduce((acc, issue) => {
    if (issue.owaspCategory) {
      const category = issue.owaspCategory.split(' – ')[1] || issue.owaspCategory;
      acc[category] = (acc[category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const owaspChartData = Object.entries(owaspData).map(([name, value]) => ({
    name: name.length > 20 ? name.substring(0, 17) + '...' : name,
    value,
    fullName: name
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          OWASP Top 10 Categories
        </CardTitle>
        <CardDescription>
          Security issues mapped to OWASP Top 10 2021
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={owaspChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <RechartsTooltip
                formatter={(value, name, props) => [value, props.payload.fullName]}
              />
              <Bar dataKey="value" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
