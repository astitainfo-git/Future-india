import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// AuthClientCheck: anyone who is not a logged-in client is sent to the home page.
export default function RequireClient() {
  const { ready, isClient } = useAuth()
  if (!ready) return null
  return isClient ? <Outlet /> : <Navigate to="/" replace />
}
