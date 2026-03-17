import type { ElementsData, HardwareSummary } from '../../lib/report';
import type { BoardFinish, BoxForm, DoorHandleSelection } from '../../lib/types';
import { ContractWardrobePreview } from '../ContractWardrobePreview';
import { useContractView } from './useContractView';

export interface ContractViewProps {
  readonly elementsData: ElementsData | null;
  readonly hardwareSummary: HardwareSummary | null;
  readonly boardFinish: BoardFinish;
  readonly doorHandle: DoorHandleSelection;
  readonly discountPln: number;
  readonly discountPercent: number;
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

export function ContractView({
  elementsData,
  hardwareSummary,
  boardFinish,
  doorHandle,
  discountPln,
  discountPercent,
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
  const {
    contractRef,
    isGeneratingPdf,
    selectedFinish,
    selectedHandle,
    pricing,
    contractSections,
    handleGeneratePdf,
  } = useContractView({
    elementsData,
    hardwareSummary,
    boardFinish,
    doorHandle,
    discountPln,
    discountPercent,
    nicheWidthMm,
    nicheHeightMm,
    cabinetDepthMm,
  });

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
              <strong>{pricing.clientPriceAfterDiscount} zł</strong>
              <span>Zaliczka</span>
              <strong>{pricing.materialsDeposit} zł</strong>
            </div>
          </div>

          <div className="contract-copy">
            {contractSections.map((section, index) => (
              <div key={index} className={section.heading ? 'contract-section' : undefined}>
                {section.heading && (
                  <h4 className="contract-section__heading">{section.heading}</h4>
                )}
                <p className={section.isTitle ? 'contract-copy__title' : undefined}>{section.body}</p>
              </div>
            ))}
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
