import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BatteryCharging, CalendarClock, CarFront, CheckCircle2, Clock3, Copy, Heart, MapPin, MessageSquareText, Navigation, Send, ShieldCheck, Star, UserRound, Users, X, Zap } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useStations } from '../hooks/useStations'
import { stationApi } from '../services/stationApi'
import { useStationStore } from '../store/useStationStore'
import { StatusBadge } from '../components/StatusBadge'
import { BookingDialog } from '../components/BookingDialog'
import { ChargeCalculator } from '../components/ChargeCalculator'
import { toast } from '../services/toast'
import { useDriverActivity } from '../hooks/useDriverActivity'

const reviewSchema = z.object({
  name: z.string().trim().min(2, 'Введите минимум 2 символа'),
  rating: z.coerce.number().min(1, 'Поставьте оценку').max(5),
  comment: z.string().trim().min(5, 'Напишите минимум 5 символов').max(500, 'Не больше 500 символов'),
})

export function StationDetails() {
  const { t } = useTranslation()
  const { stationId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isLoading } = useStations()
  const [bookingOpen, setBookingOpen] = useState(false)
  const station = useStationStore((state) => state.stations.find((item) => item.id === stationId))
  const favorites = useStationStore((state) => state.favorites)
  const toggleFavorite = useStationStore((state) => state.toggleFavorite)
  const updateStation = useStationStore((state) => state.updateStation)
  const { reservation, queueEntry, saveReservation, cancelReservation, saveQueueEntry, removeQueueEntry } = useDriverActivity(stationId)
  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { name: '', rating: 5, comment: '' },
  })
  const selectedRating = useWatch({ control, name: 'rating' })

  const statusMutation = useMutation({
    mutationFn: ({ status }) => stationApi.update(stationId, { status }),
    onSuccess: (updated) => {
      updateStation(stationId, { status: updated.status })
      queryClient.invalidateQueries({ queryKey: ['stations'] })
      toast('Availability updated')
    },
    onError: () => toast('Could not update this station', 'error'),
  })

  const reviewMutation = useMutation({
    mutationFn: (values) => {
      const review = { ...values, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
      const reviews = [review, ...(station.reviews || [])]
      const rating = Number((reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1))
      return stationApi.update(stationId, { reviews, rating })
    },
    onSuccess: (updated) => {
      updateStation(stationId, { reviews: updated.reviews, rating: updated.rating })
      queryClient.invalidateQueries({ queryKey: ['stations'] })
      reset({ name: '', rating: 5, comment: '' })
      toast(t('reviewPublished'))
    },
    onError: () => toast(t('reviewError'), 'error'),
  })

  const queueMutation = useMutation({
    mutationFn: async (action) => {
      const queue = action === 'join' ? (station.queue || 0) + 1 : Math.max(0, (station.queue || 0) - 1)
      const updated = await stationApi.update(stationId, { queue })
      return { updated, action }
    },
    onSuccess: ({ updated, action }) => {
      updateStation(stationId, { queue: updated.queue })
      if (action === 'join') {
        saveQueueEntry(updated.queue)
        toast(t('joinedQueue'))
      } else {
        removeQueueEntry()
        toast(t('leftQueue'))
      }
      queryClient.invalidateQueries({ queryKey: ['stations'] })
    },
    onError: () => toast(t('queueError'), 'error'),
  })

  const reserveCharger = (values) => {
    saveReservation(values)
    setBookingOpen(false)
    toast(t('bookingConfirmed'))
  }

  useEffect(() => { window.scrollTo(0, 0) }, [])
  if (isLoading) return <div className="page-shell"><div className="h-96 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/5" /></div>
  if (!station) return <div className="page-shell text-center"><h1 className="text-3xl font-black">Station not found</h1><Link to="/" className="primary-button mt-5 inline-flex">Back to map</Link></div>

  const favorite = favorites.includes(station.id)
  const reviews = station.reviews || []

  return (
    <div className="page-shell">
      <button onClick={() => navigate(-1)} className="mb-4 flex min-h-11 items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 sm:mb-6"><ArrowLeft size={17} /> Back to charging map</button>
      <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
        <section>
          <div className="detail-hero relative overflow-hidden rounded-2xl p-5 text-white sm:rounded-3xl sm:p-9">
            <div className="relative z-10 max-w-2xl">
              <StatusBadge status={station.status} />
              <p className="mt-8 text-sm font-bold text-emerald-300">{station.network} charging network</p>
              <h1 className="mt-2 break-words text-2xl font-black tracking-tight sm:text-5xl">{station.name}</h1>
              <p className="mt-4 flex items-center gap-2 text-sm text-white/70"><MapPin size={17} /> {station.address}, {station.district}</p>
              <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3">
                <button onClick={() => setBookingOpen(true)} className="primary-button col-span-2 min-h-12 justify-center sm:col-auto"><CalendarClock size={17} />{t('bookCharger')}</button>
                <a className="glass-button col-span-2 min-h-11 justify-center sm:col-auto" href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`} target="_blank" rel="noreferrer"><Navigation size={17} /> Get directions</a>
                <button onClick={() => { navigator.clipboard?.writeText(station.address); toast('Address copied') }} className="glass-button min-h-11 justify-center"><Copy size={17} /> Copy</button>
                <button onClick={() => toggleFavorite(station.id)} className="glass-button min-h-11 justify-center"><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /> {favorite ? 'Saved' : 'Save'}</button>
              </div>
            </div>
            <Zap className="absolute -bottom-16 -right-12 size-72 rotate-12 text-white/[.04]" fill="currentColor" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric icon={Zap} label="Max power" value={`${station.power} kW`} />
            <Metric icon={BatteryCharging} label="Connectors" value={station.connectors.join(', ')} />
            <Metric icon={Clock3} label="Open" value={station.hours} />
            <Metric icon={Star} label={t('rating')} value={`${station.rating} / 5`} />
          </div>

          <div className="panel mt-4 p-4 sm:mt-6 sm:p-6">
            <h2 className="text-lg font-black">Charging points</h2>
            <p className="mt-1 text-sm text-slate-500">Live connector status, refreshed moments ago.</p>
            <div className="mt-5 space-y-3">
              {station.connectors.map((connector, index) => <div key={connector} className="flex items-center rounded-2xl border border-slate-200 p-4 dark:border-white/10"><div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10"><Zap size={18} /></div><div className="ml-3"><p className="text-sm font-extrabold">{connector}</p><p className="text-xs text-slate-500">Up to {index ? Math.min(station.power, 22) : station.power} kW</p></div><div className="ml-auto"><StatusBadge status={index === 0 ? station.status : 'available'} compact /></div></div>)}
            </div>
          </div>

          <div className="panel mt-6 overflow-hidden">
            <div className="border-b border-slate-200 p-4 dark:border-white/10 sm:flex sm:items-center sm:justify-between sm:p-6">
              <div><p className="eyebrow">{t('stationReviews')}</p><h2 className="mt-2 text-xl font-black">{t('driverFeedback')}</h2></div>
              <div className="mt-4 flex items-center gap-3 sm:mt-0"><b className="text-3xl font-black">{station.rating}</b><div><Stars value={Math.round(station.rating)} /><p className="mt-1 text-[11px] font-bold text-slate-400">{reviews.length} {t('reviewsCount')}</p></div></div>
            </div>

            <form onSubmit={handleSubmit((values) => reviewMutation.mutate(values))} className="grid gap-4 bg-slate-50/70 p-4 dark:bg-white/[.02] sm:grid-cols-2 sm:gap-5 sm:p-6">
              <Field label={t('yourName')} error={errors.name}><div className="relative"><UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input {...register('name')} className="field pl-11" placeholder={t('namePlaceholder')} /></div></Field>
              <Field label={t('yourRating')} error={errors.rating}>
                <div className="flex h-12 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 dark:border-white/10 dark:bg-white/5" role="radiogroup" aria-label={t('yourRating')}>
                  {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" role="radio" aria-checked={selectedRating === value} onClick={() => setValue('rating', value, { shouldValidate: true })} className={`rounded-lg p-1 transition hover:scale-110 ${value <= selectedRating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} aria-label={`${value} / 5`}><Star size={24} fill="currentColor" /></button>)}
                </div>
              </Field>
              <Field label={t('yourReview')} error={errors.comment} className="sm:col-span-2"><textarea {...register('comment')} className="field min-h-28 resize-y py-3" maxLength={500} placeholder={t('reviewPlaceholder')} /></Field>
              <div className="sm:col-span-2"><button disabled={reviewMutation.isPending} className="primary-button min-h-12 w-full justify-center sm:w-auto"><span>{reviewMutation.isPending ? <span className="spinner" /> : <Send size={17} />}</span>{reviewMutation.isPending ? t('publishing') : t('publishReview')}</button></div>
            </form>

            <div className="space-y-4 p-4 sm:p-6">
              {reviews.map((review) => <article key={review.id} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10"><div className="flex items-start gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-50 font-black text-emerald-600 dark:bg-emerald-400/10">{review.name.charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h3 className="font-extrabold">{review.name}</h3><Stars value={review.rating} size={14} /><time className="ml-auto text-[11px] font-semibold text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</time></div><p className="mt-2 break-words text-sm leading-relaxed text-slate-600 dark:text-slate-300">{review.comment}</p></div></div></article>)}
              {!reviews.length && <div className="grid min-h-36 place-items-center text-center text-slate-400"><div><MessageSquareText className="mx-auto" size={28} /><p className="mt-3 text-sm font-bold">{t('noReviews')}</p><p className="mt-1 text-xs">{t('firstReview')}</p></div></div>}
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          {reservation && <div className="booking-ticket relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-800 p-6 text-white shadow-xl shadow-indigo-900/15"><div className="absolute -right-10 -top-10 size-36 rounded-full bg-white/10" /><div className="relative"><div className="flex items-start gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-white/15"><CheckCircle2 size={22} /></div><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-violet-200">{t('activeBooking')}</p><h2 className="mt-1 font-black">{new Date(reservation.startAt).toLocaleString()}</h2></div><button onClick={() => { cancelReservation(); toast(t('bookingCancelled')) }} className="ml-auto grid size-8 place-items-center rounded-lg bg-white/10 transition hover:bg-white/20" aria-label={t('cancelBooking')}><X size={15} /></button></div><div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-xl bg-white/10 p-3"><span className="text-[10px] font-bold text-white/60">{t('connector')}</span><b className="mt-1 block text-sm">{reservation.connector}</b></div><div className="rounded-xl bg-white/10 p-3"><span className="text-[10px] font-bold text-white/60">{t('duration')}</span><b className="mt-1 block text-sm">{reservation.duration} {t('minutes')}</b></div></div></div></div>}

          <div className="panel p-6">
            <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-slate-400">Live availability</p>
            <div className="mt-3 flex items-end gap-2"><b className="text-4xl font-black text-emerald-500">{station.availablePorts}</b><span className="mb-1 text-sm text-slate-500">of {station.totalPorts} ports free</span></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${(station.availablePorts / station.totalPorts) * 100}%` }} /></div>
            <div className={`mt-5 rounded-2xl p-4 ${queueEntry ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' : station.queue ? 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400'}`}>
              <div className="flex items-center gap-3"><CarFront size={20} /><span className="text-sm font-bold">{queueEntry ? t('yourQueuePlace') : t('queue')}</span><b className="ml-auto text-xl">{queueEntry ? `#${queueEntry.position}` : `${station.queue || 0} ${t('cars')}`}</b></div>
              {queueEntry && <p className="mt-2 text-xs font-semibold text-white/80">{t('estimatedWait')}: ~{Math.max(5, (queueEntry.position - 1) * 18)} {t('minutes')}</p>}
            </div>
            <button disabled={queueMutation.isPending || station.status === 'offline'} onClick={() => queueMutation.mutate(queueEntry ? 'leave' : 'join')} className={`mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-extrabold transition ${queueEntry ? 'border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-400/20 dark:hover:bg-rose-400/10' : 'bg-slate-950 text-white hover:bg-emerald-600 dark:bg-white dark:text-slate-950'}`}>{queueMutation.isPending ? <span className="spinner" /> : <Users size={17} />}{queueEntry ? t('leaveQueue') : t('joinQueue')}</button>
            <div className="mt-6 grid grid-cols-3 gap-2">{['available', 'in_use', 'offline'].map((status) => <button disabled={statusMutation.isPending} key={status} onClick={() => statusMutation.mutate({ status })} className={`rounded-xl border px-2 py-2.5 text-xs font-bold capitalize transition ${station.status === status ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400' : 'border-slate-200 hover:border-emerald-300 dark:border-white/10'}`}>{status.replace('_', ' ')}</button>)}</div>
          </div>
          <div className="panel p-6"><h2 className="font-black">Pricing & access</h2><div className="mt-5 space-y-4"><Info label="Energy rate" value={`${station.price.toLocaleString()} UZS / kWh`} /><Info label="Parking" value="Free while charging" /><Info label="Operator" value={station.network} /><Info label="Station ID" value={station.id.slice(0, 12).toUpperCase()} /></div></div>
          <ChargeCalculator station={station} />
          <div className="rounded-3xl bg-emerald-500 p-6 text-white"><ShieldCheck size={26} /><h2 className="mt-4 text-xl font-black">Verified network</h2><p className="mt-2 text-sm leading-relaxed text-emerald-50">Availability and pricing are supplied directly by the {station.network} network.</p></div>
        </aside>
      </div>
      <BookingDialog open={bookingOpen} onClose={() => setBookingOpen(false)} station={station} onReserve={reserveCharger} />
    </div>
  )
}

function Stars({ value, size = 16 }) { return <div className="flex gap-0.5 text-amber-400" aria-label={`${value} / 5`}>{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={size} fill={star <= value ? 'currentColor' : 'none'} className={star <= value ? '' : 'text-slate-300 dark:text-slate-600'} />)}</div> }
function Field({ label, error, children, className = '' }) { return <label className={`block ${className}`}><span className="mb-2 block text-xs font-extrabold">{label}</span>{children}{error && <span className="mt-1.5 block text-xs font-semibold text-rose-500">{error.message}</span>}</label> }
function Metric({ icon: Icon, label, value }) { return <div className="panel p-4"><Icon size={18} className="text-emerald-500" /><p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 truncate text-sm font-extrabold">{value}</p></div> }
function Info({ label, value }) { return <div className="flex justify-between gap-3 text-sm"><span className="text-slate-500">{label}</span><b className="text-right">{value}</b></div> }
