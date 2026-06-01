import { apiClient } from './client'
import type { AuthResponse } from '../types'

export const register = (email: string, password: string, fullName: string) =>
  apiClient.post<AuthResponse>('/api/auth/register', { email, password, fullName })

export const login = (email: string, password: string) =>
  apiClient.post<AuthResponse>('/api/auth/login', { email, password })
