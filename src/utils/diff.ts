import { diffLines } from 'diff';
import type { DiffResult, DiffLine } from '../types';

export const computeTextDiff = (oldText: string, newText: string): DiffResult => {
  const changes = diffLines(oldText, newText, { newlineIsToken: false });

  const lines: DiffLine[] = [];
  let leftLineCount = 0;
  let rightLineCount = 0;

  changes.forEach((change) => {
    const valueLines = change.value.split('\n');

    if (valueLines[valueLines.length - 1] === '') {
      valueLines.pop();
    }

    valueLines.forEach((line) => {
      if (change.added) {
        rightLineCount++;
        lines.push({
          value: line,
          added: true,
          lineNumber: rightLineCount,
        });
      } else if (change.removed) {
        leftLineCount++;
        lines.push({
          value: line,
          removed: true,
          lineNumber: leftLineCount,
        });
      } else {
        leftLineCount++;
        rightLineCount++;
        lines.push({
          value: line,
          lineNumber: leftLineCount,
        });
      }
    });
  });

  return {
    lines,
    leftLineCount,
    rightLineCount,
  };
};

export const computeParamsDiff = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oldParams: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newParams: Record<string, any>
): {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  added: Array<{ key: string; value: any }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removed: Array<{ key: string; value: any }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modified: Array<{ key: string; oldValue: any; newValue: any }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unchanged: Array<{ key: string; value: any }>;
} => {
  const allKeys = new Set([...Object.keys(oldParams), ...Object.keys(newParams)]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const added: Array<{ key: string; value: any }> = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const removed: Array<{ key: string; value: any }> = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modified: Array<{ key: string; oldValue: any; newValue: any }> = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unchanged: Array<{ key: string; value: any }> = [];

  allKeys.forEach((key) => {
    const oldVal = oldParams[key];
    const newVal = newParams[key];

    if (!(key in oldParams)) {
      added.push({ key, value: newVal });
    } else if (!(key in newParams)) {
      removed.push({ key, value: oldVal });
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      modified.push({ key, oldValue: oldVal, newValue: newVal });
    } else {
      unchanged.push({ key, value: oldVal });
    }
  });

  return { added, removed, modified, unchanged };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatJson = (obj: Record<string, any>): string => {
  return JSON.stringify(obj, null, 2);
};
