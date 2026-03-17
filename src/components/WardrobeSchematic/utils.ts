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
  /*
   * Snap the TOP EDGE of the item to multiples of SNAP_MM.
   * This means "od dołu X mm" always refers to the top surface of an item
   * (the surface a partition would rest on / the reference carpenters use).
   * The partition calculation in getPartitionSpan uses spanBotMm = shelf.yMm
   * (top edge), so the stated position is directly the partition floor — no
   * extra 18 mm needs to be added by the user.
   */
  const rawTopFromFloor = mainH - relY * mainH;
  const snappedTopFromFloor = Math.round(rawTopFromFloor / SNAP_MM) * SNAP_MM;
  return clamp(mainH - snappedTopFromFloor, 0, mainH - itemHeightMm);
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
    .filter((it) => it.type === 'shelves' || it.type === 'drawers' || it.type === 'nadstawka')
    .map((it) => {
      let h: number;
      if (it.type === 'nadstawka') {
        /*
         * The nadstawka plate (18 mm, shown in the SVG) is the bottom panel
         * of the top sub-box. The bottom sub-box has its own top panel (18 mm)
         * sitting directly below. Together they form a 36 mm zone that neither
         * sub-box interior can enter. Using 2×PANEL_MM makes:
         *   top = it.yMm             → floor of the top sub-box interior
         *   bot = it.yMm + 2×PANEL_MM → ceiling of the bottom sub-box interior
         */
        h = 2 * PANEL_MM;
      } else if (it.type === 'shelves') {
        h = PANEL_MM;
      } else {
        h = PALETTE.find((p) => p.type === it.type)?.heightMm ?? PANEL_MM;
      }
      return { top: it.yMm, bot: it.yMm + h };
    })
    .sort((a, b) => a.top - b.top);

  const above = boundaries.filter((s) => s.bot <= cursorYMm);
  const below = boundaries.filter((s) => s.top >= cursorYMm);

  /*
   * When there is no item above/below, the partition is bounded by the box
   * panel (top or bottom plate, each PANEL_MM thick). This gives the correct
   * interior height: mainH - 2 * PANEL_MM for a full-height box, or the
   * interior of a sub-box created by a nadstawka.
   *
   * The nadstawka itself is already in `boundaries` (added in the filter
   * above), so sub-box ceilings/floors are handled automatically:
   *   – top sub-box floor  = nadstawka.top  (set via below[0].top)
   *   – bot sub-box ceiling = nadstawka.bot  (set via above[last].bot)
   */
  return {
    spanTopMm: above.length > 0 ? above[above.length - 1].bot : PANEL_MM,
    spanBotMm: below.length > 0 ? below[0].top : mainH - PANEL_MM,
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

  // Nadstawka always spans the full box width — no horizontal segmentation needed.
  if (draggingType === 'nadstawka') {
    const rawY = calcDropY(e, mainH, PANEL_MM);
    const snappedY = getSnappedY(rawY, boxIdx, draggingType, placedItems, mainH);
    return { boxIdx, yMm: snappedY };
  }

  const dragItemH = PALETTE.find((p) => p.type === draggingType)?.boardMm ?? 0;
  const rawY = calcDropY(e, mainH, dragItemH);
  const preSnapSeg = getHorizontalSegmentForItem(boxIdx, rawX, boxWidthMm, placedItems, rawY, dragItemH);
  const snappedY = getSnappedY(rawY, boxIdx, draggingType, placedItems, mainH, preSnapSeg.startMm, preSnapSeg.endMm);
  return { boxIdx, yMm: snappedY, xMm: rawX };
}
