import type { PaletteConfig } from './types';

export const PALETTE: PaletteConfig[] = [
  { type: 'shelves',   label: 'Półka',      icon: '━', fill: 'rgba(59,130,246,0.10)',  stroke: '#3b7dd8', heightMm: 22,  boardMm: 18  },
  { type: 'rods',      label: 'Drążek',     icon: '◎', fill: 'rgba(217,119,6,0.10)',   stroke: '#c97c10', heightMm: 50,  boardMm: 0   },
  { type: 'drawers',   label: 'Szuflada',   icon: '▭', fill: 'rgba(22,163,74,0.10)',   stroke: '#16a34a', heightMm: 160, boardMm: 160 },
  { type: 'partition', label: 'Przegroda',  icon: '┃', fill: 'rgba(147,51,234,0.10)',  stroke: '#9333ea', heightMm: 0,   boardMm: 0   },
  { type: 'nadstawka', label: 'Nadstawka',  icon: '═', fill: 'rgba(180,83,9,0.18)',    stroke: '#b45309', heightMm: 18,  boardMm: 18  },
];

export const PANEL_MM = 18;

export const SVG_W = 660;
export const SVG_H = 440;
export const ML = 46;
export const MT = 28;
export const MR = 16;
export const MB = 32;

export const SNAP_MM = 10;
export const GAP_MM  = 3;

export const COLORS = {
  mask:     '#bcc3d0',
  niche:    '#2e7a50',
  panel:    '#8492b0',
  box:      '#3b6db0',
  blend:    '#a06820',
  dim:      '#444',
  dimFaint: '#999',
};
