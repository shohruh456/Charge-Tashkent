import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, X, AlertCircle } from 'lucide-react'
import { registerToastListener } from '../services/toast'

export function Toaster() {
  const [items, setItems] = useState([])
  const push = useCallback((message, type) => {
    const id = Date.now() + Math.random()
    setItems((current) => [...current, { id, message, type }])
    setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 3500)
  }, [])
  useEffect(() => { registerToastListener(push); return () => registerToastListener(null) }, [push])
  return (
      <div className="fixed bottom-[max(84px,calc(env(safe-area-inset-bottom)+76px))] left-3 right-3 z-[1100] flex max-w-sm flex-col gap-2 sm:bottom-5 sm:left-auto sm:right-5 sm:w-[calc(100%-2.5rem)]">
        {items.map((item) => (
          <div key={item.id} className="animate-toast flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#14231c]">
            {item.type === 'error' ? <AlertCircle className="text-rose-500" /> : <CheckCircle2 className="text-emerald-500" />}
            <span className="flex-1 text-sm font-semibold">{item.message}</span>
            <button onClick={() => setItems((current) => current.filter(({ id }) => id !== item.id))} aria-label="Dismiss"><X size={16} /></button>
          </div>
        ))}
      </div>
  )
}
