export interface HandleOption {
  readonly id: string;
  readonly label: string;
  readonly brand: string;
  readonly pricePln: number;
  readonly imageUrl: string;
  readonly isEdge?: boolean;
  readonly edgeWidthMm?: number;
}

export const HANDLE_OPTIONS: readonly HandleOption[] = [
  {
    id: 'UZ_NYXA_320',
    label: 'UZ NYXA 320',
    brand: 'GTV',
    pricePln: 25,
    imageUrl: `${import.meta.env.BASE_URL}finishes/handle/UZ_NYXA_320.jpg`,
  },
   {
    id: 'REJS_LENTIS_700_800',
    label: 'REJS LENTIS 700/800',
    brand: 'REJS',
    pricePln: 28,
    isEdge: true,
    edgeWidthMm: 1,
    imageUrl: `${import.meta.env.BASE_URL}finishes/handle/REJS_LENTIS_700_800.jpg`,
  },
];

export const ALL_HANDLE_OPTIONS: ReadonlyMap<string, HandleOption> = new Map(
  HANDLE_OPTIONS.map((option) => [option.id, option])
);