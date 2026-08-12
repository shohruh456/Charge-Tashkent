import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BatteryCharging, CarFront, Clock3, Copy, Heart, MapPin, Navigation, ShieldCheck, Star, Zap } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useStations } from '../hooks/useStations'
import { stationApi } from '../services/stationApi'
import { useStationStore } from '../store/useStationStore'
import { StatusBadge } from '../components/StatusBadge'
import { toast } from '../services/toast'

export function StationDetails() {
  const { t } = useTranslation()
  const { stationId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isLoading } = useStations()
  const station = useStationStore((state) => state.stations.find((item) => item.id === stationId))
  const favorites = useStationStore((state) => state.favorites)
  const toggleFavorite = useStationStore((state) => state.toggleFavorite)
  const updateStation = useStationStore((state) => state.updateStation)
  const mutation = useMutation({ mutationFn: ({ status }) => stationApi.update(stationId, { status }), onSuccess: (updated) => { updateStation(stationId, { status: updated.status }); queryClient.invalidateQueries({ queryKey: ['stations'] }); toast('Availability updated') }, onError: () => toast('Could not update this station', 'error') })

  useEffect(() => { window.scrollTo(0, 0) }, [])
  if (isLoading) return <div className="page-shell"><div className="h-96 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/5" /></div>
  if (!station) return <div className="page-shell text-center"><h1 className="text-3xl font-black">Station not found</h1><Link to="/" className="primary-button mt-5 inline-flex">Back to map</Link></div>

  const favorite = favorites.includes(station.id)
  return (
    <div className="page-shell">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600"><ArrowLeft size={17} /> Back to charging map</button>
      <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
        <section>
          <div className="detail-hero relative overflow-hidden rounded-3xl p-6 text-white sm:p-9">
            <div className="relative z-10 max-w-2xl"><StatusBadge status={station.status} /><p className="mt-8 text-sm font-bold text-emerald-300">{station.network} charging network</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">{station.name}</h1><p className="mt-4 flex items-center gap-2 text-sm text-white/70"><MapPin size={17} /> {station.address}, {station.district}</p><div className="mt-7 flex flex-wrap gap-3"><a className="primary-button" href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`} target="_blank" rel="noreferrer"><Navigation size={17} /> Get directions</a><button onClick={() => { navigator.clipboard?.writeText(station.address); toast('Address copied') }} className="glass-button"><Copy size={17} /> Copy address</button><button onClick={() => toggleFavorite(station.id)} className="glass-button"><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /> {favorite ? 'Saved' : 'Save'}</button></div></div>
            <Zap className="absolute -bottom-16 -right-12 size-72 rotate-12 text-white/[.04]" fill="currentColor" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric icon={Zap} label="Max power" value={`${station.power} kW`} /><Metric icon={BatteryCharging} label="Connectors" value={station.connectors.join(', ')} /><Metric icon={Clock3} label="Open" value={station.hours} /><Metric icon={Star} label="Rating" value={`${station.rating} / 5`} />
          </div>
          <div className="panel mt-6 p-6"><h2 className="text-lg font-black">Charging points</h2><p className="mt-1 text-sm text-slate-500">Live connector status, refreshed moments ago.</p><div className="mt-5 space-y-3">{station.connectors.map((connector, index) => <div key={connector} className="flex items-center rounded-2xl border border-slate-200 p-4 dark:border-white/10"><div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10"><Zap size={18} /></div><div className="ml-3"><p className="text-sm font-extrabold">{connector}</p><p className="text-xs text-slate-500">Up to {index ? Math.min(station.power, 22) : station.power} kW</p></div><div className="ml-auto"><StatusBadge status={index === 0 ? station.status : 'available'} compact /></div></div>)}</div></div>
        </section>
        <aside className="space-y-5">
          <div className="panel p-6"><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-slate-400">Live availability</p><div className="mt-3 flex items-end gap-2"><b className="text-4xl font-black text-emerald-500">{station.availablePorts}</b><span className="mb-1 text-sm text-slate-500">of {station.totalPorts} ports free</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${(station.availablePorts / station.totalPorts) * 100}%` }} /></div><div className={`mt-5 flex items-center gap-3 rounded-2xl p-4 ${station.queue ? 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400'}`}><CarFront size={20} /><span className="text-sm font-bold">{t('queue')}</span><b className="ml-auto text-xl">{station.queue || 0} {t('cars')}</b></div><div className="mt-6 grid grid-cols-3 gap-2">{['available', 'in_use', 'offline'].map((status) => <button disabled={mutation.isPending} key={status} onClick={() => mutation.mutate({ status })} className={`rounded-xl border px-2 py-2.5 text-xs font-bold capitalize transition ${station.status === status ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400' : 'border-slate-200 hover:border-emerald-300 dark:border-white/10'}`}>{status.replace('_', ' ')}</button>)}</div></div>
          <div className="panel p-6"><h2 className="font-black">Pricing & access</h2><div className="mt-5 space-y-4"><Info label="Energy rate" value={`${station.price.toLocaleString()} UZS / kWh`} /><Info label="Parking" value="Free while charging" /><Info label="Operator" value={station.network} /><Info label="Station ID" value={station.id.slice(0, 12).toUpperCase()} /></div></div>
          <div className="rounded-3xl bg-emerald-500 p-6 text-white"><ShieldCheck size={26} /><h2 className="mt-4 text-xl font-black">Verified network</h2><p className="mt-2 text-sm leading-relaxed text-emerald-50">Availability and pricing are supplied directly by the {station.network} network.</p></div>
        </aside>
      </div>
    </div>
  )
}

function Metric({ icon: Icon, label, value }) { return <div className="panel p-4"><Icon size={18} className="text-emerald-500" /><p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 truncate text-sm font-extrabold">{value}</p></div> }
function Info({ label, value }) { return <div className="flex justify-between gap-3 text-sm"><span className="text-slate-500">{label}</span><b className="text-right">{value}</b></div> }
