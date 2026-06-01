import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function FormField({ label, error, ...inputProps }: Props) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{
        display: 'block',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '0.4rem',
      }}>
        {label}
      </label>
      <input
        {...inputProps}
        style={{
          width: '100%',
          background: 'var(--bg-input)',
          border: `1px solid ${error ? 'var(--expense)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          color: 'var(--text)',
          padding: '0.6rem 0.75rem',
          outline: 'none',
          transition: 'border-color 0.15s',
          ...inputProps.style,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent2)' }}
        onBlur={e => { e.currentTarget.style.borderColor = error ? 'var(--expense)' : 'var(--border)' }}
      />
      {error && (
        <div style={{ color: 'var(--expense)', fontSize: '0.75rem', marginTop: '0.3rem' }}>
          {error}
        </div>
      )}
    </div>
  )
}
