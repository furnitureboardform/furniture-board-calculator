import { useState } from 'react';
import type { HardwareSummary } from '../../lib/report';
import type { HandleOption } from '../../lib/handleOptions';
import type { PricingSummary } from '../../lib/pricing';
import type { BoardFinish } from '../../lib/types';
import { ALL_FINISH_OPTIONS } from '../../lib/finishOptions';
import type { BoardEntry } from './utils';
import { calcCuttingLengthM, calcEdgeBandingLengthM, roundUpToCents, roundUpToHundreds } from './utils';
import {
  COST_PER_HINGE_PLN,
  COST_PER_GUIDE_SET_PLN,
  COST_PER_BRACKET_SET_PLN,
  DEFAULT_HANDLE_PRICE_PLN,
  COST_PER_LEG_PLN,
  COST_PER_LEG_CLIP_PLN,
  COST_PER_ROD_PLN,
  COST_PER_CARCASS_SQM_PLN,
  COST_PER_COVER_SQM_PLN,
  COST_PER_METER_CUTTING_PLN,
  COST_PER_METER_BANDING_PLN,
  COST_PER_METER_VENEER_CARCASS_PLN,
  COST_PER_METER_VENEER_COVER_PLN,
} from './constants';

interface CostsTabProps {
  coverBoards: BoardEntry[];
  carcassBoards: BoardEntry[];
  totalRods: number;
  totalHinges: number;
  hardwareSummary: HardwareSummary;
  boardFinish: BoardFinish;
  selectedHandle: HandleOption | undefined;
  pricingSummary: PricingSummary;
  discountInput: string;
  discountPercentInput: string;
  onDiscountPlnInput: (value: string) => void;
  onDiscountPercentInput: (value: string) => void;
  onCommitDiscountPln: () => void;
  onCommitDiscountPercent: () => void;
  transportInput: string;
  onTransportInput: (value: string) => void;
  onCommitTransport: () => void;
  customElementsInput: string;
  onCustomElementsInput: (value: string) => void;
  onCommitCustomElements: () => void;
}

