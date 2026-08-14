import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { Header } from './components/Header'
import { Dashboard } from './pages/Dashboard'
import { StationDetails } from './pages/StationDetails'
import { ManageStation } from './pages/ManageStation'
import { NotFound } from './pages/NotFound'
import { Register } from './pages/Register'
import { Admin } from './pages/Admin'
import { RequireAuth } from './components/RequireAuth'

export default function App() {
  const [isBooting, setIsBooting] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsBooting(false), 1100)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f6f8f7] text-slate-950 transition-colors dark:bg-[#07110d] dark:text-white">
        {isBooting && (
          <div className="site-loader fixed inset-0 z-[9999] grid place-items-center bg-[#f7faf8] dark:bg-[#07110d]" role="status" aria-live="polite" aria-label="Загрузка сайта">
            <div className="text-center">
              <div className="loader-logo mx-auto grid size-20 place-items-center rounded-[26px] bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30"><Zap size={36} fill="currentColor" /></div>
              <p className="mt-5 text-xl font-black tracking-tight">Charge <span className="text-emerald-500">Tashkent</span></p>
              <div className="loader-track mx-auto mt-5 h-1 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"><span className="block h-full rounded-full bg-emerald-500" /></div>
              <p className="mt-3 text-xs font-bold text-slate-400">Загружаем зарядные станции…</p>
            </div>
          </div>
        )}
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/stations/:stationId" element={<RequireAuth><StationDetails /></RequireAuth>} />
            <Route path="/register" element={<Register />} />
            <Route path="/manage" element={<RequireAuth><ManageStation /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth role="admin"><Admin /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
