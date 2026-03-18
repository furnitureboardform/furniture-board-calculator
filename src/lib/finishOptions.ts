export interface FinishOption {
  readonly id: string;
  readonly label: string;
  readonly pricePerSqmPln: number;
  readonly swatchColor: string;
  readonly imageUrl?: string;
}

export const COLOR_OPTIONS: readonly FinishOption[] = [
  { id: 'U156', label: 'Egger U156 Beż piaskowy', pricePerSqmPln: 52.30, swatchColor: '#D6C0A8', imageUrl: '/finishes/color/U156.jpg' },
  { id: 'U963', label: 'Egger U963 Szary diamentowy', pricePerSqmPln: 61.80, swatchColor: '#7E8FA0', imageUrl: '/finishes/color/U963.jpg' },
  { id: 'U104', label: 'Egger U104 Alabaster', pricePerSqmPln: 48.75, swatchColor: '#EFEDE6', imageUrl: '/finishes/color/U104.jpg' },
  { id: 'SU0197', label: 'Szary Chinchilla SU0197', pricePerSqmPln: 46.05, swatchColor: '#9E9E9E', imageUrl: '/finishes/color/SU0197.jpg' },
];

export const VENEER_OPTIONS: readonly FinishOption[] = [
  { id: 'H3730', label: 'Egger H3730 Hikora naturalna', pricePerSqmPln: 49.20, swatchColor: '#8B6844', imageUrl: '/finishes/veneer/H3730.jpg' },
  { id: 'H1385', label: 'Egger H1385 Dąb Casella naturalny', pricePerSqmPln: 55.60, swatchColor: '#C09A6A', imageUrl: '/finishes/veneer/H1385.jpg' },
  { id: 'H1386', label: 'Egger H1386 Dąb Casella brązowy', pricePerSqmPln: 68.40, swatchColor: '#7A5534', imageUrl: '/finishes/veneer/H1386.jpg' },
];

export const ACRYLIC_OPTIONS: readonly FinishOption[] = [
  { id: 'REHAU1918L', label: 'REHAU 1918L Cappuccino', pricePerSqmPln: 115.50, swatchColor: '#7B5B3A', imageUrl: '/finishes/acrylic/1918L.jpg' },
];

export const ALL_FINISH_OPTIONS: ReadonlyMap<string, FinishOption> = new Map(
  [...COLOR_OPTIONS, ...VENEER_OPTIONS, ...ACRYLIC_OPTIONS].map((o) => [o.id, o])
);
