import { useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BatteryCharging, Check, Clock3, MapPin, ShieldCheck, Star, Users, X } from 'lucide-react'
import { useStations } from '../hooks/useStations'
import { stationApi } from '../services/stationApi'
import { useStationStore } from '../store/useStationStore'
import { toast } from '../services/toast'
import { useTranslation } from 'react-i18next'

export function Admin() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const { isLoading, isError, refetch } = useStations()
  const stations = useStationStore((state) => state.stations)
  const updateStation = useStationStore((state) => state.updateStation)
  const submissions = useMemo(() => stations.filter((station) => station.submittedBy).sort((a, b) => {
    const priority = { pending: 0, rejected: 1, approved: 2 }
    return (priority[a.approvalStatus] ?? 2) - (priority[b.approvalStatus] ?? 2) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  }), [stations])
  const pending = submissions.filter((station) => station.approvalStatus === 'pending')
  const approved = stations.filter((station) => station.approvalStatus === 'approved').length

  const moderation = useMutation({
    mutationFn: ({ id, approvalStatus }) => stationApi.update(id, { approvalStatus }),
    onSuccess: (station) => {
      updateStation(station.id, { approvalStatus: station.approvalStatus })
      queryClient.invalidateQueries({ queryKey: ['stations'] })
      toast(t(station.approvalStatus === 'approved' ? 'stationPublished' : 'requestRejected'))
    },
    onError: () => toast(t('updateRequestError'), 'error'),
  })

  return (
    <div className="page-shell">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-[#10251c] to-emerald-900 p-6 text-white sm:p-9"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.18em] text-emerald-300"><ShieldCheck size={16} />{t('adminControlCenter')}</p><h1 className="mt-3 text-3xl font-black sm:text-5xl">{t('stationModeration')}</h1><p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">{t('stationModerationHint')}</p></div><div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur"><span className="text-xs font-bold text-white/50">{t('awaitingReview')}</span><b className="mt-1 block text-3xl font-black text-amber-300">{pending.length}</b></div></div></div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4"><AdminMetric icon={Clock3} label={t('approvalPending')} value={pending.length} color="amber" /><AdminMetric icon={Check} label={t('published')} value={approved} color="emerald" /><AdminMetric icon={Users} label={t('userSubmissions')} value={submissions.length} color="blue" /><AdminMetric icon={Star} label={t('totalReviews')} value={stations.reduce((sum, station) => sum + (station.reviews?.length || 0), 0)} color="violet" /></div>

      <section className="mt-8"><div className="mb-4 flex items-end justify-between gap-3"><div><p className="eyebrow">{t('moderationQueue')}</p><h2 className="mt-1 text-xl font-black">{t('userRequests')}</h2></div><span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold dark:bg-white/10">{submissions.length}</span></div>
        {isLoading && <div className="panel h-52 animate-pulse bg-slate-200 dark:bg-white/5" />}
        {isError && <div className="empty-state"><p>{t('loadRequestsError')}</p><button onClick={refetch} className="secondary-button mt-3">{t('retry')}</button></div>}
        {!isLoading && !isError && <div className="space-y-4">{submissions.map((station) => <article key={station.id} className="panel overflow-hidden"><div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center lg:p-6"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><ApprovalBadge t={t} status={station.approvalStatus} /><span className="text-[11px] font-bold text-slate-400">{station.createdAt ? new Date(station.createdAt).toLocaleDateString(i18n.resolvedLanguage) : t('noDate')}</span></div><h3 className="mt-3 truncate text-lg font-black">{station.name}</h3><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={13} />{station.address}, {station.district}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs"><span><b>{station.power} kW</b> {t('powerLabel')}</span><span><b>{station.connectors.join(', ')}</b> {t('connectorLabel')}</span><span><b>{station.network}</b> {t('operatorLabel')}</span></div><div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-white/5"><b className="text-slate-800 dark:text-white">{t('owner')}</b> {station.submittedBy?.company || station.submittedBy?.name} · {station.submittedBy?.email}{station.submittedBy?.phone ? ` · ${station.submittedBy.phone}` : ''}</div></div>{station.approvalStatus === 'pending' ? <div className="grid grid-cols-2 gap-2 lg:w-56"><button disabled={moderation.isPending} onClick={() => moderation.mutate({ id: station.id, approvalStatus: 'rejected' })} className="secondary-button min-h-11 justify-center text-rose-500"><X size={17} />{t('reject')}</button><button disabled={moderation.isPending} onClick={() => moderation.mutate({ id: station.id, approvalStatus: 'approved' })} className="primary-button min-h-11 justify-center"><Check size={17} />{t('approve')}</button></div> : <ApprovalBadge t={t} status={station.approvalStatus} large />}</div></article>)}{!submissions.length && <div className="empty-state"><BatteryCharging size={30} /><p className="mt-3 font-bold">{t('noSubmissions')}</p><p className="mt-1 text-xs">{t('noSubmissionsHint')}</p></div>}</div>}
      </section>
    </div>
  )
}

function ApprovalBadge({ t, status = 'pending', large = false }) { const labels = { pending: t('approvalPending'), approved: t('approvalApproved'), rejected: t('approvalRejected') }; const colors = { pending: 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400', approved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400', rejected: 'bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400' }; return <span className={`inline-flex items-center justify-center rounded-full font-extrabold ${large ? 'px-5 py-3 text-sm' : 'px-2.5 py-1 text-[10px]'} ${colors[status]}`}>{labels[status]}</span> }
function AdminMetric({ icon: Icon, label, value, color }) { const colors = { amber: 'bg-amber-50 text-amber-600 dark:bg-amber-400/10', emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10', blue: 'bg-blue-50 text-blue-600 dark:bg-blue-400/10', violet: 'bg-violet-50 text-violet-600 dark:bg-violet-400/10' }; return <div className="panel p-4 sm:p-5"><div className={`grid size-10 place-items-center rounded-xl ${colors[color]}`}><Icon size={19} /></div><b className="mt-4 block text-2xl font-black">{value}</b><span className="mt-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</span></div> }
