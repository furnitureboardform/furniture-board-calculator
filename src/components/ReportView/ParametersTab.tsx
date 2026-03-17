import type { ParametersData } from '../../lib/report';

interface ParametersTabProps {
  parametersData: ParametersData;
}

export function ParametersTab({ parametersData }: ParametersTabProps) {
  return (
    <div className="elements-grid">
      {parametersData.groups.map((group) => (
        <div key={group.title} className="element-card">
          <div className="element-card__header">{group.title}</div>
          <div className="element-card__body">
            {group.rows.map((row) => (
              <div key={row.label} className="element-card__row">
                <span className="element-card__label">{row.label}</span>
                <span className="element-card__value">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
