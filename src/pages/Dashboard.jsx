import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, Search, ChevronLeft, ChevronRight, Map as MapIcon, List, Navigation, Radio } from 'lucide-react'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { useTranslation } from 'react-i18next'
import { useStations } from '../hooks/useStations'
import { useStationStore } from '../store/useStationStore'
import { FilterPanel } from '../components/FilterPanel'
import { StationCard } from '../components/StationCard'
import { MapCanvas } from '../components/MapCanvas'
import { toast } from '../services/toast'

const distanceToStation = ([latitude, longitude], station) => {
  const toRadians = (value) => value * Math.PI / 180
  const latDelta = toRadians(station.lat - latitude)
  const lngDelta = toRadians(station.lng - longitude)
  const a = Math.sin(latDelta / 2) ** 2 + Math.cos(toRadians(latitude)) * Math.cos(toRadians(station.lat)) * Math.sin(lngDelta / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const bestStationFor = (stations, position) => {
  const online = stations.filter((station) => station.status !== 'offline')
  if (!online.length) return null
  const shortestQueue = Math.min(...online.map((station) => station.queue || 0))
  return online
    .filter((station) => (station.queue || 0) === shortestQueue)
    .map((station) => ({ ...station, currentDistance: distanceToStation(position, station) }))
    .sort((first, second) => first.currentDistance - second.currentDistance)[0]
}

const sortOptions = [
  { value: 'nearest', label: 'Nearest first' },
  { value: 'queue', label: 'Shortest queue' },
  { value: 'power', label: 'Highest power' },
]

export function Dashboard() {
  const { t } = useTranslation()
  const { isLoading, isError, refetch } = useStations()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileView, setMobileView] = useState('list')
  const [userPosition, setUserPosition] = useState(null)
  const [locatingBest, setLocatingBest] = useState(false)
  const [sortBy, setSortBy] = useState('nearest')
  const { stations, query, networks, connectors, status, selectedId, setQuery, setSelectedId, clearFilters } = useStationStore()

  const filtered = useMemo(() => {
    const matching = stations.filter((station) => {
      const term = query.trim().toLowerCase()
      const matchesQuery = !term || `${station.name} ${station.address} ${station.district} ${station.network}`.toLowerCase().includes(term)
      return matchesQuery && (!networks.length || networks.includes(station.network)) && (!connectors.length || station.connectors.some((item) => connectors.includes(item))) && (status === 'all' || station.status === status)
    })
    return matching.sort((first, second) => {
      if (sortBy === 'power') return second.power - first.power
      if (sortBy === 'queue') return (first.queue || 0) - (second.queue || 0) || first.distance - second.distance
      return first.distance - second.distance
    })
  }, [stations, query, networks, connectors, status, sortBy])

  useEffect(() => {
    if (selectedId && !filtered.some((station) => station.id === selectedId)) setSelectedId(null)
  }, [filtered, selectedId, setSelectedId])

  const available = stations.filter((station) => station.status === 'available').length

  const openBestStation = (position) => {
    const station = bestStationFor(stations, position)
    if (!station) {
      toast('Нет работающих станций для выбора', 'error')
      return
    }
    clearFilters()
    setSelectedId(station.id)
    setMobileView('map')
    toast(`${station.name}: очередь ${station.queue || 0} машин, ${station.currentDistance.toFixed(1)} км от вас`)
  }

  const findBestStation = () => {
    if (userPosition) {
      openBestStation(userPosition)
      return
    }
    if (!navigator.geolocation) {
      toast('Ваш браузер не поддерживает геолокацию', 'error')
      return
    }
    setLocatingBest(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = [coords.latitude, coords.longitude]
        setUserPosition(position)
        setLocatingBest(false)
        openBestStation(position)
      },
      () => {
        setLocatingBest(false)
        toast('Разрешите доступ к геопозиции, чтобы найти станцию', 'error')
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    )
  }

  return (
    <div className="relative mx-auto h-[calc(100vh-4.5rem)] max-w-[1600px] overflow-hidden lg:flex">
      <aside className={`${sidebarOpen ? 'lg:w-[420px] xl:w-[450px]' : 'lg:w-0'} ${mobileView === 'list' ? 'flex' : 'hidden'} absolute inset-0 z-20 flex-col overflow-hidden bg-[#f8faf9] transition-all duration-300 dark:bg-[#0b1712] lg:static lg:flex lg:shrink-0 lg:border-r lg:border-slate-200 dark:lg:border-white/10`}>
        <div className="shrink-0 px-5 pb-4 pt-6">
          <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><Radio size={14} /> {t('live')}</p>
          <div className="mt-1 flex items-end justify-between"><h1 className="text-2xl font-black tracking-tight">{t('find')}</h1><p className="text-xs font-semibold text-slate-500"><b className="text-emerald-600">{available}</b> {t('availableNow')}</p></div>
          <div className="relative mt-4"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="field pl-11" placeholder={t('search')} /></div>
          <button onClick={findBestStation} disabled={isLoading || locatingBest || !stations.length} className="primary-button mt-3 w-full justify-center"><Navigation className={locatingBest ? 'animate-pulse' : ''} size={17} /> {locatingBest ? t('findingBest') : t('bestQueue')}</button>
        </div>
        <FilterPanel expanded={filtersOpen} onToggle={() => setFiltersOpen((value) => !value)} />
        <div className="relative z-10 flex items-center justify-between px-5 py-3"><p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">{t('stations')} <span className="ml-1 text-slate-900 dark:text-white">{filtered.length}</span></p>
          <Listbox value={sortBy} onChange={setSortBy}>
            <ListboxButton className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold outline-none transition hover:bg-slate-100 focus:ring-2 focus:ring-emerald-500/30 dark:hover:bg-white/10">{sortOptions.find((option) => option.value === sortBy)?.label}<ChevronDown size={14} /></ListboxButton>
            <ListboxOptions transition anchor="bottom end" className="z-[1000] mt-1 w-44 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl transition duration-100 ease-out [--anchor-gap:4px] focus:outline-none data-closed:scale-95 data-closed:opacity-0 dark:border-white/10 dark:bg-[#102019]">
              {sortOptions.map((option) => <ListboxOption key={option.value} value={option.value} className="group flex cursor-pointer items-center rounded-lg px-3 py-2 text-xs font-bold text-slate-600 outline-none data-focus:bg-emerald-50 data-focus:text-emerald-700 dark:text-slate-300 dark:data-focus:bg-emerald-400/10 dark:data-focus:text-emerald-400"><span>{option.label}</span><Check size={14} className="ml-auto invisible text-emerald-500 group-data-selected:visible" /></ListboxOption>)}
            </ListboxOptions>
          </Listbox>
        </div>
        <div className="scrollbar flex-1 space-y-3 overflow-y-auto px-4 pb-24 lg:pb-4">
          {isLoading && [...Array(4)].map((_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-white/5" />)}
          {isError && <div className="empty-state"><p>We couldn’t load the charging network.</p><button onClick={refetch} className="secondary-button mt-3">Try again</button></div>}
          {!isLoading && !isError && filtered.map((station) => <StationCard key={station.id} station={station} active={selectedId === station.id} onSelect={() => { setSelectedId(station.id); setMobileView('map') }} />)}
          {!isLoading && !isError && !filtered.length && <div className="empty-state"><Search size={28} /><p className="mt-2 font-bold">{t('noResults')}</p><p className="mt-1 text-xs">Try clearing one or more filters.</p></div>}
        </div>
      </aside>
      <button onClick={() => setSidebarOpen((value) => !value)} className="absolute left-[420px] top-1/2 z-30 hidden size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white shadow-lg transition-all dark:border-white/10 dark:bg-[#14231c] lg:grid xl:left-[450px]" style={!sidebarOpen ? { left: 16 } : undefined} aria-label="Toggle sidebar">{sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}</button>
      <section className={`${mobileView === 'map' ? 'block' : 'hidden'} h-full flex-1 lg:block`}><MapCanvas stations={filtered} selectedId={selectedId} onSelect={setSelectedId} userPosition={userPosition} onLocationChange={setUserPosition} /></section>
      <div className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 rounded-2xl bg-slate-950 p-1.5 text-white shadow-2xl lg:hidden"><button onClick={() => setMobileView('list')} className={`mobile-tab ${mobileView === 'list' ? 'bg-white text-slate-950' : ''}`}><List size={16} /> {t('list')}</button><button onClick={() => setMobileView('map')} className={`mobile-tab ${mobileView === 'map' ? 'bg-white text-slate-950' : ''}`}><MapIcon size={16} /> {t('map')}</button></div>
    </div>
  )
}
