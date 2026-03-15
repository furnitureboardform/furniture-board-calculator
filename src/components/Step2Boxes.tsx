export interface Step2BoxesProps {
  numberOfBoxes: number;
  onNumberOfBoxesChange: (n: number) => void;
  onGoToStep: (step: number) => void;
  active: boolean;
}

export default function Step2Boxes({
  numberOfBoxes,
  onNumberOfBoxesChange,
  onGoToStep,
  active,
}: Step2BoxesProps) {
  return (
    <div className={`step ${active ? 'active' : ''}`}>
      <div className="step-label">Krok 2 z 3</div>
      <div className="card">
        <h2>Liczba boxów</h2>
        <div className="field">
          <label>Ile boxów ma być w szafie?</label>
          <input
            type="number"
            value={numberOfBoxes}
            onChange={(e) => onNumberOfBoxesChange(parseInt(e.target.value, 10) || 1)}
            min={1}
            max={20}
          />
        </div>
      </div>
      <button type="button" className="btn btn-outline" onClick={() => onGoToStep(1)}>
        ← Wróć
      </button>
      <button type="button" className="btn" onClick={() => onGoToStep(3)}>
        Dalej →
      </button>
    </div>
  );
}
