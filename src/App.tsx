import { useState } from 'react';
import Header from './components/Header';
import Step1Niche from './components/Step1Niche';
import Step2Boxes from './components/Step2Boxes';
import Step3BoxWidths from './components/Step3BoxWidths';
import { Step4BoardColor } from './components/Step4BoardColor';
import { ALL_FINISH_OPTIONS } from './lib/finishOptions';
import ReportView from './components/ReportView';
import { runReport } from './lib';
import { useFormState, useBoxValidation, usePreviews } from './hooks';
import { buildParameters } from './utils/buildParameters';

export default function App() {
  const [showReport, setShowReport] = useState(false);
  const [reportParametersData, setReportParametersData] = useState<import('./lib/report').ParametersData | null>(null);
  const [reportText, setReportText] = useState('');
  const [reportSummaryText, setReportSummaryText] = useState('');
  const [reportElementsData, setReportElementsData] = useState<import('./lib/report').ElementsData | null>(null);
  const [reportHardwareSummary, setReportHardwareSummary] = useState<import('./lib/report').HardwareSummary | null>(null);

  const form = useFormState();

  const validation = useBoxValidation({
    numberOfBoxes: form.numberOfBoxes,
    boxes: form.boxes,
    nicheWidthMm: form.nicheWidthMm,
    hasSideNiches: form.hasSideNiches,
    leftBlendMm: form.leftBlendMm,
    rightBlendMm: form.rightBlendMm,
    effectiveWardrobeWidthMm: form.effectiveWardrobeWidthMm,
    availableInteriorWidth: form.availableInteriorWidth,
    outerMaskingLeft: form.outerMaskingLeft,
    outerMaskingRight: form.outerMaskingRight,
  });

  const { wardrobePreview, shelvesPreview } = usePreviews({
    nicheWidthMm: form.nicheWidthMm,
    nicheHeightMm: form.nicheHeightMm,
    cabinetDepthMm: form.cabinetDepthMm,
    hasSideNiches: form.hasSideNiches,
    hasTopBottomNiches: form.hasTopBottomNiches,
    leftBlendMm: form.leftBlendMm,
    rightBlendMm: form.rightBlendMm,
    topBlendMm: form.topBlendMm,
    bottomBlendMm: form.bottomBlendMm,
    numberOfBoxes: form.numberOfBoxes,
    boxes: form.boxes,
  });

  function handleSubmit() {
    if (!validation.validationValid) return;
    const parameters = buildParameters({
      boxes: form.boxes,
      numberOfBoxes: form.numberOfBoxes,
      nicheWidthMm: form.nicheWidthMm,
      nicheHeightMm: form.nicheHeightMm,
      cabinetDepthMm: form.cabinetDepthMm,
      hasNiches: form.hasSideNiches || form.hasTopBottomNiches,
      leftBlendMm: form.leftBlendMm,
      rightBlendMm: form.rightBlendMm,
      topBlendMm: form.topBlendMm,
      bottomBlendMm: form.bottomBlendMm,
      leftNicheHeightMm: form.leftNicheHeightMm,
      rightNicheHeightMm: form.rightNicheHeightMm,
      topNicheWidthMm: form.topNicheWidthMm,
      bottomNicheWidthMm: form.bottomNicheWidthMm,
      outerMaskingLeft: form.outerMaskingLeft,
      outerMaskingRight: form.outerMaskingRight,
      outerMaskingLeftFullCover: form.outerMaskingLeftFullCover,
      outerMaskingRightFullCover: form.outerMaskingRightFullCover,
    });
    const { parametersData, mainText, summaryText, elementsData, hardwareSummary } = runReport(parameters);
    const selectedFinish = ALL_FINISH_OPTIONS.get(form.boardFinish.optionId);
    const enrichedParametersData = {
      ...parametersData,
      groups: [
        ...parametersData.groups,
        {
          title: 'Wykończenie',
          rows: [
            { label: 'Typ', value: form.boardFinish.type === 'laminat' ? 'Okleina laminat kolor' : form.boardFinish.type === 'akryl' ? 'Okleina akryl kolor' : 'Okleina laminat drewniana' },
            { label: 'Wybór', value: selectedFinish?.label ?? form.boardFinish.optionId },
            { label: 'Cena arkusza', value: selectedFinish ? `${selectedFinish.pricePerSheetPln.toFixed(2)} zł` : '—' },
          ],
        },
      ],
    };
    setReportParametersData(enrichedParametersData);
    setReportText(mainText);
    setReportSummaryText(summaryText);
    setReportElementsData(elementsData);
    setReportHardwareSummary(hardwareSummary);
    setShowReport(true);
    window.scrollTo(0, 0);
  }

  function handleBackToConfig() {
    setShowReport(false);
  }

  if (showReport) {
    return (
      <>
        <Header />
        <main>
          <ReportView
            parametersData={reportParametersData}
            reportText={reportText}
            summaryText={reportSummaryText}
            elementsData={reportElementsData}
            hardwareSummary={reportHardwareSummary}
            boardFinish={form.boardFinish}
            onBackToConfig={handleBackToConfig}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        <div className="steps-indicator">
          <span className={form.step >= 1 ? 'done' : ''} />
          <span className={form.step >= 2 ? 'done' : ''} />
          <span className={form.step >= 3 ? 'done' : ''} />
          <span className={form.step >= 4 ? 'done' : ''} />
        </div>
        <Step1Niche
          active={form.step === 1}
          nicheWidthMm={form.nicheWidthMm}
          nicheHeightMm={form.nicheHeightMm}
          cabinetDepthMm={form.cabinetDepthMm}
          hasSideNiches={form.hasSideNiches}
          onHasSideNichesChange={form.onHasSideNichesChange}
          hasTopBottomNiches={form.hasTopBottomNiches}
          onHasTopBottomNichesChange={form.onHasTopBottomNichesChange}
          outerMaskingLeft={form.outerMaskingLeft}
          onOuterMaskingLeftChange={form.setOuterMaskingLeft}
          outerMaskingLeftFullCover={form.outerMaskingLeftFullCover}
          onOuterMaskingLeftFullCoverChange={form.setOuterMaskingLeftFullCover}
          outerMaskingRight={form.outerMaskingRight}
          onOuterMaskingRightChange={form.setOuterMaskingRight}
          outerMaskingRightFullCover={form.outerMaskingRightFullCover}
          onOuterMaskingRightFullCoverChange={form.setOuterMaskingRightFullCover}
          leftBlendMm={form.leftBlendMm}
          rightBlendMm={form.rightBlendMm}
          topBlendMm={form.topBlendMm}
          bottomBlendMm={form.bottomBlendMm}
          leftNicheHeightMm={form.leftNicheHeightMm}
          rightNicheHeightMm={form.rightNicheHeightMm}
          topNicheWidthMm={form.topNicheWidthMm}
          bottomNicheWidthMm={form.bottomNicheWidthMm}
          onNicheChange={form.onNicheChange}
          onGoToStep={form.setStep}
          wardrobePreview={wardrobePreview}
        />
        <Step2Boxes
          active={form.step === 2}
          numberOfBoxes={form.numberOfBoxes}
          onNumberOfBoxesChange={form.onNumberOfBoxesChange}
          onGoToStep={form.setStep}
        />
        <Step3BoxWidths
          active={form.step === 3}
          numberOfBoxes={form.numberOfBoxes}
          boxes={form.boxes}
          splitEqually={form.splitEqually}
          onSplitEquallyChange={form.setSplitEqually}
          onBoxChange={form.onBoxChange}
          onGoToStep={form.setStep}
          validationMessage={validation.validationMessage}
          validationValid={validation.validationValid}
          shelvesPreview={shelvesPreview}
          nicheWidthMm={form.nicheWidthMm}
          nicheHeightMm={form.nicheHeightMm}
          outerMaskingLeft={form.outerMaskingLeft}
          outerMaskingRight={form.outerMaskingRight}
          hasSideNiches={form.hasSideNiches}
          leftBlendMm={form.leftBlendMm}
          rightBlendMm={form.rightBlendMm}
          leftNicheHeightMm={form.leftNicheHeightMm}
          rightNicheHeightMm={form.rightNicheHeightMm}
          topBlendMm={form.topBlendMm}
          bottomBlendMm={form.bottomBlendMm}
        />
        <Step4BoardColor
          active={form.step === 4}
          finish={form.boardFinish}
          onFinishChange={form.setBoardFinish}
          onGoToStep={form.setStep}
          onSubmit={handleSubmit}
        />
      </main>
    </>
  );
}
