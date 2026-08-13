import { useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { CalendarClock, CheckCircle2, Clock3, PlugZap, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'

const schema = z.object({
  connector: z.string().min(1),
  startAt: z.string().min(1, 'Выберите время'),
  duration: z.coerce.number().min(30).max(120),
}).refine(({ startAt }) => new Date(startAt).getTime() > Date.now(), { path: ['startAt'], message: 'Выберите будущее время' })

const nextHour = () => {
  const date = new Date(Date.now() + 60 * 60 * 1000)
  date.setMinutes(0, 0, 0)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export function BookingDialog({ open, onClose, station, onReserve }) {
  const { t } = useTranslation()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { connector: station.connectors[0], startAt: nextHour(), duration: 60 },
  })

  useEffect(() => {
    if (open) reset({ connector: station.connectors[0], startAt: nextHour(), duration: 60 })
  }, [open, reset, station.connectors])

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[1300]">
      <DialogBackdrop transition className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm duration-300 data-closed:opacity-0" />
      <div className="fixed inset-0 grid place-items-center overflow-y-auto p-4">
        <DialogPanel transition className="w-full max-w-lg overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-2xl duration-300 data-closed:translate-y-6 data-closed:scale-95 data-closed:opacity-0 dark:border-white/10 dark:bg-[#102019]">
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 p-6 text-white">
            <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/10" />
            <button onClick={onClose} className="absolute right-4 top-4 grid size-9 place-items-center rounded-xl bg-white/15 transition hover:bg-white/25" aria-label={t('close')}><X size={18} /></button>
            <div className="grid size-12 place-items-center rounded-2xl bg-white/15"><CalendarClock size={24} /></div>
            <DialogTitle className="mt-4 text-2xl font-black">{t('bookCharger')}</DialogTitle>
            <p className="mt-1 text-sm text-emerald-50">{station.name}</p>
          </div>

          <form onSubmit={handleSubmit(onReserve)} className="space-y-5 p-6">
            <label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-extrabold"><PlugZap size={15} className="text-emerald-500" />{t('connector')}</span><select {...register('connector')} className="field">{station.connectors.map((connector) => <option key={connector}>{connector}</option>)}</select></label>
            <label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-extrabold"><Clock3 size={15} className="text-emerald-500" />{t('startTime')}</span><input {...register('startAt')} min={nextHour()} type="datetime-local" className="field" />{errors.startAt && <span className="mt-1.5 block text-xs font-semibold text-rose-500">{errors.startAt.message}</span>}</label>
            <label className="block"><span className="mb-2 block text-xs font-extrabold">{t('sessionDuration')}</span><select {...register('duration')} className="field"><option value="30">30 {t('minutes')}</option><option value="60">60 {t('minutes')}</option><option value="90">90 {t('minutes')}</option><option value="120">120 {t('minutes')}</option></select></label>
            <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300"><p className="flex items-center gap-2 font-extrabold"><CheckCircle2 size={17} />{t('freeCancellation')}</p><p className="mt-1 text-xs opacity-75">{t('bookingHint')}</p></div>
            <button className="primary-button h-12 w-full justify-center"><CalendarClock size={18} />{t('confirmBooking')}</button>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
