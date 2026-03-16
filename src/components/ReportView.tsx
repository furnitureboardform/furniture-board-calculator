import { useState, useMemo } from 'react';
import type { ElementsData, HardwareSummary, ParametersData } from '../lib/report';
import type { BoardFinish, DoorHandleSelection } from '../lib/types';
import { ALL_FINISH_OPTIONS } from '../lib/finishOptions';
import { ALL_HANDLE_OPTIONS } from '../lib/handleOptions';
import { calculatePricingSummary } from '../lib/pricing';

type ReportTab = 'parameters' | 'elements' | 'summary' | 'costs';

const COST_PER_HINGE_PLN = 13;
const COST_PER_GUIDE_SET_PLN = 104;
const COST_PER_BRACKET_SET_PLN = 8;
const DEFAULT_HANDLE_PRICE_PLN = 25;
const COST_PER_LEG_PLN = 6;
const COST_PER_LEG_CLIP_PLN = 1;
const COST_PER_ROD_PLN = 15;

const BOARD_PIECE_WIDTH_MM = 2800;
const BOARD_PIECE_HEIGHT_MM = 1045;
const BOARD_PIECE_AREA_MM2 = BOARD_PIECE_WIDTH_MM * BOARD_PIECE_HEIGHT_MM;
const COST_PER_SZARY_PIECE_PLN = 120;
const COST_PER_KOLOR_PIECE_PLN = 205;
const COST_PER_METER_CUTTING_PLN = 5;
const COST_PER_METER_BANDING_PLN = 6;

function calcBoardPieces(boards: { dim1: number; dim2: number; qty: number }[]): number {
  const totalArea = boards.reduce((sum, b) => sum + b.dim1 * b.dim2 * b.qty, 0);
  return Math.ceil(totalArea / BOARD_PIECE_AREA_MM2);
}

function calcCuttingLengthM(boards: { dim1: number; dim2: number; qty: number }[]): number {
  const totalMm = boards.reduce((sum, b) => sum + (b.dim1 + b.dim2) * b.qty, 0);
  return Math.round(totalMm) / 1000;
}

function calcEdgeBandingLengthM(boards: { edgeBandingMm: number; qty: number }[]): number {
  const totalMm = boards.reduce((sum, b) => sum + b.edgeBandingMm * b.qty, 0);
  return Math.round(totalMm) / 1000;
}

function roundUpToCents(value: number): number {
  return Math.ceil(value * 100) / 100;
}

function roundUpToHundreds(value: number): number {
  return Math.ceil(value / 100) * 100;
}

export interface ReportViewProps {
  parametersData: ParametersData | null;
  reportText: string;
  summaryText: string;
  elementsData: ElementsData | null;
  hardwareSummary: HardwareSummary | null;
  boardFinish: BoardFinish;
  doorHandle: DoorHandleSelection;
  onBackToConfig: () => void;
  onOpenContract: () => void;
}

interface BoardEntry {
  dim1: number;
  dim2: number;
  edgeBanding: string;
  edgeBandingMm: number;
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
      boards.push({ dim1: box.door.heightMm, dim2: box.door.widthMm, edgeBanding: 'Wszystkie obrzeża (4 strony)', edgeBandingMm: 2 * (box.door.heightMm + box.door.widthMm), qty });
    }
  }

  const { left, right, top, bottom } = elementsData.niches;
  if (left.widthMm > 0 && left.heightMm > 0) {
    boards.push({ dim1: left.widthMm, dim2: left.heightMm, edgeBanding: 'Bez obrzeży', edgeBandingMm: 0, qty: 1 });
  }
  if (right.widthMm > 0 && right.heightMm > 0) {
    boards.push({ dim1: right.widthMm, dim2: right.heightMm, edgeBanding: 'Bez obrzeży', edgeBandingMm: 0, qty: 1 });
  }
  if (top.widthMm > 0 && top.heightMm > 0) {
    boards.push({ dim1: top.widthMm, dim2: top.heightMm, edgeBanding: 'Bez obrzeży', edgeBandingMm: 0, qty: 1 });
  }
  if (bottom.widthMm > 0 && bottom.heightMm > 0) {
    boards.push({ dim1: bottom.widthMm, dim2: bottom.heightMm, edgeBanding: 'Bez obrzeży', edgeBandingMm: 0, qty: 1 });
  }

  if (elementsData.maskings) {
    if (elementsData.maskings.left) {
      const { heightMm, widthMm } = elementsData.maskings.left;
      boards.push({ dim1: heightMm, dim2: widthMm, edgeBanding: `Obrzeże na wysokości ${heightMm} mm (1 bok)`, edgeBandingMm: heightMm, qty: 1 });
    }
    if (elementsData.maskings.right) {
      const { heightMm, widthMm } = elementsData.maskings.right;
      boards.push({ dim1: heightMm, dim2: widthMm, edgeBanding: `Obrzeże na wysokości ${heightMm} mm (1 bok)`, edgeBandingMm: heightMm, qty: 1 });
    }
  }

  return boards;
}

