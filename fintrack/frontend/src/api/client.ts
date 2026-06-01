import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT from in-memory store on every request
apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// In-memory token store — never persisted to localStorage
const tokenStore = (() => {
  let _token: string | null = null
  return {
    get: () => _token,
    set: (t: string) => { _token = t },
    clear: () => { _token = null },
  }
})()

export { apiClient, tokenStore }
