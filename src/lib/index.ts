import { calculateHardware, calculateDoorRequirements, calculateShelvesRequirements } from './calculations';
import {
  getWoodenBoards,
  getHDFBottom,
  getBoardsData,
  getBoardsSummary,
  getNicheBoards,
} from './boards';
import { buildReport } from './report';
import type { ReportResult } from './report';
import type { Parameters } from './types';

/**
 * Uruchamia pełny pipeline obliczeń i zwraca teksty raportu.
 */
export function runReport(parameters: Parameters): ReportResult {
  try {
    const woodenBoards = getWoodenBoards(parameters);
    const hdfBottom = getHDFBottom(parameters);
    const allBoards = getBoardsData(parameters);
    const boardsSummary = getBoardsSummary(allBoards);
    const nicheBoards = getNicheBoards(parameters);
    const hardware = calculateHardware(parameters);
    const doorRequirements = calculateDoorRequirements(parameters);
    const shelvesRequirements = calculateShelvesRequirements(parameters);
    return buildReport(
      parameters,
      hardware,
      woodenBoards,
      hdfBottom,
      boardsSummary,
      nicheBoards,
      doorRequirements,
      shelvesRequirements
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const emptyNiches = { hasNiches: false, left: { widthMm: 0, heightMm: 0 }, right: { widthMm: 0, heightMm: 0 }, top: { widthMm: 0, heightMm: 0 }, bottom: { widthMm: 0, heightMm: 0 } };
    return {
      parametersData: { groups: [] },
      mainText: `Błąd podczas generowania raportu:\n${message}`,
      summaryText: '',
      elementsData: { boxes: [], niches: emptyNiches, maskings: null },
      hardwareSummary: { totalGuides: 0, totalBrackets: 0, totalHandles: 0, totalLegs: 0 },
    };
  }
}

// Re-export types for consumers
export type { Parameters, BoxForm, NicheFieldName } from './types';
