import { useState } from 'react';
import type { BoxForm } from '../lib/types';

export interface WardrobeSchematicProps {
  nicheWidthMm: number;
  nicheHeightMm: number;
  outerMaskingLeft: boolean;
  outerMaskingRight: boolean;
  hasSideNiches: boolean;
  leftBlendMm: number;
  rightBlendMm: number;
  leftNicheHeightMm: number;
  rightNicheHeightMm: number;
  topBlendMm: number;
  bottomBlendMm: number;
  boxes: BoxForm[];
  numberOfBoxes: number;
  onBoxChange: (index: number, field: keyof BoxForm, value: number | string | boolean | number[]) => void;
}

type ItemType = 'shelves' | 'rods' | 'drawers' | 'partition';

interface PositionedItem {
  id: string;
  type: ItemType;
  /** mm from top of main area — for shelves/rods/drawers */
  yMm: number;
  /** mm from left edge of box interior — only for partitions */
  xMm?: number;
  /**
   * For shelves/rods/drawers: fixed horizontal span expressed in mm
   * from left edge of box interior. Once set, it does NOT change even
   * if new partitions are added later.
   */
  startMm?: number;
  endMm?: number;
  /** computed top of partition span — only for partitions */
  spanTopMm?: number;
  /** computed bottom of partition span — only for partitions */
  spanBotMm?: number;
}

interface TooltipState {
  x: number;
  y: number;
  text: string;
}

interface PaletteConfig {
  type: ItemType;
  label: string;
  icon: string;
  fill: string;
  stroke: string;
  /** visual height in mm for SVG rendering */
  heightMm: number;
  /** actual board/item thickness used for snap & label calculations */
  boardMm: number;
}

const PALETTE: PaletteConfig[] = [
  { type: 'shelves', label: 'Półka',    icon: '━', fill: 'rgba(59,130,246,0.10)',  stroke: '#3b7dd8', heightMm: 22,  boardMm: 18  },
  { type: 'rods',    label: 'Drążek',   icon: '◎', fill: 'rgba(217,119,6,0.10)',   stroke: '#c97c10', heightMm: 50,  boardMm: 0   },
  { type: 'drawers', label: 'Szuflada', icon: '▭', fill: 'rgba(22,163,74,0.10)',   stroke: '#16a34a', heightMm: 160, boardMm: 160 },
  { type: 'partition', label: 'Przegroda', icon: '┃', fill: 'rgba(147,51,234,0.10)',  stroke: '#9333ea', heightMm: 0,   boardMm: 0   },
];

const PANEL_MM = 18;
const SVG_W    = 660;
const SVG_H    = 440;
const ML = 46; const MT = 28; const MR = 16; const MB = 32;
const SNAP_MM  = 10;
const GAP_MM   = 3;

