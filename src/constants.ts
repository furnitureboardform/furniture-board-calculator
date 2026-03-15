import type { BoxForm } from './lib/types';

/** Grubość boków skrzyni (mm). */
export const SIDE_PANEL_THICKNESS_MM = 18;
/** Odjęcie na zewnętrzne maskowanie (mm). */
export const OUTER_MASKING_SIDE_MM = 18;
/** Grubość drzwi (mm). */
export const DOOR_THICKNESS_MM = 18;
/** Luz drzwi od korpusu (mm). */
export const DOOR_CLEARANCE_FROM_CABINET_MM = 2;
/** Grubość płyty tylnej (mm). */
export const BACK_BOARD_THICKNESS_MM = 3;

export const SPLIT_EQUALLY_STORAGE_KEY = 'splitEquallyEnabled';

export const defaultBox = (): BoxForm => ({
  width: 964,
  doubleDoor: false,
  shelves: 2,
  rods: 0,
  drawers: 2,
});

export function getStoredSplitEqually(): boolean {
  const stored = localStorage.getItem(SPLIT_EQUALLY_STORAGE_KEY);
  if (stored === null) return true;
  return stored === 'true';
}

/** Dzieli dostępną szerokość na równe części (z resztą na końcu). */
export function getEvenSplitWidths(totalWidth: number, count: number): number[] {
  const safeCount = Math.max(1, count);
  const safeTotal = Math.max(0, totalWidth);
  const baseWidth = Math.floor(safeTotal / safeCount);
  const remainder = safeTotal - baseWidth * safeCount;
  const widths = Array(safeCount).fill(baseWidth);
  for (let i = 0; i < remainder; i++) {
    widths[safeCount - 1 - i] += 1;
  }
  return widths;
}
