// src/utils/codeDiff.ts

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
}

/**
 * Generates a simple line-by-line diff between two code snippets.
 * This is a basic implementation and does not handle complex changes like word-level diffs.
 */
export function generateCodeDiff(oldCode: string, newCode: string): DiffLine[] {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  const diff: DiffLine[] = [];

  // This simple diff approach iterates through both arrays.
  // A real-world, highly accurate diff often uses algorithms like Myers diff.
  // This version aims for clear visual indication of line additions/removals.

  let oldIdx = 0;
  let newIdx = 0;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    const oldLine = oldLines[oldIdx];
    const newLine = newLines[newIdx];

    if (oldLine === newLine) {
      // Lines are identical
      diff.push({ type: 'unchanged', value: oldLine });
      oldIdx++;
      newIdx++;
    } else {
      // Lines are different. Try to find if one exists later in the other.
      const remainingOld = oldLines.slice(oldIdx);    
      const remainingNew = newLines.slice(newIdx);

      const oldLineInNewIndex = remainingNew.indexOf(oldLine);
      const newLineInOldIndex = remainingOld.indexOf(newLine);

      if (newLineInOldIndex !== -1 && (oldLineInNewIndex === -1 || newLineInOldIndex < oldLineInNewIndex)) {
        // Current new line found later in old code -> implies lines were removed from old
        for (let i = 0; i < newLineInOldIndex; i++) {
          diff.push({ type: 'removed', value: remainingOld[i] });
        }
        oldIdx += newLineInOldIndex;
      } else if (oldLineInNewIndex !== -1 && (newLineInOldIndex === -1 || oldLineInNewIndex < newLineInOldIndex)) {
        // Current old line found later in new code -> implies lines were added to new
        for (let i = 0; i < oldLineInNewIndex; i++) {
          diff.push({ type: 'added', value: remainingNew[i] });
        }
        newIdx += oldLineInNewIndex;
      } else {
        // No clear match down the line, assume this old line was removed and this new line was added.
        if (oldIdx < oldLines.length) {
          diff.push({ type: 'removed', value: oldLine });
          oldIdx++;
        }
        if (newIdx < newLines.length) {
          diff.push({ type: 'added', value: newLine });
          newIdx++;
        }
      }
    }
  }

  return diff;
}