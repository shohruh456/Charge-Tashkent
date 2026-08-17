import { Heart, Map } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useStations } from '../hooks/useStations'
import { useStationStore } from '../store/useStationStore'
import { StationCard } from '../components/StationCard'

export function Favorites() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isLoading, isError, refetch } = useStations()
  const stations = useStationStore((state) => state.stations)
  const favorites = useStationStore((state) => state.favorites)
  const favoriteStations = favorites.map((id) => stations.find((station) => station.id === id)).filter(Boolean)

  return (
    <div className="page-shell">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">{t('driverCenter')}</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{t('favorites')}</h1><p className="mt-2 text-sm text-slate-500">{t('favoritesHint')}</p></div>
        <Link to="/" className="secondary-button"><Map size={17} />{t('openMap')}</Link>
      </div>

      {isLoading && <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[...Array(6)].map((_, index) => <div key={index} className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/5" />)}</div>}
      {isError && <div className="empty-state mt-8"><p>{t('loadNetworkError')}</p><button onClick={refetch} className="secondary-button mt-3">{t('tryAgain')}</button></div>}
      {!isLoading && !isError && favoriteStations.length > 0 && <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{favoriteStations.map((station) => <StationCard key={station.id} station={station} onSelect={() => navigate(`/stations/${station.id}`)} />)}</div>}
      {!isLoading && !isError && !favoriteStations.length && <div className="panel mt-8 grid min-h-72 place-items-center p-8 text-center"><div><div className="mx-auto grid size-16 place-items-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-400/10"><Heart size={28} /></div><h2 className="mt-5 text-xl font-black">{t('favoritesEmpty')}</h2><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{t('favoritesEmptyHint')}</p><Link to="/" className="primary-button mt-5 inline-flex">{t('findStations')}</Link></div></div>}
    </div>
  )
}
