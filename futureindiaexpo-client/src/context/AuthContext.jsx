import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { api, TOKEN_KEY, tokenStore } from '../api/client'

export const AuthContext = createContext(null)

const EMPTY_SITE = { categories: [], subcategories: [], contact: null, headline: null }

/**
 * Replaces BaseController::$globalData — the category/sub-category menus, contact details,
 * headline, cart and wishlist that every PHP view received, plus the session facts the views
 * checked with session('isLoggedIn') / session('role') / session('mycurr').
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Without a stored token there is nothing to restore, so the session is settled immediately.
  const [ready, setReady] = useState(() => !tokenStore.get(TOKEN_KEY))
  const [site, setSite] = useState(EMPTY_SITE)
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])

  const loadUserData = useCallback(async () => {
    const [cartRes, wishRes] = await Promise.all([api.get('/account/cart'), api.get('/account/wishlist')])
    setCart(cartRes.data)
    setWishlist(wishRes.data)
  }, [])

  const clearSession = useCallback(() => {
    tokenStore.clear(TOKEN_KEY)
    setUser(null)
    setCart([])
    setWishlist([])
  }, [])

  useEffect(() => {
    let active = true
    api
      .get('/site')
      .then((res) => active && setSite(res.data))
      .catch(() => active && setSite(EMPTY_SITE))

    if (!tokenStore.get(TOKEN_KEY)) {
      return () => {
        active = false
      }
    }

    api
      .get('/auth/me')
      .then(async (res) => {
        if (!active) return
        setUser(res.data)
        await loadUserData()
      })
      .catch(() => active && clearSession())
      .finally(() => active && setReady(true))

    return () => {
      active = false
    }
  }, [clearSession, loadUserData])

  const login = useCallback(
    async (credentials) => {
      const { data } = await api.post('/auth/login', credentials)
      tokenStore.set(TOKEN_KEY, data.token)
      setUser(data.user)
      await loadUserData()
      return data.user
    },
    [loadUserData],
  )

  const addToCart = useCallback(async (alias, qty) => {
    const { data } = await api.post('/account/cart', { alias, qty })
    setCart(data)
    return data
  }, [])

  const addToWishlist = useCallback(async (alias) => {
    const { data } = await api.post('/account/wishlist', { alias })
    setWishlist(data)
    return data
  }, [])

  const value = useMemo(
    () => ({
      user,
      ready,
      // The PHP views gated prices, the cart and account pages on exactly this.
      isClient: Boolean(user),
      currency: user?.currency,
      site,
      cart,
      setCart,
      wishlist,
      setWishlist,
      login,
      logout: clearSession,
      addToCart,
      addToWishlist,
      refresh: loadUserData,
    }),
    [user, ready, site, cart, wishlist, login, clearSession, addToCart, addToWishlist, loadUserData],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