export function CostsTab({
  coverBoards,
  carcassBoards,
  totalRods,
  totalHinges,
  hardwareSummary,
  boardFinish,
  selectedHandle,
  pricingSummary,
  discountInput,
  discountPercentInput,
  onDiscountPlnInput,
  onDiscountPercentInput,
  onCommitDiscountPln,
  onCommitDiscountPercent,
  transportInput,
  onTransportInput,
  onCommitTransport,
  customElementsInput,
  onCustomElementsInput,
  onCommitCustomElements,
}: CostsTabProps) {
  const hingesCost = totalHinges * COST_PER_HINGE_PLN;
  const guidesCost = hardwareSummary.totalGuides * COST_PER_GUIDE_SET_PLN;
  const bracketsCost = hardwareSummary.totalBrackets * COST_PER_BRACKET_SET_PLN;
  const handleUnitPrice = selectedHandle?.pricePln ?? DEFAULT_HANDLE_PRICE_PLN;
  const handlesCost = hardwareSummary.totalHandles * handleUnitPrice;
  const legsCost = hardwareSummary.totalLegs * COST_PER_LEG_PLN;
  const clipsCost = hardwareSummary.totalLegs * COST_PER_LEG_CLIP_PLN;
  const rodsCost = totalRods * COST_PER_ROD_PLN;
  const carcassAreaMm2 = carcassBoards.reduce((sum, b) => sum + b.dim1 * b.dim2 * b.qty, 0);
  const carcassAreaSqm = Math.round(carcassAreaMm2 / 10000) / 100;
  const carcassBoardCost = Math.round(carcassAreaSqm * COST_PER_CARCASS_SQM_PLN * 100) / 100;
  const selectedFinish = ALL_FINISH_OPTIONS.get(boardFinish.optionId);
  const coverAreaMm2 = coverBoards.reduce((sum, b) => sum + b.dim1 * b.dim2 * b.qty, 0);
  const coverAreaSqm = Math.round(coverAreaMm2 / 10000) / 100;
  const coverPricePerSqm = selectedFinish?.pricePerSqmPln ?? COST_PER_COVER_SQM_PLN;
  const coverBoardCost = Math.round(coverAreaSqm * coverPricePerSqm * 100) / 100;
  const carcassCuttingLengthM = Math.round(calcCuttingLengthM(carcassBoards) * 100) / 100;
  const coverCuttingLengthM = Math.round(calcCuttingLengthM(coverBoards) * 100) / 100;
  const carcassCuttingCost = Math.round(carcassCuttingLengthM * COST_PER_METER_CUTTING_PLN * 100) / 100;
  const coverCuttingCost = Math.round(coverCuttingLengthM * COST_PER_METER_CUTTING_PLN * 100) / 100;
  const carcassBandingLengthM = Math.round(calcEdgeBandingLengthM(carcassBoards) * 100) / 100;
  const coverBandingLengthM = Math.round(calcEdgeBandingLengthM(coverBoards) * 100) / 100;
  const carcassBandingCost = Math.round(carcassBandingLengthM * COST_PER_METER_BANDING_PLN * 100) / 100;
  const coverBandingCost = Math.round(coverBandingLengthM * COST_PER_METER_BANDING_PLN * 100) / 100;
  const carcassVeneerCost = Math.round(carcassBandingLengthM * COST_PER_METER_VENEER_CARCASS_PLN * 100) / 100;
  const coverVeneerCost = Math.round(coverBandingLengthM * COST_PER_METER_VENEER_COVER_PLN * 100) / 100;
  const rawTotalCost = hingesCost + guidesCost + bracketsCost + handlesCost + legsCost + clipsCost + rodsCost + carcassBoardCost + coverBoardCost + carcassCuttingCost + coverCuttingCost + carcassBandingCost + coverBandingCost + carcassVeneerCost + coverVeneerCost;
  const totalCost = pricingSummary.totalCost || roundUpToCents(rawTotalCost);
  const materialsDeposit = pricingSummary.materialsDeposit || roundUpToHundreds(totalCost);
  const clientPrice = pricingSummary.clientPriceAfterDiscount;
  const [totalsVisible, setTotalsVisible] = useState(false);

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
        <div className="boards-summary-section__header boards-summary-section__header--carcass">Płyty korpus (2800 × 2070 mm)</div>
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
              <td>Płyta korpus</td>
              <td>{carcassAreaSqm} m²</td>
              <td>{COST_PER_CARCASS_SQM_PLN} zł/m²</td>
              <td>{carcassBoardCost.toFixed(2)} zł</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="boards-summary-section">
        <div className="boards-summary-section__header boards-summary-section__header--cover">
          Płyty obicie — {selectedFinish?.label ?? 'nieokreślony'} (2800 × 2070 mm)
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
              <td>Płyta obicie</td>
              <td>{coverAreaSqm} m²</td>
              <td>{coverPricePerSqm.toFixed(2)} zł/m²</td>
              <td>{coverBoardCost.toFixed(2)} zł</td>
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
              <td>Cięcie płyty korpus</td>
              <td>{carcassCuttingLengthM} m</td>
              <td>{COST_PER_METER_CUTTING_PLN} zł/m</td>
              <td>{carcassCuttingCost} zł</td>
            </tr>
            <tr>
              <td>Cięcie płyty obicie</td>
              <td>{coverCuttingLengthM} m</td>
              <td>{COST_PER_METER_CUTTING_PLN} zł/m</td>
              <td>{coverCuttingCost} zł</td>
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
              <td>Oklejanie płyty korpus</td>
              <td>{carcassBandingLengthM} m</td>
              <td>{COST_PER_METER_BANDING_PLN} zł/m</td>
              <td>{carcassBandingCost} zł</td>
            </tr>
            <tr>
              <td>Oklejanie płyty obicie</td>
              <td>{coverBandingLengthM} m</td>
              <td>{COST_PER_METER_BANDING_PLN} zł/m</td>
              <td>{coverBandingCost} zł</td>
            </tr>
            <tr>
              <td>Okleina korpus</td>
              <td>{carcassBandingLengthM} m</td>
              <td>{COST_PER_METER_VENEER_CARCASS_PLN} zł/m</td>
              <td>{carcassVeneerCost.toFixed(2)} zł</td>
            </tr>
            <tr>
              <td>Okleina obicie</td>
              <td>{coverBandingLengthM} m</td>
              <td>{COST_PER_METER_VENEER_COVER_PLN} zł/m</td>
              <td>{coverVeneerCost.toFixed(2)} zł</td>
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
          </tbody>
        </table>
      </div>
      <div className="boards-summary-section">
        <div className="boards-summary-section__header boards-summary-section__header--podsumowanie boards-summary-section__header--with-action">
          Podsumowanie finansowe
          <button
            type="button"
            className="summary-toggle-btn"
            onClick={() => setTotalsVisible((v) => !v)}
            aria-label={totalsVisible ? 'Ukryj sumy' : 'Pokaż sumy'}
          >
            {totalsVisible ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            )}
          </button>
        </div>
        <div className="costs-summary-grid">
          <div className="costs-summary-card costs-summary-card--editable">
            <span className="costs-summary-card__label">Transport</span>
            <input
              type="number"
              min={0}
              step={1}
              className="costs-summary-card__input"
              value={transportInput}
              onChange={(e) => onTransportInput(e.target.value)}
              onBlur={onCommitTransport}
              onKeyDown={(e) => { if (e.key === 'Enter') onCommitTransport(); }}
            />
            <span className="costs-summary-card__unit">zł</span>
          </div>
          <div className="costs-summary-card costs-summary-card--editable">
            <span className="costs-summary-card__label">Elementy niestandardowe</span>
            <input
              type="number"
              min={0}
              step={1}
              className="costs-summary-card__input"
              value={customElementsInput}
              onChange={(e) => onCustomElementsInput(e.target.value)}
              onBlur={onCommitCustomElements}
              onKeyDown={(e) => { if (e.key === 'Enter') onCommitCustomElements(); }}
            />
            <span className="costs-summary-card__unit">zł</span>
          </div>
          <div className="costs-summary-card costs-summary-card--editable">
            <span className="costs-summary-card__label">Rabat %</span>
            <input
              id="discount-percent-input"
              type="number"
              min={0}
              max={100}
              step={1}
              className="costs-summary-card__input"
              value={discountPercentInput}
              onChange={(e) => onDiscountPercentInput(e.target.value)}
              onBlur={onCommitDiscountPercent}
              onKeyDown={(e) => { if (e.key === 'Enter') onCommitDiscountPercent(); }}
            />
            <span className="costs-summary-card__unit">%</span>
          </div>
          <div className="costs-summary-card costs-summary-card--editable">
            <span className="costs-summary-card__label">Rabat</span>
            <input
              id="discount-pln-input"
              type="number"
              min={0}
              step={1}
              className="costs-summary-card__input"
              value={discountInput}
              onChange={(e) => onDiscountPlnInput(e.target.value)}
              onBlur={onCommitDiscountPln}
              onKeyDown={(e) => { if (e.key === 'Enter') onCommitDiscountPln(); }}
            />
            <span className="costs-summary-card__unit">zł</span>
          </div>
          {totalsVisible && (
            <div className="costs-summary-totals-row">
              <div className="costs-summary-card costs-summary-card--total">
                <span className="costs-summary-card__label">Suma całkowita (koszt własny)</span>
                <span className="costs-summary-card__value">{totalCost.toFixed(2)} zł</span>
              </div>
              <div className="costs-summary-card costs-summary-card--client-price">
                <span className="costs-summary-card__label">Cena dla klienta</span>
                <span className="costs-summary-card__value">{clientPrice} zł</span>
              </div>
              <div className="costs-summary-card">
                <span className="costs-summary-card__label">Zaliczka</span>
                <span className="costs-summary-card__value">{materialsDeposit} zł</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
