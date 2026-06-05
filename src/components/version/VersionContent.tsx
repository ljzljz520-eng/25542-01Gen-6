import { Code, Settings, FileText, Copy, Download } from 'lucide-react';
import { useState } from 'react';
import type { Version } from '../../types';
import { TabView } from '../common/TabView';
import { CodeEditor } from '../common/CodeEditor';
import { formatJson } from '../../utils/diff';
import { formatDate } from '../../utils/storage';
import { Button } from '../common/Button';
import { cn } from '../../lib/utils';

interface VersionContentProps {
  version: Version | null;
  isCurrent: boolean;
  className?: string;
  onEditScript?: (script: string) => void;
  onEditParams?: (params: string) => void;
  readOnly?: boolean;
}

export function VersionContent({
  version,
  isCurrent,
  className,
  onEditScript,
  onEditParams,
  readOnly = false,
}: VersionContentProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!version) {
    return (
      <div className={cn('flex items-center justify-center h-full text-slate-400', className)}>
        <p>选择一个版本查看详情</p>
      </div>
    );
  }

  const paramsJson = formatJson(version.params);

  const scriptTab = {
    key: 'script',
    label: '脚本',
    icon: <Code className="w-4 h-4" />,
    content: (
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Python 脚本</span>
            {version.isRollback && (
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-amber-500/20 text-amber-400">
                回滚版本
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              leftIcon={
                copiedField === 'script' ? (
                  <span className="text-emerald-400">✓</span>
                ) : (
                  <Copy className="w-4 h-4" />
                )
              }
              onClick={() => handleCopy(version.script, 'script')}
            >
              {copiedField === 'script' ? '已复制' : '复制'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => handleDownload(version.script, 'script.py')}
            >
              下载
            </Button>
          </div>
        </div>
        <CodeEditor
          value={version.script}
          onChange={onEditScript}
          language="python"
          readOnly={readOnly || !isCurrent}
          minHeight="400px"
        />
      </div>
    ),
  };

  const paramsTab = {
    key: 'params',
    label: '参数',
    icon: <Settings className="w-4 h-4" />,
    content: (
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">参数配置 (JSON)</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              leftIcon={
                copiedField === 'params' ? (
                  <span className="text-emerald-400">✓</span>
                ) : (
                  <Copy className="w-4 h-4" />
                )
              }
              onClick={() => handleCopy(paramsJson, 'params')}
            >
              {copiedField === 'params' ? '已复制' : '复制'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => handleDownload(paramsJson, 'params.json')}
            >
              下载
            </Button>
          </div>
        </div>
        <CodeEditor
          value={paramsJson}
          onChange={onEditParams}
          language="json"
          readOnly={readOnly || !isCurrent}
          minHeight="400px"
        />
      </div>
    ),
  };

  const resultsTab = {
    key: 'results',
    label: `结果文件 (${version.resultFiles.length})`,
    icon: <FileText className="w-4 h-4" />,
    content: (
      <div className="p-4 space-y-3">
        <span className="text-sm text-slate-400">
          共 {version.resultFiles.length} 个结果文件
        </span>
        {version.resultFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <FileText className="w-12 h-12 mb-3 opacity-50" />
            <p>暂无结果文件</p>
            <p className="text-sm mt-1">运行实验后保存版本时会自动保存结果文件</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {version.resultFiles.map((file) => (
              <div
                key={file.id}
                className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{file.name}</p>
                      <p className="text-xs text-slate-400">
                        {file.size} · {formatDate(file.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Copy className="w-4 h-4" />}
                      onClick={() => handleCopy(file.content, file.id)}
                    >
                      复制
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Download className="w-4 h-4" />}
                      onClick={() => handleDownload(file.content, file.name)}
                    >
                      下载
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-900 max-h-48 overflow-auto">
                  <pre className="p-3 text-xs text-slate-300 font-mono whitespace-pre-wrap">
                    {file.content}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              v{version.versionNumber} · {version.description}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {formatDate(version.createdAt)}
              {!isCurrent && !readOnly && (
                <span className="ml-2 text-amber-400">
                  (历史版本 - 如需编辑请先回滚或保存新版本)
                </span>
              )}
            </p>
          </div>
          {isCurrent && !readOnly && (
            <span className="px-2 py-1 text-xs font-medium rounded bg-emerald-500/20 text-emerald-400">
              当前版本 - 可编辑
            </span>
          )}
        </div>
      </div>
      <TabView
        tabs={[scriptTab, paramsTab, resultsTab]}
        className="flex-1"
      />
    </div>
  );
}
