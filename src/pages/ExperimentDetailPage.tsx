import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, GitCompare, RotateCcw, GitBranch, Info } from 'lucide-react';
import { useStore } from '../store/useStore';
import { VersionTimeline } from '../components/experiment/VersionTimeline';
import { VersionContent } from '../components/version/VersionContent';
import { VersionForm } from '../components/version/VersionForm';
import { RollbackModal } from '../components/version/RollbackModal';
import { Button } from '../components/common/Button';
import { formatDate } from '../utils/storage';
import { formatJson } from '../utils/diff';
import { cn } from '../lib/utils';

export function ExperimentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const experiments = useStore((state) => state.experiments);
  const selectedVersionIds = useStore((state) => state.selectedVersionIds);
  const clearSelectedVersions = useStore((state) => state.clearSelectedVersions);

  const experiment = useMemo(
    () => experiments.find((e) => e.id === id),
    [experiments, id]
  );

  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [isVersionFormOpen, setIsVersionFormOpen] = useState(false);
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);
  const [editedScript, setEditedScript] = useState('');
  const [editedParams, setEditedParams] = useState('');

  useEffect(() => {
    if (experiment && !activeVersionId) {
      setActiveVersionId(experiment.currentVersionId);
    }
  }, [experiment, activeVersionId]);

  useEffect(() => {
    return () => {
      clearSelectedVersions();
    };
  }, [clearSelectedVersions]);

  const activeVersion = useMemo(() => {
    if (!experiment || !activeVersionId) return null;
    return experiment.versions.find((v) => v.id === activeVersionId) || null;
  }, [experiment, activeVersionId]);

  const rollbackTargetVersion = useMemo(() => {
    if (!experiment || !activeVersionId) return null;
    const target = experiment.versions.find((v) => v.id === activeVersionId);
    if (target?.id === experiment.currentVersionId) return null;
    return target;
  }, [experiment, activeVersionId]);

  const nextVersionNumber = useMemo(() => {
    if (!experiment) return 1;
    return Math.max(...experiment.versions.map((v) => v.versionNumber)) + 1;
  }, [experiment]);

  const isCurrentVersion = activeVersion?.id === experiment?.currentVersionId;

  const handleCompare = () => {
    if (selectedVersionIds.length === 2 && id) {
      const sorted = [...selectedVersionIds].sort((a, b) => {
        const v1 = experiment?.versions.find((v) => v.id === a);
        const v2 = experiment?.versions.find((v) => v.id === b);
        if (!v1 || !v2) return 0;
        return v1.versionNumber - v2.versionNumber;
      });
      navigate(
        `/experiments/${id}/compare?from=${sorted[0]}&to=${sorted[1]}`
      );
    }
  };

  const handleOpenVersionForm = () => {
    if (experiment) {
      const currentVersion = experiment.versions.find(
        (v) => v.id === experiment.currentVersionId
      );
      if (currentVersion) {
        setEditedScript(currentVersion.script);
        setEditedParams(formatJson(currentVersion.params));
      }
    }
    setIsVersionFormOpen(true);
  };

  const handleOpenRollbackModal = () => {
    if (rollbackTargetVersion) {
      setIsRollbackModalOpen(true);
    }
  };

  if (!experiment) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>实验不存在</p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => navigate('/')}
          >
            返回概览
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="px-6 py-4 border-b border-slate-700 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-white mb-1">
                {experiment.name}
              </h1>
              <p className="text-sm text-slate-400 mb-2">
                {experiment.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>创建于 {formatDate(experiment.createdAt)}</span>
                <span>更新于 {formatDate(experiment.updatedAt)}</span>
                <span className="text-teal-400">
                  {experiment.versions.length} 个版本
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedVersionIds.length === 2 && (
                <Button
                  variant="secondary"
                  leftIcon={<GitCompare className="w-4 h-4" />}
                  onClick={handleCompare}
                >
                  对比选中版本
                </Button>
              )}
              {rollbackTargetVersion && (
                <Button
                  variant="warning"
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                  onClick={handleOpenRollbackModal}
                >
                  回滚到此版本
                </Button>
              )}
              <Button
                variant="primary"
                leftIcon={<Save className="w-4 h-4" />}
                onClick={handleOpenVersionForm}
              >
                保存新版本
              </Button>
            </div>
          </div>

          {selectedVersionIds.length > 0 && selectedVersionIds.length < 2 && (
            <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-200">
                已选择 {selectedVersionIds.length} 个版本，请再选择 {2 - selectedVersionIds.length} 个版本进行对比
                <button
                  onClick={clearSelectedVersions}
                  className="ml-3 text-amber-400 hover:text-amber-300 underline"
                >
                  清除选择
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 flex gap-6 overflow-hidden">
        <div
          className={cn(
            'w-80 flex-shrink-0 rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden',
            'transition-all duration-300'
          )}
        >
          <VersionTimeline
            versions={experiment.versions}
            currentVersionId={experiment.currentVersionId}
            activeVersionId={activeVersionId || ''}
            onVersionSelect={setActiveVersionId}
            className="h-full"
          />
        </div>

        <div className="flex-1 rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
          <VersionContent
            version={activeVersion}
            isCurrent={isCurrentVersion || false}
            onEditScript={setEditedScript}
            onEditParams={setEditedParams}
            className="h-full"
          />
        </div>
      </div>

      {id && (
        <>
          <VersionForm
            isOpen={isVersionFormOpen}
            onClose={() => setIsVersionFormOpen(false)}
            experimentId={id}
            currentScript={editedScript}
            currentParams={editedParams}
            nextVersionNumber={nextVersionNumber}
          />
          <RollbackModal
            isOpen={isRollbackModalOpen}
            onClose={() => setIsRollbackModalOpen(false)}
            experimentId={id}
            targetVersion={rollbackTargetVersion}
            nextVersionNumber={nextVersionNumber}
          />
        </>
      )}
    </div>
  );
}
