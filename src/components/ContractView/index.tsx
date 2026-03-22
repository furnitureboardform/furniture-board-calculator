import type { ElementsData, HardwareSummary } from '../../lib/report';
import { CONTRACTOR_PARTY_DETAILS } from '../../lib/contractTemplate';
import type { BoardFinish, BoxForm, DoorHandleSelection } from '../../lib/types';
import type { FinishOption } from '../../lib/finishOptions';
import type { HandleOption } from '../../lib/handleOptions';
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
  readonly finishesMap: ReadonlyMap<string, FinishOption>;
  readonly handlesMap: ReadonlyMap<string, HandleOption>;
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
  finishesMap,
  handlesMap,
}: ContractViewProps) {
  const selectedFinish = finishesMap.get(boardFinish.optionId);
  const selectedHandle = handlesMap.get(doorHandle.optionId);

  const {
    contractRef,
    isGeneratingPdf,
    pricing,
    contractPages,
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
    selectedFinish,
    selectedHandle,
  });

  return (
    <div className="contract-view">
      <div ref={contractRef} className="contract-sheet">
        {contractPages.map((page, pageIndex) => (
          <section key={pageIndex} className="contract-page contract-pdf-section">
            {pageIndex === 0 ? (
              <>
                <div className="contract-sheet__header">
                  <div>
                    <h2>Umowa</h2>
                    <p>Dokument roboczy do akceptacji projektu i warunków realizacji.</p>
                  </div>
                </div>
                <div className="contract-parties">
                  <p className="contract-parties__intro">
                    zawarta w dniu
                    <span className="contract-inline-line contract-inline-line--date" />
                    w
                    <span className="contract-inline-line contract-inline-line--place" />
                    pomiędzy:
                  </p>

                  <div className="contract-party-card">
                    <h3>1. Wykonawcą:</h3>
                    <div className="contract-party-card__rows">
                      <p>
                        <strong>Imię i nazwisko:</strong> {CONTRACTOR_PARTY_DETAILS.fullName}
                      </p>
                      <p>
                        <strong>Firma przedsiębiorcy:</strong> {CONTRACTOR_PARTY_DETAILS.companyName}
                      </p>
                      <p>
                        <strong>Adres wykonywania działalności:</strong>{' '}
                        {CONTRACTOR_PARTY_DETAILS.businessAddress}
                      </p>
                      <p>
                        <strong>NIP:</strong> {CONTRACTOR_PARTY_DETAILS.nip}
                      </p>
                      <p>
                        <strong>REGON:</strong> {CONTRACTOR_PARTY_DETAILS.regon}
                      </p>
                    </div>
                    <p className="contract-party-card__suffix">dalej zwanym „Wykonawcą”</p>
                  </div>

                  <div className="contract-parties__separator">a</div>

                  <div className="contract-party-card">
                    <h3>2. Zamawiającym:</h3>
                    <div className="contract-party-card__rows">
                      <div className="contract-party-field">
                        <span>Imię i nazwisko / nazwa firmy</span>
                        <div className="contract-line" />
                      </div>
                      <div className="contract-party-field">
                        <span>Adres / siedziba</span>
                        <div className="contract-line" />
                      </div>
                      <div className="contract-party-field contract-party-field--half">
                        <span>NIP</span>
                        <div className="contract-line" />
                      </div>
                      <div className="contract-party-field contract-party-field--half">
                        <span>REGON</span>
                        <div className="contract-line" />
                      </div>
                      <div className="contract-party-field">
                        <span>Telefon / e-mail</span>
                        <div className="contract-line" />
                      </div>
                    </div>
                    <p className="contract-party-card__suffix">dalej zwanym „Zamawiającym”</p>
                  </div>
                </div>
              </>
            ) : (
              page.title && <div className="contract-page__title">{page.title}</div>
            )}

            <div className="contract-copy">
              {page.sections.map((section, index) => (
                <div key={index} className={section.heading ? 'contract-section' : undefined}>
                  {section.heading && (
                    <h4 className="contract-section__heading">{section.heading}</h4>
                  )}

                  {section.body && (
                    <p className={section.isTitle ? 'contract-copy__title' : 'contract-copy__paragraph'}>
                      {section.body}
                    </p>
                  )}

                  {section.paragraphs?.map((paragraph, paragraphIndex) => (
                    <p
                      key={`${pageIndex}-${index}-paragraph-${paragraphIndex}`}
                      className="contract-copy__paragraph"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {section.listItems && section.listItems.length > 0 && (
                    <ol className="contract-copy__list">
                      {section.listItems.map((item, itemIndex) => (
                        <li key={`${pageIndex}-${index}-item-${itemIndex}`}>{item}</li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="contract-page contract-pdf-section">
          <div className="contract-page__title">Załącznik nr 1. Specyfikacja techniczna</div>

          <div className="contract-data-grid">
            <div className="contract-data-card">
              <span>Okleina / obicie</span>
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

          <div className="contract-signatures">
            <div className="signature-box">
              <div className="contract-line" />
              <span>Zamawiający</span>
            </div>
            <div className="signature-box">
              <div className="contract-line" />
              <span>Wykonawca</span>
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
