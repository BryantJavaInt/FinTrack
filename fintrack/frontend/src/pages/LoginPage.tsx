import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { FormField } from '../components/FormField'
import { useAuth } from '../auth/AuthContext'
import { login } from '../api/auth'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await login(email, password)
      signIn(data.token, data.email, data.fullName)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
        // sign_in
      </h2>
      <form onSubmit={handleSubmit}>
        <FormField label="Email" type="email" value={email}
          onChange={e => setEmail(e.target.value)} autoFocus required />
        <FormField label="Password" type="password" value={password}
          onChange={e => setPassword(e.target.value)} required />
        {error && (
          <div style={{ color: 'var(--expense)', fontSize: '0.8rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '0.65rem',
          background: loading ? 'var(--border)' : 'var(--accent)',
          color: '#000', border: 'none', borderRadius: 'var(--radius)',
          fontWeight: 600, fontFamily: 'var(--font-mono)',
          letterSpacing: '0.05em',
        }}>
          {loading ? 'SIGNING IN…' : 'SIGN IN'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </AuthLayout>
  )
}
