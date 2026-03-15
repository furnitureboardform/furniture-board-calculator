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
  /** Gdy true, w komunikacie OK pokazujemy odjęcie 2×OUTER_MASKING_SIDE_MM */
  outerMaskingEnabled: boolean;
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
  hasNiches: boolean;
  leftBlendMm: number;
  rightBlendMm: number;
  numberOfBoxes: number;
  outerMaskingEnabled: boolean;
}): string {
  const {
    nicheWidthMm,
    hasNiches,
    leftBlendMm,
    rightBlendMm,
    numberOfBoxes: n,
    outerMaskingEnabled,
  } = params;

  // Szerokość wnęki (baza, przed jakimikolwiek odjęciami)
  const base = nicheWidthMm;

  // Odjęcie blend lewej i prawej – blendy zmniejszają użyteczną szerokość szafy
  const leftBlend = hasNiches ? leftBlendMm : 0;
  const rightBlend = hasNiches ? rightBlendMm : 0;

  // Odjęcie na boki skrzyń: każdy box ma dwa boki (lewy + prawy), każdy po SIDE_PANEL_THICKNESS_MM (18 mm)
  const sidePanelsDeduction = `${n}×(2×${SIDE_PANEL_THICKNESS_MM})`;

  // Odjęcie na maskownice zewnętrzne (2×18 mm), albo 0 gdy użytkownik je wyłączył
  const outerMaskingStr = outerMaskingEnabled
    ? `2×${OUTER_MASKING_SIDE_MM}`
    : '0';

  return `${base} - ${leftBlend} - ${rightBlend} - ${sidePanelsDeduction} - ${outerMaskingStr}`;
}

export function getBoxValidation(input: BoxValidationInput): BoxValidationResult {
  const {
    numberOfBoxes: n,
    boxes,
    nicheWidthMm,
    hasNiches,
    leftBlendMm,
    rightBlendMm,
    effectiveWardrobeWidthMm,
    availableInteriorWidth,
    outerMaskingEnabled,
  } = input;

  const total = boxes.reduce((sum, b) => sum + (b.width || 0), 0);

  if (n <= 0 || nicheWidthMm <= 0 || effectiveWardrobeWidthMm <= 0) {
    return { validationValid: false, validationMessage: null };
  }

  const diff = availableInteriorWidth - total;

  if (diff === 0) {
    const formula = formatAvailableWidthFormula({
      nicheWidthMm,
      hasNiches,
      leftBlendMm,
      rightBlendMm,
      numberOfBoxes: n,
      outerMaskingEnabled,
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
