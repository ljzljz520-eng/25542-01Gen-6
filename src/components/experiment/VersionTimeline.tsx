import { GitBranch, RotateCcw, Check, Clock } from 'lucide-react';
import type { Version } from '../../types';
import { formatRelativeTime } from '../../utils/storage';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';

interface VersionTimelineProps {
  versions: Version[];
  currentVersionId: string;
  activeVersionId: string;
  onVersionSelect: (versionId: string) => void;
  className?: string;
}

export function VersionTimeline({
  versions,
  currentVersionId,
  activeVersionId,
  onVersionSelect,
  className,
}: VersionTimelineProps) {
  const toggleSelectVersion = useStore((state) => state.toggleSelectVersion);
  const selectedVersionIds = useStore((state) => state.selectedVersionIds);
  const clearSelectedVersions = useStore((state) => state.clearSelectedVersions);

  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleCheckboxChange = (e: React.MouseEvent, versionId: string) => {
    e.stopPropagation();
    toggleSelectVersion(versionId);
  };

  const isSelected = (versionId: string) => selectedVersionIds.includes(versionId);
  const isCurrent = (versionId: string) => versionId === currentVersionId;
  const isActive = (versionId: string) => versionId === activeVersionId;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">版本时间线</h3>
          {selectedVersionIds.length > 0 && (
            <button
              onClick={clearSelectedVersions}
              className="text-xs text-slate-400 hover:text-teal-400 transition-colors"
            >
              清除选择
            </button>
          )}
        </div>
        {selectedVersionIds.length > 0 && (
          <p className="text-xs text-teal-400 mt-1">
            已选择 {selectedVersionIds.length} 个版本用于对比
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {sortedVersions.map((version, index) => (
          <div
            key={version.id}
            onClick={() => onVersionSelect(version.id)}
            className={cn(
              'relative pl-8 pr-3 py-3 rounded-lg cursor-pointer transition-all duration-200 group',
              isActive(version.id)
                ? 'bg-teal-500/10 border border-teal-500/30'
                : 'hover:bg-slate-700/50 border border-transparent'
            )}
          >
            {index < sortedVersions.length - 1 && (
              <div
                className={cn(
                  'absolute left-[19px] top-10 w-0.5 h-full',
                  isCurrent(version.id) ? 'bg-teal-500' : 'bg-slate-700'
                )}
                style={{ height: 'calc(100% - 8px)' }}
              />
            )}

            <div
              className={cn(
                'absolute left-0 top-3.5 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors',
                isCurrent(version.id)
                  ? 'border-teal-500 bg-slate-900'
                  : isSelected(version.id)
                  ? 'border-amber-500 bg-slate-900'
                  : 'border-slate-600 bg-slate-800 group-hover:border-slate-500'
              )}
            >
              {isCurrent(version.id) ? (
                <Check className="w-4 h-4 text-teal-400" />
              ) : version.isRollback ? (
                <RotateCcw className="w-4 h-4 text-amber-400" />
              ) : (
                <GitBranch className="w-4 h-4 text-slate-400" />
              )}
            </div>

            <div
              onClick={(e) => handleCheckboxChange(e, version.id)}
              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                  isSelected(version.id)
                    ? 'bg-amber-500 border-amber-500'
                    : 'border-slate-500 hover:border-slate-400'
                )}
              >
                {isSelected(version.id) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-sm font-semibold',
                    isCurrent(version.id) ? 'text-teal-400' : 'text-white'
                  )}
                >
                  v{version.versionNumber}
                </span>
                {isCurrent(version.id) && (
                  <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-teal-500/20 text-teal-400">
                    当前
                  </span>
                )}
                {version.isRollback && (
                  <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-amber-500/20 text-amber-400">
                    回滚
                  </span>
                )}
                {isSelected(version.id) && (
                  <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-amber-500/20 text-amber-400">
                    已选
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-300 line-clamp-2">
                {version.description}
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>{formatRelativeTime(version.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
