import { useEffect, useState, useCallback, type ReactNode, type FormEvent } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useAuth } from '../auth/AuthContext'
import { getAccounts, getSummary, createAccount, createTransaction } from '../api/accounts'
import type { Account, Summary, Transaction } from '../types'
import { apiClient } from '../api/client'

const CURRENCIES = ['CHF', 'EUR', 'USD', 'GBP']

function fmt(n: number, currency: string) {
  return new Intl.NumberFormat('en-CH', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n)
}

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [baseCurrency, setBaseCurrency] = useState('CHF')
  const [recentTx, setRecentTx] = useState<Transaction[]>([])
  const [showNewAccount, setShowNewAccount] = useState(false)
  const [showNewTx, setShowNewTx] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)
  const [loadingAccounts, setLoadingAccounts] = useState(true)

  const loadAccounts = useCallback(async () => {
    const { data } = await getAccounts()
    setAccounts(data)
    setLoadingAccounts(false)
  }, [])

  const loadSummary = useCallback(async () => {
    const { data } = await getSummary(baseCurrency)
    setSummary(data)
  }, [baseCurrency])

  const loadRecentTx = useCallback(async (accs: Account[]) => {
    if (accs.length === 0) return
    // Fetch recent transactions from first account for demo; real app would aggregate
    const all = await Promise.all(
      accs.map(a => apiClient.get<{ content: Transaction[] }>(
        `/api/accounts/${a.id}/transactions?page=0&size=5`
      ).then(r => r.data.content))
    )
    const merged = all.flat().sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    ).slice(0, 10)
    setRecentTx(merged)
  }, [])

  useEffect(() => { loadAccounts() }, [loadAccounts])
  useEffect(() => { loadSummary() }, [loadSummary])
  useEffect(() => { if (accounts.length) loadRecentTx(accounts) }, [accounts, loadRecentTx])

  const chartData = summary
    ? Object.entries(summary.balancesByCurrency).map(([currency, balance]) => ({
        currency, balance: Number(balance),
      }))
    : []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top bar */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--accent)', letterSpacing: '0.05em' }}>
          FIN<span style={{ color: 'var(--text)' }}>TRACK</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user?.email}</span>
          <button onClick={signOut} style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-muted)', padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius)', fontSize: '0.75rem',
          }}>
            sign out
          </button>
        </div>
      </header>

      <main style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <Card title="NET WORTH">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', color: 'var(--accent)' }}>
                {summary ? fmt(summary.totalInBaseCurrency, baseCurrency) : '—'}
              </span>
              <select
                value={baseCurrency}
                onChange={e => setBaseCurrency(e.target.value)}
                style={{
                  background: 'var(--bg-input)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', padding: '0.2rem 0.4rem',
                  borderRadius: 'var(--radius)', fontSize: '0.75rem', cursor: 'pointer',
                }}
              >
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </Card>

          {summary && Object.entries(summary.balancesByCurrency).map(([cur, bal]) => (
            <Card key={cur} title={`BALANCE · ${cur}`}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '1.3rem',
                color: Number(bal) >= 0 ? 'var(--income)' : 'var(--expense)',
              }}>
                {fmt(Number(bal), cur)}
              </span>
            </Card>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Accounts */}
          <Card title="ACCOUNTS" action={
            <button onClick={() => setShowNewAccount(v => !v)} style={{
              background: 'transparent', border: '1px solid var(--accent)',
              color: 'var(--accent)', padding: '0.25rem 0.6rem',
              borderRadius: 'var(--radius)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
            }}>+ NEW</button>
          }>
            {showNewAccount && <NewAccountForm onCreated={() => { loadAccounts(); setShowNewAccount(false) }} />}
            {loadingAccounts ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Loading…</p>
            ) : accounts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No accounts yet.</p>
            ) : accounts.map(a => (
              <div key={a.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.5rem 0', borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <span style={{ fontWeight: 500 }}>{a.name}</span>
                  <span style={{
                    marginLeft: '0.5rem', fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem', color: 'var(--accent)', background: 'rgba(245,158,11,0.1)',
                    padding: '0.1rem 0.4rem', borderRadius: '3px',
                  }}>{a.currency}</span>
                </div>
                <button onClick={() => { setSelectedAccountId(a.id); setShowNewTx(true) }}
                  style={{
                    background: 'transparent', border: '1px solid var(--border)',
                    color: 'var(--text-muted)', padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius)', fontSize: '0.7rem',
                  }}>
                  + tx
                </button>
              </div>
            ))}
          </Card>

          {/* Chart */}
          <Card title="BALANCE BY CURRENCY">
            {chartData.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', paddingTop: '1rem' }}>No data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="currency" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4 }}
                    labelStyle={{ color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono', fontSize: 11 }}
                    itemStyle={{ color: 'var(--text)' }}
                    formatter={(value, _name, item) => {
                      const currency =
                        typeof item.payload?.currency === 'string'
                          ? item.payload.currency
                          : baseCurrency
                      return [fmt(Number(value), currency), 'balance']
                    }}
                  />
                  <Bar dataKey="balance" radius={[3, 3, 0, 0]}>
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.balance >= 0 ? 'var(--income)' : 'var(--expense)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* New transaction modal */}
        {showNewTx && selectedAccountId && (
          <NewTransactionModal
            accountId={selectedAccountId}
            onCreated={() => {
              loadSummary()
              loadRecentTx(accounts)
              setShowNewTx(false)
            }}
            onClose={() => setShowNewTx(false)}
          />
        )}

        {/* Recent transactions */}
        <Card title="RECENT TRANSACTIONS">
          {recentTx.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No transactions yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                  {['DATE', 'ACCOUNT', 'CATEGORY', 'TYPE', 'AMOUNT'].map(h => (
                    <th key={h} style={{ textAlign: h === 'AMOUNT' ? 'right' : 'left', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTx.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.45rem 0', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                      {new Date(tx.occurredAt).toLocaleDateString('en-CH')}
                    </td>
                    <td style={{ padding: '0.45rem 0.5rem' }}>{tx.accountName}</td>
                    <td style={{ padding: '0.45rem 0.5rem' }}>{tx.category}</td>
                    <td style={{ padding: '0.45rem 0.5rem' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                        color: tx.type === 'INCOME' ? 'var(--income)' : 'var(--expense)',
                        background: tx.type === 'INCOME' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        padding: '0.1rem 0.4rem', borderRadius: '3px',
                      }}>{tx.type}</span>
                    </td>
                    <td style={{
                      padding: '0.45rem 0', textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      color: tx.type === 'INCOME' ? 'var(--income)' : 'var(--expense)',
                    }}>
                      {tx.type === 'INCOME' ? '+' : '−'}{fmt(tx.amount, tx.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </main>
    </div>
  )
}

function Card({ title, children, action }: {
  title: string, children: ReactNode, action?: ReactNode
}) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '1rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          {title}
        </span>
        {action}
      </div>
      {children}
    </div>
  )
}

function NewAccountForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('CHF')
  const [saving, setSaving] = useState(false)

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await createAccount(name, currency)
    onCreated()
  }

  return (
    <form onSubmit={save} style={{
      display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '0.75rem',
      padding: '0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius)',
    }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Account name"
        required style={{
          flex: 1, background: 'var(--bg)', border: '1px solid var(--border)',
          color: 'var(--text)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius)',
        }} />
      <select value={currency} onChange={e => setCurrency(e.target.value)} style={{
        background: 'var(--bg)', border: '1px solid var(--border)',
        color: 'var(--text)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius)',
      }}>
        {CURRENCIES.map(c => <option key={c}>{c}</option>)}
      </select>
      <button type="submit" disabled={saving} style={{
        background: 'var(--accent)', color: '#000', border: 'none',
        padding: '0.4rem 0.75rem', borderRadius: 'var(--radius)',
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
      }}>
        {saving ? '…' : 'ADD'}
      </button>
    </form>
  )
}

function NewTransactionModal({ accountId, onCreated, onClose }: {
  accountId: number, onCreated: () => void, onClose: () => void
}) {
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await createTransaction(accountId, parseFloat(amount), type, category, description || undefined)
    onCreated()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '1.5rem', width: '360px',
      }}>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          // new_transaction
        </h3>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="Amount" type="number" step="0.01" min="0.01" required
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)' }} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['INCOME', 'EXPENSE'] as const).map(t => (
              <button key={t} type="button" onClick={() => setType(t)} style={{
                flex: 1, padding: '0.45rem',
                background: type === t ? (t === 'INCOME' ? 'var(--income)' : 'var(--expense)') : 'var(--bg-input)',
                color: type === t ? '#000' : 'var(--text-muted)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
              }}>{t}</button>
            ))}
          </div>
          <input value={category} onChange={e => setCategory(e.target.value)}
            placeholder="Category (e.g. Salary, Food)" required
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)' }} />
          <input value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Description (optional)"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)' }} />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '0.5rem', background: 'transparent',
              border: '1px solid var(--border)', color: 'var(--text-muted)',
              borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
            }}>CANCEL</button>
            <button type="submit" disabled={saving} style={{
              flex: 1, padding: '0.5rem', background: 'var(--accent)', color: '#000',
              border: 'none', borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
            }}>{saving ? '…' : 'SAVE'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

