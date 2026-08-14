import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { divIcon } from 'leaflet'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { LocateFixed, Minus, Navigation, Plus, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { StatusBadge } from './StatusBadge'

const TASHKENT_CENTER = [41.3111, 69.2797]
const hasCoordinates = (value) => Array.isArray(value)
  ? value.length === 2 && value.every((coordinate) => Number.isFinite(Number(coordinate)))
  : Number.isFinite(Number(value?.lat)) && Number.isFinite(Number(value?.lng))

const markerIcons = {
  available: divIcon({ className: '', html: '<span class="station-map-pin available"><span>⚡</span></span>', iconSize: [44, 50], iconAnchor: [22, 47] }),
  in_use: divIcon({ className: '', html: '<span class="station-map-pin in_use"><span>⚡</span></span>', iconSize: [44, 50], iconAnchor: [22, 47] }),
  offline: divIcon({ className: '', html: '<span class="station-map-pin offline"><span>⚡</span></span>', iconSize: [44, 50], iconAnchor: [22, 47] }),
}

const userIcon = divIcon({
  className: '',
  html: '<span class="user-location-pin"><span></span></span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
})

function MapBehaviour({ selected, userPosition, mapRef }) {
  const map = useMap()

  useEffect(() => {
    mapRef.current = map
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    const timer = window.setTimeout(() => map.invalidateSize(), 200)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
      mapRef.current = null
    }
  }, [map, mapRef])

  useEffect(() => {
    if (hasCoordinates(selected)) map.flyTo([Number(selected.lat), Number(selected.lng)], Math.max(map.getZoom(), 14), { duration: 0.7 })
  }, [map, selected])

  useEffect(() => {
    if (hasCoordinates(userPosition)) map.flyTo(userPosition.map(Number), Math.max(map.getZoom(), 14), { duration: 0.9 })
  }, [map, userPosition])

  return null
}

export function MapCanvas({ stations, selectedId, onSelect, userPosition: providedUserPosition, onLocationChange }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const mapRef = useRef(null)
  const [localUserPosition, setLocalUserPosition] = useState(null)
  const [locationState, setLocationState] = useState('locating')
  const userPosition = providedUserPosition || localUserPosition
  const selected = stations.find((station) => station.id === selectedId)

  const stationMarkers = useMemo(() => stations.filter(hasCoordinates).map((station) => ({
    ...station,
    icon: markerIcons[station.status] || markerIcons.offline,
  })), [stations])

  const findMe = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState('unsupported')
      return
    }

    setLocationState('locating')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = [coords.latitude, coords.longitude]
        setLocalUserPosition(position)
        onLocationChange?.(position)
        setLocationState('found')
      },
      () => setLocationState('denied'),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    )
  }, [onLocationChange])

  useEffect(() => {
    const timer = window.setTimeout(findMe, 0)
    return () => window.clearTimeout(timer)
  }, [findMe])

  const locationLabel = {
    locating: t('locating'),
    found: t('locationFound'),
    denied: t('locationDenied'),
    unsupported: t('locationUnsupported'),
  }[locationState]

  const openStationDetails = () => {
    navigate(`/stations/${selected.id}`, { viewTransition: true })
  }

  return (
    <div className="map-canvas relative h-full min-h-[420px] overflow-hidden bg-[#dfe8df] dark:bg-[#14231c] sm:min-h-[520px]">
      <MapContainer center={TASHKENT_CENTER} zoom={12} minZoom={10} maxZoom={18} zoomControl={false} className="h-full w-full" preferCanvas>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBehaviour selected={selected} userPosition={userPosition} mapRef={mapRef} />
        {stationMarkers.map((station) => (
          <Marker
            key={station.id}
            position={[station.lat, station.lng]}
            icon={station.icon}
            title={station.name}
            zIndexOffset={selectedId === station.id ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(station.id) }}
          />
        ))}
        {hasCoordinates(userPosition) && <Marker position={userPosition.map(Number)} icon={userIcon} title={t('yourLocation')} zIndexOffset={1500} />}
      </MapContainer>

      <div className="pointer-events-none absolute left-3 top-3 z-[500] flex max-w-[calc(100%-5.5rem)] items-center gap-2 rounded-xl border border-white/80 bg-white/95 px-3 py-2 text-[11px] font-bold text-slate-700 shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#0b1712]/95 dark:text-white sm:left-4 sm:top-4 sm:text-xs">
        <span className={`size-2 shrink-0 rounded-full ${locationState === 'found' ? 'bg-blue-500' : locationState === 'locating' ? 'animate-pulse bg-emerald-500' : 'bg-amber-500'}`} />
        <span className="truncate">{locationLabel}</span>
      </div>

      <div className="absolute right-3 top-3 z-[500] flex flex-col overflow-hidden rounded-xl border border-white/80 bg-white shadow-lg dark:border-white/10 dark:bg-[#0b1712] sm:right-4 sm:top-4">
        <button onClick={() => mapRef.current?.zoomIn()} className="map-control" aria-label={t('zoomIn')}><Plus size={18} /></button>
        <button onClick={() => mapRef.current?.zoomOut()} className="map-control border-t" aria-label={t('zoomOut')}><Minus size={18} /></button>
        <button onClick={findMe} className={`map-control border-t ${locationState === 'locating' ? 'text-emerald-500' : 'text-blue-500'}`} aria-label={t('showMyLocation')}><LocateFixed className={locationState === 'locating' ? 'animate-pulse' : ''} size={18} /></button>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-4 z-[500] hidden gap-2 rounded-xl border border-white/80 bg-white/95 p-2.5 text-[10px] font-bold shadow dark:border-white/10 dark:bg-[#0b1712]/95 sm:flex">
        <span className="text-emerald-600">● {t('statusAvailable')}</span><span className="text-amber-500">● {t('statusInUse')}</span><span className="text-slate-400">● {t('statusOffline')}</span>
      </div>

      {selected && <div className="animate-pop absolute bottom-24 left-3 right-3 z-[600] rounded-2xl border border-white/70 bg-white p-3.5 shadow-2xl dark:border-white/10 dark:bg-[#0b1712] sm:bottom-16 sm:left-auto sm:right-4 sm:w-[calc(100%-2rem)] sm:max-w-xs sm:p-4">
        <div className="flex items-start gap-3"><div className="grid size-11 place-items-center rounded-xl bg-emerald-500 text-white"><Zap size={20} fill="currentColor" /></div><div className="min-w-0"><p className="truncate font-extrabold">{selected.name}</p><p className="mt-1 text-xs text-slate-500">{selected.address}</p></div></div>
        <div className="mt-3 flex items-center gap-2"><StatusBadge status={selected.status} compact /><span className="text-xs font-bold">{selected.power} kW</span><span className="ml-auto text-xs text-slate-500">{selected.distance} km</span></div>
        <div className={`mt-3 flex items-center justify-between rounded-xl px-3 py-2 text-xs font-extrabold ${selected.queue ? 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400'}`}><span>{t('queue')}</span><span>{selected.queue || 0} {t('cars')}</span></div>
        <button onClick={openStationDetails} className="primary-button mt-3 w-full justify-center">{t('open')} <Navigation size={15} /></button>
      </div>}
    </div>
  )
}
