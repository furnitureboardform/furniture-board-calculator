import type { ItemType, PositionedItem, DragHoverPos } from './types';
import { PALETTE, SNAP_MM, GAP_MM, PANEL_MM } from './constants';

export function uid(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function calcDropY(e: React.DragEvent<HTMLDivElement>, mainH: number, itemHeightMm = 0): number {
  const rect = e.currentTarget.getBoundingClientRect();
  const relY = Math.max(0, Math.min(0.999, (e.clientY - rect.top) / rect.height));
  const rawTopFromCeiling = relY * mainH;
  // snap the BOTTOM EDGE of the item (from floor) to multiples of SNAP_MM
  const rawBottomFromFloor = mainH - rawTopFromCeiling - itemHeightMm;
  const snappedBottomFromFloor = Math.round(rawBottomFromFloor / SNAP_MM) * SNAP_MM;
  return Math.max(0, mainH - snappedBottomFromFloor - itemHeightMm);
}

export function calcDropX(e: React.DragEvent<HTMLDivElement>, boxWidthMm: number): number {
  const rect = e.currentTarget.getBoundingClientRect();
  const relX = Math.max(0, Math.min(0.999, (e.clientX - rect.left) / rect.width));
  return Math.round((relX * boxWidthMm) / SNAP_MM) * SNAP_MM;
}

/** Snap Y: if cursor lands inside an existing item, snap above or below it. */
export function getSnappedY(
  rawYMm: number,
  boxIdx: number,
  newItemType: ItemType,
  placed: Record<number, PositionedItem[]>,
  mainH: number,
  segmentStartMm?: number,
  segmentEndMm?: number
): number {
  const newH = PALETTE.find((p) => p.type === newItemType)?.heightMm ?? 22;
  for (const item of (placed[boxIdx] || [])) {
    if (item.type === 'partition') continue;
    if (segmentStartMm !== undefined && segmentEndMm !== undefined) {
      const s = item.startMm ?? 0;
      const e = item.endMm ?? segmentEndMm;
      if (e <= segmentStartMm || s >= segmentEndMm) continue;
    }
    const pc = PALETTE.find((p) => p.type === item.type);
    if (!pc) continue;
    const top = item.yMm;
    const bot = item.yMm + pc.heightMm;
    if (rawYMm >= top && rawYMm <= bot) {
      return rawYMm <= (top + bot) / 2
        ? Math.max(0, top - newH - GAP_MM)
        : Math.min(mainH - newH, bot + GAP_MM);
    }
  }
  return rawYMm;
}

/**
 * Compute the vertical span of a partition based on horizontal item boundaries around the cursor Y.
 * Uses actual board thickness (PANEL_MM) for shelves and drawers for accurate height calculation.
 */
export function getPartitionSpan(
  cursorYMm: number,
  boxIdx: number,
  placed: Record<number, PositionedItem[]>,
  mainH: number
): { spanTopMm: number; spanBotMm: number } {
  const boundaries = (placed[boxIdx] || [])
    .filter((it) => it.type === 'shelves' || it.type === 'drawers')
    .map((it) => {
      // Use actual board thickness for shelves, palette height for drawers
      const h = it.type === 'shelves' ? PANEL_MM : (PALETTE.find((p) => p.type === it.type)?.heightMm ?? PANEL_MM);
      return { top: it.yMm, bot: it.yMm + h };
    })
    .sort((a, b) => a.top - b.top);

  const above = boundaries.filter((s) => s.bot <= cursorYMm);
  const below = boundaries.filter((s) => s.top >= cursorYMm);

  return {
    spanTopMm: above.length > 0 ? above[above.length - 1].bot : 0,
    spanBotMm: below.length > 0 ? below[0].top : mainH,
  };
}

/**
 * Given anchor X, Y and partitions in the box, return horizontal segment [start,end] in mm.
 * Only partitions whose vertical span overlaps the item's Y position are considered.
 */
export function getHorizontalSegmentForItem(
  boxIdx: number,
  anchorXMm: number,
  boxWidthMm: number,
  placed: Record<number, PositionedItem[]>,
  yMm?: number,
  itemHeightMm?: number
): { startMm: number; endMm: number } {
  const clampedAnchor = Math.max(0, Math.min(boxWidthMm, anchorXMm));
  const partitionEdgesMm = (placed[boxIdx] || [])
    .filter((it) => {
      if (it.type !== 'partition' || typeof it.xMm !== 'number') return false;
      if (yMm === undefined) return true;
      const sTop = it.spanTopMm ?? 0;
      const sBot = it.spanBotMm ?? Infinity;
      const iTop = yMm;
      const iBot = yMm + (itemHeightMm ?? 0);
      return iTop < sBot && iBot > sTop;
    })
    .flatMap((it) => {
      const x = it.xMm as number;
      return [x, x + PANEL_MM];
    })
    .sort((a, b) => a - b);

  const bounds: number[] = [0, ...partitionEdgesMm, boxWidthMm];
  let start = 0;
  let end = boxWidthMm;
  for (let i = 1; i < bounds.length; i++) {
    if (clampedAnchor <= bounds[i]) {
      start = bounds[i - 1];
      end = bounds[i];
      break;
    }
  }
  return { startMm: start, endMm: end };
}

export function buildDragHoverPos(
  e: React.DragEvent<HTMLDivElement>,
  boxIdx: number,
  boxWidthMm: number,
  draggingType: ItemType,
  placedItems: Record<number, PositionedItem[]>,
  mainH: number
): DragHoverPos {
  const rawX = calcDropX(e, boxWidthMm);

  if (draggingType === 'partition') {
    const rawY = calcDropY(e, mainH, 0);
    const { spanTopMm, spanBotMm } = getPartitionSpan(rawY, boxIdx, placedItems, mainH);
    return { boxIdx, yMm: rawY, xMm: rawX, spanTopMm, spanBotMm };
  }

  const dragItemH = PALETTE.find((p) => p.type === draggingType)?.boardMm ?? 0;
  const rawY = calcDropY(e, mainH, dragItemH);
  const preSnapSeg = getHorizontalSegmentForItem(boxIdx, rawX, boxWidthMm, placedItems, rawY, dragItemH);
  const snappedY = getSnappedY(rawY, boxIdx, draggingType, placedItems, mainH, preSnapSeg.startMm, preSnapSeg.endMm);
  return { boxIdx, yMm: snappedY, xMm: rawX };
}
