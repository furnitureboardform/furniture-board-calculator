import type { WardrobeSchematicProps } from './types';
import { useWardrobeSchematic } from './useWardrobeSchematic';
import { Palette } from './Palette';
import { Segments } from './Segments';
import { Tooltip } from './Tooltip';

export default function WardrobeSchematic(props: WardrobeSchematicProps) {
  const schematic = useWardrobeSchematic(props);

  return (
    <div className="wardrobe-schematic">
      <div className="wardrobe-schematic__header">
        <span>📐 Podgląd graficzny szafy</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-outline btn--small" onClick={schematic.clearAll}>🗑 Wyczyść</button>
        </div>
      </div>

      <Palette
        draggingType={schematic.draggingType}
        totalByType={schematic.totalByType}
        onDragStart={schematic.handlePaletteDragStart}
        onDragEnd={schematic.handlePaletteDragEnd}
      />

      <Segments
        nicheWidthMm={props.nicheWidthMm}
        nicheHeightMm={props.nicheHeightMm}
        leftNicheHeightMm={props.leftNicheHeightMm}
        rightNicheHeightMm={props.rightNicheHeightMm}
        ox={schematic.ox}
        oy={schematic.oy}
        scaledW={schematic.scaledW}
        scaledH={schematic.scaledH}
        mainH={schematic.mainH}
        mainY={schematic.mainY}
        topBlendH={schematic.topBlendH}
        bottomBlendH={schematic.bottomBlendH}
        bottomBlendY={schematic.bottomBlendY}
        maskLeftW={schematic.maskLeftW}
        maskRightW={schematic.maskRightW}
        leftNicheW={schematic.leftNicheW}
        rightNicheW={schematic.rightNicheW}
        px={schematic.px}
        py={schematic.py}
        sw={schematic.sw}
        sh={schematic.sh}
        segs={schematic.segs}
        boxSegs={schematic.boxSegs}
        dragOverBox={schematic.dragOverBox}
        dragHoverPos={schematic.dragHoverPos}
        draggingType={schematic.draggingType}
        placedItems={schematic.placedItems}
        onRemoveItem={schematic.removeItem}
        onTooltipChange={schematic.setTooltip}
        onDragOver={schematic.handleDragOver}
        onDragLeave={schematic.handleDragLeave}
        onDrop={schematic.handleDrop}
      />

      {schematic.tooltip && <Tooltip tooltip={schematic.tooltip} />}
    </div>
  );
}
