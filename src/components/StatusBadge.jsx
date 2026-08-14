const styles = {
  available: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-400/10 dark:text-emerald-400',
  in_use: 'bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-400/10 dark:text-amber-400',
  offline: 'bg-slate-100 text-slate-500 ring-slate-400/20 dark:bg-white/5 dark:text-slate-400',
}

export function StatusBadge({ status, compact = false }) {
  const { t } = useTranslation()
  const labels = { available: t('statusAvailable'), in_use: t('statusInUse'), offline: t('statusOffline') }
  return <span className={`inline-flex items-center gap-1.5 rounded-full font-bold ring-1 ring-inset ${compact ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-xs'} ${styles[status]}`}><span className={`size-1.5 rounded-full ${status === 'available' ? 'bg-emerald-500' : status === 'in_use' ? 'bg-amber-500' : 'bg-slate-400'}`} />{labels[status]}</span>
}
import { useTranslation } from 'react-i18next'
