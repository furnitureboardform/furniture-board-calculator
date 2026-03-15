import { useState } from 'react';
import Header from './components/Header';
import Step1Niche from './components/Step1Niche';
import Step2Boxes from './components/Step2Boxes';
import Step3BoxWidths from './components/Step3BoxWidths';
import ReportView from './components/ReportView';
import { runReport } from './lib';
import { useFormState, useBoxValidation, usePreviews } from './hooks';
import { buildParameters } from './utils/buildParameters';

export default function App() {
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState('');

  const form = useFormState();

  const validation = useBoxValidation({
    numberOfBoxes: form.numberOfBoxes,
    boxes: form.boxes,
    nicheWidthMm: form.nicheWidthMm,
    hasNiches: form.hasNiches,
    leftBlendMm: form.leftBlendMm,
    rightBlendMm: form.rightBlendMm,
    effectiveWardrobeWidthMm: form.effectiveWardrobeWidthMm,
    availableInteriorWidth: form.availableInteriorWidth,
    outerMaskingEnabled: form.outerMaskingEnabled,
  });

  const { wardrobePreview, shelvesPreview } = usePreviews({
    nicheWidthMm: form.nicheWidthMm,
    nicheHeightMm: form.nicheHeightMm,
    cabinetDepthMm: form.cabinetDepthMm,
    hasNiches: form.hasNiches,
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
      hasNiches: form.hasNiches,
      leftBlendMm: form.leftBlendMm,
      rightBlendMm: form.rightBlendMm,
      topBlendMm: form.topBlendMm,
      bottomBlendMm: form.bottomBlendMm,
      leftNicheHeightMm: form.leftNicheHeightMm,
      rightNicheHeightMm: form.rightNicheHeightMm,
      topNicheWidthMm: form.topNicheWidthMm,
      bottomNicheWidthMm: form.bottomNicheWidthMm,
    });
    const text = runReport(parameters);
    setReportText(text);
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
            reportText={reportText}
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
        </div>
        <Step1Niche
          active={form.step === 1}
          nicheWidthMm={form.nicheWidthMm}
          nicheHeightMm={form.nicheHeightMm}
          cabinetDepthMm={form.cabinetDepthMm}
          hasNiches={form.hasNiches}
          outerMaskingEnabled={form.outerMaskingEnabled}
          onOuterMaskingChange={form.setOuterMaskingEnabled}
          leftBlendMm={form.leftBlendMm}
          rightBlendMm={form.rightBlendMm}
          topBlendMm={form.topBlendMm}
          bottomBlendMm={form.bottomBlendMm}
          leftNicheHeightMm={form.leftNicheHeightMm}
          rightNicheHeightMm={form.rightNicheHeightMm}
          topNicheWidthMm={form.topNicheWidthMm}
          bottomNicheWidthMm={form.bottomNicheWidthMm}
          onNicheChange={form.onNicheChange}
          onHasNichesChange={form.onHasNichesChange}
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
          onSubmit={handleSubmit}
          validationMessage={validation.validationMessage}
          validationValid={validation.validationValid}
          shelvesPreview={shelvesPreview}
        />
      </main>
    </>
  );
}
