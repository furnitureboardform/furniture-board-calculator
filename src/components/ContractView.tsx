import { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ALL_FINISH_OPTIONS } from '../lib/finishOptions';
import { ALL_HANDLE_OPTIONS } from '../lib/handleOptions';
import { buildContractTemplate } from '../lib/contractTemplate';
import { calculatePricingSummary } from '../lib/pricing';
import type { ElementsData, HardwareSummary } from '../lib/report';
import type { BoardFinish, BoxForm, DoorHandleSelection } from '../lib/types';
import { ContractWardrobePreview } from './ContractWardrobePreview';

export interface ContractViewProps {
  readonly elementsData: ElementsData | null;
  readonly hardwareSummary: HardwareSummary | null;
  readonly boardFinish: BoardFinish;
  readonly doorHandle: DoorHandleSelection;
  readonly boxes: BoxForm[];
  readonly numberOfBoxes: number;
  readonly nicheWidthMm: number;
  readonly nicheHeightMm: number;
  readonly cabinetDepthMm: number;
  readonly hasSideNiches: boolean;
  readonly leftBlendMm: number;
  readonly rightBlendMm: number;
  readonly topBlendMm: number;
  readonly bottomBlendMm: number;
  readonly outerMaskingLeft: boolean;
  readonly outerMaskingRight: boolean;
  readonly onBackToReport: () => void;
}

function getFinishTypeLabel(type: BoardFinish['type']): string {
  if (type === 'laminat') return 'Okleina laminat kolor';
  if (type === 'akryl') return 'Okleina akryl kolor';
  return 'Okleina laminat drewniana';
}

export function ContractView({
  elementsData,
  hardwareSummary,
  boardFinish,
  doorHandle,
  boxes,
  numberOfBoxes,
  nicheWidthMm,
  nicheHeightMm,
  cabinetDepthMm,
  hasSideNiches,
  leftBlendMm,
  rightBlendMm,
  topBlendMm,
  bottomBlendMm,
  outerMaskingLeft,
  outerMaskingRight,
  onBackToReport,
}: ContractViewProps) {
  const contractRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const selectedFinish = ALL_FINISH_OPTIONS.get(boardFinish.optionId);
  const selectedHandle = ALL_HANDLE_OPTIONS.get(doorHandle.optionId);
  const pricing = useMemo(
    () => calculatePricingSummary(elementsData, hardwareSummary, boardFinish, doorHandle),
    [elementsData, hardwareSummary, boardFinish, doorHandle]
  );
  const contractText = buildContractTemplate({
    finishTypeLabel: getFinishTypeLabel(boardFinish.type),
    finishLabel: selectedFinish?.label ?? boardFinish.optionId,
    handleLabel: selectedHandle?.label ?? doorHandle.optionId,
    numberOfBoxes,
    nicheWidthMm,
    nicheHeightMm,
    cabinetDepthMm,
    totalAmountPln: pricing.clientPrice,
  });
  const paragraphs = contractText.split('\n\n');

  async function handleGeneratePdf() {
    if (!contractRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(contractRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imageWidth = pageWidth - margin * 2;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      let remainingHeight = imageHeight;
      let positionY = margin;

      pdf.addImage(imageData, 'PNG', margin, positionY, imageWidth, imageHeight);
      remainingHeight -= pageHeight - margin * 2;

      while (remainingHeight > 0) {
        pdf.addPage();
        positionY = margin - (imageHeight - remainingHeight);
        pdf.addImage(imageData, 'PNG', margin, positionY, imageWidth, imageHeight);
        remainingHeight -= pageHeight - margin * 2;
      }

      pdf.save('umowa-szafa.pdf');
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  return (
    <div className="contract-view">
      <div ref={contractRef} className="contract-sheet">
        <div className="contract-sheet__header">
          <div>
            <h2>Umowa</h2>
            <p>Dokument roboczy do akceptacji projektu i warunków realizacji.</p>
          </div>
          <div className="contract-price-card">
            <span>Kwota całkowita</span>
            <strong>{pricing.clientPrice} zł</strong>
          </div>
        </div>

        <div className="contract-layout">
          <div className="contract-copy">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className={index === 0 ? 'contract-copy__title' : ''}>{paragraph}</p>
            ))}

            <div className="contract-data-grid">
              <div className="contract-data-card">
                <span>Model</span>
                <strong>{numberOfBoxes} boxy</strong>
                <small>{nicheWidthMm} × {nicheHeightMm} × {cabinetDepthMm} mm</small>
              </div>
              <div className="contract-data-card">
                <span>Okleina / kolor</span>
                <strong>{selectedFinish?.label ?? boardFinish.optionId}</strong>
                <small>{getFinishTypeLabel(boardFinish.type)}</small>
              </div>
              <div className="contract-data-card">
                <span>Uchwyt</span>
                <strong>{selectedHandle?.label ?? doorHandle.optionId}</strong>
                <small>{pricing.handleUnitPrice.toFixed(2)} zł / szt.</small>
              </div>
            </div>

            <div className="contract-fields">
              <div className="contract-field">
                <span>Imię i nazwisko zamawiającego</span>
                <div className="contract-line" />
              </div>
              <div className="contract-field">
                <span>Telefon / e-mail</span>
                <div className="contract-line" />
              </div>
              <div className="contract-field">
                <span>Adres realizacji</span>
                <div className="contract-line" />
              </div>
            </div>
          </div>

          <div className="contract-side">
            <h3>Model szafy</h3>
            <ContractWardrobePreview
              nicheWidthMm={nicheWidthMm}
              nicheHeightMm={nicheHeightMm}
              boxes={boxes}
              numberOfBoxes={numberOfBoxes}
              hasSideNiches={hasSideNiches}
              leftBlendMm={leftBlendMm}
              rightBlendMm={rightBlendMm}
              topBlendMm={topBlendMm}
              bottomBlendMm={bottomBlendMm}
              outerMaskingLeft={outerMaskingLeft}
              outerMaskingRight={outerMaskingRight}
              finishColor={selectedFinish?.swatchColor ?? '#d6c0a8'}
            />
          </div>
        </div>

        <div className="contract-signatures">
          <div className="signature-box">
            <div className="contract-line" />
            <span>Podpis zamawiającego</span>
          </div>
          <div className="signature-box">
            <div className="contract-line" />
            <span>Podpis wykonawcy</span>
          </div>
        </div>
      </div>

      <div className="contract-actions">
        <button type="button" className="btn btn-outline" onClick={onBackToReport}>
          ← Wróć do raportu
        </button>
        <button type="button" className="btn" onClick={handleGeneratePdf} disabled={isGeneratingPdf}>
          {isGeneratingPdf ? 'Generowanie PDF...' : 'Pobierz PDF'}
        </button>
      </div>
    </div>
  );
}