import { useState } from 'react';
import type { BoardFinish, DoorHandleSelection, FinishType } from '../lib/types';
import { COVER_OPTIONS, VENEER_OPTIONS, ACRYLIC_OPTIONS } from '../lib/finishOptions';
import { HANDLE_OPTIONS } from '../lib/handleOptions';

export interface Step4BoardColorProps {
  finish: BoardFinish;
  onFinishChange: (finish: BoardFinish) => void;
  handleSelection: DoorHandleSelection;
  onHandleChange: (handleSelection: DoorHandleSelection) => void;
  onGoToStep: (step: number) => void;
  onSubmit: () => void;
  active: boolean;
}

function Lightbox({ option, onClose }: { option: { label: string; imageUrl: string }; onClose: () => void }) {
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

function OptionCard({ option, selected, onSelect, onZoom, priceLabel }: { option: { label: string; brand?: string; imageUrl?: string; swatchColor?: string }; selected: boolean; onSelect: () => void; onZoom?: () => void; priceLabel: string }) {
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
        {option.brand && <span className="finish-card__brand">{option.brand}</span>}
        <span className="finish-card__label">{option.label}</span>
        <span className="finish-card__price">{priceLabel}</span>
      </div>
    </button>
  );
}

export function Step4BoardColor({ finish, onFinishChange, handleSelection, onHandleChange, onGoToStep, onSubmit, active }: Step4BoardColorProps) {
  const [zoomedOption, setZoomedOption] = useState<{ label: string; imageUrl: string } | null>(null);
  const options = finish.type === 'laminat' ? COVER_OPTIONS : finish.type === 'akryl' ? ACRYLIC_OPTIONS : VENEER_OPTIONS;

  function handleTypeChange(type: FinishType) {
    const defaultOption = (type === 'laminat' ? COVER_OPTIONS : type === 'akryl' ? ACRYLIC_OPTIONS : VENEER_OPTIONS)[0]!;
    onFinishChange({ type, optionId: defaultOption.id });
  }

  return (
    <div className={`step ${active ? 'active' : ''}`}>
      <div className="step-label">Krok 4 z 4</div>
      <div className="card">
        <h2>Okleina płyty</h2>
        <div className="field">
          <label htmlFor="finish-type">Typ wykończenia</label>
          <select
            id="finish-type"
            value={finish.type}
            onChange={(e) => handleTypeChange(e.target.value as FinishType)}
          >
            <option value="laminat">Okleina laminat obicie</option>
            <option value="okleina">Okleina laminat drewniana</option>
            <option value="akryl">Okleina akryl obicie</option>
          </select>
        </div>
        <div className="finish-cards">
          {options.map((opt) => (
            <OptionCard
              key={opt.id}
              option={opt}
              selected={finish.optionId === opt.id}
              onSelect={() => onFinishChange({ ...finish, optionId: opt.id })}
              onZoom={opt.imageUrl ? () => setZoomedOption({ label: opt.label, imageUrl: opt.imageUrl! }) : undefined}
              priceLabel={`${opt.pricePerSqmPln.toFixed(2)} zł/m²`}
            />
          ))}
        </div>
      </div>
      <div className="card">
        <h2>Uchwyt</h2>
        <div className="finish-cards">
          {HANDLE_OPTIONS.map((handle) => (
            <OptionCard
              key={handle.id}
              option={handle}
              selected={handleSelection.optionId === handle.id}
              onSelect={() => onHandleChange({ optionId: handle.id })}
              onZoom={() => setZoomedOption({ label: handle.label, imageUrl: handle.imageUrl })}
              priceLabel={`${handle.pricePln} zł/szt.`}
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
