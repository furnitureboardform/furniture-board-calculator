import type { HardwareSummary } from '../../lib/report';
import type { HandleOption } from '../../lib/handleOptions';
import type { BoardEntry } from './utils';
import { BoardsSection } from './BoardsSection';

interface SummaryTabProps {
  coverBoards: BoardEntry[];
  carcassBoards: BoardEntry[];
  hdfBoards: BoardEntry[];
  totalRods: number;
  totalHinges: number;
  hardwareSummary: HardwareSummary | null;
  selectedHandle: HandleOption | undefined;
}

export function SummaryTab({ coverBoards, carcassBoards, hdfBoards, totalRods, totalHinges, hardwareSummary, selectedHandle }: SummaryTabProps) {
  return (
    <div className="summary-tab">
      <BoardsSection title="Płyty obicie" colorClass="boards-summary-section__header--cover" boards={coverBoards} />
      <BoardsSection title="Płyty korpus" colorClass="boards-summary-section__header--carcass" boards={carcassBoards} />
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
  );
}
