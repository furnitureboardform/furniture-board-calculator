import { useState, useEffect } from 'react';
import type { BoxForm } from '../../lib/types';
import type { ItemType, PositionedItem, TooltipState, DragHoverPos, WardrobeSegment, BoxSeg } from './types';
import { PALETTE, PANEL_MM, SVG_W, SVG_H, ML, MT, MR, MB } from './constants';
import { uid, buildDragHoverPos, getHorizontalSegmentForItem, getPartitionSpan, calcDropY, calcDropX, getSnappedY, snapPartitionX } from './utils';

interface UseWardrobeSchematicParams {
  nicheWidthMm: number;
  nicheHeightMm: number;
  outerMaskingLeft: boolean;
  outerMaskingRight: boolean;
  hasSideNiches: boolean;
  leftBlendMm: number;
  rightBlendMm: number;
  topBlendMm: number;
  bottomBlendMm: number;
  boxes: BoxForm[];
  numberOfBoxes: number;
  onBoxChange: (index: number, field: keyof BoxForm, value: number | string | boolean | number[]) => void;
  initialPlacedItems?: Record<number, PositionedItem[]>;
  onPlacedItemsChange?: (items: Record<number, PositionedItem[]>) => void;
}

export function useWardrobeSchematic({
  nicheWidthMm,
  nicheHeightMm,
  outerMaskingLeft,
  outerMaskingRight,
  hasSideNiches,
  leftBlendMm,
  rightBlendMm,
  topBlendMm,
  bottomBlendMm,
  boxes,
  numberOfBoxes,
  onBoxChange,
  initialPlacedItems,
  onPlacedItemsChange,
}: UseWardrobeSchematicParams) {
  const [draggingType, setDraggingType] = useState<ItemType | null>(null);
  const [dragOverBox, setDragOverBox]   = useState<number | null>(null);
  const [dragHoverPos, setDragHoverPos] = useState<DragHoverPos | null>(null);
  const [placedItems, setPlacedItems]   = useState<Record<number, PositionedItem[]>>(() => initialPlacedItems ?? {});
  const [tooltip, setTooltip]           = useState<TooltipState | null>(null);

  useEffect(() => {
    onPlacedItemsChange?.(placedItems);
  }, [placedItems]);

  const mainH = nicheHeightMm - topBlendMm - bottomBlendMm;

  // ── Mutators ──────────────────────────────────────────────────────────────
  function addItem(boxIdx: number, item: Omit<PositionedItem, 'id'>) {
    const newItem: PositionedItem = { id: uid(), ...item };
    setPlacedItems((prev) => {
      const existing = prev[boxIdx] || [];
      const updated = [...existing, newItem];
      if (item.type === 'partition') {
        const heights = updated
          .filter((it) => it.type === 'partition')
          .map((it) => Math.round((it.spanBotMm ?? 0) - (it.spanTopMm ?? 0)));
        setTimeout(() => onBoxChange(boxIdx, 'partitions', heights), 0);
      } else if (item.type === 'shelves') {
        const shelveItems = updated.filter((it) => it.type === 'shelves');
        const widths = shelveItems.map((it) => Math.round((it.endMm ?? 0) - (it.startMm ?? 0)));
        setTimeout(() => { onBoxChange(boxIdx, 'shelves', shelveItems.length); onBoxChange(boxIdx, 'shelvesMm', widths); }, 0);
      } else if (item.type === 'nadstawka') {
        // height = distance from the bottom of the main area to the top edge of the nadstawka plate
        const heights = updated
          .filter((it) => it.type === 'nadstawka')
          .map((it) => Math.round(mainH - it.yMm))
          .sort((a, b) => b - a);
        setTimeout(() => onBoxChange(boxIdx, 'nadstawkaMm', heights), 0);
      } else {
        const count = updated.filter((it) => it.type === item.type).length;
        const field = item.type as Extract<keyof BoxForm, 'rods' | 'drawers'>;
        setTimeout(() => onBoxChange(boxIdx, field, count), 0);
      }
      return { ...prev, [boxIdx]: updated };
    });
  }

  function removeItem(boxIdx: number, itemId: string, type: ItemType) {
    setTooltip(null);
    setPlacedItems((prev) => {
      const existing = prev[boxIdx] || [];
      const updated = existing.filter((it) => it.id !== itemId);
      if (type === 'partition') {
        const heights = updated
          .filter((it) => it.type === 'partition')
          .map((it) => Math.round((it.spanBotMm ?? 0) - (it.spanTopMm ?? 0)));
        setTimeout(() => onBoxChange(boxIdx, 'partitions', heights), 0);
      } else if (type === 'shelves') {
        const shelveItems = updated.filter((it) => it.type === 'shelves');
        const widths = shelveItems.map((it) => Math.round((it.endMm ?? 0) - (it.startMm ?? 0)));
        setTimeout(() => { onBoxChange(boxIdx, 'shelves', shelveItems.length); onBoxChange(boxIdx, 'shelvesMm', widths); }, 0);
      } else if (type === 'nadstawka') {
        const heights = updated
          .filter((it) => it.type === 'nadstawka')
          .map((it) => Math.round(mainH - it.yMm))
          .sort((a, b) => b - a);
        setTimeout(() => onBoxChange(boxIdx, 'nadstawkaMm', heights), 0);
      } else {
        const count = updated.filter((it) => it.type === type).length;
        const field = type as Extract<keyof BoxForm, 'rods' | 'drawers'>;
        setTimeout(() => onBoxChange(boxIdx, field, count), 0);
      }
      return { ...prev, [boxIdx]: updated };
    });
  }

  function clearAll() {
    setTooltip(null);
    setPlacedItems((prev) => {
      const cleared: Record<number, PositionedItem[]> = {};
      Object.keys(prev).forEach((k) => { cleared[Number(k)] = []; });
      Object.keys(prev).forEach((k) => {
        const idx = Number(k);
        (['shelves', 'rods', 'drawers', 'nadstawka'] as const).forEach((t) => {
          setTimeout(() => onBoxChange(idx, t === 'nadstawka' ? 'nadstawkaMm' : t, t === 'nadstawka' ? [] : 0), 0);
        });
      });
      return cleared;
    });
  }

  function totalByType(type: ItemType): number {
    return Object.values(placedItems).flat().filter((it) => it.type === type).length;
  }

  // ── Coordinate helpers ────────────────────────────────────────────────────
  const drawW  = SVG_W - ML - MR;
  const drawH  = SVG_H - MT - MB;
  const scale  = Math.min(drawW / nicheWidthMm, drawH / nicheHeightMm);
  const scaledW = nicheWidthMm  * scale;
  const scaledH = nicheHeightMm * scale;
  const ox = ML + (drawW - scaledW) / 2;
  const oy = MT + (drawH - scaledH) / 2;

  const px = (mm: number) => ox + mm * scale;
  const py = (mm: number) => oy + mm * scale;
  const sw = (mm: number) => mm * scale;
  const sh = (mm: number) => mm * scale;

  const topBlendH    = topBlendMm;
  const bottomBlendH = bottomBlendMm;
  const mainY        = topBlendH;
  const bottomBlendY = mainY + mainH;

  // ── Segments ──────────────────────────────────────────────────────────────
  const maskLeftW  = outerMaskingLeft  ? PANEL_MM : 0;
  const maskRightW = outerMaskingRight ? PANEL_MM : 0;
  const leftNicheW  = hasSideNiches ? leftBlendMm  : 0;
  const rightNicheW = hasSideNiches ? rightBlendMm : 0;

  const activeBoxes = boxes.slice(0, numberOfBoxes);

  const segs: WardrobeSegment[] = [];
  let xMm = 0;
  if (maskLeftW  > 0) { segs.push({ type: 'mask',    xMm, wMm: maskLeftW  }); xMm += maskLeftW; }
  if (leftNicheW > 0) { segs.push({ type: 'niche-l', xMm, wMm: leftNicheW }); xMm += leftNicheW; }
  activeBoxes.forEach((box, i) => {
    segs.push({ type: 'panel', xMm, wMm: PANEL_MM }); xMm += PANEL_MM;
    segs.push({ type: 'box', xMm, wMm: box.width, boxIdx: i }); xMm += box.width;
  });
  segs.push({ type: 'panel', xMm, wMm: PANEL_MM }); xMm += PANEL_MM;
  if (rightNicheW > 0) { segs.push({ type: 'niche-r', xMm, wMm: rightNicheW }); xMm += rightNicheW; }
  if (maskRightW  > 0) { segs.push({ type: 'mask', xMm, wMm: maskRightW }); }

  const boxSegs = segs.filter((s): s is BoxSeg => s.type === 'box');

  // ── Drag handlers (encapsulated closures) ─────────────────────────────────
  function handlePaletteDragStart(type: ItemType) {
    setDraggingType(type);
  }

  function handlePaletteDragEnd() {
    setDraggingType(null);
    setDragHoverPos(null);
  }

  function handleDragOver(seg: BoxSeg, e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverBox(seg.boxIdx);
    if (!draggingType) return;
    const hoverPos = buildDragHoverPos(e, seg.boxIdx, seg.wMm, draggingType, placedItems, mainH);
    setDragHoverPos(hoverPos);
  }

  function handleDragLeave() {
    setDragOverBox(null);
    setDragHoverPos(null);
  }

  function handleDrop(seg: BoxSeg, e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const raw  = e.dataTransfer.getData('itemType');
    const type = (raw || draggingType) as ItemType;
    if (!type || !PALETTE.some((p) => p.type === type)) {
      setDragOverBox(null);
      setDragHoverPos(null);
      return;
    }
    const rawX = calcDropX(e, seg.wMm);

    if (type === 'partition') {
      const rawY = calcDropY(e, mainH, 0);
      const { spanTopMm, spanBotMm } = getPartitionSpan(rawY, seg.boxIdx, placedItems, mainH);
      const snappedX = snapPartitionX(rawX, 0, seg.wMm);
      addItem(seg.boxIdx, { type: 'partition', yMm: rawY, xMm: snappedX, spanTopMm, spanBotMm });
    } else if (type === 'nadstawka') {
      // Nadstawka always spans the full box width — no horizontal segmentation.
      const rawY = calcDropY(e, mainH, PANEL_MM);
      const yMm  = getSnappedY(rawY, seg.boxIdx, type, placedItems, mainH);
      addItem(seg.boxIdx, { type: 'nadstawka', yMm });
    } else {
      const dropItemH = PALETTE.find((p) => p.type === type)?.boardMm ?? 0;
      const rawY = calcDropY(e, mainH, dropItemH);
      const preSnapSeg = getHorizontalSegmentForItem(seg.boxIdx, rawX, seg.wMm, placedItems, rawY, dropItemH);
      const yMm = getSnappedY(rawY, seg.boxIdx, type, placedItems, mainH, preSnapSeg.startMm, preSnapSeg.endMm);
      const { startMm, endMm } = getHorizontalSegmentForItem(seg.boxIdx, rawX, seg.wMm, placedItems, yMm, dropItemH);
      addItem(seg.boxIdx, { type, yMm, startMm, endMm });
    }

    setDragOverBox(null);
    setDragHoverPos(null);
  }

  return {
    // state
    draggingType,
    dragOverBox,
    dragHoverPos,
    placedItems,
    tooltip,
    setTooltip,
    // computed geometry
    mainH,
    mainY,
    topBlendH,
    bottomBlendH,
    bottomBlendY,
    scaledW,
    scaledH,
    ox,
    oy,
    px,
    py,
    sw,
    sh,
    maskLeftW,
    maskRightW,
    leftNicheW,
    rightNicheW,
    // segments
    segs,
    boxSegs,
    // handlers
    clearAll,
    totalByType,
    removeItem,
    handlePaletteDragStart,
    handlePaletteDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
