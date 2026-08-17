import { useEffect, useRef, useState } from 'react'
import { Bell, BellRing, CalendarClock, CheckCheck, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDriverStore } from '../store/useDriverStore'
import { useStationStore } from '../store/useStationStore'
import { toast } from '../services/toast'
import { useClock } from '../hooks/useClock'

export function NotificationBell() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [permission, setPermission] = useState(() => typeof Notification === 'undefined' ? 'unsupported' : Notification.permission)
  const notifications = useDriverStore((state) => state.notifications)
  const reservations = useDriverStore((state) => state.reservations)
  const markNotificationRead = useDriverStore((state) => state.markNotificationRead)
  const markAllNotificationsRead = useDriverStore((state) => state.markAllNotificationsRead)
  const stations = useStationStore((state) => state.stations)
  const now = useClock()
  const unread = notifications.filter((item) => !item.read).length
  const nextBooking = Object.values(reservations)
    .filter((reservation) => !now || new Date(reservation.startAt).getTime() + Number(reservation.duration || 0) * 60_000 > now)
    .sort((first, second) => new Date(first.startAt) - new Date(second.startAt))[0]
  const nextStation = nextBooking && stations.find((station) => station.id === nextBooking.stationId)

  useEffect(() => {
    const close = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  const requestNotifications = async () => {
    if (typeof Notification === 'undefined') {
      toast(t('notificationsUnsupported'), 'error')
      return
    }
    const result = await Notification.requestPermission()
    setPermission(result)
    toast(t(result === 'granted' ? 'notificationsEnabled' : 'notificationsDenied'), result === 'granted' ? 'success' : 'error')
  }

  const openNotification = (notification) => {
    markNotificationRead(notification.id)
    setOpen(false)
    if (notification.stationId) navigate(`/stations/${notification.stationId}`)
  }

  return (
    <div ref={rootRef} className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} className="icon-button relative" aria-label={t('notifications')} aria-expanded={open}>
        {unread ? <BellRing size={18} /> : <Bell size={18} />}
        {unread > 0 && <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-black leading-4 text-white">{Math.min(unread, 9)}{unread > 9 ? '+' : ''}</span>}
      </button>
      {open && <div className="absolute right-0 top-[calc(100%+10px)] z-[1200] w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#102019]">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-white/10"><div><p className="text-sm font-black">{t('notifications')}</p><p className="mt-0.5 text-[10px] font-bold text-slate-400">{t('unreadNotifications', { count: unread })}</p></div>{unread > 0 && <button type="button" onClick={markAllNotificationsRead} className="grid size-9 place-items-center rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-400/10" aria-label={t('markAllRead')}><CheckCheck size={18} /></button>}</div>

        {nextBooking && nextStation && <button type="button" onClick={() => { setOpen(false); navigate('/bookings') }} className="m-3 flex w-[calc(100%-24px)] items-start gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-700 p-3 text-left text-white"><div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15"><CalendarClock size={18} /></div><div className="min-w-0"><p className="text-[9px] font-extrabold uppercase tracking-wider text-violet-200">{t('nextBooking')}</p><b className="mt-0.5 block truncate text-xs">{nextStation.name}</b><span className="mt-1 flex items-center gap-1 truncate text-[10px] text-white/70"><MapPin size={10} />{nextStation.address}</span><time className="mt-1 block text-[10px] font-bold">{new Date(nextBooking.startAt).toLocaleString(i18n.resolvedLanguage)}</time></div></button>}

        {permission === 'default' && <button type="button" onClick={requestNotifications} className="mx-3 mb-3 flex w-[calc(100%-24px)] items-center gap-3 rounded-xl bg-emerald-50 p-3 text-left text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"><BellRing size={18} /><span><b className="block text-xs">{t('enableNotifications')}</b><span className="mt-0.5 block text-[10px] opacity-70">{t('notificationPermissionHint')}</span></span></button>}

        <div className="max-h-72 overflow-y-auto">
          {notifications.map((notification) => {
            const station = stations.find((item) => item.id === notification.stationId)
            return <button type="button" key={notification.id} onClick={() => openNotification(notification)} className={`flex w-full items-start gap-3 border-t border-slate-100 p-4 text-left transition hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5 ${notification.read ? 'opacity-60' : ''}`}><span className={`mt-1 size-2 shrink-0 rounded-full ${notification.read ? 'bg-slate-300' : 'bg-emerald-500'}`} /><span className="min-w-0"><b className="block text-xs">{t(`notification${notification.type.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')}`)}</b><span className="mt-1 block truncate text-[11px] text-slate-500">{station?.name || t('station')}</span><time className="mt-1 block text-[9px] font-bold text-slate-400">{new Date(notification.createdAt).toLocaleString(i18n.resolvedLanguage)}</time></span></button>
          })}
          {!notifications.length && <div className="grid min-h-32 place-items-center p-6 text-center text-slate-400"><div><Bell size={22} className="mx-auto" /><p className="mt-2 text-xs font-bold">{t('notificationsEmpty')}</p></div></div>}
        </div>
      </div>}
    </div>
  )
}
