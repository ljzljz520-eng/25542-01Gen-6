import { useState } from 'react';
import { Search, Plus, FlaskConical, GitBranch, Files, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ExperimentCard } from '../components/experiment/ExperimentCard';
import { ExperimentForm } from '../components/experiment/ExperimentForm';
import { Button } from '../components/common/Button';
import { formatRelativeTime } from '../utils/storage';
import { cn } from '../lib/utils';

export function OverviewPage() {
  const experiments = useStore((state) => state.experiments);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredExperiments = experiments.filter((exp) =>
    exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: experiments.length,
    versions: experiments.reduce((acc, e) => acc + e.versions.length, 0),
    files: experiments.reduce(
      (acc, e) => acc + e.versions.reduce((a, v) => a + v.resultFiles.length, 0),
      0
    ),
    lastUpdated: experiments.length > 0
      ? formatRelativeTime(
          experiments.reduce(
            (latest, e) =>
              new Date(e.updatedAt) > new Date(latest) ? e.updatedAt : latest,
            experiments[0].updatedAt
          )
        )
      : '-',
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">实验概览</h1>
              <p className="text-slate-400 text-sm">
                管理和追踪您的所有实验版本
              </p>
            </div>
            <Button
              onClick={() => setIsFormOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              新建实验
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-teal-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-slate-400">实验总数</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stats.versions}</p>
              <p className="text-sm text-slate-400">版本总数</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Files className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stats.files}</p>
              <p className="text-sm text-slate-400">结果文件</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-rose-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stats.lastUpdated}</p>
              <p className="text-sm text-slate-400">最近更新</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索实验名称或描述..."
              className={cn(
                'w-full pl-12 pr-4 py-3 rounded-xl border bg-slate-800/50 text-white',
                'placeholder-slate-500 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50',
                'border-slate-700'
              )}
            />
          </div>
        </div>

        {filteredExperiments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FlaskConical className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">
              {searchQuery ? '未找到匹配的实验' : '暂无实验'}
            </p>
            <p className="text-sm mb-6">
              {searchQuery ? '尝试使用其他关键词搜索' : '点击上方按钮创建您的第一个实验'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setIsFormOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                新建实验
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExperiments.map((experiment) => (
              <ExperimentCard
                key={experiment.id}
                experiment={experiment}
              />
            ))}
          </div>
        )}
      </div>

      <ExperimentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
}
