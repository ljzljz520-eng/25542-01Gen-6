import { useMemo, useState } from 'react';
import { Code, Settings, GitCompare, ArrowLeftRight } from 'lucide-react';
import type { Version } from '../../types';
import { TabView } from '../common/TabView';
import { DiffViewer } from '../common/DiffViewer';
import { computeTextDiff, computeParamsDiff, formatJson } from '../../utils/diff';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface VersionDiffProps {
  experimentId: string;
  oldVersion: Version | null;
  newVersion: Version | null;
  className?: string;
}

type DiffView = 'unified' | 'split';

export function VersionDiff({
  experimentId,
  oldVersion,
  newVersion,
  className,
}: VersionDiffProps) {
  const navigate = useNavigate();
  const [diffView, setDiffView] = useState<DiffView>('split');

  const scriptDiff = useMemo(() => {
    if (!oldVersion || !newVersion) return null;
    return computeTextDiff(oldVersion.script, newVersion.script);
  }, [oldVersion, newVersion]);

  const paramsDiff = useMemo(() => {
    if (!oldVersion || !newVersion) return null;
    const oldJson = formatJson(oldVersion.params);
    const newJson = formatJson(newVersion.params);
    return computeTextDiff(oldJson, newJson);
  }, [oldVersion, newVersion]);

  const paramsObjectDiff = useMemo(() => {
    if (!oldVersion || !newVersion) return null;
    return computeParamsDiff(oldVersion.params, newVersion.params);
  }, [oldVersion, newVersion]);

  const stats = useMemo(() => {
    if (!scriptDiff) return { added: 0, removed: 0, total: 0 };
    let added = 0;
    let removed = 0;
    scriptDiff.lines.forEach((line) => {
      if (line.added) added++;
      if (line.removed) removed++;
    });
    return { added, removed, total: scriptDiff.rightLineCount };
  }, [scriptDiff]);

  if (!oldVersion || !newVersion) {
    return (
      <div className={cn('flex items-center justify-center h-full text-slate-400', className)}>
        <div className="text-center">
          <GitCompare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>请选择两个版本进行对比</p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => navigate(`/experiments/${experimentId}`)}
          >
            返回实验详情
          </Button>
        </div>
      </div>
    );
  }

  const scriptTab = {
    key: 'script',
    label: '脚本差异',
    icon: <Code className="w-4 h-4" />,
    content: (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-sm text-slate-400">
                新增 {stats.added} 行
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-sm text-slate-400">
                删除 {stats.removed} 行
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={diffView === 'split' ? 'primary' : 'ghost'}
              onClick={() => setDiffView('split')}
            >
              分栏视图
            </Button>
            <Button
              size="sm"
              variant={diffView === 'unified' ? 'primary' : 'ghost'}
              onClick={() => setDiffView('unified')}
            >
              统一视图
            </Button>
          </div>
        </div>
        {scriptDiff && (
          <DiffViewer
            diff={scriptDiff}
            oldVersionLabel={`v${oldVersion.versionNumber} · ${oldVersion.description}`}
            newVersionLabel={`v${newVersion.versionNumber} · ${newVersion.description}`}
            minHeight="500px"
          />
        )}
      </div>
    ),
  };

  const paramsTab = {
    key: 'params',
    label: '参数差异',
    icon: <Settings className="w-4 h-4" />,
    content: (
      <div className="p-4 space-y-4">
        {paramsObjectDiff && (
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <p className="text-2xl font-bold text-emerald-400">
                {paramsObjectDiff.added.length}
              </p>
              <p className="text-xs text-emerald-300/70">新增参数</p>
            </div>
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
              <p className="text-2xl font-bold text-rose-400">
                {paramsObjectDiff.removed.length}
              </p>
              <p className="text-xs text-rose-300/70">删除参数</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-2xl font-bold text-amber-400">
                {paramsObjectDiff.modified.length}
              </p>
              <p className="text-xs text-amber-300/70">修改参数</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-500/10 border border-slate-500/30">
              <p className="text-2xl font-bold text-slate-400">
                {paramsObjectDiff.unchanged.length}
              </p>
              <p className="text-xs text-slate-300/70">未变参数</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {paramsObjectDiff && paramsObjectDiff.added.length > 0 && (
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <h4 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                新增参数
              </h4>
              <div className="space-y-2">
                {paramsObjectDiff.added.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2 rounded bg-emerald-500/10"
                  >
                    <span className="text-emerald-400 font-mono text-sm">+</span>
                    <div>
                      <span className="text-emerald-300 font-mono text-sm">
                        {item.key}
                      </span>
                      <span className="text-slate-400 text-sm"> = </span>
                      <span className="text-emerald-200 font-mono text-sm">
                        {JSON.stringify(item.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {paramsObjectDiff && paramsObjectDiff.removed.length > 0 && (
            <div className="p-4 rounded-lg bg-rose-500/5 border border-rose-500/20">
              <h4 className="text-sm font-medium text-rose-400 mb-3 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-rose-500" />
                删除参数
              </h4>
              <div className="space-y-2">
                {paramsObjectDiff.removed.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2 rounded bg-rose-500/10"
                  >
                    <span className="text-rose-400 font-mono text-sm">-</span>
                    <div>
                      <span className="text-rose-300 font-mono text-sm">
                        {item.key}
                      </span>
                      <span className="text-slate-400 text-sm"> = </span>
                      <span className="text-rose-200/60 font-mono text-sm line-through">
                        {JSON.stringify(item.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {paramsObjectDiff && paramsObjectDiff.modified.length > 0 && (
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <h4 className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4" />
                修改参数
              </h4>
              <div className="space-y-3">
                {paramsObjectDiff?.modified.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded bg-slate-800/50 border border-slate-700"
                  >
                    <p className="text-amber-300 font-mono text-sm mb-2">
                      {item.key}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 rounded bg-rose-500/10">
                        <span className="text-rose-400 text-xs">旧值</span>
                        <p className="font-mono text-rose-200 mt-1">
                          {JSON.stringify(item.oldValue)}
                        </p>
                      </div>
                      <div className="p-2 rounded bg-emerald-500/10">
                        <span className="text-emerald-400 text-xs">新值</span>
                        <p className="font-mono text-emerald-200 mt-1">
                          {JSON.stringify(item.newValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {paramsDiff && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-slate-300 mb-3">JSON 差异视图</h4>
            <DiffViewer
              diff={paramsDiff}
              oldVersionLabel={`v${oldVersion.versionNumber} 参数`}
              newVersionLabel={`v${newVersion.versionNumber} 参数`}
              minHeight="300px"
            />
          </div>
        )}
      </div>
    ),
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitCompare className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">
                版本对比
              </h3>
              <p className="text-xs text-slate-400">
                v{oldVersion.versionNumber} → v{newVersion.versionNumber}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/experiments/${experimentId}`)}
          >
            返回实验详情
          </Button>
        </div>
      </div>
      <TabView
        tabs={[scriptTab, paramsTab]}
        className="flex-1"
      />
    </div>
  );
}
