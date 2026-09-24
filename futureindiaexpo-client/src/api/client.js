import axios from 'axios'

export const TOKEN_KEY = 'fie_token'
export const ADMIN_TOKEN_KEY = 'fie_admin_token'

// localStorage can throw in private windows or when site data is blocked.
export const tokenStore = {
  get(key) {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value)
    } catch {
      return
    }
  },
  clear(key) {
    try {
      localStorage.removeItem(key)
    } catch {
      return
    }
  },
}

const keyFor = (url = '') => (url.startsWith('/admin') ? ADMIN_TOKEN_KEY : TOKEN_KEY)

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

api.interceptors.request.use((config) => {
  const token = tokenStore.get(keyFor(config.url))
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(undefined, (error) => {
  const url = error.config?.url ?? ''
  if (error.response?.status === 401 && !url.startsWith('/auth/')) tokenStore.clear(keyFor(url))
  return Promise.reject(error)
})

export const errorMessage = (err) => err?.response?.data?.message || err?.message || 'Something went wrong'

// Same path the PHP templates used: base_url() + assets/welcome/images/<folder>/<file>.
const IMAGES = '/assets/welcome/images'
export const imageUrl = (folder, name) => (name ? `${IMAGES}${folder ? `/${folder}` : ''}/${name}` : '')
