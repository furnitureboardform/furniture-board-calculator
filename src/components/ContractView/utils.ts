import type { BoardFinish } from '../../lib/types';

export function getFinishTypeLabel(type: BoardFinish['type']): string {
  if (type === 'laminat') return 'Laminat';
  if (type === 'akryl') return 'Akryl';
  return 'Okleina';
}
