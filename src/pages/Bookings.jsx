import { CalendarClock, MapPin, Navigation, Trash2, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useStations } from '../hooks/useStations'
import { useStationStore } from '../store/useStationStore'
import { useDriverStore } from '../store/useDriverStore'
import { toast } from '../services/toast'

const bookingState = (reservation) => {
  const start = new Date(reservation.startAt).getTime()
  const end = start + Number(reservation.duration || 0) * 60_000
  if (Date.now() > end) return 'completed'
  if (Date.now() >= start) return 'active'
  return 'upcoming'
}

export function Bookings() {
  const { t, i18n } = useTranslation()
  const { isLoading } = useStations()
  const stations = useStationStore((state) => state.stations)
  const reservations = useDriverStore((state) => state.reservations)
  const cancelReservation = useDriverStore((state) => state.cancelReservation)
  const bookings = Object.values(reservations)
    .map((reservation) => ({ reservation, station: stations.find((item) => item.id === reservation.stationId) }))
    .filter(({ station }) => station)
    .sort((first, second) => new Date(first.reservation.startAt) - new Date(second.reservation.startAt))

  const cancel = (stationId) => {
    cancelReservation(stationId)
    toast(t('bookingCancelled'))
  }

  return (
    <div className="page-shell">
      <div><p className="eyebrow">{t('driverCenter')}</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{t('myBookings')}</h1><p className="mt-2 text-sm text-slate-500">{t('myBookingsHint')}</p></div>

      {isLoading && <div className="mt-8 h-64 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/5" />}
      {!isLoading && bookings.length > 0 && <div className="mt-8 space-y-4">{bookings.map(({ reservation, station }) => {
        const state = bookingState(reservation)
        return <article key={station.id} className="panel overflow-hidden p-4 sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center"><div className="flex min-w-0 flex-1 items-start gap-4"><div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-400/10"><Zap size={22} fill="currentColor" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-black">{station.name}</h2><BookingState state={state} t={t} /></div><p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={14} />{station.address}, {station.district}</p><p className="mt-3 flex items-center gap-2 text-sm font-extrabold"><CalendarClock size={16} className="text-violet-500" />{new Date(reservation.startAt).toLocaleString(i18n.resolvedLanguage)}</p></div></div><div className="grid grid-cols-2 gap-2 sm:flex"><div className="rounded-xl bg-slate-50 px-4 py-3 text-xs dark:bg-white/5"><span className="text-slate-400">{t('connector')}</span><b className="mt-1 block">{reservation.connector}</b></div><div className="rounded-xl bg-slate-50 px-4 py-3 text-xs dark:bg-white/5"><span className="text-slate-400">{t('duration')}</span><b className="mt-1 block">{reservation.duration} {t('minutes')}</b></div></div><div className="flex flex-wrap gap-2 lg:justify-end"><Link to={`/stations/${station.id}`} className="secondary-button flex-1 justify-center sm:flex-none">{t('viewStation')}</Link><a href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`} target="_blank" rel="noreferrer" className="primary-button flex-1 justify-center sm:flex-none"><Navigation size={16} />{t('getDirections')}</a>{state !== 'completed' && <button onClick={() => cancel(station.id)} className="icon-button text-rose-500" aria-label={t('cancelBooking')}><Trash2 size={17} /></button>}</div></div></article>
      })}</div>}
      {!isLoading && !bookings.length && <div className="panel mt-8 grid min-h-72 place-items-center p-8 text-center"><div><div className="mx-auto grid size-16 place-items-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-400/10"><CalendarClock size={28} /></div><h2 className="mt-5 text-xl font-black">{t('bookingsEmpty')}</h2><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{t('bookingsEmptyHint')}</p><Link to="/" className="primary-button mt-5 inline-flex">{t('findStations')}</Link></div></div>}
    </div>
  )
}

function BookingState({ state, t }) {
  const styles = { upcoming: 'bg-violet-50 text-violet-600 dark:bg-violet-400/10', active: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10', completed: 'bg-slate-100 text-slate-500 dark:bg-white/10' }
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${styles[state]}`}>{t(`bookingState${state.charAt(0).toUpperCase()}${state.slice(1)}`)}</span>
}
