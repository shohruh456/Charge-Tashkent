import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const LEGACY_STORAGE_KEY = 'charge-tashkent-driver-activity'

function readLegacyActivity() {
  try {
    const activity = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || '{}')
    return {
      reservations: activity.reservations || {},
      queues: activity.queues || {},
    }
  } catch {
    return { reservations: {}, queues: {} }
  }
}

const legacyActivity = readLegacyActivity()

const createNotification = (type, stationId, extra = {}) => ({
  id: crypto.randomUUID(),
  type,
  stationId,
  createdAt: new Date().toISOString(),
  read: false,
  ...extra,
})

export const useDriverStore = create(persist((set) => ({
  reservations: legacyActivity.reservations,
  queues: legacyActivity.queues,
  notifications: [],
  remindedReservations: {},

  saveReservation: (stationId, reservation) => set((state) => ({
    reservations: {
      ...state.reservations,
      [stationId]: { ...reservation, stationId, createdAt: new Date().toISOString() },
    },
    notifications: [createNotification('booking_confirmed', stationId), ...state.notifications].slice(0, 30),
  })),
  cancelReservation: (stationId) => set((state) => {
    const reservations = { ...state.reservations }
    delete reservations[stationId]
    return {
      reservations,
      notifications: [createNotification('booking_cancelled', stationId), ...state.notifications].slice(0, 30),
    }
  }),
  saveQueueEntry: (stationId, position) => set((state) => ({
    queues: {
      ...state.queues,
      [stationId]: { position, joinedAt: new Date().toISOString() },
    },
  })),
  removeQueueEntry: (stationId) => set((state) => {
    const queues = { ...state.queues }
    delete queues[stationId]
    return { queues }
  }),
  sendBookingReminder: (stationId, startAt) => set((state) => {
    const reminderKey = `${stationId}:${startAt}`
    if (state.remindedReservations[reminderKey]) return state
    return {
      remindedReservations: { ...state.remindedReservations, [reminderKey]: true },
      notifications: [createNotification('booking_reminder', stationId, { startAt }), ...state.notifications].slice(0, 30),
    }
  }),
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((item) => item.id === id ? { ...item, read: true } : item),
  })),
  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map((item) => ({ ...item, read: true })),
  })),
  clearNotifications: () => set({ notifications: [] }),
}), {
  name: 'charge-tashkent-driver-center',
  version: 1,
}))
