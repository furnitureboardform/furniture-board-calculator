export interface ContractSection {
  heading?: string;
  body: string;
  isTitle?: boolean;
}

export interface ContractTemplateData {
  finishTypeLabel: string;
  finishLabel: string;
  handleLabel: string;
  nicheWidthMm: number;
  nicheHeightMm: number;
  cabinetDepthMm: number;
  totalAmountPln: number;
  depositAmountPln: number;
}

export function buildContractTemplate(data: ContractTemplateData): ContractSection[] {
  return [
    {
      body: 'UMOWA WYKONANIA ZABUDOWY MEBLOWEJ',
      isTitle: true,
    },
    {
      body: 'Zawarta pomiędzy Wykonawcą, którego dane zostaną uzupełnione przed podpisaniem dokumentu, a Zamawiającym w ramach indywidualnego zamówienia na wykonanie mebli na wymiar.',
    },
    {
      heading: '§ 1. Przedmiot umowy',
      body: `Przedmiotem niniejszej umowy jest wykonanie oraz przygotowanie do montażu zabudowy meblowej (szafy wnękowej) o następujących wymiarach zewnętrznych: szerokość ${data.nicheWidthMm} mm × wysokość ${data.nicheHeightMm} mm × głębokość ${data.cabinetDepthMm} mm, zgodnie z projektem zaakceptowanym przez Zamawiającego.`,
    },
    {
      heading: '§ 2. Specyfikacja wykończenia',
      body: `Wykonawca zobowiązuje się zrealizować zamówienie zgodnie z zaakceptowaną przez Zamawiającego specyfikacją techniczną. Wykończenie frontów oraz elementów widocznych: ${data.finishTypeLabel} — ${data.finishLabel}. Zastosowany uchwyt: ${data.handleLabel}. Szczegółowy model graficzny stanowi Załącznik techniczny do niniejszej umowy.`,
    },
    {
      heading: '§ 3. Wynagrodzenie',
      body: `Łączna kwota wynagrodzenia Wykonawcy za realizację przedmiotu umowy wynosi ${data.totalAmountPln} zł brutto. Zaliczka wynosi ${data.depositAmountPln} zł brutto. Kwota obejmuje wykonanie i przygotowanie zabudowy do montażu zgodnie z zaakceptowanym projektem oraz specyfikacją techniczną. Szczegółowy harmonogram płatności zostanie uzgodniony przez Strony przed podpisaniem umowy.`,
    },
    {
      heading: '§ 4. Oświadczenie Zamawiającego',
      body: 'Zamawiający oświadcza, że zapoznał się z przedstawionym modelem graficznym, dokonał wyboru wykończenia i uchwytów oraz akceptuje całość konfiguracji i jej specyfikację techniczną stanowiącą integralną część niniejszej umowy.',
    },
    {
      heading: '§ 5. Warunki realizacji',
      body: 'Termin realizacji, szczegółowy harmonogram płatności, warunki dostawy oraz montażu zostaną uzgodnione przez Strony i uzupełnione pisemnie przed złożeniem przez Zamawiającego podpisu na niniejszym dokumencie.',
    },
  ];
}