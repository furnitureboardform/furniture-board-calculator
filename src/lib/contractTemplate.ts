export interface ContractTemplateData {
  finishTypeLabel: string;
  finishLabel: string;
  handleLabel: string;
  numberOfBoxes: number;
  nicheWidthMm: number;
  nicheHeightMm: number;
  cabinetDepthMm: number;
  totalAmountPln: number;
}

export function buildContractTemplate(data: ContractTemplateData): string {
  return [
    'UMOWA WYKONANIA ZABUDOWY MEBLOWEJ',
    'Zawarta pomiędzy Wykonawcą a Zamawiającym, którego dane zostaną uzupełnione przed podpisaniem dokumentu.',
    `Przedmiotem umowy jest wykonanie oraz przygotowanie do montażu szafy o wymiarach ${data.nicheWidthMm} × ${data.nicheHeightMm} × ${data.cabinetDepthMm} mm, w konfiguracji ${data.numberOfBoxes} boxów.`,
    `Wykończenie frontów i elementów widocznych: ${data.finishTypeLabel} — ${data.finishLabel}. Zastosowany uchwyt: ${data.handleLabel}.`,
    `Łączna kwota umowy wynosi ${data.totalAmountPln} zł. Kwota obejmuje wykonanie zabudowy zgodnie z zaakceptowanym modelem oraz specyfikacją przedstawioną w aplikacji.`,
    'Zamawiający oświadcza, że zapoznał się z przedstawionym modelem, doborem uchwytów i wykończenia oraz akceptuje całość konfiguracji.',
    'Termin realizacji, warunki płatności oraz warunki montażu zostaną uzupełnione przez strony przed podpisaniem dokumentu.',
  ].join('\n\n');
}