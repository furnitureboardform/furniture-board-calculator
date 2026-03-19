import type { BoardFinish } from '../../lib/types';

export function getFinishTypeLabel(type: BoardFinish['type']): string {
  if (type === 'laminat') return 'Okleina laminat obicie';
  if (type === 'akryl') return 'Okleina akryl obicie';
  return 'Okleina laminat drewniana';
}