function uid() { return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`; }

function arrowHead(id: string, color: string) {
  return (
    <marker id={id} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill={color} />
    </marker>
  );
}

function calcDropY(e: React.DragEvent<HTMLDivElement>, mainH: number, itemHeightMm = 0): number {
  const rect = e.currentTarget.getBoundingClientRect();
  const relY = Math.max(0, Math.min(0.999, (e.clientY - rect.top) / rect.height));
  const rawTopFromCeiling = relY * mainH;
  // snap the BOTTOM EDGE of the item (from floor) to multiples of SNAP_MM
  const rawBottomFromFloor = mainH - rawTopFromCeiling - itemHeightMm;
  const snappedBottomFromFloor = Math.round(rawBottomFromFloor / SNAP_MM) * SNAP_MM;
  return Math.max(0, mainH - snappedBottomFromFloor - itemHeightMm);
}

function calcDropX(e: React.DragEvent<HTMLDivElement>, boxWidthMm: number): number {
  const rect = e.currentTarget.getBoundingClientRect();
  const relX = Math.max(0, Math.min(0.999, (e.clientX - rect.left) / rect.width));
  return Math.round((relX * boxWidthMm) / SNAP_MM) * SNAP_MM;
}

/** Snap Y: if cursor lands inside an existing item, snap above or below it. */
function getSnappedY(
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
    // jeżeli mamy segment, ignorujemy elementy które z nim się nie przecinają
    if (segmentStartMm !== undefined && segmentEndMm !== undefined) {
      const s = item.startMm ?? 0;
      const e = item.endMm ?? segmentEndMm;
      if (e <= segmentStartMm || s >= segmentEndMm) {
        continue;
      }
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

/** Compute the vertical span of a partition based on horizontal item boundaries around the cursor Y.
 *  Uses actual board thickness (PANEL_MM) for shelves and drawers for accurate height calculation.
 */
function getPartitionSpan(
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

/** Given anchor X, Y and partitions in the box, return horizontal segment [start,end] in mm.
 *  Only partitions whose vertical span overlaps the item's Y position are considered.
 */
function getHorizontalSegmentForItem(
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

type DragHoverPos = {
  boxIdx: number;
  yMm: number;
  /** for partitions: X position within box interior */
  xMm?: number;
  spanTopMm?: number;
  spanBotMm?: number;
};

export default function WardrobeSchematic({
  nicheWidthMm, nicheHeightMm,
  outerMaskingLeft, outerMaskingRight,
  hasSideNiches, leftBlendMm, rightBlendMm,
  leftNicheHeightMm, rightNicheHeightMm,
  topBlendMm, bottomBlendMm,
  boxes, numberOfBoxes,
  onBoxChange,
}: WardrobeSchematicProps) {
  const [draggingType, setDraggingType] = useState<ItemType | null>(null);
  const [dragOverBox, setDragOverBox]   = useState<number | null>(null);
  const [dragHoverPos, setDragHoverPos] = useState<DragHoverPos | null>(null);
  const [placedItems, setPlacedItems]   = useState<Record<number, PositionedItem[]>>({});
  const [tooltip, setTooltip]           = useState<TooltipState | null>(null);

  const mainH = nicheHeightMm - topBlendMm - bottomBlendMm;

  // ── Mutators ─────────────────────────────────────────────────────────────
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
      } else {
        const count = updated.filter((it) => it.type === type).length;
        const field = type as Extract<keyof BoxForm, 'rods' | 'drawers'>;
        setTimeout(() => onBoxChange(boxIdx, field, count), 0);
      }
      return { ...prev, [boxIdx]: updated };
    });
  }

  // ── Coordinate helpers ───────────────────────────────────────────────────
  const drawW = SVG_W - ML - MR;
  const drawH = SVG_H - MT - MB;
  const scale  = Math.min(drawW / nicheWidthMm, drawH / nicheHeightMm);
  const scaledW = nicheWidthMm * scale;
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

  // ── Segments ─────────────────────────────────────────────────────────────
  const maskLeftW  = outerMaskingLeft  ? PANEL_MM : 0;
  const maskRightW = outerMaskingRight ? PANEL_MM : 0;
  const leftNicheW  = hasSideNiches ? leftBlendMm  : 0;
  const rightNicheW = hasSideNiches ? rightBlendMm : 0;

  const activeBoxes = boxes.slice(0, numberOfBoxes);

  type Segment = { type: 'mask' | 'niche-l' | 'niche-r' | 'panel' | 'box'; xMm: number; wMm: number; boxIdx?: number };
  const segs: Segment[] = [];
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

  const boxSegs = segs.filter((s): s is Segment & { boxIdx: number } => s.type === 'box');

  const COLORS = { mask: '#bcc3d0', niche: '#2e7a50', panel: '#8492b0', box: '#3b6db0', blend: '#a06820', dim: '#444', dimFaint: '#999' };
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  const totalByType = (type: ItemType) =>
    Object.values(placedItems).flat().filter((it) => it.type === type).length;

  function clearAll() {
    setTooltip(null);
    setPlacedItems((prev) => {
      const cleared: Record<number, PositionedItem[]> = {};
      Object.keys(prev).forEach((k) => { cleared[Number(k)] = []; });
      Object.keys(prev).forEach((k) => {
        const idx = Number(k);
        (['shelves', 'rods', 'drawers'] as const).forEach((t) => {
          setTimeout(() => onBoxChange(idx, t, 0), 0);
        });
      });
      return cleared;
    });
  }

  return (
    <div className="wardrobe-schematic">
      <div className="wardrobe-schematic__header">
        <span>📐 Podgląd graficzny szafy</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-outline btn--small" onClick={clearAll}>🗑 Wyczyść</button>
        </div>
      </div>

      {/* ── Palette ── */}
      <div className="schematic-palette">
        {PALETTE.map((p) => (
          <div
            key={p.type}
            className={`palette-item${draggingType === p.type ? ' palette-item--dragging' : ''}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('itemType', p.type);
              e.dataTransfer.effectAllowed = 'copy';
              setDraggingType(p.type);
            }}
            onDragEnd={() => { setDraggingType(null); setDragHoverPos(null); }}
            style={{ '--item-stroke': p.stroke, '--item-fill': p.fill } as React.CSSProperties}
          >
            <span className="palette-item__icon">{p.icon}</span>
            <span className="palette-item__label">{p.label}</span>
            {totalByType(p.type) > 0 && (
              <span className="palette-item__count">×{totalByType(p.type)}</span>
            )}
          </div>
        ))}
        <span className="schematic-palette__tip">Przeciągnij na box · kliknij aby usunąć</span>
      </div>

      {/* ── SVG + drop overlays ── */}
      <div className="schematic-svg-wrapper">
        <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ display: 'block', background: '#f8f9fc' }} aria-label="Schemat szafy">
          <defs>
            {arrowHead('arr-dim-s', COLORS.dim)}
            {arrowHead('arr-dim-e', COLORS.dim)}
            {arrowHead('arr-faint-s', COLORS.dimFaint)}
            {arrowHead('arr-faint-e', COLORS.dimFaint)}
            <pattern id="hatch-mask" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="5" stroke="#c0c8d8" strokeWidth="1.5" />
            </pattern>
            <pattern id="hatch-niche" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="5" stroke="#2e7a50" strokeWidth="1.5" />
            </pattern>
            <pattern id="hatch-blend" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="5" stroke="#a06820" strokeWidth="1.5" />
            </pattern>
            {boxSegs.map((seg) => (
              <clipPath key={`clip-${seg.boxIdx}`} id={`clip-box-${seg.boxIdx}`}>
                <rect x={px(seg.xMm)} y={py(mainY)} width={sw(seg.wMm)} height={sh(mainH)} />
              </clipPath>
            ))}
          </defs>

          {/* Niche boundary */}
          <rect x={ox} y={oy} width={scaledW} height={scaledH} fill="none" stroke="#bbc3d4" strokeWidth={1} strokeDasharray="5,4" />

          {/* Top blend */}
          {topBlendH > 0 && (
            <g>
              <rect x={px(maskLeftW + leftNicheW)} y={py(0)}
                width={sw(nicheWidthMm - maskLeftW - maskRightW - leftNicheW - rightNicheW)} height={sh(topBlendH)}
                fill="url(#hatch-blend)" stroke={COLORS.blend} strokeWidth={0.7} />
              <text x={px(maskLeftW + leftNicheW + (nicheWidthMm - maskLeftW - maskRightW - leftNicheW - rightNicheW) / 2)}
                y={py(topBlendH / 2)} fill={COLORS.blend} fontSize={clamp(sh(topBlendH) * 0.45, 7, 11)}
                textAnchor="middle" dominantBaseline="middle">↕ {topBlendH}</text>
            </g>
          )}

          {/* Bottom blend */}
          {bottomBlendH > 0 && (
            <g>
              <rect x={px(maskLeftW + leftNicheW)} y={py(bottomBlendY)}
                width={sw(nicheWidthMm - maskLeftW - maskRightW - leftNicheW - rightNicheW)} height={sh(bottomBlendH)}
                fill="url(#hatch-blend)" stroke={COLORS.blend} strokeWidth={0.7} />
              <text x={px(maskLeftW + leftNicheW + (nicheWidthMm - maskLeftW - maskRightW - leftNicheW - rightNicheW) / 2)}
                y={py(bottomBlendY + bottomBlendH / 2)} fill={COLORS.blend} fontSize={clamp(sh(bottomBlendH) * 0.45, 7, 11)}
                textAnchor="middle" dominantBaseline="middle">↕ {bottomBlendH}</text>
            </g>
          )}

          {/* ── Segments ── */}
          {segs.map((seg, i) => {
            const sx   = px(seg.xMm);
            const segW = sw(seg.wMm);

            if (seg.type === 'mask')
              return <rect key={i} x={sx} y={py(0)} width={segW} height={sh(nicheHeightMm)} fill="url(#hatch-mask)" stroke={COLORS.mask} strokeWidth={0.7} />;

            if (seg.type === 'niche-l' || seg.type === 'niche-r') {
              const filledH = Math.min(seg.type === 'niche-l' ? leftNicheHeightMm : rightNicheHeightMm, mainH);
              return (
                <g key={i}>
                  <rect x={sx} y={py(mainY)} width={segW} height={sh(mainH)} fill="rgba(46,122,80,0.04)" stroke={COLORS.niche} strokeWidth={0.8} />
                  {filledH > 0 && <rect x={sx} y={py(mainY)} width={segW} height={sh(filledH)} fill="url(#hatch-niche)" stroke={COLORS.niche} strokeWidth={0.8} />}
                  <text x={sx + segW / 2} y={py(mainY + mainH / 2)} fill={COLORS.niche}
                    fontSize={clamp(segW * 0.55, 7, 10)} textAnchor="middle" dominantBaseline="middle"
                    transform={`rotate(-90,${sx + segW / 2},${py(mainY + mainH / 2)})`}>{seg.wMm}mm</text>
                </g>
              );
            }

            if (seg.type === 'panel')
              return <rect key={i} x={sx} y={py(mainY)} width={segW} height={sh(mainH)} fill="#c8cdd8" stroke="#aab0c0" strokeWidth={0.7} />;

            if (seg.type === 'box') {
              const bIdx = seg.boxIdx ?? 0;
              const boxItems = placedItems[bIdx] || [];
              const isOver   = dragOverBox === bIdx;
              const boxYpx   = py(mainY);
              const boxHpx   = sh(mainH);
              const fSize    = clamp(segW * 0.15, 7, 12);
              const hover    = dragHoverPos?.boxIdx === bIdx ? dragHoverPos : null;
              const hoverCfg = draggingType ? PALETTE.find((p) => p.type === draggingType) : null;

              return (
                <g key={i}>
                  {/* Box background */}
                  <rect x={sx} y={boxYpx} width={segW} height={boxHpx}
                    fill={isOver ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.03)'}
                    stroke={isOver ? '#3b7dd8' : COLORS.box} strokeWidth={isOver ? 2 : 1} />

                  {/* Empty box label */}
                  {boxItems.length === 0 && segW > 20 && (
                    <>
                      <text x={sx + segW / 2} y={boxYpx + boxHpx / 2 - fSize * 0.7}
                        fill={COLORS.box} fontSize={clamp(fSize * 1.05, 7, 13)}
                        textAnchor="middle" dominantBaseline="middle" fontWeight="600">Box {bIdx + 1}</text>
                      <text x={sx + segW / 2} y={boxYpx + boxHpx / 2 + fSize * 0.9}
                        fill={COLORS.box} fontSize={clamp(fSize * 0.9, 6, 11)}
                        textAnchor="middle" dominantBaseline="middle">{seg.wMm} mm</text>
                    </>
                  )}
                  {boxItems.length > 0 && segW > 16 && (
                    <text x={sx + segW / 2} y={boxYpx + 10}
                      fill="rgba(59,109,176,0.35)" fontSize={clamp(fSize * 0.8, 5, 9)} textAnchor="middle">Box {bIdx + 1}</text>
                  )}

                  {/* ── Items ── */}
                  {boxItems.map((item) => {
                    // ── Przegroda ───────────────────────────────────────
                    if (item.type === 'partition') {
                      const pc = PALETTE.find((p) => p.type === item.type)!;
                      const itemX   = sx + sw(item.xMm ?? 0);
                      const sTopY   = py(mainY + (item.spanTopMm ?? 0));
                      const sBotY   = py(mainY + (item.spanBotMm ?? mainH));
                      const sH      = sBotY - sTopY;
                      const sW      = sw(PANEL_MM);
                      const spanMm  = Math.round((item.spanBotMm ?? mainH) - (item.spanTopMm ?? 0));
                      const widthMm = PANEL_MM;
                      return (
                        <g
                          key={item.id}
                          clipPath={`url(#clip-box-${bIdx})`}
                          onClick={() => removeItem(bIdx, item.id, item.type)}
                          onMouseEnter={(e) => {
                            setTooltip({
                              x: e.clientX + 10,
                              y: e.clientY + 10,
                              text: `Przegroda\nSzerokość: ${widthMm} mm\nWysokość: ${spanMm} mm\nOd lewej: ${Math.round(item.xMm ?? 0)} mm`,
                            });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                          style={{ cursor: 'pointer' }}
                        >
                          <rect
                            x={itemX}
                            y={sTopY}
                            width={sW}
                            height={sH}
                            fill={pc.fill}
                            stroke={pc.stroke}
                            strokeWidth={1.2}
                          />
                        </g>
                      );
                    }

                    const pc = PALETTE.find((p) => p.type === item.type);
                    if (!pc) return null;

                    const itemYpx = py(mainY + item.yMm);
                    const itemHpx = Math.max(4, sh(pc.heightMm));

                    // compute horizontal segment for non-partition items:
                    // if item has its own fixed span, use it; otherwise span whole box
                    const spanStartMm = item.startMm !== undefined ? item.startMm : 0;
                    const spanEndMm   = item.endMm   !== undefined ? item.endMm   : seg.wMm;
                    const itemSX = sx + sw(spanStartMm);
                    const itemSegW = sw(spanEndMm - spanStartMm);

                    // ── Półka ────────────────────────────────────────────
                    if (item.type === 'shelves') {
                      const widthMm = Math.round(spanEndMm - spanStartMm);
                      const heightMm = PALETTE.find((p) => p.type === 'shelves')!.boardMm;
                      return (
                        <g
                          key={item.id}
                          clipPath={`url(#clip-box-${bIdx})`}
                          onClick={() => removeItem(bIdx, item.id, item.type)}
                          onMouseEnter={(e) => {
                            setTooltip({
                              x: e.clientX + 10,
                              y: e.clientY + 10,
                              text: `Półka\nSzerokość: ${widthMm} mm\nGrubość: ${heightMm} mm\nOd dołu: ${mainH - item.yMm - heightMm} mm`,
                            });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                          style={{ cursor: 'pointer' }}
                        >
                          <rect
                            x={itemSX}
                            y={itemYpx}
                            width={itemSegW}
                            height={Math.max(4, sh(heightMm))}
                            fill={pc.fill}
                            stroke={pc.stroke}
                            strokeWidth={1.2}
                          />
                        </g>
                      );
                    }

                    // ── Drążek ───────────────────────────────────────────
                    if (item.type === 'rods') {
                      const midY = itemYpx + itemHpx / 2;
                      const r = clamp(sh(8), 3, 8);
                      const widthMm = Math.round(spanEndMm - spanStartMm);
                      return (
                        <g
                          key={item.id}
                          clipPath={`url(#clip-box-${bIdx})`}
                          onClick={() => removeItem(bIdx, item.id, item.type)}
                          onMouseEnter={(e) => {
                            setTooltip({
                              x: e.clientX + 10,
                              y: e.clientY + 10,
                              text: `Drążek\nSzerokość: ${widthMm} mm\nOd dołu: ${mainH - item.yMm} mm`,
                            });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                          style={{ cursor: 'pointer' }}
                        >
                          <rect x={itemSX} y={itemYpx} width={itemSegW} height={itemHpx} fill="transparent" />
                          <line
                            x1={itemSX + 4}
                            y1={midY}
                            x2={itemSX + itemSegW - 4}
                            y2={midY}
                            stroke={pc.stroke}
                            strokeWidth={2}
                            strokeDasharray="4,3"
                          />
                          <circle cx={itemSX + itemSegW / 2} cy={midY} r={r} fill={pc.fill} stroke={pc.stroke} strokeWidth={1} />
                        </g>
                      );
                    }

                    // ── Szuflada ─────────────────────────────────────────
                    if (item.type === 'drawers') {
                      const widthMm = Math.round(spanEndMm - spanStartMm);
                      const heightMm = PALETTE.find((p) => p.type === 'drawers')!.boardMm;
                      return (
                        <g
                          key={item.id}
                          clipPath={`url(#clip-box-${bIdx})`}
                          onClick={() => removeItem(bIdx, item.id, item.type)}
                          onMouseEnter={(e) => {
                            setTooltip({
                              x: e.clientX + 10,
                              y: e.clientY + 10,
                              text: `Szuflada\nSzerokość: ${widthMm} mm\nWysokość: ${heightMm} mm\nOd dołu: ${mainH - item.yMm - heightMm} mm`,
                            });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                          style={{ cursor: 'pointer' }}
                        >
                          <rect
                            x={itemSX}
                            y={itemYpx}
                            width={itemSegW}
                            height={itemHpx}
                            fill={pc.fill}
                            stroke={pc.stroke}
                            strokeWidth={1.2}
                            rx={1}
                          />
                          <line
                            x1={itemSX + 4}
                            y1={itemYpx + itemHpx * 0.55}
                            x2={itemSX + itemSegW - 4}
                            y2={itemYpx + itemHpx * 0.55}
                            stroke={pc.stroke}
                            strokeWidth={0.7}
                          />
                          <rect
                            x={itemSX + itemSegW / 2 - clamp(segW * 0.15, 8, 20)}
                            y={itemYpx + itemHpx * 0.22}
                            width={clamp(itemSegW * 0.3, 16, 40)}
                            height={clamp(itemHpx * 0.12, 3, 6)}
                            fill="none"
                            stroke={pc.stroke}
                            strokeWidth={0.8}
                            rx={1}
                          />
                        </g>
                      );
                    }

                    return null;
                  })}

                  {/* ── Drop preview ─ */}
                  {hover && hoverCfg && draggingType !== 'partition' && (
                    <g clipPath={`url(#clip-box-${bIdx})`}>
                      {(() => {
                        const anchor =
                          hover.xMm !== undefined ? hover.xMm : seg.wMm / 2;
                        const hItemH = draggingType ? (PALETTE.find((p) => p.type === draggingType)?.heightMm ?? 0) : 0;
                        const { startMm, endMm } = getHorizontalSegmentForItem(
                          bIdx,
                          anchor,
                          seg.wMm,
                          placedItems,
                          hover.yMm,
                          hItemH
                        );
                        const lineSX = sx + sw(startMm);
                        const lineEX = sx + sw(endMm);
                        const widthPx = lineEX - lineSX;
                        return (
                          <>
                            <line
                              x1={lineSX}
                              y1={py(mainY + hover.yMm)}
                              x2={lineEX}
                              y2={py(mainY + hover.yMm)}
                              stroke={hoverCfg.stroke}
                              strokeWidth={2}
                              strokeDasharray="5,3"
                            />
                            <rect
                              x={lineSX + 3}
                              y={py(mainY + hover.yMm) - 14}
                              width={clamp(widthPx - 6, 20, 72)}
                              height={13}
                              fill="#111318"
                              rx={3}
                              opacity={0.85}
                            />
                            <text
                              x={lineSX + 6}
                              y={py(mainY + hover.yMm) - 4}
                              fill={hoverCfg.stroke}
                              fontSize={clamp(widthPx * 0.11, 7, 10)}
                              fontWeight="600"
                            >
                              {mainH - hover.yMm - (hoverCfg.boardMm ?? 0)} mm od dołu
                            </text>
                          </>
                        );
                      })()}
                    </g>
                  )}

                  {/* ── Przegroda drop preview ── */}
                  {hover && hoverCfg && draggingType === 'partition' && hover.xMm !== undefined && (
                    <g clipPath={`url(#clip-box-${bIdx})`}>
                      {/* Span highlight */}
                      <rect
                        x={sx + sw(hover.xMm)} y={py(mainY + (hover.spanTopMm ?? 0))}
                        width={sw(PANEL_MM)}
                        height={sh((hover.spanBotMm ?? mainH) - (hover.spanTopMm ?? 0))}
                        fill={hoverCfg.fill} stroke={hoverCfg.stroke} strokeWidth={1.5} strokeDasharray="4,3"
                      />
                      {/* X label */}
                      <rect x={sx + sw(hover.xMm) + sw(PANEL_MM) + 2} y={py(mainY + (hover.spanTopMm ?? 0) + ((hover.spanBotMm ?? mainH) - (hover.spanTopMm ?? 0)) / 2) - 8}
                        width={58} height={13} fill="#111318" rx={3} opacity={0.85} />
                      <text
                        x={sx + sw(hover.xMm) + sw(PANEL_MM) + 5}
                        y={py(mainY + (hover.spanTopMm ?? 0) + ((hover.spanBotMm ?? mainH) - (hover.spanTopMm ?? 0)) / 2) + 2}
                        fill={hoverCfg.stroke} fontSize={clamp(segW * 0.11, 7, 10)} fontWeight="600">
                        {hover.xMm} mm od lewej
                      </text>
                    </g>
                  )}

                  {/* Bottom dimension tick */}
                  <line x1={sx} y1={py(nicheHeightMm) + 4} x2={sx + segW} y2={py(nicheHeightMm) + 4} stroke={COLORS.box} strokeWidth={0.6} />
                  <line x1={sx} y1={py(nicheHeightMm) + 1} x2={sx} y2={py(nicheHeightMm) + 7} stroke={COLORS.box} strokeWidth={0.6} />
                  <line x1={sx + segW} y1={py(nicheHeightMm) + 1} x2={sx + segW} y2={py(nicheHeightMm) + 7} stroke={COLORS.box} strokeWidth={0.6} />
                  <text x={sx + segW / 2} y={py(nicheHeightMm) + 17}
                    fill={COLORS.box} fontSize={clamp(segW * 0.12, 6, 10)} textAnchor="middle">{seg.wMm}</text>
                </g>
              );
            }
            return null;
          })}

          {/* Dim: width */}
          <line x1={ox} y1={oy - 12} x2={ox + scaledW} y2={oy - 12} stroke={COLORS.dim} strokeWidth={0.7} markerStart="url(#arr-dim-s)" markerEnd="url(#arr-dim-e)" />
          <line x1={ox} y1={oy - 6} x2={ox} y2={oy} stroke={COLORS.dimFaint} strokeWidth={0.5} strokeDasharray="2,2" />
          <line x1={ox + scaledW} y1={oy - 6} x2={ox + scaledW} y2={oy} stroke={COLORS.dimFaint} strokeWidth={0.5} strokeDasharray="2,2" />
          <text x={ox + scaledW / 2} y={oy - 16} fill={COLORS.dim} fontSize={11} textAnchor="middle" fontWeight="bold">{nicheWidthMm} mm</text>

          {/* Dim: height */}
          <line x1={ox - 14} y1={oy} x2={ox - 14} y2={oy + scaledH} stroke={COLORS.dim} strokeWidth={0.7} markerStart="url(#arr-dim-s)" markerEnd="url(#arr-dim-e)" />
          <line x1={ox - 6} y1={oy} x2={ox} y2={oy} stroke={COLORS.dimFaint} strokeWidth={0.5} strokeDasharray="2,2" />
          <line x1={ox - 6} y1={oy + scaledH} x2={ox} y2={oy + scaledH} stroke={COLORS.dimFaint} strokeWidth={0.5} strokeDasharray="2,2" />
          <text x={ox - 28} y={oy + scaledH / 2} fill={COLORS.dim} fontSize={11} textAnchor="middle" fontWeight="bold"
            transform={`rotate(-90,${ox - 28},${oy + scaledH / 2})`}>{nicheHeightMm} mm</text>

          {/* Dim: main area */}
          {(topBlendH > 0 || bottomBlendH > 0) && mainH > 0 && (
            <g>
              <line x1={ox + scaledW + 10} y1={py(mainY)} x2={ox + scaledW + 10} y2={py(mainY + mainH)}
                stroke={COLORS.dimFaint} strokeWidth={0.7} markerStart="url(#arr-faint-s)" markerEnd="url(#arr-faint-e)" />
              <line x1={ox + scaledW} y1={py(mainY)} x2={ox + scaledW + 12} y2={py(mainY)} stroke={COLORS.dimFaint} strokeWidth={0.5} />
              <line x1={ox + scaledW} y1={py(mainY + mainH)} x2={ox + scaledW + 12} y2={py(mainY + mainH)} stroke={COLORS.dimFaint} strokeWidth={0.5} />
              <text x={ox + scaledW + 22} y={py(mainY + mainH / 2)} fill={COLORS.dimFaint} fontSize={9} textAnchor="middle"
                transform={`rotate(-90,${ox + scaledW + 22},${py(mainY + mainH / 2)})`}>{mainH} mm</text>
            </g>
          )}

          {/* Legend */}
          <g transform={`translate(${ox}, ${SVG_H - 4})`}>
            {maskLeftW > 0 && (<g><rect x={0} y={-6} width={10} height={10} fill="url(#hatch-mask)" stroke={COLORS.mask} strokeWidth={0.5} /><text x={13} y={1} fill={COLORS.mask} fontSize={8}>Maskownica</text></g>)}
            {(leftNicheW > 0 || rightNicheW > 0) && (<g transform="translate(90,0)"><rect x={0} y={-6} width={10} height={10} fill="url(#hatch-niche)" stroke={COLORS.niche} strokeWidth={0.5} /><text x={13} y={1} fill={COLORS.niche} fontSize={8}>Wnęka boczna</text></g>)}
            {(topBlendH > 0 || bottomBlendH > 0) && (<g transform="translate(200,0)"><rect x={0} y={-6} width={10} height={10} fill="url(#hatch-blend)" stroke={COLORS.blend} strokeWidth={0.5} /><text x={13} y={1} fill={COLORS.blend} fontSize={8}>Blenda/Wnęka</text></g>)}
            <g transform="translate(310,0)"><rect x={0} y={-6} width={10} height={10} fill="rgba(59,130,246,0.05)" stroke={COLORS.box} strokeWidth={0.7} /><text x={13} y={1} fill={COLORS.box} fontSize={8}>Box</text></g>
          </g>
        </svg>

        {/* ── Drop zones ── */}
        {boxSegs.map((seg) => (
          <div
            key={`drop-${seg.boxIdx}`}
            className={`schematic-drop-zone${dragOverBox === seg.boxIdx ? ' schematic-drop-zone--over' : ''}`}
            style={{
              position: 'absolute',
              left:   `${(px(seg.xMm) / SVG_W) * 100}%`,
              top:    `${(py(mainY)   / SVG_H) * 100}%`,
              width:  `${(sw(seg.wMm) / SVG_W) * 100}%`,
              height: `${(sh(mainH)   / SVG_H) * 100}%`,
              pointerEvents: draggingType ? 'auto' : 'none',
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
              setDragOverBox(seg.boxIdx);

              const rawX = calcDropX(e, seg.wMm);

              if (draggingType === 'partition') {
                const rawY = calcDropY(e, mainH, 0);
                const { spanTopMm, spanBotMm } = getPartitionSpan(rawY, seg.boxIdx, placedItems, mainH);
                setDragHoverPos({ boxIdx: seg.boxIdx, yMm: rawY, xMm: rawX, spanTopMm, spanBotMm });
              } else if (draggingType) {
                const dragItemH = PALETTE.find((p) => p.type === draggingType)?.boardMm ?? 0;
                const rawY = calcDropY(e, mainH, dragItemH);
                const preSnapSeg = getHorizontalSegmentForItem(seg.boxIdx, rawX, seg.wMm, placedItems, rawY, dragItemH);
                const snappedY = getSnappedY(rawY, seg.boxIdx, draggingType, placedItems, mainH, preSnapSeg.startMm, preSnapSeg.endMm);
                setDragHoverPos({ boxIdx: seg.boxIdx, yMm: snappedY, xMm: rawX });
              }
            }}
            onDragLeave={() => { setDragOverBox(null); setDragHoverPos(null); }}
            onDrop={(e) => {
              e.preventDefault();
              const raw = e.dataTransfer.getData('itemType');
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
                addItem(seg.boxIdx, { type: 'partition', yMm: rawY, xMm: rawX, spanTopMm, spanBotMm });
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
            }}
          />
        ))}
        {tooltip && (() => {
          const [title, ...lines] = tooltip.text.split('\n');
          return (
            <div
              style={{
                position: 'fixed',
                left: tooltip.x,
                top: tooltip.y,
                backgroundColor: '#fff',
                color: '#333',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 12,
                lineHeight: '1.7',
                pointerEvents: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
                zIndex: 20,
                whiteSpace: 'nowrap',
                border: '1px solid #dde1ea',
                minWidth: 140,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13, color: '#1a1a2e' }}>{title}</div>
              {lines.map((line, i) => {
                const [label, val] = line.split(': ');
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                    <span style={{ color: '#888' }}>{label}</span>
                    <span style={{ fontWeight: 600, color: '#333' }}>{val}</span>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
