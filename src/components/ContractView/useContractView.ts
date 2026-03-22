import { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { FinishOption } from '../../lib/finishOptions';
import type { HandleOption } from '../../lib/handleOptions';
import { buildContractTemplate } from '../../lib/contractTemplate';
import { calculatePricingSummary } from '../../lib/pricing';
import type { ElementsData, HardwareSummary } from '../../lib/report';
import type { BoardFinish, DoorHandleSelection } from '../../lib/types';
import { getFinishTypeLabel } from './utils';

interface UseContractViewParams {
  readonly elementsData: ElementsData | null;
  readonly hardwareSummary: HardwareSummary | null;
  readonly boardFinish: BoardFinish;
  readonly doorHandle: DoorHandleSelection;
  readonly discountPln: number;
  readonly discountPercent: number;
  readonly nicheWidthMm: number;
  readonly nicheHeightMm: number;
  readonly cabinetDepthMm: number;
  readonly selectedFinish: FinishOption | undefined;
  readonly selectedHandle: HandleOption | undefined;
}

export function useContractView({
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
}: UseContractViewParams) {
  const contractRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const pricing = useMemo(
    () => calculatePricingSummary(elementsData, hardwareSummary, boardFinish, doorHandle, discountPln, discountPercent, 0, 0, selectedFinish?.pricePerSqmPln, selectedHandle?.pricePln),
    [elementsData, hardwareSummary, boardFinish, doorHandle, discountPln, discountPercent, selectedFinish, selectedHandle]
  );

  const contractPages = buildContractTemplate({
    finishTypeLabel: getFinishTypeLabel(boardFinish.type),
    finishLabel: selectedFinish?.label ?? boardFinish.optionId,
    handleLabel: selectedHandle?.label ?? doorHandle.optionId,
    nicheWidthMm,
    nicheHeightMm,
    cabinetDepthMm,
    totalAmountPln: pricing.clientPriceAfterDiscount,
    depositAmountPln: pricing.materialsDeposit,
  });

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

  return {
    contractRef,
    isGeneratingPdf,
    selectedFinish,
    selectedHandle,
    pricing,
    contractPages,
    handleGeneratePdf,
  };
}
