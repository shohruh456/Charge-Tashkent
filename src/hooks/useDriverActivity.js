import { useState } from 'react'

const STORAGE_KEY = 'charge-tashkent-driver-activity'
const emptyActivity = { reservations: {}, queues: {} }

function readActivity() {
  try {
    return { ...emptyActivity, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  } catch {
    return emptyActivity
  }
}

export function useDriverActivity(stationId) {
  const [activity, setActivity] = useState(readActivity)

  const update = (producer) => {
    setActivity((current) => {
      const next = producer(current)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return {
    reservation: activity.reservations[stationId] || null,
    queueEntry: activity.queues[stationId] || null,
    saveReservation: (reservation) => update((current) => ({
      ...current,
      reservations: { ...current.reservations, [stationId]: { ...reservation, stationId, createdAt: new Date().toISOString() } },
    })),
    cancelReservation: () => update((current) => {
      const reservations = { ...current.reservations }
      delete reservations[stationId]
      return { ...current, reservations }
    }),
    saveQueueEntry: (position) => update((current) => ({
      ...current,
      queues: { ...current.queues, [stationId]: { position, joinedAt: new Date().toISOString() } },
    })),
    removeQueueEntry: () => update((current) => {
      const queues = { ...current.queues }
      delete queues[stationId]
      return { ...current, queues }
    }),
  }
}
