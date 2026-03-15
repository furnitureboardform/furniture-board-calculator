export interface ReportViewProps {
  reportText: string;
  onBackToConfig: () => void;
}

export default function ReportView({ reportText, onBackToConfig }: ReportViewProps) {
  return (
    <>
      <div className="report">
        <h2>Lista zakupów</h2>
        <pre>{reportText}</pre>
      </div>
      <button type="button" className="btn btn-outline" onClick={onBackToConfig}>
        ← Wróć do konfiguracji
      </button>
    </>
  );
}
