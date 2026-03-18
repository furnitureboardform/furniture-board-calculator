export interface FinishOption {
  readonly id: string;
  readonly label: string;
  readonly brand: string;
  readonly pricePerSqmPln: number;
  readonly swatchColor: string;
  readonly imageUrl?: string;
}

export const COLOR_OPTIONS: readonly FinishOption[] = [
  { id: 'U156', label: 'U156 Beż piaskowy', brand: 'Egger', pricePerSqmPln: 52.30, swatchColor: '#D6C0A8', imageUrl: '/finishes/laminate/U156.jpg' },
  { id: 'U963', label: 'U963 Szary diamentowy', brand: 'Egger', pricePerSqmPln: 61.80, swatchColor: '#7E8FA0', imageUrl: '/finishes/laminate/U963.jpg' },
  { id: 'U104', label: 'U104 Alabaster', brand: 'Egger', pricePerSqmPln: 48.75, swatchColor: '#EFEDE6', imageUrl: '/finishes/laminate/U104.jpg' },
  { id: 'SU0197', label: 'SU0197 Szary Chinchilla', brand: 'Kronospan', pricePerSqmPln: 46.05, swatchColor: '#9E9E9E', imageUrl: '/finishes/laminate/SU0197.jpg' },
  { id: 'PU1207SG', label: 'PU1207 SG Szary Gołębi', brand: 'Woodeco', pricePerSqmPln: 56.99, swatchColor: '#8E9EAD', imageUrl: '/finishes/laminate/PU1207SG.jpg' },
];

export const VENEER_OPTIONS: readonly FinishOption[] = [
  { id: 'H3730', label: 'H3730 Hikora naturalna', brand: 'Egger', pricePerSqmPln: 49.20, swatchColor: '#8B6844', imageUrl: '/finishes/veneer/H3730.jpg' },
  { id: 'H1385', label: 'H1385 Dąb Casella naturalny', brand: 'Egger', pricePerSqmPln: 55.60, swatchColor: '#C09A6A', imageUrl: '/finishes/veneer/H1385.jpg' },
  { id: 'H1386', label: 'H1386 Dąb Casella brązowy', brand: 'Egger', pricePerSqmPln: 68.40, swatchColor: '#7A5534', imageUrl: '/finishes/veneer/H1386.jpg' },
];

export const ACRYLIC_OPTIONS: readonly FinishOption[] = [
  { id: 'REHAU1918L', label: '1918L Cappuccino', brand: 'REHAU', pricePerSqmPln: 115.50, swatchColor: '#7B5B3A', imageUrl: '/finishes/acrylic/1918L.jpg' },
];

export const ALL_FINISH_OPTIONS: ReadonlyMap<string, FinishOption> = new Map(
  [...COLOR_OPTIONS, ...VENEER_OPTIONS, ...ACRYLIC_OPTIONS].map((o) => [o.id, o])
);
