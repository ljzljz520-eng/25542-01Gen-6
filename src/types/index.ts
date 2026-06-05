export interface ResultFile {
  id: string;
  versionId: string;
  name: string;
  size: string;
  type: string;
  content: string;
  createdAt: string;
}

export interface Version {
  id: string;
  experimentId: string;
  versionNumber: number;
  script: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>;
  description: string;
  isRollback: boolean;
  rollbackFromVersionId?: string;
  createdAt: string;
  resultFiles: ResultFile[];
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  currentVersionId: string;
  createdAt: string;
  updatedAt: string;
  versions: Version[];
}

export interface AppState {
  experiments: Experiment[];
  activeExperimentId: string | null;
  selectedVersionIds: string[];
  loading: boolean;
}

export type AppAction =
  | { type: 'LOAD_EXPERIMENTS'; payload: Experiment[] }
  | { type: 'ADD_EXPERIMENT'; payload: Experiment }
  | { type: 'UPDATE_EXPERIMENT'; payload: Experiment }
  | { type: 'ADD_VERSION'; payload: { experimentId: string; version: Version } }
  | { type: 'SET_ACTIVE_EXPERIMENT'; payload: string | null }
  | { type: 'TOGGLE_SELECT_VERSION'; payload: string }
  | { type: 'CLEAR_SELECTED_VERSIONS' };

export interface DiffLine {
  value: string;
  added?: boolean;
  removed?: boolean;
  lineNumber?: number;
}

export interface DiffResult {
  lines: DiffLine[];
  leftLineCount: number;
  rightLineCount: number;
}
