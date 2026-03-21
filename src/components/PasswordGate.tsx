import { useState } from 'react';

const COOKIE_NAME = 'fg_auth';
const PASSWORD = 'Mocnehaslo123!';

function setCookie(name: string, value: string, days: number): void {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}

function getCookie(name: string): string | null {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

export function isAuthenticated(): boolean {
  return getCookie(COOKIE_NAME) === 'true';
}

interface PasswordGateProps {
  readonly onAuthenticated: () => void;
}

export function PasswordGate({ onAuthenticated }: PasswordGateProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === PASSWORD) {
      setCookie(COOKIE_NAME, 'true', 30);
      onAuthenticated();
    } else {
      setError(true);
      setValue('');
    }
  };

  return (
    <div style={styles.overlay}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Furniture Board Calculator</h2>
        <p style={styles.subtitle}>Wprowadź hasło, aby kontynuować</p>
        <input
          type="password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          placeholder="Hasło"
          autoFocus
          style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
        />
        {error && <p style={styles.errorText}>Nieprawidłowe hasło</p>}
        <button type="submit" style={styles.button}>
          Wejdź
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    maxWidth: '340px',
    padding: '40px 32px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#1a1a2e',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#888',
    textAlign: 'center',
    marginBottom: '4px',
  },
  input: {
    padding: '10px 14px',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    outline: 'none',
  },
  inputError: {
    borderColor: '#e53935',
  },
  errorText: {
    fontSize: '0.8rem',
    color: '#e53935',
    marginTop: '-4px',
  },
  button: {
    padding: '10px',
    fontSize: '1rem',
    fontWeight: 600,
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '4px',
  },
};
