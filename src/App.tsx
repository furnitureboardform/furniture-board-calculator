import { useState, useEffect } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './lib/firebase';
import { PasswordGate, isAuthenticated } from './components/PasswordGate';
import { ProjectsPage } from './components/ProjectsPage';
import Header from './components/Header';
import Step1Niche from './components/Step1Niche';
import Step2Boxes from './components/Step2Boxes';
import Step3BoxWidths from './components/Step3BoxWidths';
import { Step4BoardColor } from './components/Step4BoardColor';
import { ContractView } from './components/ContractView';
import { DashboardPage } from './components/DashboardPage';
import ReportView from './components/ReportView';
import { runReport } from './lib';
import { useFormState, useBoxValidation, usePreviews } from './hooks';
import { useFirestoreOptions } from './hooks/useFirestoreOptions';
import { useStep1Firestore } from './hooks/useStep1Firestore';
import { useStep2Firestore } from './hooks/useStep2Firestore';
import { useStep3Firestore } from './hooks/useStep3Firestore';
import { useStep4Firestore } from './hooks/useStep4Firestore';
import type { PositionedItem } from './components/WardrobeSchematic/types';
import { buildParameters } from './utils/buildParameters';

type FinalView = 'report' | 'contract';

export default function App() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [wardrobePlacedItems, setWardrobePlacedItems] = useState<Record<number, PositionedItem[]>>({});

  useEffect(() => {
    if (authenticated) {
      signInAnonymously(auth);
    }
  }, [authenticated]);
  const [showReport, setShowReport] = useState(false);
  const [finalView, setFinalView] = useState<FinalView>('report');
  const [reportParametersData, setReportParametersData] = useState<import('./lib/report').ParametersData | null>(null);
  const [reportText, setReportText] = useState('');
  const [reportSummaryText, setReportSummaryText] = useState('');
  const [reportElementsData, setReportElementsData] = useState<import('./lib/report').ElementsData | null>(null);
  const [reportHardwareSummary, setReportHardwareSummary] = useState<import('./lib/report').HardwareSummary | null>(null);

  const form = useFormState();

  const { saveStep1 } = useStep1Firestore(currentProjectId, {
    onNicheChange: form.onNicheChange,
    onHasSideNichesChange: form.onHasSideNichesChange,
    onHasTopBottomNichesChange: form.onHasTopBottomNichesChange,
    setOuterMaskingLeft: form.setOuterMaskingLeft,
    setOuterMaskingRight: form.setOuterMaskingRight,
    setOuterMaskingLeftFullCover: form.setOuterMaskingLeftFullCover,
    setOuterMaskingRightFullCover: form.setOuterMaskingRightFullCover,
  });

  const { saveStep2 } = useStep2Firestore(currentProjectId, form.onNumberOfBoxesChange);

  const { saveStep3, step3Ready } = useStep3Firestore({
    projectId: currentProjectId,
    onLoaded: (boxes, placedItems) => {
      boxes.forEach((box, i) => {
        form.onBoxChange(i, 'width', box.width);
        form.onBoxChange(i, 'doubleDoor', box.doubleDoor);
        form.onBoxChange(i, 'shelves', box.shelves);
        form.onBoxChange(i, 'shelvesMm', box.shelvesMm);
        form.onBoxChange(i, 'rods', box.rods);
        form.onBoxChange(i, 'drawers', box.drawers);
        form.onBoxChange(i, 'partitions', box.partitions);
        form.onBoxChange(i, 'nadstawkaMm', box.nadstawkaMm);
      });
      setWardrobePlacedItems(placedItems);
    },
  });

  const { saveStep4 } = useStep4Firestore({
    projectId: currentProjectId,
    setBoardFinish: form.setBoardFinish,
    setDoorHandle: form.setDoorHandle,
    setTransportCostPln: form.setTransportCostPln,
    setCustomElementsCostPln: form.setCustomElementsCostPln,
    setDiscountPln: form.setDiscountPln,
    setDiscountPercent: form.setDiscountPercent,
  });

  const { finishes, handles, finishesMap, handlesMap, loading: optionsLoading } = useFirestoreOptions();

  const handleStep1Next = (step: number) => {
    saveStep1({
      nicheWidthMm: form.nicheWidthMm,
      nicheHeightMm: form.nicheHeightMm,
      cabinetDepthMm: form.cabinetDepthMm,
      hasSideNiches: form.hasSideNiches,
      hasTopBottomNiches: form.hasTopBottomNiches,
      leftBlendMm: form.leftBlendMm,
      rightBlendMm: form.rightBlendMm,
      topBlendMm: form.topBlendMm,
      bottomBlendMm: form.bottomBlendMm,
      outerMaskingLeft: form.outerMaskingLeft,
      outerMaskingRight: form.outerMaskingRight,
      outerMaskingLeftFullCover: form.outerMaskingLeftFullCover,
      outerMaskingRightFullCover: form.outerMaskingRightFullCover,
    });
    form.setStep(step);
  };

  const handleStep2Next = (step: number) => {
    saveStep2({ numberOfBoxes: form.numberOfBoxes });
    form.setStep(step);
  };

  const handleStep3Next = (step: number) => {
    saveStep3(form.boxes, wardrobePlacedItems);
    form.setStep(step);
  };

  const validation = useBoxValidation({
    numberOfBoxes: form.numberOfBoxes,
    boxes: form.boxes,
    nicheWidthMm: form.nicheWidthMm,
    hasNiches: form.hasSideNiches || form.hasTopBottomNiches,
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
    const selectedHandle = handlesMap.get(form.doorHandle.optionId);
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
      doorEdgeWidthReductionMm: selectedHandle?.isEdge ? (selectedHandle.edgeWidthMm ?? 0) : 0,
    });
    const { parametersData, mainText, summaryText, elementsData, hardwareSummary } = runReport(parameters);
    const selectedFinish = finishesMap.get(form.boardFinish.optionId);
    const enrichedParametersData = {
      ...parametersData,
      groups: [
        ...parametersData.groups,
        {
          title: 'Wykończenie',
          rows: [
            { label: 'Typ', value: form.boardFinish.type === 'laminat' ? 'Laminat' : form.boardFinish.type === 'akryl' ? 'Akryl' : 'Okleina' },
            { label: 'Wybór', value: selectedFinish?.label ?? form.boardFinish.optionId },
            { label: 'Cena za m²', value: selectedFinish ? `${selectedFinish.pricePerSqmPln.toFixed(2)} zł/m²` : '—' },
            { label: 'Uchwyt', value: selectedHandle?.label ?? form.doorHandle.optionId },
            { label: 'Cena uchwytu', value: selectedHandle ? `${selectedHandle.pricePln.toFixed(2)} zł/szt.` : '—' },
          ],
        },
      ],
    };
    setReportParametersData(enrichedParametersData);
    setReportText(mainText);
    setReportSummaryText(summaryText);
    setReportElementsData(elementsData);
    setReportHardwareSummary(hardwareSummary);
    setFinalView('report');
    setShowReport(true);
    window.scrollTo(0, 0);
  }

  function handleBackToConfig() {
    setFinalView('report');
    setShowReport(false);
  }

  function handleOpenContract() {
    setFinalView('contract');
    window.scrollTo(0, 0);
  }

  function handleBackToReport() {
    setFinalView('report');
    window.scrollTo(0, 0);
  }

  if (showReport) {
    return (
      <>
        <Header onGoToProjects={() => { setShowReport(false); form.setStep(1); setCurrentProjectId(null); }} />
        <main>
          {finalView === 'report' ? (
            <ReportView
              parametersData={reportParametersData}
              reportText={reportText}
              summaryText={reportSummaryText}
              elementsData={reportElementsData}
              hardwareSummary={reportHardwareSummary}
              boardFinish={form.boardFinish}
              doorHandle={form.doorHandle}
              discountPln={form.discountPln}
              onDiscountPlnChange={form.setDiscountPln}
              discountPercent={form.discountPercent}
              onDiscountPercentChange={form.setDiscountPercent}
              transportCostPln={form.transportCostPln}
              onTransportCostPlnChange={form.setTransportCostPln}
              customElementsCostPln={form.customElementsCostPln}
              onCustomElementsCostPlnChange={form.setCustomElementsCostPln}
              onSaveFinancials={({ transportCostPln, customElementsCostPln, discountPln, discountPercent, clientPriceAfterDiscount }) => {
                saveStep4(form.boardFinish, form.doorHandle, transportCostPln, customElementsCostPln, discountPln, discountPercent, clientPriceAfterDiscount);
              }}
              onBackToConfig={handleBackToConfig}
              onOpenContract={handleOpenContract}
              finishesMap={finishesMap}
              handlesMap={handlesMap}
            />
          ) : (
            <ContractView
              elementsData={reportElementsData}
              hardwareSummary={reportHardwareSummary}
              boardFinish={form.boardFinish}
              doorHandle={form.doorHandle}
              discountPln={form.discountPln}
              discountPercent={form.discountPercent}
              boxes={form.boxes}
              numberOfBoxes={form.numberOfBoxes}
              nicheWidthMm={form.nicheWidthMm}
              nicheHeightMm={form.nicheHeightMm}
              cabinetDepthMm={form.cabinetDepthMm}
              hasSideNiches={form.hasSideNiches}
              leftBlendMm={form.leftBlendMm}
              rightBlendMm={form.rightBlendMm}
              topBlendMm={form.topBlendMm}
              bottomBlendMm={form.bottomBlendMm}
              outerMaskingLeft={form.outerMaskingLeft}
              outerMaskingRight={form.outerMaskingRight}
              onBackToReport={handleBackToReport}
              finishesMap={finishesMap}
              handlesMap={handlesMap}
            />
          )}
        </main>
      </>
    );
  }

  if (!authenticated) {
    return (
      <PasswordGate
        onAuthenticated={() => setAuthenticated(true)}
      />
    );
  }

  if (!currentProjectId) {
    if (showDashboard) {
      return <DashboardPage onBack={() => setShowDashboard(false)} />;
    }
    return <ProjectsPage
      onSelectProject={(id) => {
        form.setStep(1);
        setWardrobePlacedItems({});
        setCurrentProjectId(id);
      }}
      onCreateProject={(id) => {
        form.resetForm();
        setWardrobePlacedItems({});
        setCurrentProjectId(id);
      }}
      onDashboard={() => setShowDashboard(true)}
    />;
  }

  return (
    <>
      <Header onGoToProjects={() => setCurrentProjectId(null)} />
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
          onGoToStep={handleStep1Next}
          onGoToProjects={() => setCurrentProjectId(null)}
          wardrobePreview={wardrobePreview}
        />
        <Step2Boxes
          active={form.step === 2}
          numberOfBoxes={form.numberOfBoxes}
          onNumberOfBoxesChange={form.onNumberOfBoxesChange}
          onGoToStep={handleStep2Next}
        />
        <Step3BoxWidths
          active={form.step === 3}
          numberOfBoxes={form.numberOfBoxes}
          boxes={form.boxes}
          splitEqually={form.splitEqually}
          onSplitEquallyChange={form.setSplitEqually}
          onBoxChange={form.onBoxChange}
          onGoToStep={handleStep3Next}
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
          initialPlacedItems={wardrobePlacedItems}
          onPlacedItemsChange={setWardrobePlacedItems}
          key={step3Ready ? `${currentProjectId}-ready` : `${currentProjectId}-init`}
        />
        <Step4BoardColor
          active={form.step === 4}
          finish={form.boardFinish}
          onFinishChange={form.setBoardFinish}
          handleSelection={form.doorHandle}
          onHandleChange={form.setDoorHandle}
          onGoToStep={form.setStep}
          onSubmit={() => {
            saveStep4(form.boardFinish, form.doorHandle, form.transportCostPln, form.customElementsCostPln, form.discountPln, form.discountPercent);
            handleSubmit();
          }}
          finishes={finishes}
          handles={handles}
          optionsLoading={optionsLoading}
        />
      </main>
    </>
  );
}
