import { useState } from 'react';
import type { ElementsData } from '../lib/report';

type ReportTab = 'parameters' | 'elements' | 'summary';

export interface ReportViewProps {
  parametersText: string;
  reportText: string;
  summaryText: string;
  elementsData: ElementsData | null;
  onBackToConfig: () => void;
}

export default function ReportView({ parametersText, reportText: _reportText, summaryText, elementsData, onBackToConfig }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<ReportTab>('parameters');

  return (
    <>
      <div className="report">
        <div className="report-tabs">
          <button
            type="button"
            className={`report-tab${activeTab === 'parameters' ? ' report-tab--active' : ''}`}
            onClick={() => setActiveTab('parameters')}
          >
            Parametry wejściowe
          </button>
          <button
            type="button"
            className={`report-tab${activeTab === 'elements' ? ' report-tab--active' : ''}`}
            onClick={() => setActiveTab('elements')}
          >
            Elementy szafy
          </button>
          <button
            type="button"
            className={`report-tab${activeTab === 'summary' ? ' report-tab--active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            Podsumowanie listy zakupów
          </button>
        </div>

        <div className="report-tab-content">
          {activeTab === 'parameters' && <pre>{parametersText}</pre>}

          {activeTab === 'elements' && elementsData && (
            <div className="elements-grid">
              {elementsData.boxes.map((box) => (
                <div key={box.boxNumber} className="element-card">
                  <div className="element-card__header">Box {box.boxNumber}</div>
                  <div className="element-card__body">
                    {box.door && (
                      <div className="element-card__row">
                        <span className="element-card__label">Drzwi {box.door.side}</span>
                        <span className="element-card__value">
                          {box.door.heightMm} × {box.door.widthMm} mm
                        </span>
                        <span className="element-card__meta">
                          Wszystkie obrzeża (4 strony) · zawiasy: {box.door.hinges} szt.
                        </span>
                      </div>
                    )}
                    {box.shelves && (
                      <div className="element-card__row">
                        <span className="element-card__label">Półki ({box.shelves.quantity} szt.)</span>
                        <span className="element-card__value">
                          {box.shelves.widthMm} × {box.shelves.depthMm} mm
                        </span>
                        <span className="element-card__meta">
                          Obrzeże na szerokości {box.shelves.widthMm} mm (1 bok)
                        </span>
                      </div>
                    )}
                    {box.panels && (
                      <>
                        <div className="element-card__divider" />
                        <div className="element-card__row">
                          <span className="element-card__label">Płyta boczna boxa (2 szt.)</span>
                          <span className="element-card__value">
                            {box.panels.sideHeightMm} × {box.panels.depthMm} mm
                          </span>
                          <span className="element-card__meta">
                            Obrzeże na wysokości {box.panels.sideHeightMm} mm (1 bok)
                          </span>
                        </div>
                        <div className="element-card__row">
                          <span className="element-card__label">Płyta górna boxa (1 szt.)</span>
                          <span className="element-card__value">
                            {box.panels.topBottomWidthMm} × {box.panels.depthMm} mm
                          </span>
                          <span className="element-card__meta">
                            Obrzeże na szerokości {box.panels.topBottomWidthMm} mm (1 bok)
                          </span>
                        </div>
                        <div className="element-card__row">
                          <span className="element-card__label">Płyta dolna boxa (1 szt.)</span>
                          <span className="element-card__value">
                            {box.panels.topBottomWidthMm} × {box.panels.depthMm} mm
                          </span>
                          <span className="element-card__meta">
                            Obrzeże na szerokości {box.panels.topBottomWidthMm} mm (1 bok)
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}

              <div className="element-card">
                <div className="element-card__header">Blendy / Wnęki</div>
                <div className="element-card__body">
                  {[
                    { label: 'Lewa', w: elementsData.niches.left.widthMm, h: elementsData.niches.left.heightMm },
                    { label: 'Prawa', w: elementsData.niches.right.widthMm, h: elementsData.niches.right.heightMm },
                    { label: 'Górna', w: elementsData.niches.top.widthMm, h: elementsData.niches.top.heightMm },
                    { label: 'Dolna', w: elementsData.niches.bottom.widthMm, h: elementsData.niches.bottom.heightMm },
                  ].map(({ label, w, h }) => (
                    <div key={label} className="element-card__row">
                      <span className="element-card__label">{label}</span>
                      <span className="element-card__value">{w} × {h} mm</span>
                      <span className="element-card__meta">Bez obrzeży</span>
                    </div>
                  ))}
                </div>
              </div>

              {elementsData.maskings && (
                <div className="element-card">
                  <div className="element-card__header">Maskownice</div>
                  <div className="element-card__body">
                    {elementsData.maskings.left && (
                      <div className="element-card__row">
                        <span className="element-card__label">Maskownica lewa</span>
                        <span className="element-card__value">
                          {elementsData.maskings.left.heightMm} × {elementsData.maskings.left.widthMm} mm
                        </span>
                        <span className="element-card__meta">
                          Obrzeże na wysokości {elementsData.maskings.left.heightMm} mm (1 bok)
                        </span>
                      </div>
                    )}
                    {elementsData.maskings.right && (
                      <div className="element-card__row">
                        <span className="element-card__label">Maskownica prawa</span>
                        <span className="element-card__value">
                          {elementsData.maskings.right.heightMm} × {elementsData.maskings.right.widthMm} mm
                        </span>
                        <span className="element-card__meta">
                          Obrzeże na wysokości {elementsData.maskings.right.heightMm} mm (1 bok)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'summary' && <pre>{summaryText}</pre>}
        </div>
      </div>
      <button type="button" className="btn btn-outline" onClick={onBackToConfig}>
        ← Wróć do konfiguracji
      </button>
    </>
  );
}
