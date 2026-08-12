import { CarFront, Heart, MapPin, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { StatusBadge } from './StatusBadge'
import { useStationStore } from '../store/useStationStore'

export function StationCard({ station, active, onSelect }) {
  const { t } = useTranslation()
  const favorites = useStationStore((state) => state.favorites)
  const toggleFavorite = useStationStore((state) => state.toggleFavorite)
  const favorite = favorites.includes(station.id)
  return (
    <article onClick={onSelect} className={`group cursor-pointer rounded-2xl border p-4 transition-all ${active ? 'border-emerald-500 bg-emerald-50/60 shadow-sm dark:bg-emerald-400/5' : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-white/10 dark:bg-white/[.035]'}`}>
      <div className="flex items-start gap-3">
        <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${station.status === 'available' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-white/10'}`}><Zap size={18} fill="currentColor" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex gap-2"><h3 className="truncate text-sm font-extrabold">{station.name}</h3><button onClick={(event) => { event.stopPropagation(); toggleFavorite(station.id) }} className={`ml-auto transition ${favorite ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400'}`} aria-label="Favorite station"><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /></button></div>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400"><MapPin size={12} /> {station.district}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2"><StatusBadge status={station.status} compact /><span className="text-[11px] font-bold text-slate-500">{station.connectors.join(' · ')}</span><span className="ml-auto text-xs font-extrabold">{station.power} kW</span></div>
      <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold ${station.queue ? 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400'}`}><CarFront size={15} /><span>{t('queue')}</span><span className="ml-auto">{station.queue || 0} {t('cars')}</span></div>
    </article>
  )
}
