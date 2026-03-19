import type { ItemType, PositionedItem, TooltipState, DragHoverPos } from './types';
import { PALETTE, PANEL_MM, COLORS } from './constants';
import { clamp, getHorizontalSegmentForItem } from './utils';

interface BoxSegmentsProps {
  boxIdx: number;
  xMm: number;
  wMm: number;
  boxItems: PositionedItem[];
  isOver: boolean;
  hover: DragHoverPos | null;
  draggingType: ItemType | null;
  placedItems: Record<number, PositionedItem[]>;
  mainH: number;
  mainY: number;
  nicheHeightMm: number;
  px: (mm: number) => number;
  py: (mm: number) => number;
  sw: (mm: number) => number;
  sh: (mm: number) => number;
  onRemoveItem: (boxIdx: number, itemId: string, type: ItemType) => void;
  onTooltipChange: (tooltip: TooltipState | null) => void;
}

export function BoxSegments({
  boxIdx,
  xMm,
  wMm,
  boxItems,
  isOver,
  hover,
  draggingType,
  placedItems,
  mainH,
  mainY,
  nicheHeightMm,
  px,
  py,
  sw,
  sh,
  onRemoveItem,
  onTooltipChange,
}: BoxSegmentsProps) {
  const sx     = px(xMm);
  const segW   = sw(wMm);
  const boxYpx = py(mainY);
  const boxHpx = sh(mainH);
  const fSize  = clamp(segW * 0.15, 7, 12);
  const hoverCfg = draggingType ? PALETTE.find((p) => p.type === draggingType) : null;

  return (
    <g>
      {/* Box background */}
      <rect
        x={sx} y={boxYpx} width={segW} height={boxHpx}
        fill={isOver ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.03)'}
        stroke={isOver ? '#3b7dd8' : COLORS.box}
        strokeWidth={isOver ? 2 : 1}
      />

      {/* Empty box label */}
      {boxItems.length === 0 && segW > 20 && (
        <>
          <text x={sx + segW / 2} y={boxYpx + boxHpx / 2 - fSize * 0.7}
            fill={COLORS.box} fontSize={clamp(fSize * 1.05, 7, 13)}
            textAnchor="middle" dominantBaseline="middle" fontWeight="600">Box {boxIdx + 1}</text>
          <text x={sx + segW / 2} y={boxYpx + boxHpx / 2 + fSize * 0.9}
            fill={COLORS.box} fontSize={clamp(fSize * 0.9, 6, 11)}
            textAnchor="middle" dominantBaseline="middle">{wMm} mm</text>
        </>
      )}
      {boxItems.length > 0 && segW > 16 && (
        <text x={sx + segW / 2} y={boxYpx + 10}
          fill="rgba(59,109,176,0.35)" fontSize={clamp(fSize * 0.8, 5, 9)} textAnchor="middle">Box {boxIdx + 1}</text>
      )}

      {/* ── Items ── */}
      {boxItems.map((item) => {
        // ── Przegroda ──────────────────────────────────────────────────────
        if (item.type === 'partition') {
          const pc     = PALETTE.find((p) => p.type === item.type)!;
          const itemX  = sx + sw(item.xMm ?? 0);
          const sTopY  = py(mainY + (item.spanTopMm ?? 0));
          const sBotY  = py(mainY + (item.spanBotMm ?? mainH));
          const sH     = sBotY - sTopY;
          const sW     = sw(PANEL_MM);
          const spanMm = Math.round((item.spanBotMm ?? mainH - PANEL_MM) - (item.spanTopMm ?? PANEL_MM));
          return (
            <g
              key={item.id}
              clipPath={`url(#clip-box-${boxIdx})`}
              onClick={() => onRemoveItem(boxIdx, item.id, item.type)}
              onMouseEnter={(e) => onTooltipChange({ x: e.clientX + 10, y: e.clientY + 10, text: `Przegroda\nSzerokość: ${PANEL_MM} mm\nWysokość: ${spanMm} mm\nOd lewej: ${Math.round(item.xMm ?? 0)} mm` })}
              onMouseLeave={() => onTooltipChange(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect x={itemX} y={sTopY} width={sW} height={sH} fill={pc.fill} stroke={pc.stroke} strokeWidth={1.2} />
            </g>
          );
        }

        const pc = PALETTE.find((p) => p.type === item.type);
        if (!pc) return null;

        const itemYpx = py(mainY + item.yMm);
        const itemHpx = Math.max(4, sh(pc.heightMm));
        const spanStartMm = item.startMm !== undefined ? item.startMm : 0;
        const spanEndMm   = item.endMm   !== undefined ? item.endMm   : wMm;
        const itemSX   = sx + sw(spanStartMm);
        const itemSegW = sw(spanEndMm - spanStartMm);

        // ── Półka ──────────────────────────────────────────────────────────
        if (item.type === 'shelves') {
          const widthMm  = Math.round(spanEndMm - spanStartMm);
          const heightMm = PALETTE.find((p) => p.type === 'shelves')!.boardMm;
          return (
            <g
              key={item.id}
              clipPath={`url(#clip-box-${boxIdx})`}
              onClick={() => onRemoveItem(boxIdx, item.id, item.type)}
              onMouseEnter={(e) => onTooltipChange({ x: e.clientX + 10, y: e.clientY + 10, text: `Półka\nSzerokość: ${widthMm} mm\nGrubość: ${heightMm} mm\nOd dołu (góra półki): ${mainH - item.yMm} mm` })}
              onMouseLeave={() => onTooltipChange(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect x={itemSX} y={itemYpx} width={itemSegW} height={Math.max(4, sh(heightMm))} fill={pc.fill} stroke={pc.stroke} strokeWidth={1.2} />
            </g>
          );
        }

        // ── Drążek ─────────────────────────────────────────────────────────
        if (item.type === 'rods') {
          const midY   = itemYpx + itemHpx / 2;
          const r      = clamp(sh(8), 3, 8);
          const widthMm = Math.round(spanEndMm - spanStartMm);
          return (
            <g
              key={item.id}
              clipPath={`url(#clip-box-${boxIdx})`}
              onClick={() => onRemoveItem(boxIdx, item.id, item.type)}
              onMouseEnter={(e) => onTooltipChange({ x: e.clientX + 10, y: e.clientY + 10, text: `Drążek\nSzerokość: ${widthMm} mm\nOd dołu: ${mainH - item.yMm} mm` })}
              onMouseLeave={() => onTooltipChange(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect x={itemSX} y={itemYpx} width={itemSegW} height={itemHpx} fill="transparent" />
              <line x1={itemSX + 4} y1={midY} x2={itemSX + itemSegW - 4} y2={midY} stroke={pc.stroke} strokeWidth={2} strokeDasharray="4,3" />
              <circle cx={itemSX + itemSegW / 2} cy={midY} r={r} fill={pc.fill} stroke={pc.stroke} strokeWidth={1} />
            </g>
          );
        }

        // ── Szuflada ───────────────────────────────────────────────────────
        if (item.type === 'drawers') {
          const widthMm  = Math.round(spanEndMm - spanStartMm);
          const heightMm = PALETTE.find((p) => p.type === 'drawers')!.boardMm;
          return (
            <g
              key={item.id}
              clipPath={`url(#clip-box-${boxIdx})`}
              onClick={() => onRemoveItem(boxIdx, item.id, item.type)}
              onMouseEnter={(e) => onTooltipChange({ x: e.clientX + 10, y: e.clientY + 10, text: `Szuflada\nSzerokość: ${widthMm} mm\nWysokość: ${heightMm} mm\nOd dołu (góra szuflady): ${mainH - item.yMm} mm` })}
              onMouseLeave={() => onTooltipChange(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect x={itemSX} y={itemYpx} width={itemSegW} height={itemHpx} fill={pc.fill} stroke={pc.stroke} strokeWidth={1.2} rx={1} />
              <line x1={itemSX + 4} y1={itemYpx + itemHpx * 0.55} x2={itemSX + itemSegW - 4} y2={itemYpx + itemHpx * 0.55} stroke={pc.stroke} strokeWidth={0.7} />
              <rect
                x={itemSX + itemSegW / 2 - clamp(segW * 0.15, 8, 20)}
                y={itemYpx + itemHpx * 0.22}
                width={clamp(itemSegW * 0.3, 16, 40)}
                height={clamp(itemHpx * 0.12, 3, 6)}
                fill="none" stroke={pc.stroke} strokeWidth={0.8} rx={1}
              />
            </g>
          );
        }

        // ── Nadstawka ──────────────────────────────────────────────────────
        if (item.type === 'nadstawka') {
          const heightFromBottom = Math.round(mainH - item.yMm);
          // top sub-box: top main panel (18) + interior + nadstawka plate (18)
          const topSubboxTotal = Math.round(item.yMm + PANEL_MM);
          const topSubboxInterior = Math.round(item.yMm - PANEL_MM);
          // bottom sub-box: nadstawka plate (18) + implicit top panel (18) + interior + bottom main panel (18)
          const botSubboxTotal = Math.round(mainH - item.yMm - PANEL_MM);
          const botSubboxInterior = Math.round(mainH - item.yMm - 3 * PANEL_MM);
          return (
            <g
              key={item.id}
              clipPath={`url(#clip-box-${boxIdx})`}
              onClick={() => onRemoveItem(boxIdx, item.id, item.type)}
              onMouseEnter={(e) => onTooltipChange({
                x: e.clientX + 10, y: e.clientY + 10,
                text: `Nadstawka\nOd dołu (góra płyty): ${heightFromBottom} mm\nBox górny: ${topSubboxTotal} mm (wnętrze: ${topSubboxInterior} mm)\nBox dolny: ${botSubboxTotal} mm (wnętrze: ${botSubboxInterior} mm)`,
              })}
              onMouseLeave={() => onTooltipChange(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Full-width structural plate */}
              <rect x={sx} y={itemYpx} width={segW} height={Math.max(4, sh(PANEL_MM))} fill={pc.fill} stroke={pc.stroke} strokeWidth={2} />
              {/* Double-line detail to suggest a structural divider */}
              <line x1={sx + 2} y1={itemYpx + Math.max(4, sh(PANEL_MM)) / 2} x2={sx + segW - 2} y2={itemYpx + Math.max(4, sh(PANEL_MM)) / 2} stroke={pc.stroke} strokeWidth={0.7} strokeDasharray="4,3" />
            </g>
          );
        }

        return null;
      })}

      {/* ── Nadstawka drop preview ── */}
      {hover && hoverCfg && draggingType === 'nadstawka' && (
        <g clipPath={`url(#clip-box-${boxIdx})`}>
          <rect x={sx} y={py(mainY + hover.yMm)} width={segW} height={Math.max(4, sh(PANEL_MM))} fill={hoverCfg.fill} stroke={hoverCfg.stroke} strokeWidth={2} strokeDasharray="5,3" />
          <rect x={sx + 3} y={py(mainY + hover.yMm) - 14} width={clamp(segW - 6, 30, 90)} height={13} fill="#111318" rx={3} opacity={0.85} />
          <text x={sx + 6} y={py(mainY + hover.yMm) - 4} fill={hoverCfg.stroke} fontSize={clamp(segW * 0.1, 7, 10)} fontWeight="600">
            {mainH - hover.yMm} mm od dołu
          </text>
        </g>
      )}

      {/* ── Regular item drop preview ── */}
      {hover && hoverCfg && draggingType !== 'partition' && draggingType !== 'nadstawka' && (
        <g clipPath={`url(#clip-box-${boxIdx})`}>
          {(() => {
            const anchor  = hover.xMm !== undefined ? hover.xMm : wMm / 2;
            const hItemH  = draggingType ? (PALETTE.find((p) => p.type === draggingType)?.heightMm ?? 0) : 0;
            const { startMm, endMm } = getHorizontalSegmentForItem(boxIdx, anchor, wMm, placedItems, hover.yMm, hItemH);
            const lineSX  = sx + sw(startMm);
            const lineEX  = sx + sw(endMm);
            const widthPx = lineEX - lineSX;
            return (
              <>
                <line x1={lineSX} y1={py(mainY + hover.yMm)} x2={lineEX} y2={py(mainY + hover.yMm)} stroke={hoverCfg.stroke} strokeWidth={2} strokeDasharray="5,3" />
                <rect x={lineSX + 3} y={py(mainY + hover.yMm) - 14} width={clamp(widthPx - 6, 20, 72)} height={13} fill="#111318" rx={3} opacity={0.85} />
                <text x={lineSX + 6} y={py(mainY + hover.yMm) - 4} fill={hoverCfg.stroke} fontSize={clamp(widthPx * 0.11, 7, 10)} fontWeight="600">
                  {mainH - hover.yMm} mm od dołu
                </text>
              </>
            );
          })()}
        </g>
      )}

      {/* ── Przegroda drop preview ── */}
      {hover && hoverCfg && draggingType === 'partition' && hover.xMm !== undefined && (
        <g clipPath={`url(#clip-box-${boxIdx})`}>
          <rect
            x={sx + sw(hover.xMm)} y={py(mainY + (hover.spanTopMm ?? 0))}
            width={sw(PANEL_MM)} height={sh((hover.spanBotMm ?? mainH) - (hover.spanTopMm ?? 0))}
            fill={hoverCfg.fill} stroke={hoverCfg.stroke} strokeWidth={1.5} strokeDasharray="4,3"
          />
          <rect
            x={sx + sw(hover.xMm) + sw(PANEL_MM) + 2}
            y={py(mainY + (hover.spanTopMm ?? 0) + ((hover.spanBotMm ?? mainH) - (hover.spanTopMm ?? 0)) / 2) - 8}
            width={58} height={13} fill="#111318" rx={3} opacity={0.85}
          />
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
      <text x={sx + segW / 2} y={py(nicheHeightMm) + 17} fill={COLORS.box} fontSize={clamp(segW * 0.12, 6, 10)} textAnchor="middle">{wMm}</text>
    </g>
  );
}
