import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDriverStore } from '../store/useDriverStore'
import { useStationStore } from '../store/useStationStore'
import { toast } from '../services/toast'

const REMINDER_WINDOW = 15 * 60_000

async function showSystemNotification(title, options) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready
    await registration.showNotification(title, options)
    return
  }
  new Notification(title, options)
}

export function BookingReminder() {
  const { t } = useTranslation()
  const reservations = useDriverStore((state) => state.reservations)
  const remindedReservations = useDriverStore((state) => state.remindedReservations)
  const sendBookingReminder = useDriverStore((state) => state.sendBookingReminder)
  const stations = useStationStore((state) => state.stations)

  useEffect(() => {
    const checkBookings = () => {
      Object.values(reservations).forEach((reservation) => {
        const startsIn = new Date(reservation.startAt).getTime() - Date.now()
        const reminderKey = `${reservation.stationId}:${reservation.startAt}`
        if (startsIn <= 0 || startsIn > REMINDER_WINDOW || remindedReservations[reminderKey]) return
        const station = stations.find((item) => item.id === reservation.stationId)
        const stationName = station?.name || t('station')
        sendBookingReminder(reservation.stationId, reservation.startAt)
        toast(t('bookingReminderToast', { name: stationName }))
        showSystemNotification(t('bookingReminderTitle'), {
          body: t('bookingReminderBody', { name: stationName }),
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: reminderKey,
          data: { url: `/stations/${reservation.stationId}` },
        }).catch(() => {})
      })
    }

    checkBookings()
    const timer = window.setInterval(checkBookings, 30_000)
    return () => window.clearInterval(timer)
  }, [remindedReservations, reservations, sendBookingReminder, stations, t])

  return null
}
