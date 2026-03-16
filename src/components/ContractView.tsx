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
      const sections = Array.from(
        contractRef.current.querySelectorAll<HTMLElement>('.contract-pdf-section')
      );
      if (sections.length === 0) return;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const maxContentHeight = pageHeight - margin * 2;

      for (let i = 0; i < sections.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const section = sections[i]!;
        const canvas = await html2canvas(section, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
        });

        const imageData = canvas.toDataURL('image/png');
        let imageWidth = pageWidth - margin * 2;
        let imageHeight = (canvas.height * imageWidth) / canvas.width;

        // If a single section is taller than one page, scale it down to keep it whole.
        if (imageHeight > maxContentHeight) {
          imageHeight = maxContentHeight;
          imageWidth = (canvas.width * imageHeight) / canvas.height;
        }

        const drawX = margin + ((pageWidth - margin * 2) - imageWidth) / 2;
        pdf.addImage(imageData, 'PNG', drawX, margin, imageWidth, imageHeight);
      }

      pdf.save('umowa-szafa.pdf');
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  return (
    <div className="contract-view">
      <div ref={contractRef} className="contract-sheet">
        <section className="contract-page contract-pdf-section">
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

          <div className="contract-copy">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className={index === 0 ? 'contract-copy__title' : ''}>{paragraph}</p>
            ))}

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
        </section>

        <section className="contract-page contract-pdf-section">
          <div className="contract-page__title">Załącznik techniczny</div>

          <div className="contract-data-grid">
            <div className="contract-data-card">
              <span>Okleina / kolor</span>
              <strong>{selectedFinish?.label ?? boardFinish.optionId}</strong>
            </div>
            <div className="contract-data-card">
              <span>Uchwyt</span>
              <strong>{selectedHandle?.label ?? doorHandle.optionId}</strong>
            </div>
          </div>

          <div className="contract-side contract-side--full">
            <h3>Model graficzny szafy</h3>
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
        </section>
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