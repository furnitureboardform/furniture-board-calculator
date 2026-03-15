import type { BoxForm } from '../lib/types';

export interface Step3BoxWidthsProps {
  boxes: BoxForm[];
  splitEqually: boolean;
  onSplitEquallyChange: (checked: boolean) => void;
  onBoxChange: (index: number, field: keyof BoxForm, value: number | string | boolean) => void;
  onGoToStep: (step: number) => void;
  validationMessage: string | null;
  validationValid: boolean;
  shelvesPreview: string | null;
  active: boolean;
}

export default function Step3BoxWidths({
  boxes,
  splitEqually,
  onSplitEquallyChange,
  onBoxChange,
  onGoToStep,
  validationMessage,
  validationValid,
  shelvesPreview,
  active,
}: Step3BoxWidthsProps) {
  return (
    <div className={`step ${active ? 'active' : ''}`}>
      <div className="step-label">Krok 3 z 4</div>
      <div className="card">
        <h2>Szerokości boxów</h2>
        <div className="checkbox-row">
          <input
            type="checkbox"
            id="split-equally"
            checked={splitEqually}
            onChange={(e) => onSplitEquallyChange(e.target.checked)}
          />
          <label htmlFor="split-equally">Podziel po rowno</label>
        </div>
        <div id="boxes-container">
          {boxes.map((box, i) => (
            <div key={i} className="box-section">
              <div className="box-section-title">Box {i + 1}</div>
              <div className="field">
                <label>Szerokość (mm) wnętrza boxa</label>
                <input
                  type="number"
                  value={box.width}
                  onChange={(e) => onBoxChange(i, 'width', parseInt(e.target.value, 10) || 0)}
                  min={1}
                  readOnly={splitEqually}
                />
              </div>
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  id={`double-door-${i}`}
                  checked={box.doubleDoor}
                  onChange={(e) => onBoxChange(i, 'doubleDoor', e.target.checked)}
                />
                <label htmlFor={`double-door-${i}`}>Podwójne drzwi</label>
              </div>
              <div className="field">
                <label>Liczba półek</label>
                <input
                  type="number"
                  value={box.shelves}
                  onChange={(e) => onBoxChange(i, 'shelves', parseInt(e.target.value, 10) || 0)}
                  min={0}
                />
              </div>
              <div className="field">
                <label>Liczba drążków</label>
                <input
                  type="number"
                  value={box.rods}
                  onChange={(e) => onBoxChange(i, 'rods', parseInt(e.target.value, 10) || 0)}
                  min={0}
                />
              </div>
              <div className="field">
                <label>Liczba szuflad</label>
                <input
                  type="number"
                  value={box.drawers}
                  onChange={(e) => onBoxChange(i, 'drawers', parseInt(e.target.value, 10) || 0)}
                  min={0}
                />
              </div>
            </div>
          ))}
        </div>
        {validationMessage != null && (
          <div className={`validation-msg ${validationValid ? 'ok' : 'error'}`}>
            {validationMessage}
          </div>
        )}
        {shelvesPreview && (
          <div className="preview-box" dangerouslySetInnerHTML={{ __html: shelvesPreview }} />
        )}
      </div>
      <button type="button" className="btn btn-outline" onClick={() => onGoToStep(2)}>
        ← Wróć
      </button>
      <button type="button" className="btn" onClick={() => onGoToStep(4)} disabled={!validationValid}>
        Dalej →
      </button>
    </div>
  );
}
