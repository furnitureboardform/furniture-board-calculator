import type { NicheFieldName } from '../lib/types';
import type { ReactNode } from 'react';

export interface Step1NicheProps {
  nicheWidthMm: number;
  nicheHeightMm: number;
  cabinetDepthMm: number;
  hasSideNiches: boolean;
  onHasSideNichesChange: (checked: boolean) => void;
  hasTopBottomNiches: boolean;
  onHasTopBottomNichesChange: (checked: boolean) => void;
  outerMaskingLeft: boolean;
  onOuterMaskingLeftChange: (checked: boolean) => void;
  outerMaskingLeftFullCover: boolean;
  onOuterMaskingLeftFullCoverChange: (checked: boolean) => void;
  outerMaskingRight: boolean;
  onOuterMaskingRightChange: (checked: boolean) => void;
  outerMaskingRightFullCover: boolean;
  onOuterMaskingRightFullCoverChange: (checked: boolean) => void;
  leftBlendMm: number;
  rightBlendMm: number;
  topBlendMm: number;
  bottomBlendMm: number;
  leftNicheHeightMm: number;
  rightNicheHeightMm: number;
  topNicheWidthMm: number;
  bottomNicheWidthMm: number;
  onNicheChange: (field: NicheFieldName, value: string) => void;
  onGoToStep: (step: number) => void;
  wardrobePreview: ReactNode;
  active: boolean;
}

export default function Step1Niche({
  nicheWidthMm,
  nicheHeightMm,
  cabinetDepthMm,
  hasSideNiches,
  onHasSideNichesChange,
  hasTopBottomNiches,
  onHasTopBottomNichesChange,
  outerMaskingLeft,
  onOuterMaskingLeftChange,
  outerMaskingLeftFullCover,
  onOuterMaskingLeftFullCoverChange,
  outerMaskingRight,
  onOuterMaskingRightChange,
  outerMaskingRightFullCover,
  onOuterMaskingRightFullCoverChange,
  leftBlendMm,
  rightBlendMm,
  topBlendMm,
  bottomBlendMm,
  leftNicheHeightMm,
  rightNicheHeightMm,
  topNicheWidthMm,
  bottomNicheWidthMm,
  onNicheChange,
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
          <label>Głębokość wnęki (mm)</label>
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
            id="outer-masking-left"
            checked={outerMaskingLeft}
            onChange={(e) => onOuterMaskingLeftChange(e.target.checked)}
          />
          <label htmlFor="outer-masking-left">Maskownica lewa</label>
        </div>
        {outerMaskingLeft && (
          <div className="checkbox-row checkbox-row--sub">
            <input
              type="checkbox"
              id="outer-masking-left-full-cover"
              checked={outerMaskingLeftFullCover}
              onChange={(e) => onOuterMaskingLeftFullCoverChange(e.target.checked)}
            />
            <label htmlFor="outer-masking-left-full-cover">Czy całe obicie</label>
          </div>
        )}
        <div className="checkbox-row">
          <input
            type="checkbox"
            id="outer-masking-right"
            checked={outerMaskingRight}
            onChange={(e) => onOuterMaskingRightChange(e.target.checked)}
          />
          <label htmlFor="outer-masking-right">Maskownica prawa</label>
        </div>
        {outerMaskingRight && (
          <div className="checkbox-row checkbox-row--sub">
            <input
              type="checkbox"
              id="outer-masking-right-full-cover"
              checked={outerMaskingRightFullCover}
              onChange={(e) => onOuterMaskingRightFullCoverChange(e.target.checked)}
            />
            <label htmlFor="outer-masking-right-full-cover">Czy całe obicie</label>
          </div>
        )}
        <div className="checkbox-row">
          <input
            type="checkbox"
            id="has-side-niches"
            checked={hasSideNiches}
            onChange={(e) => onHasSideNichesChange(e.target.checked)}
          />
          <label htmlFor="has-side-niches">Wnęki boczne</label>
        </div>
        {hasSideNiches && (
          <>
            <div className={`niche-group${outerMaskingLeft ? ' niche-group--disabled' : ''}`}>
              <div className="niche-group-title">
                Wnęka lewa
                {outerMaskingLeft && (
                  <span className="niche-group-disabled-hint"> – zakryta maskownicą</span>
                )}
              </div>
              <div className="field">
                <label>Szerokość (mm)</label>
                <input
                  type="number"
                  value={leftBlendMm}
                  onChange={(e) => onNicheChange('leftBlendMm', e.target.value)}
                  min={0}
                  readOnly={outerMaskingLeft}
                />
              </div>
              <div className="field">
                <label>Wysokość (mm)</label>
                <input
                  type="number"
                  value={leftNicheHeightMm}
                  onChange={(e) => onNicheChange('leftNicheHeightMm', e.target.value)}
                  min={0}
                  readOnly
                  className="input--auto"
                />
              </div>
            </div>
            <div className={`niche-group${outerMaskingRight ? ' niche-group--disabled' : ''}`}>
              <div className="niche-group-title">
                Wnęka prawa
                {outerMaskingRight && (
                  <span className="niche-group-disabled-hint"> – zakryta maskownicą</span>
                )}
              </div>
              <div className="field">
                <label>Szerokość (mm)</label>
                <input
                  type="number"
                  value={rightBlendMm}
                  onChange={(e) => onNicheChange('rightBlendMm', e.target.value)}
                  min={0}
                  readOnly={outerMaskingRight}
                />
              </div>
              <div className="field">
                <label>Wysokość (mm)</label>
                <input
                  type="number"
                  value={rightNicheHeightMm}
                  onChange={(e) => onNicheChange('rightNicheHeightMm', e.target.value)}
                  min={0}
                  readOnly
                  className="input--auto"
                />
              </div>
            </div>
          </>
        )}
        <div className="checkbox-row">
          <input
            type="checkbox"
            id="has-top-bottom-niches"
            checked={hasTopBottomNiches}
            onChange={(e) => onHasTopBottomNichesChange(e.target.checked)}
          />
          <label htmlFor="has-top-bottom-niches">Wnęka górna</label>
        </div>
        {hasTopBottomNiches && (
          <div className="niche-group">
            <div className="niche-group-title">Wnęka górna</div>
            <div className="field">
              <label>Szerokość (mm)</label>
              <input
                type="number"
                value={topNicheWidthMm}
                onChange={(e) => onNicheChange('topNicheWidthMm', e.target.value)}
                min={0}
                readOnly
                className="input--auto"
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
        )}
        <div className="niche-group">
          <div className="niche-group-title">Wnęka dolna</div>
          <div className="field">
            <label>Szerokość (mm)</label>
            <input
              type="number"
              value={bottomNicheWidthMm}
              onChange={(e) => onNicheChange('bottomNicheWidthMm', e.target.value)}
              min={0}
              readOnly
              className="input--auto"
            />
          </div>
          <div className="field">
            <label>Wysokość (mm)</label>
            <input
              type="number"
              value={bottomBlendMm}
              onChange={(e) => onNicheChange('bottomBlendMm', e.target.value)}
              min={0}
              readOnly
              className="input--auto"
            />
          </div>
        </div>
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
