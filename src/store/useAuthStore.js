import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const ADMIN_EMAIL = 'admin@charge.uz'
const ADMIN_PASSWORD = 'admin123'

export const useAuthStore = create(persist((set) => ({
  user: null,
  register: ({ name, email, role = 'user', company = '', phone = '' }) => set({ user: { id: crypto.randomUUID(), name, email: email.toLowerCase(), role, company, phone, createdAt: new Date().toISOString() } }),
  loginAdmin: ({ email, password }) => {
    if (email.toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) return false
    set({ user: { id: 'charge-admin', name: 'Charge Admin', email: ADMIN_EMAIL, role: 'admin' } })
    return true
  },
  logout: () => set({ user: null }),
}), { name: 'charge-tashkent-auth' }))
