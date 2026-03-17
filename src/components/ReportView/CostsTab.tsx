import type { HardwareSummary } from '../../lib/report';
import type { HandleOption } from '../../lib/handleOptions';
import type { PricingSummary } from '../../lib/pricing';
import type { BoardFinish } from '../../lib/types';
import { ALL_FINISH_OPTIONS } from '../../lib/finishOptions';
import type { BoardEntry } from './utils';
import { calcBoardPieces, calcCuttingLengthM, calcEdgeBandingLengthM, roundUpToCents, roundUpToHundreds } from './utils';
import {
  COST_PER_HINGE_PLN,
  COST_PER_GUIDE_SET_PLN,
  COST_PER_BRACKET_SET_PLN,
  DEFAULT_HANDLE_PRICE_PLN,
  COST_PER_LEG_PLN,
  COST_PER_LEG_CLIP_PLN,
  COST_PER_ROD_PLN,
  COST_PER_SZARY_PIECE_PLN,
  COST_PER_KOLOR_PIECE_PLN,
  COST_PER_METER_CUTTING_PLN,
  COST_PER_METER_BANDING_PLN,
} from './constants';

interface CostsTabProps {
  kolorBoards: BoardEntry[];
  szaryBoards: BoardEntry[];
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
}

export function CostsTab({
  kolorBoards,
  szaryBoards,
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
}: CostsTabProps) {
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
  const materialsDeposit = pricingSummary.materialsDeposit || roundUpToHundreds(totalCost);
  const clientPrice = pricingSummary.clientPriceAfterDiscount;

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
            <tr style={{ fontWeight: 'bold' }}>
              <td colSpan={3}>Zaliczka</td>
              <td>{materialsDeposit} zł</td>
            </tr>
            <tr style={{ fontWeight: 'bold' }}>
              <td colSpan={3}>Rabat %</td>
              <td>
                <input
                  id="discount-percent-input"
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  className="report-discount-input"
                  value={discountPercentInput}
                  onChange={(e) => onDiscountPercentInput(e.target.value)}
                  onBlur={onCommitDiscountPercent}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onCommitDiscountPercent();
                    }
                  }}
                />
              </td>
            </tr>
            <tr style={{ fontWeight: 'bold' }}>
              <td colSpan={3}>Rabat</td>
              <td>
                <input
                  id="discount-pln-input"
                  type="number"
                  min={0}
                  step={1}
                  className="report-discount-input"
                  value={discountInput}
                  onChange={(e) => onDiscountPlnInput(e.target.value)}
                  onBlur={onCommitDiscountPln}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onCommitDiscountPln();
                    }
                  }}
                />
              </td>
            </tr>
            <tr style={{ fontWeight: 'bold', color: 'var(--color-kolor, #c0392b)' }}>
              <td colSpan={3}>Cena dla klienta</td>
              <td>{clientPrice} zł</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
