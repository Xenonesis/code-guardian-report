// src/components/ui/CodeDiffViewer.tsx

import React from 'react';
import { generateCodeDiff } from '@/utils/codeDiff';

interface CodeDiffViewerProps {
  originalCode: string;
  suggestedCode: string;
}

export const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({ originalCode, suggestedCode }) => {
  const diff = generateCodeDiff(originalCode, suggestedCode);

  return (
    <div className="bg-slate-900/90 border border-slate-700 rounded-md shadow-lg overflow-hidden text-slate-200 font-mono text-xs max-h-60 min-w-[300px] max-w-[500px] flex flex-col">
      <div className="flex justify-between items-center p-2 border-b border-slate-700 bg-slate-800">
        <span className="font-semibold text-white">Code Difference</span>
      </div>
      <pre className="flex-1 p-2 overflow-auto whitespace-pre">
        <code>
          {diff.map((line, index) => (
            <div
              key={index}
              className={`leading-tight py-[1px] px-1 ${
                line.type === 'added'
                  ? 'bg-green-900/40 text-green-300'
                  : line.type === 'removed'
                  ? 'bg-red-900/40 text-red-300'
                  : 'text-slate-200'
              }`}
            >
              <span className="inline-block w-4 text-center select-none opacity-70">
                {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
              </span>
              {line.value}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
};