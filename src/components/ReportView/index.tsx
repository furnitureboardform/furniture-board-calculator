import { useState, useMemo, useEffect } from 'react';
import type { ElementsData, HardwareSummary, ParametersData } from '../../lib/report';
import type { BoardFinish, DoorHandleSelection } from '../../lib/types';
import { ALL_HANDLE_OPTIONS } from '../../lib/handleOptions';
import { calculatePricingSummary } from '../../lib/pricing';
import { groupBoards, getKolorBoards, getSzaryBoards } from './utils';
import { ParametersTab } from './ParametersTab';
import { ElementsTab } from './ElementsTab';
import { SummaryTab } from './SummaryTab';
import { CostsTab } from './CostsTab';

type ReportTab = 'parameters' | 'elements' | 'summary' | 'costs';

export interface ReportViewProps {
  parametersData: ParametersData | null;
  reportText: string;
  summaryText: string;
  elementsData: ElementsData | null;
  hardwareSummary: HardwareSummary | null;
  boardFinish: BoardFinish;
  doorHandle: DoorHandleSelection;
  discountPln: number;
  onDiscountPlnChange: (discountPln: number) => void;
  discountPercent: number;
  onDiscountPercentChange: (discountPercent: number) => void;
  onBackToConfig: () => void;
  onOpenContract: () => void;
}

export default function ReportView({ parametersData, reportText: _reportText, summaryText: _summaryText, elementsData, hardwareSummary, boardFinish, doorHandle, discountPln, onDiscountPlnChange, discountPercent, onDiscountPercentChange, onBackToConfig, onOpenContract }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<ReportTab>('parameters');
  const [discountInput, setDiscountInput] = useState<string>('0');
  const [discountPercentInput, setDiscountPercentInput] = useState<string>('0');
  const [transportCostPln, setTransportCostPln] = useState<number>(0);
  const [transportInput, setTransportInput] = useState<string>('0');

  const parsedDiscountPln = useMemo(() => {
    if (!Number.isFinite(discountPln)) return 0;
    return Math.max(0, discountPln);
  }, [discountPln]);

  const parsedDiscountPercent = useMemo(() => {
    if (!Number.isFinite(discountPercent)) return 0;
    return Math.min(100, Math.max(0, discountPercent));
  }, [discountPercent]);

  useEffect(() => {
    setDiscountInput(String(parsedDiscountPln));
  }, [parsedDiscountPln]);

  useEffect(() => {
    setDiscountPercentInput(String(parsedDiscountPercent));
  }, [parsedDiscountPercent]);

  function parseDiscountPlnInput(rawValue: string): number | null {
    const normalized = rawValue.trim().replace(',', '.');
    if (normalized === '') return null;
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) return null;
    return Math.max(0, Math.round(parsed));
  }

  function parseDiscountPercentInput(rawValue: string): number | null {
    const normalized = rawValue.trim().replace(',', '.');
    if (normalized === '') return null;
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) return null;
    const rounded = Math.round(parsed);
    return Math.min(100, Math.max(0, rounded));
  }

  function handleDiscountPlnInput(value: string) {
    setDiscountInput(value);
    const parsed = parseDiscountPlnInput(value);
    if (parsed !== null) {
      onDiscountPlnChange(parsed);
    }
  }

  function handleDiscountPercentInput(value: string) {
    setDiscountPercentInput(value);
    const parsed = parseDiscountPercentInput(value);
    if (parsed !== null) {
      onDiscountPercentChange(parsed);
    }
  }

  function commitDiscountPlnInput() {
    const parsed = parseDiscountPlnInput(discountInput);
    if (parsed === null) {
      onDiscountPlnChange(0);
      setDiscountInput('0');
      return;
    }
    onDiscountPlnChange(parsed);
    setDiscountInput(String(parsed));
  }

  function commitDiscountPercentInput() {
    const parsed = parseDiscountPercentInput(discountPercentInput);
    if (parsed === null) {
      onDiscountPercentChange(0);
      setDiscountPercentInput('0');
      return;
    }
    onDiscountPercentChange(parsed);
    setDiscountPercentInput(String(parsed));
  }

  const selectedHandle = useMemo(
    () => ALL_HANDLE_OPTIONS.get(doorHandle.optionId),
    [doorHandle.optionId]
  );
  const pricingSummary = useMemo(
    () => calculatePricingSummary(elementsData, hardwareSummary, boardFinish, doorHandle, parsedDiscountPln, parsedDiscountPercent, transportCostPln),
    [elementsData, hardwareSummary, boardFinish, doorHandle, parsedDiscountPln, parsedDiscountPercent, transportCostPln]
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
        .flatMap((b) => (b.hdf ?? [])
          .map((section) => ({ dim1: section.widthMm, dim2: section.heightMm, edgeBanding: 'Bez obrzeży', edgeBandingMm: 0, qty: 1 }))),
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
            <ParametersTab parametersData={parametersData} />
          )}

          {activeTab === 'elements' && elementsData && (
            <ElementsTab elementsData={elementsData} />
          )}

          {activeTab === 'summary' && (
            <SummaryTab
              kolorBoards={kolorBoards}
              szaryBoards={szaryBoards}
              hdfBoards={hdfBoards}
              totalRods={totalRods}
              totalHinges={totalHinges}
              hardwareSummary={hardwareSummary}
              selectedHandle={selectedHandle}
            />
          )}

          {activeTab === 'costs' && hardwareSummary && (
            <CostsTab
              kolorBoards={kolorBoards}
              szaryBoards={szaryBoards}
              totalRods={totalRods}
              totalHinges={totalHinges}
              hardwareSummary={hardwareSummary}
              boardFinish={boardFinish}
              selectedHandle={selectedHandle}
              pricingSummary={pricingSummary}
              discountInput={discountInput}
              discountPercentInput={discountPercentInput}
              onDiscountPlnInput={handleDiscountPlnInput}
              onDiscountPercentInput={handleDiscountPercentInput}
              onCommitDiscountPln={commitDiscountPlnInput}
              onCommitDiscountPercent={commitDiscountPercentInput}
              transportInput={transportInput}
              onTransportInput={(value) => {
                setTransportInput(value);
                const parsed = Number(value.trim().replace(',', '.'));
                setTransportCostPln(Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0);
              }}
              onCommitTransport={() => {
                const parsed = Number(transportInput.trim().replace(',', '.'));
                const safe = Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0;
                setTransportCostPln(safe);
                setTransportInput(String(safe));
              }}
            />
          )}
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
