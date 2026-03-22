export interface HandleOption {
  readonly id: string;
  readonly label: string;
  readonly brand: string;
  readonly pricePln: number;
  readonly imageUrl?: string;
  readonly isEdge?: boolean;
  readonly edgeWidthMm?: number;
}