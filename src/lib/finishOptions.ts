import type { FinishType } from './types';

export interface FinishOption {
  readonly id: string;
  readonly label: string;
  readonly brand: string;
  readonly type: FinishType;
  readonly pricePerSqmPln: number;
  readonly swatchColor?: string;
  readonly imageUrl?: string;
}
