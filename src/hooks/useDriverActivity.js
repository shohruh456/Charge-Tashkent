import { useDriverStore } from '../store/useDriverStore'

export function useDriverActivity(stationId) {
  const reservation = useDriverStore((state) => state.reservations[stationId] || null)
  const queueEntry = useDriverStore((state) => state.queues[stationId] || null)
  const saveReservation = useDriverStore((state) => state.saveReservation)
  const cancelReservation = useDriverStore((state) => state.cancelReservation)
  const saveQueueEntry = useDriverStore((state) => state.saveQueueEntry)
  const removeQueueEntry = useDriverStore((state) => state.removeQueueEntry)

  return {
    reservation,
    queueEntry,
    saveReservation: (reservationData) => saveReservation(stationId, reservationData),
    cancelReservation: () => cancelReservation(stationId),
    saveQueueEntry: (position) => saveQueueEntry(stationId, position),
    removeQueueEntry: () => removeQueueEntry(stationId),
  }
}
