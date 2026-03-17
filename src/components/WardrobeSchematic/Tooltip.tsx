import type { TooltipState } from './types';

interface TooltipProps {
  tooltip: TooltipState;
}

export function Tooltip({ tooltip }: TooltipProps) {
  const [title, ...lines] = tooltip.text.split('\n');
  return (
    <div
      style={{
        position: 'fixed',
        left: tooltip.x,
        top: tooltip.y,
        backgroundColor: '#fff',
        color: '#333',
        padding: '10px 14px',
        borderRadius: 8,
        fontSize: 12,
        lineHeight: '1.7',
        pointerEvents: 'none',
        boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
        zIndex: 20,
        whiteSpace: 'nowrap',
        border: '1px solid #dde1ea',
        minWidth: 140,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13, color: '#1a1a2e' }}>{title}</div>
      {lines.map((line, i) => {
        const [label, val] = line.split(': ');
        return (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ color: '#888' }}>{label}</span>
            <span style={{ fontWeight: 600, color: '#333' }}>{val}</span>
          </div>
        );
      })}
    </div>
  );
}
