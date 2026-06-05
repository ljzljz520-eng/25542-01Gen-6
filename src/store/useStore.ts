import { create } from 'zustand';
import type { Experiment, Version, ResultFile } from '../types';
import { loadExperiments, saveExperiments, generateId } from '../utils/storage';
import { initializeMockDataIfEmpty } from '../utils/mockData';

interface AppState {
  experiments: Experiment[];
  activeExperimentId: string | null;
  selectedVersionIds: string[];
  loading: boolean;
  init: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addExperiment: (name: string, description: string, script: string, params: Record<string, any>, descriptionVersion: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addVersion: (experimentId: string, script: string, params: Record<string, any>, description: string, resultFiles?: Array<{ name: string; content: string }>) => void;
  rollbackVersion: (experimentId: string, targetVersionId: string, description: string) => void;
  setActiveExperiment: (id: string | null) => void;
  toggleSelectVersion: (versionId: string) => void;
  clearSelectedVersions: () => void;
  getExperimentById: (id: string) => Experiment | undefined;
  getVersionById: (experimentId: string, versionId: string) => Version | undefined;
}

export const useStore = create<AppState>((set, get) => ({
  experiments: [],
  activeExperimentId: null,
  selectedVersionIds: [],
  loading: true,

  init: () => {
    initializeMockDataIfEmpty();
    const experiments = loadExperiments();
    set({ experiments, loading: false });
  },

  addExperiment: (name, description, script, params, versionDescription) => {
    const now = new Date().toISOString();
    const expId = generateId();
    const versionId = generateId();

    const initialVersion: Version = {
      id: versionId,
      experimentId: expId,
      versionNumber: 1,
      script,
      params,
      description: versionDescription,
      isRollback: false,
      createdAt: now,
      resultFiles: [],
    };

    const newExperiment: Experiment = {
      id: expId,
      name,
      description,
      currentVersionId: versionId,
      createdAt: now,
      updatedAt: now,
      versions: [initialVersion],
    };

    const experiments = [...get().experiments, newExperiment];
    saveExperiments(experiments);
    set({ experiments });
  },

  addVersion: (experimentId, script, params, description, resultFiles = []) => {
    const state = get();
    const experiment = state.experiments.find((e) => e.id === experimentId);
    if (!experiment) return;

    const now = new Date().toISOString();
    const versionId = generateId();
    const nextVersionNumber = Math.max(...experiment.versions.map((v) => v.versionNumber)) + 1;

    const newVersion: Version = {
      id: versionId,
      experimentId,
      versionNumber: nextVersionNumber,
      script,
      params,
      description,
      isRollback: false,
      createdAt: now,
      resultFiles: resultFiles.map((rf) => ({
        id: generateId(),
        versionId,
        name: rf.name,
        size: `${Math.round(rf.content.length / 1024)} KB`,
        type: rf.name.split('.').pop() || 'txt',
        content: rf.content,
        createdAt: now,
      })),
    };

    const updatedExperiments = state.experiments.map((e) => {
      if (e.id === experimentId) {
        return {
          ...e,
          versions: [...e.versions, newVersion],
          currentVersionId: versionId,
          updatedAt: now,
        };
      }
      return e;
    });

    saveExperiments(updatedExperiments);
    set({ experiments: updatedExperiments });
  },

  rollbackVersion: (experimentId, targetVersionId, description) => {
    const state = get();
    const experiment = state.experiments.find((e) => e.id === experimentId);
    if (!experiment) return;

    const targetVersion = experiment.versions.find((v) => v.id === targetVersionId);
    if (!targetVersion) return;

    const now = new Date().toISOString();
    const versionId = generateId();
    const nextVersionNumber = Math.max(...experiment.versions.map((v) => v.versionNumber)) + 1;

    const allResultFiles: ResultFile[] = experiment.versions.flatMap((v) => v.resultFiles);

    const newVersion: Version = {
      id: versionId,
      experimentId,
      versionNumber: nextVersionNumber,
      script: targetVersion.script,
      params: { ...targetVersion.params },
      description,
      isRollback: true,
      rollbackFromVersionId: targetVersionId,
      createdAt: now,
      resultFiles: allResultFiles,
    };

    const updatedExperiments = state.experiments.map((e) => {
      if (e.id === experimentId) {
        return {
          ...e,
          versions: [...e.versions, newVersion],
          currentVersionId: versionId,
          updatedAt: now,
        };
      }
      return e;
    });

    saveExperiments(updatedExperiments);
    set({ experiments: updatedExperiments });
  },

  setActiveExperiment: (id) => set({ activeExperimentId: id }),

  toggleSelectVersion: (versionId) => {
    const selected = get().selectedVersionIds;
    if (selected.includes(versionId)) {
      set({ selectedVersionIds: selected.filter((id) => id !== versionId) });
    } else if (selected.length < 2) {
      set({ selectedVersionIds: [...selected, versionId] });
    }
  },

  clearSelectedVersions: () => set({ selectedVersionIds: [] }),

  getExperimentById: (id) => get().experiments.find((e) => e.id === id),

  getVersionById: (experimentId, versionId) => {
    const experiment = get().experiments.find((e) => e.id === experimentId);
    return experiment?.versions.find((v) => v.id === versionId);
  },
}));
