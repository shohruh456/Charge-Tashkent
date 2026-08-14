import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export function RequireAuth({ children, role }) {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (!user) return <Navigate to={`/register?next=${encodeURIComponent(location.pathname)}`} replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}
