import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { VersionDiff } from '../components/version/VersionDiff';

export function ComparePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const experiments = useStore((state) => state.experiments);

  const experiment = useMemo(
    () => experiments.find((e) => e.id === id),
    [experiments, id]
  );

  const fromVersionId = searchParams.get('from');
  const toVersionId = searchParams.get('to');

  const oldVersion = useMemo(() => {
    if (!experiment || !fromVersionId) return null;
    return experiment.versions.find((v) => v.id === fromVersionId) || null;
  }, [experiment, fromVersionId]);

  const newVersion = useMemo(() => {
    if (!experiment || !toVersionId) return null;
    return experiment.versions.find((v) => v.id === toVersionId) || null;
  }, [experiment, toVersionId]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        <div className="h-full rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
          <VersionDiff
            experimentId={id || ''}
            oldVersion={oldVersion}
            newVersion={newVersion}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
