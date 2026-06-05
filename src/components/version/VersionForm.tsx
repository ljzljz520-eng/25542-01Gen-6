import { useState } from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { CodeEditor } from '../common/CodeEditor';
import { Modal } from '../common/Modal';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';

interface VersionFormProps {
  isOpen: boolean;
  onClose: () => void;
  experimentId: string;
  currentScript: string;
  currentParams: string;
  nextVersionNumber: number;
}

export function VersionForm({
  isOpen,
  onClose,
  experimentId,
  currentScript,
  currentParams,
  nextVersionNumber,
}: VersionFormProps) {
  const addVersion = useStore((state) => state.addVersion);
  const [formData, setFormData] = useState({
    script: currentScript,
    params: currentParams,
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.description.trim()) {
      newErrors.description = '版本说明不能为空';
    }
    try {
      JSON.parse(formData.params);
    } catch {
      newErrors.params = '参数格式不正确，必须是有效的 JSON';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    try {
      const params = JSON.parse(formData.params);
      addVersion(experimentId, formData.script, params, formData.description);
      onClose();
      setFormData({
        script: currentScript,
        params: currentParams,
        description: '',
      });
      setErrors({});
    } catch {
      setErrors({ params: '参数格式不正确' });
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({
      script: currentScript,
      params: currentParams,
      description: '',
    });
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`保存新版本 v${nextVersionNumber}`}
      size="xl"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="ghost" onClick={handleClose}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            保存版本
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-300">保存版本后无法修改</p>
              <p className="text-xs text-amber-200/70 mt-1">
                版本一旦保存，脚本、参数和结果文件将被永久记录，无法删除或修改。
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            版本说明 <span className="text-rose-400">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="请详细描述此版本的改动内容、目的和预期效果..."
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
          {!errors.description && formData.description.trim() && (
            <p className="mt-1 text-xs text-emerald-400">✓ 版本说明已填写</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            脚本内容
          </label>
          <CodeEditor
            value={formData.script}
            onChange={(value) => setFormData({ ...formData, script: value })}
            language="python"
            minHeight="200px"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            参数配置 (JSON)
          </label>
          <CodeEditor
            value={formData.params}
            onChange={(value) => setFormData({ ...formData, params: value })}
            language="json"
            minHeight="150px"
            className={cn(errors.params && 'border-rose-500')}
          />
          {errors.params && (
            <p className="mt-1 text-xs text-rose-400">{errors.params}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
