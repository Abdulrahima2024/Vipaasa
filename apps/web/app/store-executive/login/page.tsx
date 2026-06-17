'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const styles: Record<string, Record<string, string | number>> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'linear-gradient(180deg, #f4f7f5 0%, #e8efe9 100%)',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    borderRadius: '30px',
    background: '#ffffff',
    boxShadow: '0 24px 80px rgba(15, 23, 42, 0.12)',
    padding: '40px',
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: 700,
    color: '#0f172a',
  },
  subtitle: {
    margin: '12px 0 28px',
    color: '#475569',
    lineHeight: 1.6,
  },
  input: {
    width: '100%',
    padding: '16px 18px',
    borderRadius: '16px',
    border: '1px solid #d1d5db',
    marginBottom: '16px',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '16px',
    borderRadius: '16px',
    border: 'none',
    backgroundColor: '#166534',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
  },
  error: {
    color: '#b91c1c',
    fontSize: '0.95rem',
    marginBottom: '16px',
  },
};

export default function StoreExecutiveLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    router.push('/store-executive');
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Store Executive Login</h1>
        <p style={styles.subtitle}>Enter your email and password to access the executive dashboard.</p>
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
          />
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" style={styles.button}>
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
