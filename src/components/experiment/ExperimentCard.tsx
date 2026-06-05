import { Calendar, Files, GitBranch, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Experiment } from '../../types';
import { formatRelativeTime } from '../../utils/storage';
import { cn } from '../../lib/utils';

interface ExperimentCardProps {
  experiment: Experiment;
  className?: string;
}

export function ExperimentCard({ experiment, className }: ExperimentCardProps) {
  const navigate = useNavigate();
  const versionCount = experiment.versions.length;
  const latestVersion = experiment.versions[experiment.versions.length - 1];

  return (
    <div
      onClick={() => navigate(`/experiments/${experiment.id}`)}
      className={cn(
        'group relative p-5 rounded-xl border border-slate-700 bg-slate-800/50',
        'cursor-pointer transition-all duration-300 hover:border-teal-500/50 hover:bg-slate-800',
        'hover:shadow-lg hover:shadow-teal-500/10 hover:-translate-y-0.5',
        className
      )}
    >
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-5 h-5 text-teal-400" />
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-teal-400 transition-colors pr-8">
            {experiment.name}
          </h3>
          <p className="mt-1 text-sm text-slate-400 line-clamp-2">
            {experiment.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-teal-400" />
            <span>
              v{latestVersion?.versionNumber || 0} · {versionCount} 个版本
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Files className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {experiment.versions.reduce((acc, v) => acc + v.resultFiles.length, 0)} 个结果文件
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatRelativeTime(experiment.updatedAt)}</span>
          </div>
        </div>

        <div className="pt-2 mt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-500">最新版本说明</p>
          <p className="text-sm text-slate-300 mt-0.5 line-clamp-1">
            {latestVersion?.description || '暂无说明'}
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl" />
    </div>
  );
}
