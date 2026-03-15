import type { NicheFieldName } from '../lib/types';
import type { ReactNode } from 'react';

export interface Step1NicheProps {
  nicheWidthMm: number;
  nicheHeightMm: number;
  cabinetDepthMm: number;
  hasNiches: boolean;
  /** Maskownice zewnętrzne – domyślnie zaznaczone; gdy true, od dostępnej szerokości odejmowane jest 2×18 mm */
  outerMaskingEnabled: boolean;
  onOuterMaskingChange: (checked: boolean) => void;
  leftBlendMm: number;
  rightBlendMm: number;
  topBlendMm: number;
  bottomBlendMm: number;
  leftNicheHeightMm: number;
  rightNicheHeightMm: number;
  topNicheWidthMm: number;
  bottomNicheWidthMm: number;
  onNicheChange: (field: NicheFieldName, value: string) => void;
  onHasNichesChange: (checked: boolean) => void;
  onGoToStep: (step: number) => void;
  wardrobePreview: ReactNode;
  active: boolean;
}

export default function Step1Niche({
  nicheWidthMm,
  nicheHeightMm,
  cabinetDepthMm,
  hasNiches,
  outerMaskingEnabled,
  onOuterMaskingChange,
  leftBlendMm,
  rightBlendMm,
  topBlendMm,
  bottomBlendMm,
  leftNicheHeightMm,
  rightNicheHeightMm,
  topNicheWidthMm,
  bottomNicheWidthMm,
  onNicheChange,
  onHasNichesChange,
  onGoToStep,
  wardrobePreview,
  active,
}: Step1NicheProps) {
  return (
    <div className={`step ${active ? 'active' : ''}`}>
      <div className="step-label">Krok 1 z 3</div>
      <div className="card">
        <h2>Wymiary wnęki</h2>
        <div className="field">
          <label>Szerokość wnęki (mm)</label>
          <input
            type="number"
            value={nicheWidthMm}
            onChange={(e) => onNicheChange('nicheWidthMm', e.target.value)}
            min={1}
          />
        </div>
        <div className="field">
          <label>Wysokość wnęki (mm)</label>
          <input
            type="number"
            value={nicheHeightMm}
            onChange={(e) => onNicheChange('nicheHeightMm', e.target.value)}
            min={1}
          />
        </div>
        <div className="field">
          <label>Głębokość szafy (mm)</label>
          <input
            type="number"
            value={cabinetDepthMm}
            onChange={(e) => onNicheChange('cabinetDepthMm', e.target.value)}
            min={1}
          />
        </div>
        <div className="checkbox-row">
          <input
            type="checkbox"
            id="outer-masking"
            checked={outerMaskingEnabled}
            onChange={(e) => onOuterMaskingChange(e.target.checked)}
          />
          <label htmlFor="outer-masking">Maskownice zewnętrzne</label>
        </div>
        <div className="checkbox-row">
          <input
            type="checkbox"
            id="has-niches"
            checked={hasNiches}
            onChange={(e) => onHasNichesChange(e.target.checked)}
          />
          <label htmlFor="has-niches">Blendy</label>
        </div>
        {hasNiches && (
          <>
            <div className="niche-group">
              <div className="niche-group-title">Lewa blenda</div>
              <div className="field">
                <label>Szerokość (mm)</label>
                <input
                  type="number"
                  value={leftBlendMm}
                  onChange={(e) => onNicheChange('leftBlendMm', e.target.value)}
                  min={0}
                />
              </div>
              <div className="field">
                <label>Wysokość (mm)</label>
                <input
                  type="number"
                  value={leftNicheHeightMm}
                  onChange={(e) => onNicheChange('leftNicheHeightMm', e.target.value)}
                  min={0}
                />
              </div>
            </div>
            <div className="niche-group">
              <div className="niche-group-title">Prawa blenda</div>
              <div className="field">
                <label>Szerokość (mm)</label>
                <input
                  type="number"
                  value={rightBlendMm}
                  onChange={(e) => onNicheChange('rightBlendMm', e.target.value)}
                  min={0}
                />
              </div>
              <div className="field">
                <label>Wysokość (mm)</label>
                <input
                  type="number"
                  value={rightNicheHeightMm}
                  onChange={(e) => onNicheChange('rightNicheHeightMm', e.target.value)}
                  min={0}
                />
              </div>
            </div>
            <div className="niche-group">
              <div className="niche-group-title">Górna blenda</div>
              <div className="field">
                <label>Szerokość (mm)</label>
                <input
                  type="number"
                  value={topNicheWidthMm}
                  onChange={(e) => onNicheChange('topNicheWidthMm', e.target.value)}
                  min={0}
                />
              </div>
              <div className="field">
                <label>Wysokość (mm)</label>
                <input
                  type="number"
                  value={topBlendMm}
                  onChange={(e) => onNicheChange('topBlendMm', e.target.value)}
                  min={0}
                />
              </div>
            </div>
            <div className="niche-group">
              <div className="niche-group-title">Dolna blenda</div>
              <div className="field">
                <label>Szerokość (mm)</label>
                <input
                  type="number"
                  value={bottomNicheWidthMm}
                  onChange={(e) => onNicheChange('bottomNicheWidthMm', e.target.value)}
                  min={0}
                />
              </div>
              <div className="field">
                <label>Wysokość (mm)</label>
                <input
                  type="number"
                  value={bottomBlendMm}
                  onChange={(e) => onNicheChange('bottomBlendMm', e.target.value)}
                  min={0}
                />
              </div>
            </div>
          </>
        )}
        {wardrobePreview && (
          <div className="preview-box">{wardrobePreview}</div>
        )}
      </div>
      <button type="button" className="btn" onClick={() => onGoToStep(2)}>
        Dalej →
      </button>
    </div>
  );
}
