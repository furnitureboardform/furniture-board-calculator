import type { BoardEntry } from './utils';

interface BoardsSectionProps {
  title: string;
  colorClass: string;
  boards: BoardEntry[];
}

export function BoardsSection({ title, colorClass, boards }: BoardsSectionProps) {
  if (boards.length === 0) return null;
  return (
    <div className="boards-summary-section">
      <div className={`boards-summary-section__header ${colorClass}`}>{title}</div>
      <table className="boards-summary-table">
        <thead>
          <tr>
            <th>Wymiary (mm)</th>
            <th>Ilość</th>
            <th>Obrzeże</th>
          </tr>
        </thead>
        <tbody>
          {boards.map((b, i) => (
            <tr key={i}>
              <td>{b.dim1} × {b.dim2}</td>
              <td>{b.qty} szt.</td>
              <td>{b.edgeBanding}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
