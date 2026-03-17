import type { ItemType } from './types';
import { PALETTE } from './constants';

interface PaletteProps {
  draggingType: ItemType | null;
  totalByType: (type: ItemType) => number;
  onDragStart: (type: ItemType) => void;
  onDragEnd: () => void;
}

export function Palette({ draggingType, totalByType, onDragStart, onDragEnd }: PaletteProps) {
  return (
    <div className="schematic-palette">
      {PALETTE.map((p) => (
        <div
          key={p.type}
          className={`palette-item${draggingType === p.type ? ' palette-item--dragging' : ''}`}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('itemType', p.type);
            e.dataTransfer.effectAllowed = 'copy';
            onDragStart(p.type);
          }}
          onDragEnd={onDragEnd}
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
  );
}
