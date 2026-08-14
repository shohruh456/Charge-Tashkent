import { SlidersHorizontal, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useStationStore } from '../store/useStationStore'

const networkColors = { Tokbor: '#22c55e', Voltauto: '#8b5cf6', 'K Watt': '#f59e0b', NRG: '#0ea5e9' }
const connectorOptions = ['GB/T', 'CCS2', 'GIBRID', 'Type 2']

export function FilterPanel({ expanded, onToggle }) {
  const { t } = useTranslation()
  const { networks, connectors, status, toggleNetwork, toggleConnector, setStatus, clearFilters } = useStationStore()
  return (
    <section className="border-b border-slate-200 px-4 py-3 dark:border-white/10 sm:px-5 sm:py-4">
      <div className="flex items-center justify-between">
        <button onClick={onToggle} className="flex min-h-10 items-center gap-2 text-sm font-extrabold"><SlidersHorizontal size={17} /> {t('filters')} <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] text-white">{networks.length + connectors.length + (status !== 'all' ? 1 : 0)}</span></button>
        <button onClick={clearFilters} className="flex min-h-10 items-center gap-1 text-xs font-bold text-slate-400 transition hover:text-emerald-600"><RotateCcw size={13} /> {t('reset')}</button>
      </div>
      <div className={`grid overflow-hidden transition-all duration-300 ${expanded ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="min-h-0 space-y-4">
          <div>
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.15em] text-slate-400">{t('availability')}</p>
            <div className="flex flex-wrap gap-2">
              {[['all', 'all'], ['available', 'statusAvailable'], ['in_use', 'statusInUse'], ['offline', 'statusOffline']].map(([value, label]) => <button key={value} onClick={() => setStatus(value)} className={`filter-pill ${status === value ? 'filter-pill-active' : ''}`}>{t(label)}</button>)}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.15em] text-slate-400">{t('networks')}</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(networkColors).map(([network, color]) => <label key={network} className="check-option"><input type="checkbox" checked={networks.includes(network)} onChange={() => toggleNetwork(network)} /><span className="size-2 rounded-full" style={{ backgroundColor: color }} />{network}</label>)}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.15em] text-slate-400">{t('connectors')}</p>
            <div className="flex flex-wrap gap-2">{connectorOptions.map((connector) => <button key={connector} onClick={() => toggleConnector(connector)} className={`filter-pill ${connectors.includes(connector) ? 'filter-pill-active' : ''}`}>{connector}</button>)}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
