import type { BoardFinish } from '../../lib/types';

export function getFinishTypeLabel(type: BoardFinish['type']): string {
  if (type === 'laminat') return 'Okleina laminat kolor';
  if (type === 'akryl') return 'Okleina akryl kolor';
  return 'Okleina laminat drewniana';
}
