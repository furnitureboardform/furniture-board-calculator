import type { ItemType, PositionedItem, TooltipState, DragHoverPos, WardrobeSegment, BoxSeg } from './types';
import { COLORS, SVG_W, SVG_H } from './constants';
import { clamp } from './utils';
import { BoxSegments } from './BoxSegments';

function arrowHead(id: string, color: string) {
  return (
    <marker id={id} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill={color} />
    </marker>
  );
}

interface SegmentsProps {
  nicheWidthMm: number;
  nicheHeightMm: number;
  leftNicheHeightMm: number;
  rightNicheHeightMm: number;
  ox: number;
  oy: number;
  scaledW: number;
  scaledH: number;
  mainH: number;
  mainY: number;
  topBlendH: number;
  bottomBlendH: number;
  bottomBlendY: number;
  maskLeftW: number;
  maskRightW: number;
  leftNicheW: number;
  rightNicheW: number;
  px: (mm: number) => number;
  py: (mm: number) => number;
  sw: (mm: number) => number;
  sh: (mm: number) => number;
  segs: WardrobeSegment[];
  boxSegs: BoxSeg[];
  dragOverBox: number | null;
  dragHoverPos: DragHoverPos | null;
  draggingType: ItemType | null;
  placedItems: Record<number, PositionedItem[]>;
  onRemoveItem: (boxIdx: number, itemId: string, type: ItemType) => void;
  onTooltipChange: (tooltip: TooltipState | null) => void;
  onDragOver: (seg: BoxSeg, e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (seg: BoxSeg, e: React.DragEvent<HTMLDivElement>) => void;
}

export function Segments({
  nicheWidthMm, nicheHeightMm,
  leftNicheHeightMm, rightNicheHeightMm,
  ox, oy, scaledW, scaledH,
  mainH, mainY, topBlendH, bottomBlendH, bottomBlendY,
  maskLeftW, maskRightW, leftNicheW, rightNicheW,
  px, py, sw, sh,
  segs, boxSegs,
  dragOverBox, dragHoverPos, draggingType, placedItems,
  onRemoveItem, onTooltipChange,
  onDragOver, onDragLeave, onDrop,
}: SegmentsProps) {
  return (
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
            <text
              x={px(maskLeftW + leftNicheW + (nicheWidthMm - maskLeftW - maskRightW - leftNicheW - rightNicheW) / 2)}
              y={py(topBlendH / 2)}
              fill={COLORS.blend} fontSize={clamp(sh(topBlendH) * 0.45, 7, 11)}
              textAnchor="middle" dominantBaseline="middle">↕ {topBlendH}</text>
          </g>
        )}

        {/* Bottom blend */}
        {bottomBlendH > 0 && (
          <g>
            <rect x={px(maskLeftW + leftNicheW)} y={py(bottomBlendY)}
              width={sw(nicheWidthMm - maskLeftW - maskRightW - leftNicheW - rightNicheW)} height={sh(bottomBlendH)}
              fill="url(#hatch-blend)" stroke={COLORS.blend} strokeWidth={0.7} />
            <text
              x={px(maskLeftW + leftNicheW + (nicheWidthMm - maskLeftW - maskRightW - leftNicheW - rightNicheW) / 2)}
              y={py(bottomBlendY + bottomBlendH / 2)}
              fill={COLORS.blend} fontSize={clamp(sh(bottomBlendH) * 0.45, 7, 11)}
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
            return (
              <BoxSegments
                key={i}
                boxIdx={bIdx}
                xMm={seg.xMm}
                wMm={seg.wMm}
                boxItems={placedItems[bIdx] || []}
                isOver={dragOverBox === bIdx}
                hover={dragHoverPos?.boxIdx === bIdx ? dragHoverPos : null}
                draggingType={draggingType}
                placedItems={placedItems}
                mainH={mainH}
                mainY={mainY}
                nicheHeightMm={nicheHeightMm}
                px={px}
                py={py}
                sw={sw}
                sh={sh}
                onRemoveItem={onRemoveItem}
                onTooltipChange={onTooltipChange}
              />
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
          onDragOver={(e) => onDragOver(seg, e)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(seg, e)}
        />
      ))}
    </div>
  );
}
