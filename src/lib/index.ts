import { calculateHardware, calculateDoorRequirements, calculateShelvesRequirements } from './calculations';
import {
  getWoodenBoards,
  getHDFBottom,
  getBoardsData,
  getBoardsSummary,
  getNicheBoards,
} from './boards';
import { buildReport } from './report';
import type { Parameters } from './types';

/**
 * Uruchamia pełny pipeline obliczeń i zwraca tekst raportu.
 */
export function runReport(parameters: Parameters): string {
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
    return `Błąd podczas generowania raportu:\n${message}`;
  }
}

// Re-export types for consumers
export type { Parameters, BoxForm, NicheFieldName } from './types';
