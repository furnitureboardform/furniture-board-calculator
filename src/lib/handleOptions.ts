export interface HandleOption {
  readonly id: string;
  readonly label: string;
  readonly brand: string;
  readonly pricePln: number;
  readonly imageUrl: string;
}

export const HANDLE_OPTIONS: readonly HandleOption[] = [
  {
    id: 'UZ_NYXA_320',
    label: 'UZ NYXA 320',
    brand: 'GTV',
    pricePln: 25,
    imageUrl: '/finishes/handle/UZ_NYXA_320.jpg',
  },
];

export const ALL_HANDLE_OPTIONS: ReadonlyMap<string, HandleOption> = new Map(
  HANDLE_OPTIONS.map((option) => [option.id, option])
);