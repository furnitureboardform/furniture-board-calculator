import type { BoxForm } from '../lib/types';

interface ContractWardrobePreviewProps {
  readonly nicheWidthMm: number;
  readonly nicheHeightMm: number;
  readonly boxes: BoxForm[];
  readonly numberOfBoxes: number;
  readonly hasSideNiches: boolean;
  readonly leftBlendMm: number;
  readonly rightBlendMm: number;
  readonly topBlendMm: number;
  readonly bottomBlendMm: number;
  readonly outerMaskingLeft: boolean;
  readonly outerMaskingRight: boolean;
  readonly finishColor: string;
}

const SVG_W = 760;
const SVG_H = 420;
const PADDING = 26;
const PANEL_MM = 18;

export function ContractWardrobePreview({
  nicheWidthMm,
  nicheHeightMm,
  boxes,
  numberOfBoxes,
  hasSideNiches,
  leftBlendMm,
  rightBlendMm,
  topBlendMm,
  bottomBlendMm,
  outerMaskingLeft,
  outerMaskingRight,
  finishColor,
}: ContractWardrobePreviewProps) {
  const innerWidth = SVG_W - PADDING * 2;
  const innerHeight = SVG_H - PADDING * 2;
  const scale = Math.min(innerWidth / nicheWidthMm, innerHeight / nicheHeightMm);
  const widthPx = nicheWidthMm * scale;
  const heightPx = nicheHeightMm * scale;
  const startX = (SVG_W - widthPx) / 2;
  const startY = (SVG_H - heightPx) / 2;

  const leftNiche = hasSideNiches ? leftBlendMm : 0;
  const rightNiche = hasSideNiches ? rightBlendMm : 0;
  const leftMask = outerMaskingLeft ? PANEL_MM : 0;
  const rightMask = outerMaskingRight ? PANEL_MM : 0;
  const mainWidthMm = nicheWidthMm - leftNiche - rightNiche - leftMask - rightMask;
  const activeBoxes = boxes.slice(0, numberOfBoxes);
  const totalBoxWidth = activeBoxes.reduce((sum, box) => sum + box.width, 0) || 1;
  let cursorMm = leftMask + leftNiche;

  return (
    <div className="contract-preview">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="contract-preview__svg" aria-label="Model szafy do umowy">
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#fafafc" />
        <rect x={startX} y={startY} width={widthPx} height={heightPx} fill="#f0f2f6" stroke="#c6ccd7" strokeWidth={1.2} rx={6} />

        {topBlendMm > 0 && (
          <rect
            x={startX + (leftMask + leftNiche) * scale}
            y={startY}
            width={mainWidthMm * scale}
            height={topBlendMm * scale}
            fill="#e7d8be"
            opacity={0.8}
          />
        )}

        {bottomBlendMm > 0 && (
          <rect
            x={startX + (leftMask + leftNiche) * scale}
            y={startY + (nicheHeightMm - bottomBlendMm) * scale}
            width={mainWidthMm * scale}
            height={bottomBlendMm * scale}
            fill="#e7d8be"
            opacity={0.8}
          />
        )}

        {leftMask > 0 && (
          <rect x={startX} y={startY} width={leftMask * scale} height={heightPx} fill="#d4d8e0" />
        )}
        {rightMask > 0 && (
          <rect x={startX + widthPx - rightMask * scale} y={startY} width={rightMask * scale} height={heightPx} fill="#d4d8e0" />
        )}

        {leftNiche > 0 && (
          <rect x={startX + leftMask * scale} y={startY} width={leftNiche * scale} height={heightPx} fill="#dcecdf" stroke="#83a58a" strokeDasharray="5 4" />
        )}
        {rightNiche > 0 && (
          <rect x={startX + widthPx - (rightMask + rightNiche) * scale} y={startY} width={rightNiche * scale} height={heightPx} fill="#dcecdf" stroke="#83a58a" strokeDasharray="5 4" />
        )}

        {activeBoxes.map((box, index) => {
          const boxWidthMm = (box.width / totalBoxWidth) * mainWidthMm;
          const boxX = startX + cursorMm * scale;
          cursorMm += boxWidthMm;
          const boxY = startY + topBlendMm * scale;
          const boxW = boxWidthMm * scale;
          const boxH = heightPx - (topBlendMm + bottomBlendMm) * scale;
          const shelvesCount = Math.max(0, box.shelves || 0);
          const drawersCount = Math.max(0, box.drawers || 0);
          const rodsCount = Math.max(0, box.rods || 0);
          const partitions = box.partitions ?? [];

          const drawerGap = 4;
          const drawerHeight = drawersCount > 0
            ? Math.min(Math.max(20, (boxH * 0.42) / drawersCount), 44)
            : 0;
          const drawersBlockHeight = drawersCount > 0
            ? drawersCount * drawerHeight + (drawersCount - 1) * drawerGap
            : 0;
          const shelvesTop = boxY + 10;
          const shelvesBottom = boxY + boxH - drawersBlockHeight - 12;
          const shelvesArea = Math.max(0, shelvesBottom - shelvesTop);

          return (
            <g key={index}>
              <rect x={boxX} y={boxY} width={boxW} height={boxH} fill="#ffffff" stroke={finishColor} strokeWidth={1.2} />

              {/* Przegrody pionowe (wewnętrzne podziały) */}
              {partitions.map((partitionHeight, partitionIndex) => {
                const partitionW = Math.max(2, boxW * 0.018);
                const xPos = boxX + ((partitionIndex + 1) / (partitions.length + 1)) * boxW - partitionW / 2;
                const hPx = Math.max(0, Math.min(boxH, partitionHeight * scale));
                const yPos = boxY + boxH - hPx;
                return (
                  <rect
                    key={`partition-${partitionIndex}`}
                    x={xPos}
                    y={yPos}
                    width={partitionW}
                    height={hPx}
                    fill="#a48dd6"
                    opacity={0.85}
                  />
                );
              })}

              {/* Półki */}
              {Array.from({ length: shelvesCount }, (_, shelfIndex) => {
                const yPos = shelvesTop + ((shelfIndex + 1) * shelvesArea) / (shelvesCount + 1);
                return (
                  <rect
                    key={`shelf-${shelfIndex}`}
                    x={boxX + 3}
                    y={yPos}
                    width={Math.max(0, boxW - 6)}
                    height={3}
                    fill="#3b7dd8"
                    opacity={0.85}
                  />
                );
              })}

              {/* Drążki */}
              {Array.from({ length: rodsCount }, (_, rodIndex) => {
                const yPos = shelvesTop + ((rodIndex + 1) * shelvesArea) / (rodsCount + 1) + 8;
                return (
                  <g key={`rod-${rodIndex}`}>
                    <line
                      x1={boxX + 8}
                      y1={yPos}
                      x2={boxX + boxW - 8}
                      y2={yPos}
                      stroke="#c97c10"
                      strokeWidth={2}
                      strokeDasharray="4 3"
                    />
                    <circle cx={boxX + boxW / 2} cy={yPos} r={3} fill="#c97c10" opacity={0.85} />
                  </g>
                );
              })}

              {/* Szuflady */}
              {Array.from({ length: drawersCount }, (_, drawerIndex) => {
                const yPos = boxY + boxH - (drawerIndex + 1) * drawerHeight - drawerIndex * drawerGap - 6;
                return (
                  <g key={`drawer-${drawerIndex}`}>
                    <rect
                      x={boxX + 6}
                      y={yPos}
                      width={Math.max(0, boxW - 12)}
                      height={Math.max(12, drawerHeight)}
                      fill="#d6f3df"
                      stroke="#16a34a"
                      strokeWidth={1}
                      rx={2}
                    />
                    <rect
                      x={boxX + boxW / 2 - 12}
                      y={yPos + Math.max(6, drawerHeight * 0.35)}
                      width={24}
                      height={3}
                      fill="#16a34a"
                      opacity={0.9}
                    />
                  </g>
                );
              })}

              <text x={boxX + (boxWidthMm * scale) / 2} y={startY + heightPx + 16} textAnchor="middle" fontSize="11" fill="#4c5a70">
                Box {index + 1}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}