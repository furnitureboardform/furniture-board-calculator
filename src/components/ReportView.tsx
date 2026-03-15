import { useState, useMemo } from 'react';
import type { ElementsData, HardwareSummary } from '../lib/report';

type ReportTab = 'parameters' | 'elements' | 'summary';

export interface ReportViewProps {
  parametersText: string;
  reportText: string;
  summaryText: string;
  elementsData: ElementsData | null;
  hardwareSummary: HardwareSummary | null;
  onBackToConfig: () => void;
}

interface BoardEntry {
  dim1: number;
  dim2: number;
  edgeBanding: string;
  qty: number;
}

function groupBoards(boards: BoardEntry[]): BoardEntry[] {
  const map = new Map<string, BoardEntry>();
  for (const b of boards) {
    const key = `${b.dim1}x${b.dim2}|${b.edgeBanding}`;
    const existing = map.get(key);
    if (existing) {
      existing.qty += b.qty;
    } else {
      map.set(key, { ...b });
    }
  }
  return Array.from(map.values());
}

function getKolorBoards(elementsData: ElementsData): BoardEntry[] {
  const boards: BoardEntry[] = [];

  for (const box of elementsData.boxes) {
    if (box.door) {
      const qty = box.door.doubleDoor ? 2 : 1;
      boards.push({ dim1: box.door.heightMm, dim2: box.door.widthMm, edgeBanding: 'Wszystkie obrzeża (4 strony)', qty });
    }
  }

  const { left, right, top, bottom } = elementsData.niches;
  if (left.widthMm > 0 && left.heightMm > 0) {
    boards.push({ dim1: left.widthMm, dim2: left.heightMm, edgeBanding: 'Bez obrzeży', qty: 1 });
  }
  if (right.widthMm > 0 && right.heightMm > 0) {
    boards.push({ dim1: right.widthMm, dim2: right.heightMm, edgeBanding: 'Bez obrzeży', qty: 1 });
  }
  if (top.widthMm > 0 && top.heightMm > 0) {
    boards.push({ dim1: top.widthMm, dim2: top.heightMm, edgeBanding: 'Bez obrzeży', qty: 1 });
  }
  if (bottom.widthMm > 0 && bottom.heightMm > 0) {
    boards.push({ dim1: bottom.widthMm, dim2: bottom.heightMm, edgeBanding: 'Bez obrzeży', qty: 1 });
  }

  if (elementsData.maskings) {
    if (elementsData.maskings.left) {
      const { heightMm, widthMm } = elementsData.maskings.left;
      boards.push({ dim1: heightMm, dim2: widthMm, edgeBanding: `Obrzeże na wysokości ${heightMm} mm (1 bok)`, qty: 1 });
    }
    if (elementsData.maskings.right) {
      const { heightMm, widthMm } = elementsData.maskings.right;
      boards.push({ dim1: heightMm, dim2: widthMm, edgeBanding: `Obrzeże na wysokości ${heightMm} mm (1 bok)`, qty: 1 });
    }
  }

  return boards;
}

function getSzaryBoards(elementsData: ElementsData): BoardEntry[] {
  const boards: BoardEntry[] = [];

  for (const box of elementsData.boxes) {
    if (box.shelves && box.shelves.quantity > 0) {
      boards.push({
        dim1: box.shelves.widthMm,
        dim2: box.shelves.depthMm,
        edgeBanding: `Obrzeże na szerokości ${box.shelves.widthMm} mm (1 bok)`,
        qty: box.shelves.quantity,
      });
    }

    if (box.panels) {
      boards.push({
        dim1: box.panels.sideHeightMm,
        dim2: box.panels.depthMm,
        edgeBanding: `Obrzeże na wysokości ${box.panels.sideHeightMm} mm (1 bok)`,
        qty: 2,
      });
      // top and bottom have the same dimensions — push 2 together
      boards.push({
        dim1: box.panels.topBottomWidthMm,
        dim2: box.panels.depthMm,
        edgeBanding: `Obrzeże na szerokości ${box.panels.topBottomWidthMm} mm (1 bok)`,
        qty: 2,
      });
    }
  }

  return boards;
}

