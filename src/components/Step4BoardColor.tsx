import { useEffect, useState } from 'react';
import type { BoardFinish, DoorHandleSelection, FinishType } from '../lib/types';
import type { FinishOption } from '../lib/finishOptions';
import type { HandleOption } from '../lib/handleOptions';

export interface Step4BoardColorProps {
  finish: BoardFinish;
  onFinishChange: (finish: BoardFinish) => void;
  handleSelection: DoorHandleSelection;
  onHandleChange: (handleSelection: DoorHandleSelection) => void;
  onGoToStep: (step: number) => void;
  onSubmit: () => void;
  active: boolean;
  finishes: FinishOption[];
  handles: HandleOption[];
  optionsLoading: boolean;
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

export function Step4BoardColor({ finish, onFinishChange, handleSelection, onHandleChange, onGoToStep, onSubmit, active, finishes, handles, optionsLoading }: Step4BoardColorProps) {
  const [zoomedOption, setZoomedOption] = useState<{ label: string; imageUrl: string } | null>(null);
  const typeOptions = finishes.filter((f) => f.type === finish.type);

  useEffect(() => {
    if (optionsLoading) return;
    const currentExists = typeOptions.some((f) => f.id === finish.optionId);
    if (!currentExists && typeOptions.length > 0) {
      onFinishChange({ ...finish, optionId: typeOptions[0]!.id });
    }
  }, [finish.type, optionsLoading]);

  function handleTypeChange(type: FinishType) {
    const first = finishes.find((f) => f.type === type);
    onFinishChange({ type, optionId: first?.id ?? '' });
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
            <option value="laminat">Laminat</option>
            <option value="akryl">Akryl</option>
            <option value="lakier">Lakier</option>
          </select>
        </div>
        {optionsLoading ? (
          <p style={{ color: '#888', fontSize: '0.95em' }}>Ładowanie okładzin…</p>
        ) : typeOptions.length === 0 ? (
          <p style={{ color: '#888', fontSize: '0.95em' }}>Brak okładzin tego typu. Dodaj je w panelu Dashboard.</p>
        ) : (
        <div className="finish-cards">
          {typeOptions.map((opt) => (
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
        )}
      </div>
      <div className="card">
        <h2>Uchwyt</h2>
        {optionsLoading ? (
          <p style={{ color: '#888', fontSize: '0.95em' }}>Ładowanie uchwytów…</p>
        ) : handles.length === 0 ? (
          <p style={{ color: '#888', fontSize: '0.95em' }}>Brak uchwytów. Dodaj je w panelu Dashboard.</p>
        ) : (
        <div className="finish-cards">
          {handles.map((handle) => (
            <OptionCard
              key={handle.id}
              option={handle}
              selected={handleSelection.optionId === handle.id}
              onSelect={() => onHandleChange({ optionId: handle.id })}
              onZoom={handle.imageUrl ? () => setZoomedOption({ label: handle.label, imageUrl: handle.imageUrl! }) : undefined}
              priceLabel={`${handle.pricePln} zł/szt.`}
            />
          ))}
        </div>
        )}
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
