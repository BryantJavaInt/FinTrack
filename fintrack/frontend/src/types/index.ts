export interface AuthResponse {
  token: string
  email: string
  fullName: string
}

export interface Account {
  id: number
  name: string
  currency: string
  createdAt: string
}

export interface Transaction {
  id: number
  accountId: number
  accountName: string
  currency: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  description: string | null
  occurredAt: string
}

export interface Summary {
  balancesByCurrency: Record<string, number>
  totalInBaseCurrency: number
  baseCurrency: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
