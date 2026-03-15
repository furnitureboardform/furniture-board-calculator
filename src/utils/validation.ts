import { SIDE_PANEL_THICKNESS_MM, OUTER_MASKING_SIDE_MM } from '../constants';

export interface BoxValidationInput {
  numberOfBoxes: number;
  boxes: { width: number }[];
  nicheWidthMm: number;
  hasNiches: boolean;
  leftBlendMm: number;
  rightBlendMm: number;
  effectiveWardrobeWidthMm: number;
  availableInteriorWidth: number;
  outerMaskingLeft: boolean;
  outerMaskingRight: boolean;
  hasSideNiches: boolean;
}

export interface BoxValidationResult {
  validationValid: boolean;
  validationMessage: string | null;
}

/**
 * Buduje opis wzoru na dostępną szerokość wnętrz boxów (do komunikatu walidacji OK).
 * Wyjaśnia, co jest odejmowane od szerokości wnęki i dlaczego.
 */
function formatAvailableWidthFormula(params: {
  nicheWidthMm: number;
  hasSideNiches: boolean;
  leftBlendMm: number;
  rightBlendMm: number;
  numberOfBoxes: number;
  outerMaskingLeft: boolean;
  outerMaskingRight: boolean;
}): string {
  const {
    nicheWidthMm,
    hasSideNiches,
    leftBlendMm,
    rightBlendMm,
    numberOfBoxes: n,
    outerMaskingLeft,
    outerMaskingRight,
  } = params;

  const base = nicheWidthMm;
  const leftBlend = hasSideNiches ? leftBlendMm : 0;
  const rightBlend = hasSideNiches ? rightBlendMm : 0;
  const sidePanelsDeduction = `${n}×(2×${SIDE_PANEL_THICKNESS_MM})`;

  const maskCount = (outerMaskingLeft ? 1 : 0) + (outerMaskingRight ? 1 : 0);
  const outerMaskingStr =
    maskCount === 2 ? `2×${OUTER_MASKING_SIDE_MM}` : maskCount === 1 ? `${OUTER_MASKING_SIDE_MM}` : '0';

  return `${base} - ${leftBlend} - ${rightBlend} - ${sidePanelsDeduction} - ${outerMaskingStr}`;
}

export function getBoxValidation(input: BoxValidationInput): BoxValidationResult {
  const {
    numberOfBoxes: n,
    boxes,
    nicheWidthMm,
    hasSideNiches,
    leftBlendMm,
    rightBlendMm,
    effectiveWardrobeWidthMm,
    availableInteriorWidth,
    outerMaskingLeft,
    outerMaskingRight,
  } = input;

  const total = boxes.reduce((sum, b) => sum + (b.width || 0), 0);

  if (n <= 0 || nicheWidthMm <= 0 || effectiveWardrobeWidthMm <= 0) {
    return { validationValid: false, validationMessage: null };
  }

  const diff = availableInteriorWidth - total;

  if (diff === 0) {
    const formula = formatAvailableWidthFormula({
      nicheWidthMm,
      hasSideNiches,
      leftBlendMm,
      rightBlendMm,
      numberOfBoxes: n,
      outerMaskingLeft,
      outerMaskingRight,
    });
    return {
      validationValid: true,
      validationMessage: `OK. Suma szerokości wnętrz boxów = ${total} mm (dostępne: ${availableInteriorWidth} mm = ${formula}).`,
    };
  }

  if (diff > 0) {
    return {
      validationValid: false,
      validationMessage: `Za mało. Zostało jeszcze ${diff} mm do rozdzielenia między boxy. Dostępne łącznie: ${availableInteriorWidth} mm.`,
    };
  }

  return {
    validationValid: false,
    validationMessage: `Za dużo. Przekroczono dostępne miejsce o ${Math.abs(diff)} mm. Dostępne łącznie: ${availableInteriorWidth} mm.`,
  };
}
