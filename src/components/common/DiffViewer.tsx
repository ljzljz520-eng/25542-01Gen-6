import { useMemo } from 'react';
import type { DiffResult } from '../../types';
import { cn } from '../../lib/utils';

interface DiffViewerProps {
  diff: DiffResult;
  oldVersionLabel?: string;
  newVersionLabel?: string;
  className?: string;
  minHeight?: string;
}

export function DiffViewer({
  diff,
  oldVersionLabel = '旧版本',
  newVersionLabel = '新版本',
  className,
  minHeight = '400px',
}: DiffViewerProps) {
  const { leftLines, rightLines } = useMemo(() => {
    const left: Array<{ content: string; type: 'normal' | 'removed' | 'empty'; lineNumber: number | null }> = [];
    const right: Array<{ content: string; type: 'normal' | 'added' | 'empty'; lineNumber: number | null }> = [];

    let leftLineNum = 1;
    let rightLineNum = 1;

    diff.lines.forEach((line) => {
      if (line.removed) {
        left.push({
          content: line.value,
          type: 'removed',
          lineNumber: leftLineNum++,
        });
        right.push({
          content: '',
          type: 'empty',
          lineNumber: null,
        });
      } else if (line.added) {
        left.push({
          content: '',
          type: 'empty',
          lineNumber: null,
        });
        right.push({
          content: line.value,
          type: 'added',
          lineNumber: rightLineNum++,
        });
      } else {
        left.push({
          content: line.value,
          type: 'normal',
          lineNumber: leftLineNum++,
        });
        right.push({
          content: line.value,
          type: 'normal',
          lineNumber: rightLineNum++,
        });
      }
    });

    return { leftLines: left, rightLines: right };
  }, [diff]);

  const lineStyle = (type: string) => {
    switch (type) {
      case 'removed':
        return 'bg-rose-900/30';
      case 'added':
        return 'bg-emerald-900/30';
      case 'empty':
        return 'bg-slate-800/50';
      default:
        return '';
    }
  };

  const linePrefix = (type: string) => {
    switch (type) {
      case 'removed':
        return <span className="text-rose-400 mr-2">-</span>;
      case 'added':
        return <span className="text-emerald-400 mr-2">+</span>;
      default:
        return <span className="text-slate-600 mr-2"> </span>;
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-900',
        className
      )}
      style={{ minHeight }}
    >
      <div className="flex border-b border-slate-700 bg-slate-800/50">
        <div className="flex-1 px-4 py-2 text-sm font-medium text-slate-400 border-r border-slate-700">
          {oldVersionLabel}
        </div>
        <div className="flex-1 px-4 py-2 text-sm font-medium text-slate-400">
          {newVersionLabel}
        </div>
      </div>

      <div className="flex flex-1 overflow-auto" style={{ minHeight: `calc(${minHeight} - 40px)` }}>
        <div className="flex-1 flex-shrink-0 min-w-0 border-r border-slate-700">
          {leftLines.map((line, i) => (
            <div
              key={i}
              className={cn(
                'flex font-mono text-sm leading-6',
                lineStyle(line.type)
              )}
            >
              <span className="flex-shrink-0 w-12 px-2 text-right text-xs text-slate-500 select-none bg-slate-800/30 border-r border-slate-700">
                {line.lineNumber || ''}
              </span>
              <span className="flex-1 px-2 whitespace-pre overflow-x-auto">
                {line.type !== 'empty' && linePrefix(line.type)}
                <span
                  className={cn(
                    line.type === 'removed' && 'text-rose-300',
                    line.type === 'empty' && 'text-transparent'
                  )}
                >
                  {line.content || ' '}
                </span>
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 flex-shrink-0 min-w-0">
          {rightLines.map((line, i) => (
            <div
              key={i}
              className={cn(
                'flex font-mono text-sm leading-6',
                lineStyle(line.type)
              )}
            >
              <span className="flex-shrink-0 w-12 px-2 text-right text-xs text-slate-500 select-none bg-slate-800/30 border-r border-slate-700">
                {line.lineNumber || ''}
              </span>
              <span className="flex-1 px-2 whitespace-pre overflow-x-auto">
                {line.type !== 'empty' && linePrefix(line.type)}
                <span
                  className={cn(
                    line.type === 'added' && 'text-emerald-300',
                    line.type === 'empty' && 'text-transparent'
                  )}
                >
                  {line.content || ' '}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
