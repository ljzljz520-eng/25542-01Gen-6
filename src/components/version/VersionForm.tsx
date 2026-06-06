import { useState, useRef } from 'react';
import { FileText, AlertCircle, Upload, X, File, FileCode, FileSpreadsheet, FileImage } from 'lucide-react';
import { Button } from '../common/Button';
import { CodeEditor } from '../common/CodeEditor';
import { Modal } from '../common/Modal';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';

interface ResultFileInput {
  name: string;
  content: string;
  size: number;
}

interface VersionFormProps {
  isOpen: boolean;
  onClose: () => void;
  experimentId: string;
  currentScript: string;
  currentParams: string;
  nextVersionNumber: number;
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['py', 'js', 'ts', 'java', 'cpp', 'c', 'h', 'go', 'rs', 'sh'].includes(ext || '')) {
    return <FileCode className="w-4 h-4 text-blue-400" />;
  }
  if (['csv', 'xlsx', 'xls', 'json', 'xml'].includes(ext || '')) {
    return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || '')) {
    return <FileImage className="w-4 h-4 text-purple-400" />;
  }
  return <File className="w-4 h-4 text-slate-400" />;
};

export function VersionForm({
  isOpen,
  onClose,
  experimentId,
  currentScript,
  currentParams,
  nextVersionNumber,
}: VersionFormProps) {
  const addVersion = useStore((state) => state.addVersion);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    script: currentScript,
    params: currentParams,
    description: '',
  });
  const [resultFiles, setResultFiles] = useState<ResultFileInput[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);

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

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const filePromises = Array.from(files).map((file) => {
      return new Promise<ResultFileInput>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            name: file.name,
            content: e.target?.result as string,
            size: file.size,
          });
        };
        reader.onerror = reject;
        reader.readAsText(file);
      });
    });

    Promise.all(filePromises).then((newFiles) => {
      setResultFiles((prev) => [...prev, ...newFiles]);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setResultFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    try {
      const params = JSON.parse(formData.params);
      addVersion(
        experimentId,
        formData.script,
        params,
        formData.description,
        resultFiles.map((f) => ({ name: f.name, content: f.content }))
      );
      onClose();
      setFormData({
        script: currentScript,
        params: currentParams,
        description: '',
      });
      setResultFiles([]);
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
    setResultFiles([]);
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

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            结果文件 <span className="text-slate-500 font-normal">(可选)</span>
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all',
              'hover:border-teal-500/50 hover:bg-teal-500/5',
              isDragging
                ? 'border-teal-500 bg-teal-500/10'
                : 'border-slate-700 bg-slate-800/30'
            )}
          >
            <Upload className={cn(
              'w-8 h-8 mx-auto mb-2 transition-colors',
              isDragging ? 'text-teal-400' : 'text-slate-500'
            )} />
            <p className="text-sm text-slate-300 mb-1">
              拖拽文件到此处，或点击选择文件
            </p>
            <p className="text-xs text-slate-500">
              支持 CSV、JSON、TXT、图片等格式，将作为此版本的结果文件保存
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {resultFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-slate-400 mb-2">
                已添加 {resultFiles.length} 个文件：
              </p>
              {resultFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(file.name)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-200 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
