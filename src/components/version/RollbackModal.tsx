import { useState } from 'react';
import { RotateCcw, AlertTriangle, FileText, Settings, Code } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { useStore } from '../../store/useStore';
import type { Version } from '../../types';
import { cn } from '../../lib/utils';

interface RollbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  experimentId: string;
  targetVersion: Version | null;
  nextVersionNumber: number;
}

export function RollbackModal({
  isOpen,
  onClose,
  experimentId,
  targetVersion,
  nextVersionNumber,
}: RollbackModalProps) {
  const rollbackVersion = useStore((state) => state.rollbackVersion);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!description.trim()) {
      newErrors.description = '版本说明不能为空';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !targetVersion) return;

    rollbackVersion(experimentId, targetVersion.id, description);
    onClose();
    setDescription('');
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    setDescription('');
    setErrors({});
  };

  if (!targetVersion) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`回滚到 v${targetVersion.versionNumber}`}
      size="lg"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="ghost" onClick={handleClose}>
            取消
          </Button>
          <Button
            variant="warning"
            onClick={handleSubmit}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            确认回滚
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-rose-300">重要提示</p>
              <p className="text-xs text-rose-200/70 mt-1">
                回滚操作将创建一个新版本 (v{nextVersionNumber})，恢复到目标版本的参数和脚本配置。
                <strong className="text-rose-300"> 所有历史结果文件将被保留，不会被删除。</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-400" />
            回滚预览
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Code className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-slate-300">脚本将恢复为 v{targetVersion.versionNumber} 的内容</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {targetVersion.script.substring(0, 100)}...
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Settings className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-slate-300">参数将恢复为 v{targetVersion.versionNumber} 的配置</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {Object.keys(targetVersion.params).length} 个参数配置项
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-xs font-medium text-emerald-400 mb-1">✓ 将保留</p>
            <p className="text-sm text-emerald-200/80">所有历史结果文件</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs font-medium text-amber-400 mb-1">↻ 将恢复</p>
            <p className="text-sm text-amber-200/80">参数和脚本配置</p>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            版本说明 <span className="text-rose-400">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`描述此次回滚的原因，例如："回滚到 v${targetVersion.versionNumber} 配置，因为..."`}
            rows={3}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border bg-slate-900 text-white resize-none',
              'placeholder-slate-500 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-teal-500/50',
              errors.description
                ? 'border-rose-500 focus:border-rose-500'
                : 'border-slate-700 focus:border-teal-500'
            )}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-400">{errors.description}</p>
          )}
          {!errors.description && description.trim() && (
            <p className="mt-1 text-xs text-emerald-400">✓ 版本说明已填写</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
