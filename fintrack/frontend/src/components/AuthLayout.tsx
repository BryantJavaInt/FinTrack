import type { ReactNode } from 'react'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
      }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.5rem',
            fontWeight: 500,
            color: 'var(--accent)',
            letterSpacing: '0.05em',
          }}>
            FIN<span style={{ color: 'var(--text)' }}>TRACK</span>
          </span>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            multi-currency finance manager
          </div>
        </div>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '2rem',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}
