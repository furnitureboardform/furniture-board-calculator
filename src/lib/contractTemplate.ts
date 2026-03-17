export interface ContractSection {
  heading?: string;
  body?: string;
  paragraphs?: string[];
  listItems?: string[];
  isTitle?: boolean;
}

export interface ContractTemplatePage {
  title?: string;
  sections: ContractSection[];
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

export const CONTRACTOR_PARTY_DETAILS = {
  fullName: 'Damian Sulewski',
  companyName: 'Damian Sulewski',
  businessAddress:
    'ul. Mińska 45/1, 03-808 Warszawa, pow. Warszawa, gm. Warszawa, woj. MAZOWIECKIE, Polska',
  nip: '7123415624',
  regon: '388325402',
} as const;

function roundToWholePln(amount: number): number {
  return Math.round(amount);
}

export function buildContractTemplate(data: ContractTemplateData): ContractTemplatePage[] {
  const remainingAmountPln = Math.max(0, data.totalAmountPln - data.depositAmountPln);
  const installationInstallmentPln = roundToWholePln(remainingAmountPln * 0.8);
  const completionInstallmentPln = Math.max(0, remainingAmountPln - installationInstallmentPln);

  return [
    {
      sections: [
        {
          body: 'UMOWA WYKONANIA ZABUDOWY MEBLOWEJ',
          isTitle: true,
        },
        {
          body: 'Strony zgodnie oświadczają, że dane identyfikujące Wykonawcę i Zamawiającego wskazane w części wstępnej niniejszego dokumentu stanowią integralną część Umowy, a ilekroć w dalszej treści mowa jest o Stronach, należy przez to rozumieć łącznie Wykonawcę i Zamawiającego.',
        },
        {
          heading: '§ 1. Przedmiot Umowy',
          listItems: [
            `Przedmiotem niniejszej Umowy jest wykonanie, dostawa oraz montaż zabudowy meblowej na wymiar o następujących wymiarach zewnętrznych: szerokość ${data.nicheWidthMm} mm, wysokość ${data.nicheHeightMm} mm, głębokość ${data.cabinetDepthMm} mm.`,
            'Przedmiot Umowy zostanie wykonany zgodnie z projektem, konfiguracją i ustaleniami zaakceptowanymi przez Zamawiającego przed rozpoczęciem realizacji.',
            'Załącznik nr 1 do niniejszej Umowy stanowi specyfikacja techniczna wraz z modelem graficznym zabudowy i stanowi integralną część Umowy.',
          ],
        },
        {
          heading: '§ 2. Specyfikacja Techniczna',
          listItems: [
            `Wykonawca zobowiązuje się wykonać przedmiot Umowy zgodnie z zaakceptowaną przez Zamawiającego specyfikacją techniczną. Wykończenie frontów oraz elementów widocznych: ${data.finishTypeLabel} — ${data.finishLabel}.`,
            `W ramach realizacji zostanie zastosowany uchwyt: ${data.handleLabel}.`,
            'Po akceptacji projektu i specyfikacji wszelkie zmiany zakresu, materiałów, wymiarów lub wyposażenia wymagają uzgodnienia co najmniej w formie dokumentowej i mogą skutkować odpowiednią zmianą wynagrodzenia oraz terminu realizacji.',
            'Wykonawca zastrzega możliwość zastosowania rozwiązań technicznie równoważnych, jeżeli jest to konieczne dla prawidłowego wykonania zabudowy i nie pogarsza uzgodnionych cech użytkowych ani estetycznych przedmiotu Umowy.',
          ],
        },
        {
          heading: '§ 3. Wynagrodzenie i Zasady Płatności',
          listItems: [
            `Łączna kwota wynagrodzenia należnego Wykonawcy z tytułu należytego wykonania przedmiotu Umowy wynosi ${data.totalAmountPln} zł brutto i obejmuje wykonanie, przygotowanie do montażu oraz standardowe materiały i okucia wynikające z zaakceptowanego projektu.`,
            `Zaliczka na poczet materiałów i rozpoczęcia realizacji wynosi ${data.depositAmountPln} zł brutto i jest płatna przy podpisaniu Umowy albo w terminie uzgodnionym przez Strony. Pozostała kwota ${remainingAmountPln} zł brutto podlega rozliczeniu w kolejnych etapach realizacji.`,
            `I rata: ${data.depositAmountPln} zł brutto, płatna po podpisaniu Umowy jako zaliczka materiałowa.`,
            `II rata: ${installationInstallmentPln} zł brutto, płatna przed rozpoczęciem montażu albo najpóźniej w dniu rozpoczęcia prac montażowych.`,
            `III rata: ${completionInstallmentPln} zł brutto, płatna w dniu zakończenia montażu i odbioru zabudowy.`,
            'Prace dodatkowe, których potrzeba ujawni się po pomiarze, w toku produkcji lub montażu, a które nie wynikają z zaakceptowanego projektu podstawowego, są rozliczane odrębnie po uprzedniej akceptacji Zamawiającego.',
            'Opóźnienie w zapłacie uprawnia Wykonawcę do wstrzymania realizacji do czasu uregulowania należności oraz dochodzenia odsetek ustawowych za opóźnienie, jeżeli są należne.',
          ],
        },
        {
          heading: '§ 4. Termin Realizacji i Pomiar',
          listItems: [
            'Termin rozpoczęcia montażu oraz przewidywany termin zakończenia realizacji są ustalane indywidualnie przez Strony i mogą zostać doprecyzowane po końcowym pomiarze albo potwierdzeniu dostępności materiałów.',
            'W przypadku ujawnienia podczas pomiaru lub montażu rozbieżności pomiędzy stanem faktycznym lokalu a danymi przekazanymi przy zamówieniu Wykonawca jest uprawniony do skorygowania wymiarów elementów, o ile nie zmienia to zaakceptowanej funkcji i charakteru zabudowy.',
            'Bieg terminu realizacji ulega odpowiedniemu przedłużeniu o czas opóźnień spowodowanych w szczególności brakiem dostępu do lokalu, nieprzygotowaniem pomieszczeń, opóźnieniem płatności, koniecznością wykonania prac dodatkowych, opóźnieniem dostaw materiałów niezależnym od Wykonawcy albo działaniem siły wyższej.',
          ],
        },
      ],
    },
    {
      title: 'Warunki Ogólne',
      sections: [
        {
          heading: '§ 5. Warunki Realizacji i Montażu',
          listItems: [
            'Cena obejmuje standardowy montaż w miejscu realizacji. Prace dodatkowe, w tym niwelowanie nierówności ścian, podłóg i sufitów, przeróbki budowlane lub elektryczne, nie są objęte wynagrodzeniem, chyba że Strony postanowią inaczej w odrębnym uzgodnieniu.',
            'Warunki transportu, wniesienia oraz ewentualne dopłaty za utrudniony dostęp do lokalu są ustalane indywidualnie przed montażem.',
            'Brak wpłaty którejkolwiek z uzgodnionych rat może wstrzymać rozpoczęcie albo kontynuację realizacji do czasu uregulowania należności.',
            'Zamawiający odpowiada za przygotowanie miejsca montażu, w tym za zakończenie prac mokrych i budowlanych, zabezpieczenie wyposażenia oraz zapewnienie bezpiecznych warunków pracy.',
            'Jeżeli uzgodniony termin montażu nie dojdzie do skutku z przyczyn leżących po stronie Zamawiającego, Wykonawca może wyznaczyć nowy termin oraz obciążyć Zamawiającego rzeczywiście poniesionymi kosztami dodatkowego transportu, dojazdu lub magazynowania.',
          ],
        },
        {
          heading: '§ 6. Odbiór Przedmiotu Umowy',
          listItems: [
            'Po zakończeniu montażu Strony dokonują odbioru przedmiotu Umowy, w miarę możliwości potwierdzonego protokołem odbioru albo inną utrwaloną formą potwierdzenia wykonania prac.',
            'Protokół odbioru, o ile zostanie sporządzony, stanowi Załącznik nr 2 do Umowy i dokumentuje stan wykonanych prac na dzień odbioru.',
            'Wady lub usterki nieistotne, które nie uniemożliwiają normalnego korzystania z zabudowy zgodnie z jej przeznaczeniem, nie stanowią podstawy do odmowy odbioru, a Wykonawca usuwa je w uzgodnionym terminie.',
          ],
        },
        {
          heading: '§ 7. Rezygnacja i Własność Przedmiotu Umowy',
          listItems: [
            'W przypadku rezygnacji przez Zamawiającego po wykonaniu pomiaru, projektu lub zamówieniu materiałów Wykonawca może potrącić poniesione i należycie wykazane koszty przygotowawcze, projektowe, materiałowe oraz organizacyjne z wpłaconych kwot.',
            'Materiały i elementy wykonywane według indywidualnej specyfikacji Zamawiającego, które zostały już zamówione lub wykonane, nie podlegają zwrotowi, a ich koszt obciąża Zamawiającego w zakresie dopuszczalnym przez przepisy prawa.',
            'Do czasu zapłaty pełnego wynagrodzenia zamontowane elementy pozostają własnością Wykonawcy, o ile bezwzględnie obowiązujące przepisy nie stanowią inaczej.',
          ],
        },
        {
          heading: '§ 8. Reklamacje i Gwarancja',
          listItems: [
            'Zamawiający zobowiązuje się zgłosić wady lub niezgodności niezwłocznie po ich stwierdzeniu, wraz z opisem problemu oraz dokumentem potwierdzającym zawarcie Umowy lub odbiór zabudowy.',
            'Wykonawca udziela gwarancji na wykonane elementy i zastosowane okucia w zakresie wynikającym z ich prawidłowego użytkowania.',
            'Gwarancja nie obejmuje naturalnych różnic rysunku i odcienia materiałów, uszkodzeń mechanicznych, skutków niewłaściwego użytkowania, działania wilgoci, wysokiej temperatury, wad wynikających z krzywizn ścian lub podłóg niewchodzących w zakres zlecenia ani prac prowadzonych przez osoby trzecie po montażu.',
            'Postanowienia dotyczące gwarancji nie wyłączają ani nie ograniczają uprawnień Zamawiającego będącego konsumentem, jeżeli takie uprawnienia przysługują mu na podstawie bezwzględnie obowiązujących przepisów prawa.',
          ],
        },
        {
          heading: '§ 9. Obowiązki Zamawiającego',
          listItems: [
            'Zamawiający zapewni dostęp do lokalu, możliwość wniesienia elementów oraz warunki techniczne niezbędne do prowadzenia montażu.',
            'Na czas montażu Zamawiający zapewni dostęp do energii elektrycznej oraz podstawowego zaplecza sanitarnego.',
            'Zamawiający ponosi odpowiedzialność za uzyskanie wymaganych zgód administracyjnych, wspólnotowych lub technicznych, jeżeli są konieczne do wykonania prac w lokalu.',
            'Zamawiający oświadcza, że zapoznał się z przedstawionym modelem graficznym, dokonał wyboru wykończenia i uchwytów oraz akceptuje całość konfiguracji i jej specyfikację techniczną stanowiącą integralną część niniejszej umowy.',
          ],
        },
        {
          heading: '§ 10. Postanowienia Końcowe',
          listItems: [
            'Wszelkie zmiany niniejszej Umowy wymagają co najmniej formy dokumentowej, chyba że przepis bezwzględnie obowiązującego prawa wymaga zachowania formy szczególnej.',
            'W sprawach nieuregulowanych niniejszą Umową zastosowanie mają właściwe przepisy Kodeksu cywilnego oraz inne powszechnie obowiązujące przepisy prawa.',
            'Załącznik nr 1 w postaci specyfikacji technicznej oraz modelu graficznego, a także Załącznik nr 2 w postaci protokołu odbioru, o ile zostanie sporządzony, stanowią integralną część niniejszej Umowy.',
            'Umowę sporządzono w dwóch jednobrzmiących egzemplarzach, po jednym dla każdej ze Stron.',
          ],
        },
      ],
    },
  ];
}