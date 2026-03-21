interface HeaderProps {
  onGoToProjects?: () => void;
}

export default function Header({ onGoToProjects }: HeaderProps) {
  return (
    <header>
      <div className="header__inner">
        <div className="header__text">
          <h1>Kalkulator Mebli</h1>
          <p>Konfiguruj parametry krok po kroku</p>
        </div>
        {onGoToProjects && (
          <button className="header__projects-btn" onClick={onGoToProjects} title="Wróć do projektów">
            <span className="header__projects-btn-icon">&#8592;</span>
            <span className="header__projects-btn-label">Projekty</span>
          </button>
        )}
      </div>
    </header>
  );
}
