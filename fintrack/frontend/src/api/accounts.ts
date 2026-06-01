import { apiClient } from './client'
import type { Account, Transaction, Page, Summary } from '../types'

export const getAccounts = () =>
  apiClient.get<Account[]>('/api/accounts')

export const createAccount = (name: string, currency: string) =>
  apiClient.post<Account>('/api/accounts', { name, currency })

export const getTransactions = (accountId: number, page = 0, size = 20) =>
  apiClient.get<Page<Transaction>>(`/api/accounts/${accountId}/transactions`, {
    params: { page, size },
  })

export const createTransaction = (
  accountId: number,
  amount: number,
  type: 'INCOME' | 'EXPENSE',
  category: string,
  description?: string,
) =>
  apiClient.post<Transaction>(`/api/accounts/${accountId}/transactions`, {
    amount,
    type,
    category,
    description,
  })

export const getSummary = (baseCurrency: string) =>
  apiClient.get<Summary>('/api/summary', { params: { baseCurrency } })
