import { useState } from 'react';
import type { BoardFinish, FinishType } from '../lib/types';
import { COLOR_OPTIONS, VENEER_OPTIONS, ACRYLIC_OPTIONS } from '../lib/finishOptions';
import type { FinishOption } from '../lib/finishOptions';

export interface Step4BoardColorProps {
  finish: BoardFinish;
  onFinishChange: (finish: BoardFinish) => void;
  onGoToStep: (step: number) => void;
  onSubmit: () => void;
  active: boolean;
}

function Lightbox({ option, onClose }: { option: FinishOption; onClose: () => void }) {
  return (
    <div className="lightbox" onClick={onClose}>
      <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
        <img src={option.imageUrl} alt={option.label} className="lightbox__image" />
        <div className="lightbox__footer">
          <span className="lightbox__label">{option.label}</span>
          <button type="button" className="lightbox__close" onClick={onClose}>✕</button>
        </div>
      </div>
    </div>
  );
}

function FinishCard({ option, selected, onSelect, onZoom }: { option: FinishOption; selected: boolean; onSelect: () => void; onZoom?: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`finish-card${selected ? ' finish-card--selected' : ''}`}
    >
      <div className="finish-card__swatch">
        {option.imageUrl
          ? (
            <>
              <img src={option.imageUrl} alt={option.label} className="finish-card__image" />
              {onZoom && (
                <button
                  type="button"
                  className="finish-card__zoom"
                  onClick={(e) => { e.stopPropagation(); onZoom(); }}
                  title="Powiększ"
                >⤢</button>
              )}
            </>
          )
          : <div className="finish-card__color" style={{ backgroundColor: option.swatchColor }} />
        }
      </div>
      <div className="finish-card__info">
        <span className="finish-card__label">{option.label}</span>
        <span className="finish-card__price">{(option.pricePerSheetPln / 2).toFixed(2)} zł/arkusz</span>
      </div>
    </button>
  );
}

export function Step4BoardColor({ finish, onFinishChange, onGoToStep, onSubmit, active }: Step4BoardColorProps) {
  const [zoomedOption, setZoomedOption] = useState<FinishOption | null>(null);
  const options = finish.type === 'laminat' ? COLOR_OPTIONS : finish.type === 'akryl' ? ACRYLIC_OPTIONS : VENEER_OPTIONS;

  function handleTypeChange(type: FinishType) {
    const defaultOption = (type === 'laminat' ? COLOR_OPTIONS : type === 'akryl' ? ACRYLIC_OPTIONS : VENEER_OPTIONS)[0]!;
    onFinishChange({ type, optionId: defaultOption.id });
  }

  return (
    <div className={`step ${active ? 'active' : ''}`}>
      <div className="step-label">Krok 4 z 4</div>
      <div className="card">
        <h2>Kolor płyty</h2>
        <div className="field">
          <label htmlFor="finish-type">Typ wykończenia</label>
          <select
            id="finish-type"
            value={finish.type}
            onChange={(e) => handleTypeChange(e.target.value as FinishType)}
          >
            <option value="laminat">Okleina laminat kolor</option>
            <option value="okleina">Okleina laminat drewniana</option>
            <option value="akryl">Okleina akryl kolor</option>
          </select>
        </div>
        <div className="finish-cards">
          {options.map((opt) => (
            <FinishCard
              key={opt.id}
              option={opt}
              selected={finish.optionId === opt.id}
              onSelect={() => onFinishChange({ ...finish, optionId: opt.id })}
              onZoom={opt.imageUrl ? () => setZoomedOption(opt) : undefined}
            />
          ))}
        </div>
      </div>
      {zoomedOption?.imageUrl && (
        <Lightbox option={zoomedOption} onClose={() => setZoomedOption(null)} />
      )}
      <button type="button" className="btn btn-outline" onClick={() => onGoToStep(3)}>
        ← Wróć
      </button>
      <button type="button" className="btn" onClick={onSubmit}>
        Generuj
      </button>
    </div>
  );
}
