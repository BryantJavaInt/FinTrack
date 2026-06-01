import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { FormField } from '../components/FormField'
import { useAuth } from '../auth/AuthContext'
import { register } from '../api/auth'

export function RegisterPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      const { data } = await register(email, password, fullName)
      signIn(data.token, data.email, data.fullName)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
        // create_account
      </h2>
      <form onSubmit={handleSubmit}>
        <FormField label="Full Name" type="text" value={fullName}
          onChange={e => setFullName(e.target.value)} autoFocus required />
        <FormField label="Email" type="email" value={email}
          onChange={e => setEmail(e.target.value)} required />
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
          {loading ? 'CREATING…' : 'CREATE ACCOUNT'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
