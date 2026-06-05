import { useState } from 'react';
import { Code, FileText, Type } from 'lucide-react';
import { Button } from '../common/Button';
import { CodeEditor } from '../common/CodeEditor';
import { Modal } from '../common/Modal';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';

interface ExperimentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultScript = `import pandas as pd
import numpy as np

def process_data():
    # 数据加载
    df = pd.read_csv('./data/input.csv')
    
    # 数据处理逻辑
    processed = df.copy()
    
    # TODO: 添加你的处理逻辑
    
    return processed

if __name__ == '__main__':
    result = process_data()
    print(result.describe())`;

const defaultParams = {
  batch_size: 32,
  learning_rate: 0.001,
  epochs: 10,
  optimizer: 'adam',
};

export function ExperimentForm({ isOpen, onClose }: ExperimentFormProps) {
  const addExperiment = useStore((state) => state.addExperiment);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    script: defaultScript,
    params: JSON.stringify(defaultParams, null, 2),
    versionDescription: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = '请输入实验名称';
    }
    if (!formData.description.trim()) {
      newErrors.description = '请输入实验描述';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.versionDescription.trim()) {
      newErrors.versionDescription = '版本说明不能为空';
    }
    try {
      JSON.parse(formData.params);
    } catch {
      newErrors.params = '参数格式不正确，必须是有效的 JSON';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = () => {
    if (!validateStep2()) return;

    try {
      const params = JSON.parse(formData.params);
      addExperiment(
        formData.name,
        formData.description,
        formData.script,
        params,
        formData.versionDescription
      );
      onClose();
      setStep(1);
      setFormData({
        name: '',
        description: '',
        script: defaultScript,
        params: JSON.stringify(defaultParams, null, 2),
        versionDescription: '',
      });
      setErrors({});
    } catch {
      setErrors({ params: '参数格式不正确' });
    }
  };

  const handleClose = () => {
    onClose();
    setStep(1);
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="创建新实验"
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-slate-400">
            步骤 {step} / 2
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleClose}>
              取消
            </Button>
            {step === 2 && (
              <Button variant="secondary" onClick={handleBack}>
                上一步
              </Button>
            )}
            <Button
              variant="primary"
              onClick={step === 1 ? handleNext : handleSubmit}
            >
              {step === 1 ? '下一步' : '创建实验'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {step === 1 && (
          <>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Type className="w-4 h-4 text-teal-400" />
                实验名称
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="例如：图像分类模型训练"
                className={cn(
                  'w-full px-4 py-2.5 rounded-lg border bg-slate-900 text-white',
                  'placeholder-slate-500 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-teal-500/50',
                  errors.name
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-slate-700 focus:border-teal-500'
                )}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-400">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <FileText className="w-4 h-4 text-teal-400" />
                实验描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="简要描述实验目的和预期结果..."
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
                <p className="mt-1 text-xs text-rose-400">
                  {errors.description}
                </p>
              )}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Code className="w-4 h-4 text-teal-400" />
                初始脚本
              </label>
              <CodeEditor
                value={formData.script}
                onChange={(value) => setFormData({ ...formData, script: value })}
                language="python"
                minHeight="200px"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Code className="w-4 h-4 text-amber-400" />
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

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                版本说明 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.versionDescription}
                onChange={(e) =>
                  setFormData({ ...formData, versionDescription: e.target.value })
                }
                placeholder="描述此版本的主要内容和改动..."
                className={cn(
                  'w-full px-4 py-2.5 rounded-lg border bg-slate-900 text-white',
                  'placeholder-slate-500 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-teal-500/50',
                  errors.versionDescription
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-slate-700 focus:border-teal-500'
                )}
              />
              {errors.versionDescription && (
                <p className="mt-1 text-xs text-rose-400">
                  {errors.versionDescription}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