function BoardsSection({ title, colorClass, boards }: { title: string; colorClass: string; boards: BoardEntry[] }) {
  if (boards.length === 0) return null;
  return (
    <div className="boards-summary-section">
      <div className={`boards-summary-section__header ${colorClass}`}>{title}</div>
      <table className="boards-summary-table">
        <thead>
          <tr>
            <th>Wymiary (mm)</th>
            <th>Ilość</th>
            <th>Obrzeże</th>
          </tr>
        </thead>
        <tbody>
          {boards.map((b, i) => (
            <tr key={i}>
              <td>{b.dim1} × {b.dim2}</td>
              <td>{b.qty} szt.</td>
              <td>{b.edgeBanding}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ReportView({ parametersText, reportText: _reportText, summaryText: _summaryText, elementsData, hardwareSummary, onBackToConfig }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<ReportTab>('parameters');

  const kolorBoards = useMemo(
    () => elementsData ? groupBoards(getKolorBoards(elementsData)) : [],
    [elementsData]
  );
  const szaryBoards = useMemo(
    () => elementsData ? groupBoards(getSzaryBoards(elementsData)) : [],
    [elementsData]
  );
  const hdfBoards = useMemo(
    () => elementsData ? groupBoards(
      elementsData.boxes
        .filter((b) => b.hdf)
        .map((b) => ({ dim1: b.hdf!.widthMm, dim2: b.hdf!.heightMm, edgeBanding: 'Bez obrzeży', qty: 1 }))
    ) : [],
    [elementsData]
  );
  const totalRods = useMemo(
    () => elementsData ? elementsData.boxes.reduce((sum, b) => sum + (b.rods ?? 0), 0) : 0,
    [elementsData]
  );
  const totalHinges = useMemo(
    () => elementsData ? elementsData.boxes.reduce((sum, b) => sum + (b.door?.hinges ?? 0), 0) : 0,
    [elementsData]
  );

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
                        <span className="element-card__label">
                          Drzwi {box.door.doubleDoor ? 'podwójne' : 'pojedyncze'}
                          {box.door.doubleDoor && <span className="element-card__badge">×2</span>}
                        </span>
                        <span className="element-card__value">
                          {box.door.heightMm} × {box.door.widthMm} mm
                        </span>
                        <span className="element-card__meta">
                          Wszystkie obrzeża (4 strony) · zawiasy: {box.door.hinges} szt. · <span className="element-card__color element-card__color--kolor">kolor</span>
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
                          Obrzeże na szerokości {box.shelves.widthMm} mm (1 bok) · <span className="element-card__color element-card__color--szary">szary</span>
                        </span>
                      </div>
                    )}
                    {box.rods && box.rods > 0 && (
                      <div className="element-card__row">
                        <span className="element-card__label">Drążki ({box.rods} szt.)</span>
                      </div>
                    )}
                    {box.hdf && (
                      <div className="element-card__row">
                        <span className="element-card__label">Płyta HDF (1 szt.)</span>
                        <span className="element-card__value">
                          {box.hdf.widthMm} × {box.hdf.heightMm} mm
                        </span>
                        <span className="element-card__meta">
                          <span className="element-card__color element-card__color--szary">szary</span>
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
                            Obrzeże na wysokości {box.panels.sideHeightMm} mm (1 bok) · <span className="element-card__color element-card__color--szary">szary</span>
                          </span>
                        </div>
                        <div className="element-card__row">
                          <span className="element-card__label">Płyta górna boxa (1 szt.)</span>
                          <span className="element-card__value">
                            {box.panels.topBottomWidthMm} × {box.panels.depthMm} mm
                          </span>
                          <span className="element-card__meta">
                            Obrzeże na szerokości {box.panels.topBottomWidthMm} mm (1 bok) · <span className="element-card__color element-card__color--szary">szary</span>
                          </span>
                        </div>
                        <div className="element-card__row">
                          <span className="element-card__label">Płyta dolna boxa (1 szt.)</span>
                          <span className="element-card__value">
                            {box.panels.topBottomWidthMm} × {box.panels.depthMm} mm
                          </span>
                          <span className="element-card__meta">
                            Obrzeże na szerokości {box.panels.topBottomWidthMm} mm (1 bok) · <span className="element-card__color element-card__color--szary">szary</span>
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
                      <span className="element-card__meta">Bez obrzeży · <span className="element-card__color element-card__color--kolor">kolor</span></span>
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
                          Obrzeże na wysokości {elementsData.maskings.left.heightMm} mm (1 bok) · <span className="element-card__color element-card__color--kolor">kolor</span>
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
                          Obrzeże na wysokości {elementsData.maskings.right.heightMm} mm (1 bok) · <span className="element-card__color element-card__color--kolor">kolor</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="summary-tab">
              <BoardsSection title="Płyty kolor" colorClass="boards-summary-section__header--kolor" boards={kolorBoards} />
              <BoardsSection title="Płyty szare" colorClass="boards-summary-section__header--szary" boards={szaryBoards} />
              {hdfBoards.length > 0 && (
                <BoardsSection title="Płyta HDF" colorClass="boards-summary-section__header--hdf" boards={hdfBoards} />
              )}
              <div className="boards-summary-section">
                <div className="boards-summary-section__header boards-summary-section__header--dodatki">Dodatki</div>
                <table className="boards-summary-table">
                  <tbody>
                    {totalRods > 0 && (
                      <tr>
                        <td>Drążki</td>
                        <td>{totalRods} szt.</td>
                        <td />
                      </tr>
                    )}
                    <tr>
                      <td>Zawiasy</td>
                      <td>{totalHinges} szt.</td>
                      <td />
                    </tr>
                    {hardwareSummary && (
                      <>
                        <tr>
                          <td>Prowadnice przesuwne</td>
                          <td>{hardwareSummary.totalGuides} szt.</td>
                          <td>1 zestaw na szuflądę</td>
                        </tr>
                        <tr>
                          <td>Sprzęgła</td>
                          <td>{hardwareSummary.totalBrackets} szt.</td>
                          <td>1 zestaw na szuflądę</td>
                        </tr>
                        <tr>
                          <td>Uchwyty</td>
                          <td>{hardwareSummary.totalHandles} szt.</td>
                          <td>1 na drzwi</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      <button type="button" className="btn btn-outline" onClick={onBackToConfig}>
        ← Wróć do konfiguracji
      </button>
    </>
  );
}