function getSzaryBoards(elementsData: ElementsData): BoardEntry[] {
  const boards: BoardEntry[] = [];

  for (const box of elementsData.boxes) {
    if (box.shelves) {
      for (const g of box.shelves.groups) {
        boards.push({
          dim1: g.widthMm,
          dim2: box.shelves.depthMm,
          edgeBanding: `Obrzeże na szerokości ${g.widthMm} mm (1 bok)`,
          edgeBandingMm: g.widthMm,
          qty: g.qty,
        });
      }
    }

    if (box.panels) {
      boards.push({
        dim1: box.panels.sideHeightMm,
        dim2: box.panels.depthMm,
        edgeBanding: `Obrzeże na wysokości ${box.panels.sideHeightMm} mm (1 bok)`,
        edgeBandingMm: box.panels.sideHeightMm,
        qty: 2,
      });
      // top and bottom have the same dimensions — push 2 together
      boards.push({
        dim1: box.panels.topBottomWidthMm,
        dim2: box.panels.depthMm,
        edgeBanding: `Obrzeże na szerokości ${box.panels.topBottomWidthMm} mm (1 bok)`,
        edgeBandingMm: box.panels.topBottomWidthMm,
        qty: 2,
      });
    }

    if (box.drawerBoards) {
      const d = box.drawerBoards;
      const s = d.sets;
      boards.push({ dim1: d.sidePanel.heightMm, dim2: d.sidePanel.depthMm, edgeBanding: `Obrzeże na długości ${d.sidePanel.depthMm} mm (1 bok)`, edgeBandingMm: d.sidePanel.depthMm, qty: d.count * 2 * s });
      boards.push({ dim1: d.frontPanel.heightMm, dim2: d.frontPanel.widthMm, edgeBanding: 'Wszystkie obrzeża (4 strony)', edgeBandingMm: 2 * (d.frontPanel.heightMm + d.frontPanel.widthMm), qty: d.count * s });
      boards.push({ dim1: d.internalWall1.heightMm, dim2: d.internalWall1.widthMm, edgeBanding: `Obrzeże na długości ${d.internalWall1.widthMm} mm (1 bok)`, edgeBandingMm: d.internalWall1.widthMm, qty: d.count * s });
      boards.push({ dim1: d.internalWall2.heightMm, dim2: d.internalWall2.widthMm, edgeBanding: `Obrzeże na długości ${d.internalWall2.widthMm} mm (1 bok)`, edgeBandingMm: d.internalWall2.widthMm, qty: d.count * s });
      boards.push({ dim1: d.separator.heightMm, dim2: d.separator.widthMm, edgeBanding: 'Bez obrzeży', edgeBandingMm: 0, qty: d.separator.qty });
      boards.push({ dim1: d.drawerRail.heightMm, dim2: d.drawerRail.widthMm, edgeBanding: `Jedno obrzeże na długości ${d.drawerRail.widthMm} mm`, edgeBandingMm: d.drawerRail.widthMm, qty: 2 });
    }

    if (box.slupki && box.slupki.length > 0) {
      for (const s of box.slupki) {
        boards.push({
          dim1: s.heightMm,
          dim2: s.depthMm,
          edgeBanding: `Obrzeże na wysokości ${s.heightMm} mm (1 bok)`,
          edgeBandingMm: s.heightMm,
          qty: 1,
        });
      }
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

export default function ReportView({ parametersData, reportText: _reportText, summaryText: _summaryText, elementsData, hardwareSummary, boardFinish, doorHandle, onBackToConfig, onOpenContract }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<ReportTab>('parameters');
  const selectedHandle = useMemo(
    () => ALL_HANDLE_OPTIONS.get(doorHandle.optionId),
    [doorHandle.optionId]
  );
  const pricingSummary = useMemo(
    () => calculatePricingSummary(elementsData, hardwareSummary, boardFinish, doorHandle),
    [elementsData, hardwareSummary, boardFinish, doorHandle]
  );

  const kolorBoards = useMemo(
    () => elementsData ? groupBoards(getKolorBoards(elementsData)) : [],
    [elementsData]
  );
  const szaryBoards = useMemo(
    () => elementsData ? groupBoards(getSzaryBoards(elementsData)) : [],
    [elementsData]
  );
  const hdfBoards = useMemo(
    () => elementsData ? groupBoards([
      ...elementsData.boxes
        .filter((b) => b.hdf)
        .map((b) => ({ dim1: b.hdf!.widthMm, dim2: b.hdf!.heightMm, edgeBanding: 'Bez obrzeży', edgeBandingMm: 0, qty: 1 })),
      ...elementsData.boxes
        .filter((b) => b.drawerBoards)
        .map((b) => ({ dim1: b.drawerBoards!.hdfBottom.depthMm, dim2: b.drawerBoards!.hdfBottom.widthMm, edgeBanding: 'Bez obrzeży', edgeBandingMm: 0, qty: b.drawerBoards!.count })),
    ]) : [],
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
          <button
            type="button"
            className={`report-tab${activeTab === 'costs' ? ' report-tab--active' : ''}`}
            onClick={() => setActiveTab('costs')}
          >
            Koszty
          </button>
        </div>

        <div className="report-tab-content">
          {activeTab === 'parameters' && parametersData && (
            <div className="elements-grid">
              {parametersData.groups.map((group) => (
                <div key={group.title} className="element-card">
                  <div className="element-card__header">{group.title}</div>
                  <div className="element-card__body">
                    {group.rows.map((row) => (
                      <div key={row.label} className="element-card__row">
                        <span className="element-card__label">{row.label}</span>
                        <span className="element-card__value">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

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
                    {box.shelves && box.shelves.groups.map((g, gi) => (
                      <div key={gi} className="element-card__row">
                        <span className="element-card__label">Półki ({g.qty} szt.)</span>
                        <span className="element-card__value">
                          {g.widthMm} × {box.shelves!.depthMm} mm
                        </span>
                        <span className="element-card__meta">
                          Obrzeże na szerokości {g.widthMm} mm (1 bok) · <span className="element-card__color element-card__color--szary">szary</span>
                        </span>
                      </div>
                    ))}
                    {box.rods && box.rods > 0 && (
                      <div className="element-card__row">
                        <span className="element-card__label">Drążki ({box.rods} szt.)</span>
                      </div>
                    )}
                    {box.slupki && box.slupki.length > 0 && (
                      <>
                        <div className="element-card__divider" />
                        {box.slupki.map((s, si) => (
                          <div key={si} className="element-card__row">
                            <span className="element-card__label">Słupek {si + 1} (1 szt.)</span>
                            <span className="element-card__value">{s.heightMm} × {s.depthMm} mm</span>
                            <span className="element-card__meta">
                              Obrzeże na wysokości {s.heightMm} mm (1 bok) · <span className="element-card__color element-card__color--szary">szary</span>
                            </span>
                          </div>
                        ))}
                      </>
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
                    {box.drawerBoards && (
                      <>
                        <div className="element-card__divider" />
                        <div className="element-card__row">
                          <span className="element-card__label">Szuflady ({box.drawerBoards.count} szt. × {box.drawerBoards.sets} {box.drawerBoards.sets > 1 ? 'zestawy' : 'zestaw'})</span>
                        </div>
                        <div className="element-card__row">
                          <span className="element-card__label">Bok szuflady ({box.drawerBoards.count * 2 * box.drawerBoards.sets} szt.)</span>
                          <span className="element-card__value">
                            {box.drawerBoards.sidePanel.heightMm} × {box.drawerBoards.sidePanel.depthMm} mm
                          </span>
                          <span className="element-card__meta">
                            Obrzeże na długości {box.drawerBoards.sidePanel.depthMm} mm (1 bok) · <span className="element-card__color element-card__color--szary">szary</span>
                          </span>
                        </div>
                        <div className="element-card__row">
                          <span className="element-card__label">Front szuflady ({box.drawerBoards.count * box.drawerBoards.sets} szt.)</span>
                          <span className="element-card__value">
                            {box.drawerBoards.frontPanel.heightMm} × {box.drawerBoards.frontPanel.widthMm} mm
                          </span>
                          <span className="element-card__meta">
                            Wszystkie obrzeża (4 strony) · <span className="element-card__color element-card__color--szary">szary</span>
                          </span>
                        </div>
                        <div className="element-card__row">
                          <span className="element-card__label">Przód szuflady ({box.drawerBoards.count * box.drawerBoards.sets} szt.)</span>
                          <span className="element-card__value">
                            {box.drawerBoards.internalWall1.heightMm} × {box.drawerBoards.internalWall1.widthMm} mm
                          </span>
                          <span className="element-card__meta">
                            Obrzeże na długości {box.drawerBoards.internalWall1.widthMm} mm (1 bok) · <span className="element-card__color element-card__color--szary">szary</span>
                          </span>
                        </div>
                        <div className="element-card__row">
                          <span className="element-card__label">Tył szuflady ({box.drawerBoards.count * box.drawerBoards.sets} szt.)</span>
                          <span className="element-card__value">
                            {box.drawerBoards.internalWall2.heightMm} × {box.drawerBoards.internalWall2.widthMm} mm
                          </span>
                          <span className="element-card__meta">
                            Obrzeże na długości {box.drawerBoards.internalWall2.widthMm} mm (1 bok) · <span className="element-card__color element-card__color--szary">szary</span>
                          </span>
                        </div>
                        <div className="element-card__row">
                          <span className="element-card__label">Dno szuflady HDF ({box.drawerBoards.count} szt.)</span>
                          <span className="element-card__value">
                            {box.drawerBoards.hdfBottom.depthMm} × {box.drawerBoards.hdfBottom.widthMm} mm
                          </span>
                          <span className="element-card__meta">
                            Bez obrzeży · <span className="element-card__color element-card__color--szary">szary</span>
                          </span>
                        </div>
                        <div className="element-card__row">
                          <span className="element-card__label">Płyta separatorów ({box.drawerBoards.separator.qty} szt.)</span>
                          <span className="element-card__value">
                            {box.drawerBoards.separator.heightMm} × {box.drawerBoards.separator.widthMm} mm
                          </span>
                          <span className="element-card__meta">
                            Bez obrzeży · <span className="element-card__color element-card__color--szary">szary</span>
                          </span>
                        </div>
                        <div className="element-card__row">
                          <span className="element-card__label">Płyta prowadnicy szuflady (2 szt.)</span>
                          <span className="element-card__value">
                            {box.drawerBoards.drawerRail.heightMm} × {box.drawerBoards.drawerRail.widthMm} mm
                          </span>
                          <span className="element-card__meta">
                            Jedno obrzeże na długości {box.drawerBoards.drawerRail.widthMm} mm · <span className="element-card__color element-card__color--szary">szary</span>
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
                      <td>na drzwi (wg wysokości drzwi)</td>
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
                          <td>Uchwyty{selectedHandle ? ` — ${selectedHandle.label}` : ''}</td>
                          <td>{hardwareSummary.totalHandles} szt.</td>
                          <td>1 na drzwi</td>
                        </tr>
                        <tr>
                          <td>Nóżki</td>
                          <td>{hardwareSummary.totalLegs} szt.</td>
                          <td>4 na box</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'costs' && hardwareSummary && (() => {
            const hingesCost = totalHinges * COST_PER_HINGE_PLN;
            const guidesCost = hardwareSummary.totalGuides * COST_PER_GUIDE_SET_PLN;
            const bracketsCost = hardwareSummary.totalBrackets * COST_PER_BRACKET_SET_PLN;
            const handleUnitPrice = selectedHandle?.pricePln ?? DEFAULT_HANDLE_PRICE_PLN;
            const handlesCost = hardwareSummary.totalHandles * handleUnitPrice;
            const legsCost = hardwareSummary.totalLegs * COST_PER_LEG_PLN;
            const clipsCost = hardwareSummary.totalLegs * COST_PER_LEG_CLIP_PLN;
            const rodsCost = totalRods * COST_PER_ROD_PLN;
            const szaryPieces = calcBoardPieces(szaryBoards);
            const kolorPieces = calcBoardPieces(kolorBoards);
            const szaryBoardCost = szaryPieces * COST_PER_SZARY_PIECE_PLN;
            const selectedFinish = ALL_FINISH_OPTIONS.get(boardFinish.optionId);
            const kolorPricePerSheet = (selectedFinish?.pricePerSheetPln ?? COST_PER_KOLOR_PIECE_PLN * 2) / 2;
            const kolorBoardCost = kolorPieces * kolorPricePerSheet;
            const cuttingLengthM = Math.round((calcCuttingLengthM(szaryBoards) + calcCuttingLengthM(kolorBoards)) * 100) / 100;
            const cuttingCost = Math.round(cuttingLengthM * COST_PER_METER_CUTTING_PLN * 100) / 100;
            const bandingLengthM = Math.round((calcEdgeBandingLengthM(szaryBoards) + calcEdgeBandingLengthM(kolorBoards)) * 100) / 100;
            const bandingCost = Math.round(bandingLengthM * COST_PER_METER_BANDING_PLN * 100) / 100;
            const rawTotalCost = hingesCost + guidesCost + bracketsCost + handlesCost + legsCost + clipsCost + rodsCost + szaryBoardCost + kolorBoardCost + cuttingCost + bandingCost;
            const totalCost = pricingSummary.totalCost || roundUpToCents(rawTotalCost);
            const clientPrice = pricingSummary.clientPrice || (roundUpToHundreds(totalCost) * 2);
            const colGroup = (
              <colgroup>
                <col style={{ width: '45%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '19%' }} />
              </colgroup>
            );
            return (
              <div className="summary-tab">
                <div className="boards-summary-section">
                  <div className="boards-summary-section__header boards-summary-section__header--szary">Płyty szare (2800 × 1045 mm)</div>
                  <table className="boards-summary-table">
                    {colGroup}
                    <thead>
                      <tr>
                        <th>Element</th>
                        <th>Ilość</th>
                        <th>Cena jedn.</th>
                        <th>Razem</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Płyta szara</td>
                        <td>{szaryPieces} szt.</td>
                        <td>{COST_PER_SZARY_PIECE_PLN} zł</td>
                        <td>{szaryBoardCost} zł</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="boards-summary-section">
                  <div className="boards-summary-section__header boards-summary-section__header--kolor">
                    Płyty kolor — {selectedFinish?.label ?? 'nieokreślony'} (2800 × 1045 mm)
                  </div>
                  <table className="boards-summary-table">
                    {colGroup}
                    <thead>
                      <tr>
                        <th>Element</th>
                        <th>Ilość</th>
                        <th>Cena jedn.</th>
                        <th>Razem</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Płyta kolor</td>
                        <td>{kolorPieces} szt.</td>
                        <td>{kolorPricePerSheet.toFixed(2)} zł</td>
                        <td>{kolorBoardCost.toFixed(2)} zł</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="boards-summary-section">
                  <div className="boards-summary-section__header boards-summary-section__header--dodatki">Cięcie płyt</div>
                  <table className="boards-summary-table">
                    {colGroup}
                    <thead>
                      <tr>
                        <th>Element</th>
                        <th>Ilość</th>
                        <th>Cena jedn.</th>
                        <th>Razem</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Cięcie</td>
                        <td>{cuttingLengthM} m</td>
                        <td>{COST_PER_METER_CUTTING_PLN} zł/m</td>
                        <td>{cuttingCost} zł</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="boards-summary-section">
                  <div className="boards-summary-section__header boards-summary-section__header--dodatki">Oklejanie płyt</div>
                  <table className="boards-summary-table">
                    {colGroup}
                    <thead>
                      <tr>
                        <th>Element</th>
                        <th>Ilość</th>
                        <th>Cena jedn.</th>
                        <th>Razem</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Oklejanie</td>
                        <td>{bandingLengthM} m</td>
                        <td>{COST_PER_METER_BANDING_PLN} zł/m</td>
                        <td>{bandingCost} zł</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="boards-summary-section">
                  <div className="boards-summary-section__header boards-summary-section__header--dodatki">Koszty sprzętu</div>
                  <table className="boards-summary-table">
                    {colGroup}
                    <thead>
                      <tr>
                        <th>Element</th>
                        <th>Ilość</th>
                        <th>Cena jedn.</th>
                        <th>Razem</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Zawiasy</td>
                        <td>{totalHinges} szt.</td>
                        <td>{COST_PER_HINGE_PLN} zł</td>
                        <td>{hingesCost} zł</td>
                      </tr>
                      <tr>
                        <td>Prowadnice przesuwne</td>
                        <td>{hardwareSummary.totalGuides} szt.</td>
                        <td>{COST_PER_GUIDE_SET_PLN} zł</td>
                        <td>{guidesCost} zł</td>
                      </tr>
                      <tr>
                        <td>Sprzęgła</td>
                        <td>{hardwareSummary.totalBrackets} szt.</td>
                        <td>{COST_PER_BRACKET_SET_PLN} zł</td>
                        <td>{bracketsCost} zł</td>
                      </tr>
                      <tr>
                        <td>Uchwyty{selectedHandle ? ` — ${selectedHandle.label}` : ''}</td>
                        <td>{hardwareSummary.totalHandles} szt.</td>
                        <td>{handleUnitPrice} zł</td>
                        <td>{handlesCost} zł</td>
                      </tr>
                      <tr>
                        <td>Nóżki</td>
                        <td>{hardwareSummary.totalLegs} szt.</td>
                        <td>{COST_PER_LEG_PLN} zł</td>
                        <td>{legsCost} zł</td>
                      </tr>
                      <tr>
                        <td>Klip zatrzask (na nóżkę)</td>
                        <td>{hardwareSummary.totalLegs} szt.</td>
                        <td>{COST_PER_LEG_CLIP_PLN} zł</td>
                        <td>{clipsCost} zł</td>
                      </tr>
                      {totalRods > 0 && (
                        <tr>
                          <td>Drążki</td>
                          <td>{totalRods} szt.</td>
                          <td>{COST_PER_ROD_PLN} zł</td>
                          <td>{rodsCost} zł</td>
                        </tr>
                      )}
                      <tr style={{ fontWeight: 'bold', borderTop: '2px solid currentColor' }}>
                        <td colSpan={3}>Suma całkowita (koszt własny)</td>
                        <td>{totalCost.toFixed(2)} zł</td>
                      </tr>
                      <tr style={{ fontWeight: 'bold', color: 'var(--color-kolor, #c0392b)' }}>
                        <td colSpan={3}>Cena dla klienta (×2)</td>
                        <td>{clientPrice} zł</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
      <div className="report-actions">
        <button type="button" className="btn btn-outline" onClick={onBackToConfig}>
          ← Wróć do konfiguracji
        </button>
        <button type="button" className="btn" onClick={onOpenContract}>
          Umowa
        </button>
      </div>
    </>
  );
}
