import { createContext, useContext, useState, type ReactNode } from 'react'
import { tokenStore } from '../api/client'

interface AuthUser {
  email: string
  fullName: string
}

interface AuthContextValue {
  user: AuthUser | null
  signIn: (token: string, email: string, fullName: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  const signIn = (token: string, email: string, fullName: string) => {
    tokenStore.set(token)
    setUser({ email, fullName })
  }

  const signOut = () => {
    tokenStore.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
