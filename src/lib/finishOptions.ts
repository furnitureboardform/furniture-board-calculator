export interface FinishOption {
  readonly id: string;
  readonly label: string;
  readonly pricePerSheetPln: number;
  readonly swatchColor: string;
  readonly imageUrl?: string;
}

export const COLOR_OPTIONS: readonly FinishOption[] = [
  { id: 'U156', label: 'Egger U156 Beż piaskowy', pricePerSheetPln: 420.12, swatchColor: '#D6C0A8', imageUrl: '/finishes/color/U156.jpg' },
  { id: 'U963', label: 'Egger U963 Szary diamentowy', pricePerSheetPln: 642.12, swatchColor: '#7E8FA0', imageUrl: '/finishes/color/U963.jpg' },
  { id: 'U104', label: 'Egger U104 Alabaster', pricePerSheetPln: 512.34, swatchColor: '#EFEDE6', imageUrl: '/finishes/color/U104.jpg' },
];

export const VENEER_OPTIONS: readonly FinishOption[] = [
  { id: 'H3730', label: 'Egger H3730 Hikora naturalna', pricePerSheetPln: 260.23, swatchColor: '#8B6844', imageUrl: '/finishes/veneer/H3730.jpg' },
  { id: 'H1385', label: 'Egger H1385 Dąb Casella naturalny', pricePerSheetPln: 412.32, swatchColor: '#C09A6A', imageUrl: '/finishes/veneer/H1385.jpg' },
  { id: 'H1386', label: 'Egger H1386 Dąb Casella brązowy', pricePerSheetPln: 565.12, swatchColor: '#7A5534', imageUrl: '/finishes/veneer/H1386.jpg' },
];

export const ALL_FINISH_OPTIONS: ReadonlyMap<string, FinishOption> = new Map(
  [...COLOR_OPTIONS, ...VENEER_OPTIONS].map((o) => [o.id, o])
);
