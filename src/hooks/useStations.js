import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { stationApi } from '../services/stationApi'
import { useStationStore } from '../store/useStationStore'

export function useStations() {
  const setStations = useStationStore((state) => state.setStations)
  const query = useQuery({ queryKey: ['stations'], queryFn: stationApi.list })

  useEffect(() => {
    if (query.data) setStations(query.data)
  }, [query.data, setStations])

  return query
}
